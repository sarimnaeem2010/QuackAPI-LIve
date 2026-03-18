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

interface BaileysSocketWithWS extends WASocket {
  ws?: { readyState?: number; isOpen?: boolean; isClosed?: boolean };
}

const logger = pino({ level: "warn" });

const SESSION_DIR = path.join(process.cwd(), "baileys_sessions");

if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

const activeSockets: Map<number, BaileysSocketWithWS> = new Map();
const reconnectAttempts: Map<number, number> = new Map();
const suppressReconnect = new Set<number>();
const autoReconnecting = new Set<number>();
const lastConnectedAt: Map<number, number> = new Map();
const STABLE_CONNECTION_MS = 30_000;
// Tracks how many consecutive 440 "conflict/replaced" disconnects a device has seen.
// Used to enforce an escalating backoff to break out of conflict loops.
const consecutive440s: Map<number, number> = new Map();

// Devices that connected via QR scan (not session restore). Used to gate connect emails.
const qrGeneratedDevices = new Set<number>();
// Pending disconnect notification timers — cancelled if device reconnects in time.
const pendingDisconnectNotifications: Map<number, ReturnType<typeof setTimeout>> = new Map();
const DISCONNECT_EMAIL_DELAY_MS = 5 * 60 * 1000; // 5 minutes

const RETRY_WINDOW_MS = 5 * 60 * 1000;

interface RetryEntry {
  messageId: number;
  retryUntil: number;
  to: string;
  content: string;
  type: string;
  mediaUrl?: string;
  extra?: { caption?: string; filename?: string; lat?: string; lng?: string; address?: string; contactName?: string; contactPhone?: string };
}
const retryQueue: Map<number, RetryEntry[]> = new Map();

// Cache the WA version for 24h to avoid blocking reconnects on fetch failures
let _cachedVersion: number[] | null = null;
let _versionFetchedAt = 0;
const VERSION_CACHE_TTL = 24 * 60 * 60 * 1000;

