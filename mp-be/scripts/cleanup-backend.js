#!/usr/bin/env node
/*
  Cleanup utility for mp-be

  - Moves one-off maintenance scripts in project root to scripts/archive/
  - Deletes backup files (*.backup) and known temp/test artifacts
  - Can run in dry-run mode (default). Use --apply to perform changes.

  Usage:
    node scripts/cleanup-backend.js           # dry run
    node scripts/cleanup-backend.js --apply   # apply changes
*/

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..", "..");
const dryRun = !process.argv.includes("--apply");

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    if (dryRun) {
      console.log(`[dry-run] mkdir -p ${dirPath}`);
    } else {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}

function moveFile(src, dest) {
  if (dryRun) {
    console.log(`[dry-run] mv ${src} -> ${dest}`);
    return;
  }
  ensureDir(path.dirname(dest));
  fs.renameSync(src, dest);
}

function deletePath(targetPath) {
  if (!fs.existsSync(targetPath)) return;
  if (dryRun) {
    console.log(`[dry-run] rm -rf ${targetPath}`);
    return;
  }
  const stat = fs.lstatSync(targetPath);
  if (stat.isDirectory()) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  } else {
    fs.unlinkSync(targetPath);
  }
}

function listFiles(dir) {
  return fs.existsSync(dir)
    ? fs.readdirSync(dir).map((f) => path.join(dir, f))
    : [];
}

const root = projectRoot;
const scriptsDir = path.join(root, "scripts");
const archiveDir = path.join(scriptsDir, "archive");

// Identifiers for one-off scripts living at repo root
const oneOffScriptPrefixes = [
  "fix-",
  "update-",
  "increase-",
  "switch-",
  "add-",
  "use-",
  "improve-",
  "check-",
  "debug-",
  "migrate-",
];

const oneOffScriptAllowlist = new Set([
  // Keep entrypoint and config-like files out of moving logic
  "index.js",
]);

const rootEntries = listFiles(root);

// 1) Move one-off maintenance scripts from root to scripts/archive
const moveCandidates = rootEntries.filter((absPath) => {
  const base = path.basename(absPath);
  return (
    base.endsWith(".js") &&
    !oneOffScriptAllowlist.has(base) &&
    oneOffScriptPrefixes.some((p) => base.startsWith(p))
  );
});

if (moveCandidates.length) {
  ensureDir(archiveDir);
  moveCandidates.forEach((absPath) => {
    const dest = path.join(archiveDir, path.basename(absPath));
    moveFile(absPath, dest);
  });
}

// 2) Delete backup files and temp/test artifacts
const deleteGlobs = [
  // Backups
  /\.backup$/,
  // Temporary files
  /^temp_.*\.txt$/, // temp_*.txt
  /^temp_(top|bottom)\.txt$/,
  /^temp_response\.json$/,
  // Ad-hoc test artifacts
  /^test-file\.txt$/,
  /^test-results\.txt$/,
];

const deleteCandidates = rootEntries.filter((absPath) => {
  const base = path.basename(absPath);
  return deleteGlobs.some((re) => re.test(base));
});

deleteCandidates.forEach((absPath) => deletePath(absPath));

// 3) Optional: propose deleting logs from VCS working tree (not removing directory by default)
const logsDir = path.join(root, "logs");
if (fs.existsSync(logsDir)) {
  console.log(
    `[info] Logs exist at ${logsDir}. Consider clearing tracked files and relying on .gitignore.`
  );
}

console.log(dryRun ? "Completed dry run." : "Applied cleanup.");
