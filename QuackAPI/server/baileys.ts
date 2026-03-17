import type {
  WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import path from "path";
import fs from "fs";
import QRCode from "qrcode";
import { storage } from "./storage";
import {
  sendDeviceDisconnectNotification,
  sendDeviceConnectNotification,
} from "./email";

const logger = pino({ level: "warn" });

const SESSION_DIR = path.join(process.cwd(), "baileys_sessions");

if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

const activeSockets: Map<number, WASocket> = new Map();
const reconnectAttempts: Map<number, number> = new Map();
const suppressReconnect = new Set<number>();
const autoReconnecting = new Set<number>();
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

async function saveSessionToDB(deviceId: number, sessionPath: string): Promise<void> {
  if (!fs.existsSync(sessionPath)) return;
  try {
    const files = fs.readdirSync(sessionPath);
    const sessionData: Record<string, any> = {};
    for (const file of files) {
      const filePath = path.join(sessionPath, file);
      const stat = fs.statSync(filePath);
      if (!stat.isFile()) continue;
      const raw = fs.readFileSync(filePath, "utf-8");
      try {
        sessionData[file] = JSON.parse(raw);
      } catch {
        sessionData[file] = raw;
      }
    }
    await storage.updateDeviceSessionData(deviceId, sessionData);
  } catch (err) {
    console.error(`[Baileys] Failed to save session to DB for device ${deviceId}:`, err);
  }
}

async function restoreSessionFromDB(deviceId: number, sessionPath: string): Promise<boolean> {
  try {
    const device = await storage.getDevice(deviceId);
    if (!device?.sessionData || typeof device.sessionData !== "object") return false;
    const sessionFiles = device.sessionData as Record<string, any>;
    if (Object.keys(sessionFiles).length === 0) return false;
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }
    for (const [filename, content] of Object.entries(sessionFiles)) {
      const filePath = path.join(sessionPath, filename);
      const data = typeof content === "string" ? content : JSON.stringify(content);
      fs.writeFileSync(filePath, data, "utf-8");
    }
    console.log(`[Baileys] Restored session from DB for device ${deviceId} (${Object.keys(sessionFiles).length} files)`);
    return true;
  } catch (err) {
    console.error(`[Baileys] Failed to restore session from DB for device ${deviceId}:`, err);
    return false;
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

  if (isReconnect) {
    autoReconnecting.add(deviceId);
  } else {
    reconnectAttempts.delete(deviceId);
    autoReconnecting.delete(deviceId);
  }

  const sessionPath = getSessionPath(deviceId);

  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  const hasLocalCreds = fs.existsSync(path.join(sessionPath, "creds.json"));
  if (!hasLocalCreds) {
    await restoreSessionFromDB(deviceId, sessionPath);
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

    sock.ev.on("creds.update", async () => {
      saveCreds();
      await saveSessionToDB(deviceId, sessionPath).catch(() => {});
    });

    sock.ev.on("connection.update", async (update) => {
      try {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          try {
            const qrDataUrl = await QRCode.toDataURL(qr, { width: 300, margin: 2 });
            await storage.updateDeviceStatusAndQR(deviceId, "pending", qrDataUrl);
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
          await storage.updateDeviceStatusAndQR(deviceId, "disconnected", null);

          if (!shouldReconnect) {
            const device = await storage.getDevice(deviceId);
            if (device) {
              const user = await storage.getUser(device.userId);
              if (user?.email) {
                sendDeviceDisconnectNotification(user.email, user.name, device.deviceName).catch((err) =>
                  console.error("[Email] Disconnect notification failed:", err)
                );
              }
            }
            reconnectAttempts.delete(deviceId);
            const sessionDir = getSessionPath(deviceId);
            if (fs.existsSync(sessionDir)) {
              fs.rmSync(sessionDir, { recursive: true, force: true });
            }
            await storage.updateDeviceSessionData(deviceId, null).catch(() => {});
            return;
          }

          const attempts = reconnectAttempts.get(deviceId) || 0;

          if (attempts >= MAX_RECONNECT_ATTEMPTS) {
            console.log(`[Baileys] Device ${deviceId} exceeded max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}). Giving up.`);
            reconnectAttempts.delete(deviceId);
            const device = await storage.getDevice(deviceId);
            if (device) {
              const user = await storage.getUser(device.userId);
              if (user?.email) {
                sendDeviceDisconnectNotification(user.email, user.name, device.deviceName).catch((err) =>
                  console.error("[Email] Max reconnect notification failed:", err)
                );
              }
            }
            const sessionDir = getSessionPath(deviceId);
            if (fs.existsSync(sessionDir)) {
              fs.rmSync(sessionDir, { recursive: true, force: true });
            }
            await storage.updateDeviceSessionData(deviceId, null).catch(() => {});
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

        } else if (connection === "open") {
          console.log(`[Baileys] Device ${deviceId} connected successfully!`);
          reconnectAttempts.delete(deviceId);

          const phoneNumber = sock.user?.id?.split(":")[0] || sock.user?.id?.split("@")[0] || null;
          await storage.updateDeviceStatusAndQR(deviceId, "connected", null);

          if (phoneNumber) {
            await storage.updateDevicePhone(deviceId, phoneNumber);
          }

          await saveSessionToDB(deviceId, sessionPath).catch(() => {});

          const device = await storage.getDevice(deviceId);
          if (device) {
            const user = await storage.getUser(device.userId);
            if (user?.email) {
              sendDeviceConnectNotification(user.email, user.name, device.deviceName, phoneNumber).catch((err) =>
                console.error("[Email] Connect notification failed:", err)
              );
            }
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
    await storage.updateDeviceStatusAndQR(deviceId, "disconnected", null);
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
    console.warn(`[Baileys] sendMessage: no socket for device ${deviceId}`);
    await storage.updateMessageStatus(messageId, "failed", "Device not connected");
    return;
  }

  const wsReadyState = (sock as any).ws?.readyState;
  if (wsReadyState !== undefined && wsReadyState !== 1) {
    console.warn(`[Baileys] sendMessage: socket for device ${deviceId} is not open (readyState=${wsReadyState})`);
    activeSockets.delete(deviceId);
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

export async function disconnectDevice(deviceId: number, notifyUser: boolean = false): Promise<void> {
  if (notifyUser) {
    const device = await storage.getDevice(deviceId);
    if (device) {
      const user = await storage.getUser(device.userId);
      if (user?.email) {
        await sendDeviceDisconnectNotification(user.email, user.name, device.deviceName).catch((err) =>
          console.error("[Email] Disconnect notification failed:", err)
        );
      }
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

  const allActiveDevices = await storage.getConnectedAndPendingDevices().catch(() => [] as any[]);

  for (const device of allActiveDevices) {
    const deviceId = device.id;
    const sessionPath = getSessionPath(deviceId);
    const hasLocalCreds = fs.existsSync(path.join(sessionPath, "creds.json"));
    const hasDbSession = device.sessionData && typeof device.sessionData === "object" && Object.keys(device.sessionData as object).length > 0;

    if (hasLocalCreds || hasDbSession) {
      console.log(`[Baileys] Reconnecting device ${deviceId} (local=${hasLocalCreds}, db=${hasDbSession})...`);
      setupBaileys(deviceId);
    } else {
      console.log(`[Baileys] Device ${deviceId} has no session anywhere — marking disconnected.`);
      await storage.updateDeviceStatusAndQR(deviceId, "disconnected", null);
    }
  }

  if (!fs.existsSync(SESSION_DIR)) return;

  const dirs = fs.readdirSync(SESSION_DIR);
  for (const dir of dirs) {
    const match = dir.match(/^device_(\d+)$/);
    if (!match) continue;
    const deviceId = parseInt(match[1], 10);
    if (allActiveDevices.find((d: any) => d.id === deviceId)) continue;

    const credsFile = path.join(SESSION_DIR, dir, "creds.json");
    if (!fs.existsSync(credsFile)) {
      console.log(`[Baileys] Orphaned session dir for device ${deviceId} without creds — cleaning up.`);
      fs.rmSync(path.join(SESSION_DIR, dir), { recursive: true, force: true });
    }
  }
}
