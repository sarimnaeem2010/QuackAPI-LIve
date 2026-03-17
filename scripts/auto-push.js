import chokidar from "chokidar";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const IGNORED = [
  /(^|[/\\])\../,          // dotfiles / dot-directories (includes .git, .local)
  /node_modules/,
  /[/\\]dist[/\\]/,
  /baileys_sessions/,
  /\.log$/,
  /\.db(-wal|-shm)?$/,
];

const DEBOUNCE_MS = 2000;

let timer = null;
let changedFiles = new Set();

function pad(n) {
  return String(n).padStart(2, "0");
}

function timestamp() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function updateRemoteWithToken() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("[auto-push] ERROR: GITHUB_TOKEN is not set. Cannot push to GitHub.");
    process.exit(1);
  }

  try {
    const remoteUrl = execSync("git remote get-url origin", { cwd: ROOT }).toString().trim();
    const match = remoteUrl.match(/https:\/\/(?:[^@]+@)?github\.com\/(.+)/);
    if (!match) {
      console.error("[auto-push] ERROR: origin remote does not look like a GitHub HTTPS URL:", remoteUrl);
      process.exit(1);
    }
    const repoPath = match[1];
    const authedUrl = `https://x-access-token:${token}@github.com/${repoPath}`;
    execSync(`git remote set-url origin "${authedUrl}"`, { cwd: ROOT });
    console.log("[auto-push] GitHub remote configured with token.");
  } catch (err) {
    console.error("[auto-push] ERROR configuring remote:", err.message);
    process.exit(1);
  }
}

function pushChanges() {
  const files = [...changedFiles];
  changedFiles.clear();
  const label = files.length === 1
    ? path.relative(ROOT, files[0])
    : `${files.length} files`;
  const msg = `auto: ${label} @ ${timestamp()}`;

  try {
    execSync("git add .", { cwd: ROOT, stdio: "pipe" });
    const diff = execSync("git diff --cached --name-only", { cwd: ROOT }).toString().trim();
    if (!diff) {
      console.log("[auto-push] No staged changes, skipping commit.");
      return;
    }
    execSync(`git commit -m "${msg.replace(/"/g, "'")}"`, { cwd: ROOT, stdio: "pipe" });
    execSync("git push origin main", { cwd: ROOT, stdio: "pipe" });
    console.log(`[auto-push] Pushed: ${msg}`);
  } catch (err) {
    console.error("[auto-push] Push failed:", err.message);
  }
}

function schedule(filePath) {
  changedFiles.add(filePath);
  if (timer) clearTimeout(timer);
  timer = setTimeout(pushChanges, DEBOUNCE_MS);
}

updateRemoteWithToken();

try {
  execSync('git config user.email "replit-agent@quackapi.com"', { cwd: ROOT });
  execSync('git config user.name "Replit Auto Push"', { cwd: ROOT });
} catch (err) {
  console.error("[auto-push] WARNING: Could not set git identity:", err.message);
}

const watcher = chokidar.watch(ROOT, {
  ignored: IGNORED,
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
});

watcher
  .on("add", (p) => { console.log(`[auto-push] New file: ${path.relative(ROOT, p)}`); schedule(p); })
  .on("change", (p) => { console.log(`[auto-push] Changed: ${path.relative(ROOT, p)}`); schedule(p); })
  .on("unlink", (p) => { console.log(`[auto-push] Deleted: ${path.relative(ROOT, p)}`); schedule(p); })
  .on("error", (err) => console.error("[auto-push] Watcher error:", err))
  .on("ready", () => console.log("[auto-push] Watching for file changes..."));

process.on("SIGINT", () => { watcher.close(); process.exit(0); });
process.on("SIGTERM", () => { watcher.close(); process.exit(0); });
