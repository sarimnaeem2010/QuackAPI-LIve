import type {
  WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import path from "path";
import fs from "fs";
import QRCode from "qrcode";
import { storage } from "./storage";
import { sendDeviceDisconnectNotification } from "./email";

const logger = pino({ level: "warn" });

const SESSION_DIR = path.join(process.cwd(), "baileys_sessions");

if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

const activeSockets: Map<number, WASocket> = new Map();
const reconnectAttempts: Map<number, number> = new Map();
const suppressReconnect = new Set<number>();
const MAX_RECONNECT_ATTEMPTS = 10;

let _baileys: typeof import("@whiskeysockets/baileys") | null = null;
async function getBaileys() {
  if (!_baileys) {
    _baileys = await import("@whiskeysockets/baileys");
  }
  return _baileys;
}

function getSessionPath(deviceId: number): string {
  return path.join(SESSION_DIR, `device_${deviceId}`);
}

function getReconnectDelay(attempt: number): number {
  const base = 3000;
  const delay = Math.min(base * Math.pow(2, attempt), 120000);
  return delay;
}

export function clearDeviceSession(deviceId: number): void {
  const sessionDir = getSessionPath(deviceId);
  if (fs.existsSync(sessionDir)) {
    fs.rmSync(sessionDir, { recursive: true, force: true });
    console.log(`[Baileys] Cleared session for device ${deviceId}`);
  }
}

export async function setupBaileys(deviceId: number, isReconnect: boolean = false): Promise<void> {
  if (activeSockets.has(deviceId)) {
    const existing = activeSockets.get(deviceId);
    suppressReconnect.add(deviceId);
    try {
      existing?.end(undefined);
    } catch {}
    activeSockets.delete(deviceId);
  } else {
    suppressReconnect.delete(deviceId);
  }

  if (!isReconnect) {
    reconnectAttempts.delete(deviceId);
  }

  const sessionPath = getSessionPath(deviceId);
  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  try {
    const {
      default: makeWASocket,
      useMultiFileAuthState,
      DisconnectReason,
      fetchLatestBaileysVersion,
      makeCacheableSignalKeyStore,
      Browsers,
      getContentType,
    } = await getBaileys();

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      logger: logger as any,
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger as any),
      },
      browser: Browsers.ubuntu("Chrome"),
      generateHighQualityLinkPreview: false,
      syncFullHistory: false,
      markOnlineOnConnect: true,
    });

    activeSockets.set(deviceId, sock);

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      try {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          try {
            const qrDataUrl = await QRCode.toDataURL(qr, { width: 300, margin: 2 });
            await storage.updateDeviceSession(deviceId, null, "pending", qrDataUrl);
            console.log(`[Baileys] QR code generated for device ${deviceId}`);
          } catch (err) {
            console.error(`[Baileys] QR generation error for device ${deviceId}:`, err);
          }
        }

        if (connection === "close") {
          if (suppressReconnect.has(deviceId)) {
            suppressReconnect.delete(deviceId);
            activeSockets.delete(deviceId);
            return;
          }

          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          console.log(`[Baileys] Device ${deviceId} disconnected. Status: ${statusCode}. Reconnect: ${shouldReconnect}`);

          activeSockets.delete(deviceId);
          await storage.updateDeviceSession(deviceId, null, "disconnected", null);
          
          const device = await storage.getDevice(deviceId);
          if (device) {
            const user = await storage.getUser(device.userId);
            if (user?.email) {
              sendDeviceDisconnectNotification(user.email, user.name, device.deviceName).catch((err) =>
                console.error("[Email] Disconnect notification failed:", err)
              );
            }
          }
          if (shouldReconnect) {
            const attempts = reconnectAttempts.get(deviceId) || 0;

            if (attempts >= MAX_RECONNECT_ATTEMPTS) {
              console.log(`[Baileys] Device ${deviceId} exceeded max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}). Giving up.`);
              reconnectAttempts.delete(deviceId);
              const sessionDir = getSessionPath(deviceId);
              if (fs.existsSync(sessionDir)) {
                fs.rmSync(sessionDir, { recursive: true, force: true });
              }
              return;
            }

            const delay = getReconnectDelay(attempts);
            reconnectAttempts.set(deviceId, attempts + 1);
            console.log(`[Baileys] Will reconnect device ${deviceId} in ${Math.round(delay / 1000)}s (attempt ${attempts + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
            setTimeout(async () => {
              const device = await storage.getDevice(deviceId);
              if (!device) return;
              setupBaileys(deviceId, true);
            }, delay);
          } else {
            // Send email for loggedOut scenario
            const device = await storage.getDevice(deviceId);
            if (device) {
              const user = await storage.getUser(device.userId);
              if (user?.email) {
                sendDeviceDisconnectNotification(user.email, user.name, device.deviceName).catch((err) =>
                  console.error("[Email] Disconnect notification failed:", err)
                );
              }
            }
            await storage.updateDeviceSession(deviceId, null, "disconnected", null);
            reconnectAttempts.delete(deviceId);
            const sessionDir = getSessionPath(deviceId);
            if (fs.existsSync(sessionDir)) {
              fs.rmSync(sessionDir, { recursive: true, force: true });
            }
          }
        } else if (connection === "open") {
          console.log(`[Baileys] Device ${deviceId} connected successfully!`);
          reconnectAttempts.delete(deviceId);

          const phoneNumber = sock.user?.id?.split(":")[0] || sock.user?.id?.split("@")[0] || null;
          await storage.updateDeviceSession(deviceId, { connected: true }, "connected", null);

          if (phoneNumber) {
            await storage.updateDevicePhone(deviceId, phoneNumber);
          }
        }
      } catch (err) {
        console.error(`[Baileys] connection.update handler error for device ${deviceId}:`, err);
      }
    });

    sock.ev.on("messages.upsert", async ({ messages: msgs, type }) => {
      try {
        if (type !== "notify") return;

        for (const msg of msgs) {
          if (msg.key.fromMe) continue;

          const sender = msg.key.remoteJid || "";
          const contentType = msg.message ? getContentType(msg.message) : null;
          let textContent = "";

          if (contentType === "conversation") {
            textContent = msg.message?.conversation || "";
          } else if (contentType === "extendedTextMessage") {
            textContent = msg.message?.extendedTextMessage?.text || "";
          } else if (contentType === "imageMessage") {
            textContent = "[Image] " + (msg.message?.imageMessage?.caption || "");
          } else if (contentType === "videoMessage") {
            textContent = "[Video] " + (msg.message?.videoMessage?.caption || "");
          } else if (contentType === "documentMessage") {
            textContent = "[Document] " + (msg.message?.documentMessage?.fileName || "");
          }

          if (!textContent) continue;

          const device = await storage.getDevice(deviceId);
          if (device?.webhookUrl) {
            const payload = {
              event: "message.received",
              deviceId,
              from: sender,
              content: textContent,
              timestamp: msg.messageTimestamp,
              messageId: msg.key.id,
            };
            try {
              const response = await fetch(device.webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              console.log(`[Webhook] Sent incoming message to ${device.webhookUrl}`);
              await storage.createWebhookLog({ deviceId, event: "message.received", url: device.webhookUrl, payload, success: true, statusCode: response.status }).catch(() => {});
            } catch (err: any) {
              console.error(`[Webhook] Failed to send to ${device.webhookUrl}:`, err.message);
              await storage.createWebhookLog({ deviceId, event: "message.received", url: device.webhookUrl, payload, success: false, errorMessage: err.message }).catch(() => {});
            }
          }
        }
      } catch (err) {
        console.error(`[Baileys] messages.upsert handler error for device ${deviceId}:`, err);
      }
    });
  } catch (err) {
    console.error(`[Baileys] Failed to setup device ${deviceId}:`, err);
    await storage.updateDeviceSession(deviceId, null, "disconnected", null);
  }
}

export async function sendMessage(
  deviceId: number,
  to: string,
  content: string,
  messageId: number,
  type: string = "text",
  mediaUrl?: string,
  extra?: { caption?: string; filename?: string; lat?: string; lng?: string; address?: string; contactName?: string; contactPhone?: string }
): Promise<void> {
  const sock = activeSockets.get(deviceId);

  if (!sock) {
    await storage.updateMessageStatus(messageId, "failed", "Device not connected");
    return;
  }

  try {
    const jid = to.includes("@") ? to : `${to.replace(/[^0-9]/g, "")}@s.whatsapp.net`;

    let messageContent: any;

    switch (type) {
      case "text":
        messageContent = { text: content };
        break;
      case "image":
        messageContent = {
          image: { url: mediaUrl || content },
          caption: extra?.caption || undefined,
        };
        break;
      case "video":
        messageContent = {
          video: { url: mediaUrl || content },
          caption: extra?.caption || undefined,
        };
        break;
      case "audio":
        messageContent = {
          audio: { url: mediaUrl || content },
          mimetype: "audio/mpeg",
        };
        break;
      case "document":
        messageContent = {
          document: { url: mediaUrl || content },
          mimetype: "application/octet-stream",
          fileName: extra?.filename || "document",
        };
        break;
      case "link":
        messageContent = { text: content };
        break;
      case "contact": {
        const phone = extra?.contactPhone || content;
        const name = extra?.contactName || phone;
        const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;TYPE=CELL:${phone}\nEND:VCARD`;
        messageContent = {
          contacts: {
            displayName: name,
            contacts: [{ vcard }],
          },
        };
        break;
      }
      case "location":
        messageContent = {
          location: {
            degreesLatitude: parseFloat(extra?.lat || "0"),
            degreesLongitude: parseFloat(extra?.lng || "0"),
            name: extra?.address || undefined,
          },
        };
        break;
      default:
        messageContent = { text: content };
    }

    await sock.sendMessage(jid, messageContent);
    await storage.updateMessageStatus(messageId, "sent");
    console.log(`[Baileys] Message ${messageId} sent to ${to} via device ${deviceId}`);

    const device = await storage.getDevice(deviceId);
    if (device?.webhookUrl) {
      const sentPayload = { event: "message.sent", messageId, to, deviceId, status: "sent" };
      try {
        const response = await fetch(device.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sentPayload),
        });
        await storage.createWebhookLog({ deviceId, event: "message.sent", url: device.webhookUrl, payload: sentPayload, success: true, statusCode: response.status }).catch(() => {});
      } catch (webhookErr: any) {
        await storage.createWebhookLog({ deviceId, event: "message.sent", url: device.webhookUrl, payload: sentPayload, success: false, errorMessage: webhookErr.message }).catch(() => {});
      }
    }
  } catch (err: any) {
    console.error(`[Baileys] Failed to send message ${messageId}:`, err.message);
    await storage.updateMessageStatus(messageId, "failed", err.message);

    const device = await storage.getDevice(deviceId);
    if (device?.webhookUrl) {
      const failedPayload = { event: "message.failed", messageId, to, deviceId, error: err.message };
      try {
        const response = await fetch(device.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(failedPayload),
        });
        await storage.createWebhookLog({ deviceId, event: "message.failed", url: device.webhookUrl, payload: failedPayload, success: true, statusCode: response.status }).catch(() => {});
      } catch (webhookErr: any) {
        await storage.createWebhookLog({ deviceId, event: "message.failed", url: device.webhookUrl, payload: failedPayload, success: false, errorMessage: webhookErr.message }).catch(() => {});
      }
    }
  }
}

