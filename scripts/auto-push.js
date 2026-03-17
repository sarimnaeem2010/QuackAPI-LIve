import chokidar from "chokidar";
import { execSync, spawnSync } from "child_process";
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

function setup() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("[auto-push] ERROR: GITHUB_TOKEN is not set. Cannot push to GitHub.");
    process.exit(1);
  }

  try {
    // Ensure the remote URL uses plain HTTPS (no embedded credentials)
    const remoteUrl = execSync("git remote get-url origin", { cwd: ROOT }).toString().trim();
    const match = remoteUrl.match(/https:\/\/(?:[^@]+@)?github\.com\/(.+)/);
    if (!match) {
      console.error("[auto-push] ERROR: origin remote does not look like a GitHub HTTPS URL:", remoteUrl);
      process.exit(1);
    }
    const cleanUrl = `https://github.com/${match[1]}`;
    execSync(`git remote set-url origin "${cleanUrl}"`, { cwd: ROOT });

    // Use a git credential helper that supplies the token at push time only
    // Single quotes preserve $GITHUB_TOKEN as a literal variable — expanded at push time, not config time
    execSync("git config credential.helper '!f() { echo username=x-access-token; echo password=$GITHUB_TOKEN; }; f'", { cwd: ROOT });

    // Configure committer identity
    execSync('git config user.email "replit-agent@quackapi.com"', { cwd: ROOT });
    execSync('git config user.name "Replit Auto Push"', { cwd: ROOT });

    console.log("[auto-push] GitHub credentials configured via credential helper (token not stored on disk).");
  } catch (err) {
    console.error("[auto-push] ERROR during setup:", err.message);
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
    // Remove stale lock file if present (can occur after a crash or race)
    try {
      const lockFile = path.join(ROOT, ".git", "index.lock");
      execSync(`rm -f "${lockFile}"`, { stdio: "pipe" });
    } catch { }

    execSync("git add .", { cwd: ROOT, stdio: "pipe" });
    const diff = execSync("git diff --cached --name-only", { cwd: ROOT }).toString().trim();
    if (!diff) {
      console.log("[auto-push] No staged changes, skipping commit.");
      return;
    }
    execSync(`git commit -m "${msg.replace(/"/g, "'")}"`, { cwd: ROOT, stdio: "pipe" });

    // Push with the GITHUB_TOKEN available in env so the credential helper can read it
    const result = spawnSync("git", ["push", "origin", "main"], {
      cwd: ROOT,
      env: { ...process.env },
      encoding: "utf-8",
    });
    if (result.status !== 0) {
      console.error("[auto-push] Push failed:", result.stderr || result.stdout);
    } else {
      console.log(`[auto-push] Pushed: ${msg}`);
    }
  } catch (err) {
    console.error("[auto-push] Push failed:", err.message);
  }
}

function schedule(filePath) {
  changedFiles.add(filePath);
  if (timer) clearTimeout(timer);
  timer = setTimeout(pushChanges, DEBOUNCE_MS);
}

setup();

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