async function getWAVersion(baileys: typeof import("@whiskeysockets/baileys")): Promise<number[]> {
  const now = Date.now();
  if (_cachedVersion && now - _versionFetchedAt < VERSION_CACHE_TTL) {
    return _cachedVersion;
  }
  try {
    const { version } = await baileys.fetchLatestBaileysVersion();
    _cachedVersion = version;
    _versionFetchedAt = now;
    console.log(`[Baileys] Fetched fresh WA version: ${version.join(".")}`);
    return version;
  } catch (err) {
    if (_cachedVersion) {
      console.warn(`[Baileys] Failed to fetch WA version, using cached: ${_cachedVersion.join(".")}`);
      return _cachedVersion;
    }
    const fallback = [2, 3000, 1019685367];
    console.warn(`[Baileys] Failed to fetch WA version, using fallback: ${fallback.join(".")}`);
    _cachedVersion = fallback;
    _versionFetchedAt = now;
    return fallback;
  }
}

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
  return Math.min(base * Math.pow(2, attempt), 300_000);
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
    const baileys = await getBaileys();
    const {
      default: makeWASocket,
      useMultiFileAuthState,
      DisconnectReason,
      makeCacheableSignalKeyStore,
      Browsers,
    } = baileys;

    const version = await getWAVersion(baileys);

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

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

    // Socket is only registered as active once fully authenticated (connection === "open").
    // Setting it here before open would allow sendMessage to run on a broken/unauthenticated socket.

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
            if (activeSockets.get(deviceId) === sock) {
              activeSockets.delete(deviceId);
            }
            return;
          }

          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          const isLoggedOut = statusCode === DisconnectReason.loggedOut;
          const is440Conflict = statusCode === 440;
          const isImmediateRetry =
            !is440Conflict &&
            (statusCode === DisconnectReason.restartRequired ||
              statusCode === DisconnectReason.timedOut ||
              statusCode == null);

          // Check if the just-ended connection was stable (lasted >= 30s).
          // If so, reset the consecutive 440 counter — the conflict that caused previous
          // 440s is resolved. We measure from the last recorded open time to now (close time).
          const connOpenedAt = lastConnectedAt.get(deviceId);
          const connDurationMs = connOpenedAt ? (Date.now() - connOpenedAt) : 0;
          if (connDurationMs >= STABLE_CONNECTION_MS) {
            consecutive440s.delete(deviceId);
          }

          if (is440Conflict) {
            consecutive440s.set(deviceId, (consecutive440s.get(deviceId) ?? 0) + 1);
          }
          const consec440Count = consecutive440s.get(deviceId) ?? 0;

          console.log(
            `[Baileys] Device ${deviceId} disconnected. statusCode=${statusCode} loggedOut=${isLoggedOut} immediateRetry=${isImmediateRetry} consec440=${consec440Count}`
          );

          if (activeSockets.get(deviceId) === sock) {
            activeSockets.delete(deviceId);
          }
          await storage.updateDeviceStatusAndQR(deviceId, "disconnected", null);

          if (isLoggedOut) {
            console.log(`[Baileys] Device ${deviceId} was logged out by WhatsApp. Clearing session.`);
            reconnectAttempts.delete(deviceId);
            const sessionDir = getSessionPath(deviceId);
            if (fs.existsSync(sessionDir)) {
              fs.rmSync(sessionDir, { recursive: true, force: true });
            }
            await storage.updateDeviceSessionData(deviceId, null).catch(() => {});
            const device = await storage.getDevice(deviceId);
            if (device) {
              const user = await storage.getUser(device.userId);
              if (user?.email) {
                sendDeviceDisconnectNotification(user.email, user.name, device.deviceName).catch((err) =>
                  console.error("[Email] Logout notification failed:", err)
                );
              }
            }
            return;
          }

          const attempts = reconnectAttempts.get(deviceId) || 0;
          const baseDelay = isImmediateRetry ? 1_000 : getReconnectDelay(attempts);
          // 440 "conflict/replaced": enforce a minimum 15s delay so the competing session
          // has time to die before we reconnect. After 3 consecutive 440s, escalate to 60s
          // to break out of a runaway conflict loop.
          let delay: number;
          if (is440Conflict) {
            if (consec440Count >= 3) {
              delay = 60_000;
              console.warn(`[Baileys] Device ${deviceId} had ${consec440Count} consecutive 440s — enforcing 60s cooldown before next reconnect`);
            } else {
              delay = Math.max(baseDelay, 15_000);
            }
          } else {
            delay = baseDelay;
          }

          if (!isImmediateRetry) {
            reconnectAttempts.set(deviceId, attempts + 1);
          }

          console.log(
            `[Baileys] Scheduling reconnect for device ${deviceId} in ${Math.round(delay / 1000)}s` +
            (isImmediateRetry ? " (immediate retry)" : ` (attempt ${attempts + 1})`)
          );

          setTimeout(async () => {
            if (suppressReconnect.has(deviceId)) return;
            const device = await storage.getDevice(deviceId);
            if (!device) return;
            setupBaileys(deviceId, true);
          }, delay);

        } else if (connection === "open") {
          activeSockets.set(deviceId, sock);
          const wasAutoReconnect = autoReconnecting.has(deviceId);
          autoReconnecting.delete(deviceId);
          const prevConnectedAt = lastConnectedAt.get(deviceId);
          lastConnectedAt.set(deviceId, Date.now());
          // Only reset backoff counter if previous connection was stable (or first connect).
          // If the last session was very short (<30s), keep the counter so backoff keeps growing.
          const prevDurationMs = prevConnectedAt ? (Date.now() - prevConnectedAt) : Infinity;
          if (prevDurationMs >= STABLE_CONNECTION_MS) {
            reconnectAttempts.delete(deviceId);
          }

          console.log(`[Baileys] Device ${deviceId} connected! (autoReconnect=${wasAutoReconnect})`);

          const phoneNumber = sock.user?.id?.split(":")[0] || sock.user?.id?.split("@")[0] || null;
          await storage.updateDeviceStatusAndQR(deviceId, "connected", null);

          if (phoneNumber) {
            await storage.updateDevicePhone(deviceId, phoneNumber);
          }

          await saveSessionToDB(deviceId, sessionPath).catch(() => {});

          const pendingRetries = retryQueue.get(deviceId);
          if (pendingRetries && pendingRetries.length > 0) {
            const now = Date.now();
            const toRetry = pendingRetries.filter(e => e.retryUntil > now);
            retryQueue.delete(deviceId);
            if (toRetry.length > 0) {
              console.log(`[Baileys] Retrying ${toRetry.length} queued message(s) for device ${deviceId}`);
              for (const entry of toRetry) {
                sendMessage(deviceId, entry.to, entry.content, entry.messageId, entry.type, entry.mediaUrl, entry.extra).catch(err =>
                  console.error(`[Baileys] Retry failed for message ${entry.messageId}:`, err)
                );
              }
            }
          }

          if (!wasAutoReconnect) {
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
        }
      } catch (err) {
        console.error(`[Baileys] connection.update handler error for device ${deviceId}:`, err);
      }
    });

    sock.ev.on("messages.upsert", async ({ messages: msgs, type }) => {
      try {
        if (type !== "notify") return;

        const { getContentType } = await getBaileys();

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

    if (!suppressReconnect.has(deviceId)) {
      const attempts = reconnectAttempts.get(deviceId) || 0;
      const delay = getReconnectDelay(attempts);
      reconnectAttempts.set(deviceId, attempts + 1);
      console.log(`[Baileys] Setup failed for device ${deviceId}, retrying in ${Math.round(delay / 1000)}s (attempt ${attempts + 1})...`);
      setTimeout(async () => {
        if (suppressReconnect.has(deviceId)) return;
        const device = await storage.getDevice(deviceId);
        if (!device) return;
        setupBaileys(deviceId, true);
      }, delay);
    }
  }
}

const HEALTH_CHECK_INTERVAL = 3 * 60 * 1000;

export function startHealthCheck(): void {
  setInterval(() => {
    for (const [deviceId, sock] of activeSockets.entries()) {
      const ws = (sock as BaileysSocketWithWS).ws;
      const isOpen = ws?.isOpen ?? (ws?.readyState === 1);
      if (!ws || !isOpen) {
        console.log(
          `[Baileys] Health check: device ${deviceId} socket is stale (isOpen=${isOpen}). Triggering reconnect.`
        );
        storage.updateDeviceStatusAndQR(deviceId, "disconnected", null).catch(() => {});
        if (!suppressReconnect.has(deviceId)) {
          setupBaileys(deviceId, true);
        }
      }
    }

    const now = Date.now();
    for (const [deviceId, queue] of retryQueue.entries()) {
      const fresh = queue.filter(e => e.retryUntil > now);
      if (fresh.length === 0) {
        retryQueue.delete(deviceId);
      } else if (fresh.length !== queue.length) {
        retryQueue.set(deviceId, fresh);
      }
    }
  }, HEALTH_CHECK_INTERVAL);
  console.log("[Baileys] Socket health check started (interval: 3 min).");
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

  const queueForRetry = (): void => {
    const queue = retryQueue.get(deviceId) ?? [];
    if (!queue.some(e => e.messageId === messageId)) {
      queue.push({ messageId, retryUntil: Date.now() + RETRY_WINDOW_MS, to, content, type, mediaUrl, extra });
      retryQueue.set(deviceId, queue);
      console.log(`[Baileys] Queued message ${messageId} for retry on device ${deviceId} reconnect`);
    }
  };

  if (!sock) {
    console.warn(`[Baileys] sendMessage: no socket for device ${deviceId}`);
    await storage.updateMessageStatus(messageId, "failed", "Device not connected");
    queueForRetry();
    return;
  }

  const ws = sock.ws;
  const isOpen = ws?.isOpen ?? (ws?.readyState === 1);
  if (!ws || !isOpen) {
    console.warn(`[Baileys] sendMessage: socket for device ${deviceId} is not open (ws=${!!ws}, isOpen=${isOpen})`);
    activeSockets.delete(deviceId);
    await storage.updateMessageStatus(messageId, "failed", "Device not connected");
    queueForRetry();
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
  } else {
    suppressReconnect.add(deviceId);
  }

  const sessionDir = getSessionPath(deviceId);
  if (fs.existsSync(sessionDir)) {
    fs.rmSync(sessionDir, { recursive: true, force: true });
  }

  await storage.updateDeviceSession(deviceId, null, "disconnected", null);
}

export function getDeviceSocket(deviceId: number): BaileysSocketWithWS | undefined {
  return activeSockets.get(deviceId);
}

export function closeAllSockets(): void {
  console.log(`[Baileys] Closing ${activeSockets.size} active socket(s) for graceful shutdown...`);
  for (const [deviceId, sock] of activeSockets.entries()) {
    suppressReconnect.add(deviceId);
    try { sock.end(undefined); } catch {}
  }
  activeSockets.clear();
}

export async function reconnectExistingDevices(): Promise<void> {
  console.log("[Baileys] Checking for existing sessions to reconnect...");
  // Pause 5s before connecting any devices on startup. Combined with the 2s shutdown
  // delay in gracefulShutdown(), this creates a ~7s clean window ensuring the previous
  // server instance's WA sockets are fully closed before we attempt to reconnect.
  // Without this, both the old and new processes connect simultaneously → 440 conflict loop.
  await new Promise(r => setTimeout(r, 5000));

  const devicesWithSession = await storage.getDevicesWithSession().catch(() => [] as any[]);
  const reconnectedIds = new Set<number>();

  for (const device of devicesWithSession) {
    const deviceId = device.id;
    reconnectedIds.add(deviceId);
    const sessionPath = getSessionPath(deviceId);
    const hasLocalCreds = fs.existsSync(path.join(sessionPath, "creds.json"));
    console.log(`[Baileys] Reconnecting device ${deviceId} (status=${device.status}, local=${hasLocalCreds}, db=true)...`);
    setupBaileys(deviceId, true);
  }

  const connectedAndPending = await storage.getConnectedAndPendingDevices().catch(() => [] as any[]);
  for (const device of connectedAndPending) {
    if (reconnectedIds.has(device.id)) continue;
    const deviceId = device.id;
    const sessionPath = getSessionPath(deviceId);
    const hasLocalCreds = fs.existsSync(path.join(sessionPath, "creds.json"));

    if (hasLocalCreds) {
      console.log(`[Baileys] Reconnecting device ${deviceId} from local creds (status=${device.status})...`);
      setupBaileys(deviceId, true);
    } else {
      console.log(`[Baileys] Device ${deviceId} has no session — marking disconnected.`);
      await storage.updateDeviceStatusAndQR(deviceId, "disconnected", null);
      const user = await storage.getUser(device.userId).catch(() => undefined);
      if (user?.email) {
        sendDeviceDisconnectNotification(user.email, user.name, device.deviceName).catch((err) =>
          console.error("[Email] Startup disconnect notification failed:", err)
        );
      }
    }
  }

  if (fs.existsSync(SESSION_DIR)) {
    const dirs = fs.readdirSync(SESSION_DIR);
    for (const dir of dirs) {
      const match = dir.match(/^device_(\d+)$/);
      if (!match) continue;
      const deviceId = parseInt(match[1], 10);
      if (reconnectedIds.has(deviceId)) continue;
      if (connectedAndPending.find((d: any) => d.id === deviceId)) continue;

      const credsFile = path.join(SESSION_DIR, dir, "creds.json");
      if (!fs.existsSync(credsFile)) {
        console.log(`[Baileys] Orphaned session dir for device ${deviceId} without creds — cleaning up.`);
        fs.rmSync(path.join(SESSION_DIR, dir), { recursive: true, force: true });
      }
    }
  }

  startHealthCheck();
}