export async function disconnectDevice(deviceId: number): Promise<void> {
  const device = await storage.getDevice(deviceId);
  if (device) {
    const user = await storage.getUser(device.userId);
    if (user?.email) {
      await sendDeviceDisconnectNotification(user.email, user.name, device.deviceName).catch((err) =>
        console.error("[Email] Disconnect notification failed:", err)
      );
    }
  }
  const sock = activeSockets.get(deviceId);
  if (sock) {
    suppressReconnect.add(deviceId);
    try {
      await sock.logout();
    } catch {}
    activeSockets.delete(deviceId);
  }

  const sessionDir = getSessionPath(deviceId);
  if (fs.existsSync(sessionDir)) {
    fs.rmSync(sessionDir, { recursive: true, force: true });
  }

  await storage.updateDeviceSession(deviceId, null, "disconnected", null);
}

export function getDeviceSocket(deviceId: number): WASocket | undefined {
  return activeSockets.get(deviceId);
}

export async function reconnectExistingDevices(): Promise<void> {
  console.log("[Baileys] Checking for existing sessions to reconnect...");
  if (!fs.existsSync(SESSION_DIR)) return;

  const dirs = fs.readdirSync(SESSION_DIR);
  for (const dir of dirs) {
    const match = dir.match(/^device_(\d+)$/);
    if (!match) continue;

    const deviceId = parseInt(match[1], 10);
    const device = await storage.getDevice(deviceId);

    const credsFile = path.join(SESSION_DIR, dir, "creds.json");
    const hasValidSession = fs.existsSync(credsFile);

    if (device && device.status !== "disconnected" && hasValidSession) {
      console.log(`[Baileys] Reconnecting device ${deviceId}...`);
      setupBaileys(deviceId);
    } else if (device && !hasValidSession) {
      console.log(`[Baileys] Device ${deviceId} has no saved session, skipping reconnect.`);
      await storage.updateDeviceSession(deviceId, null, "disconnected", null);
    }
  }
}
