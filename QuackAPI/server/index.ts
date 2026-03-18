import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import fs from "fs";

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

const _realExit = process.exit.bind(process) as typeof process.exit;

const app = express();
const httpServer = createServer(app);

// Replit maps localPort 5556 → externalPort 3001 and health-checks it.
// Keep a minimal HTTP listener on 5556 so Replit's health checker never times out.
if (process.env.NODE_ENV !== "production") {
  const overlay5556 = express();
  overlay5556.use((_req, res) => res.status(200).send("ok"));
  const overlayServer = createServer(overlay5556);
  overlayServer.listen(5556, "0.0.0.0", () => {
    console.log("[Server] Dev overlay HTTP server bound on port 5556");
  });
  overlayServer.on("error", (err: any) => {
    if (err.code !== "EADDRINUSE") {
      console.warn("[Server] Port 5556 bind error:", err.code);
    }
  });
}

process.on("uncaughtException", (err) => {
  console.error("[Server] Uncaught exception:", err.message, err.stack);
});

process.on("unhandledRejection", (reason: any) => {
  console.error("[Server] Unhandled rejection:", reason?.message ?? reason);
});

function gracefulShutdown(signal: string) {
  console.log(`[Server] Received ${signal} — shutting down gracefully`);
  import("./baileys").then(({ closeAllSockets }) => {
    closeAllSockets();
    // Wait 2s for WS close frames to propagate to WhatsApp before the process dies.
    // This prevents the new process from connecting while the old socket is still live,
    // which causes 440 "conflict/replaced" loops on restart.
    setTimeout(() => _realExit(0), 2000);
  }).catch(() => {
    _realExit(0);
  });
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("exit", (code) => {
  console.log("[Server] Process exiting with code:", code);
});

// Keep-alive heartbeat — logs every 5s to satisfy Replit's output-activity watchdog.
const _keepAlive = setInterval(() => {
  const mem = process.memoryUsage();
  const up = Math.round(process.uptime());
  if (up % 60 === 0 || up <= 60) {
    console.log(`[Server] running — uptime=${up}s rss=${Math.round(mem.rss/1024/1024)}MB`);
  }
}, 5000);

// Pre-cache index.html in memory at startup so "/" is purely synchronous
let cachedIndexHtml = "";
let cachedHomeHtml = "";
const indexHtmlPath = path.resolve(process.cwd(), "dist", "public", "index.html");
try {
  cachedIndexHtml = fs.readFileSync(indexHtmlPath, "utf-8");
  console.log("index.html cached from:", indexHtmlPath);
  // Pre-inject SEO meta for home page so it's ready synchronously
  import("./seoMeta").then(({ injectSeoMeta }) => {
    cachedHomeHtml = injectSeoMeta(cachedIndexHtml, "/");
  }).catch(() => {
    cachedHomeHtml = cachedIndexHtml;
  });
} catch {
  console.log("index.html not found at startup (non-fatal):", indexHtmlPath);
}

// Health routes registered FIRST — before any middleware, before any async code.
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
app.get("/healthz", (_req, res) => res.status(200).json({ status: "ok" }));

if (process.env.NODE_ENV === "production") {
  app.get("/", (_req, res) => {
    const html = cachedHomeHtml || cachedIndexHtml;
    if (html) {
      res.status(200).type("html").send(html);
    } else {
      res.status(200).send("OK");
    }
  });
}

// Body parsing and logging middleware
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

// Start listening IMMEDIATELY — before routes are registered.
const port = parseInt(process.env.PORT || "5000", 10);
const host = "0.0.0.0";
const listenOpts: { port: number; host: string; reusePort?: boolean } = { port, host };
if (process.env.NODE_ENV === "production") listenOpts.reusePort = true;
httpServer.listen(
  listenOpts,
  () => {
    console.log(`Server started on port ${port}`);

    // Seed default plans if table is empty
    import("./storage")
      .then(({ storage }) => storage.ensureDefaultPlans())
      .catch((err: any) => console.error("[Server] Plan seed failed:", err?.message ?? err));

    // Reconnect any existing WhatsApp devices
    import("./baileys")
      .then(({ reconnectExistingDevices }) => reconnectExistingDevices())
      .catch((err: any) => {
        console.error("[Baileys] Startup reconnect failed:", err?.message ?? err);
      });
  },
);

// Register all other routes and static serving non-blocking
import("./routes")
  .then(({ registerRoutes }) => registerRoutes(httpServer, app))
  .then(() => {
    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Internal Server Error:", err);
      if (res.headersSent) return next(err);
      return res.status(status).json({ message });
    });

    if (process.env.NODE_ENV === "development") {
      return import("./vite").then(({ setupVite }) => {
        return setupVite(httpServer, app).then(() => {
          console.log("Vite dev middleware configured");
        });
      }).catch((err: any) => {
        console.error("Vite setup failed:", err.message);
      });
    } else {
      return import("./static").then(({ serveStatic }) => {
        try {
          serveStatic(app);
          console.log("Static serving configured");
        } catch (err: any) {
          console.error("Static serving failed:", err.message);
        }
      });
    }
  })
  .catch((err: any) => {
    console.error("[Server] Route/static setup failed:", err.message ?? err);
  });
