import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { injectSeoMeta } from "./seoMeta";

export function serveStatic(app: Express) {
  const candidates = [
    path.resolve(__dirname, "public"),
    path.resolve(process.cwd(), "dist", "public"),
  ];
  const distPath = candidates.find((p) => fs.existsSync(p));
  if (!distPath) {
    throw new Error(
      `Could not find the build directory. Tried: ${candidates.join(", ")}. Make sure to build the client first.`,
    );
  }

  console.log(`Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  const indexHtmlPath = path.resolve(distPath, "index.html");
  let cachedIndexHtml = "";
  try {
    cachedIndexHtml = fs.readFileSync(indexHtmlPath, "utf-8");
  } catch {
    console.warn("[static] index.html not found at:", indexHtmlPath);
  }

  app.use("/{*path}", (req, res) => {
    if (!cachedIndexHtml) {
      return res.status(404).send("Not found");
    }
    const pathname = (req.originalUrl || "/").split("?")[0].split("#")[0] || "/";
    const injected = injectSeoMeta(cachedIndexHtml, pathname);
    res.status(200).type("text/html").send(injected);
  });
}
