import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const nextDir = path.join(projectRoot, ".next");
const lockFile = path.join(nextDir, "dev", "lock");

const args = new Set(process.argv.slice(2));
const lockOnly = args.has("--lock-only");

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (await exists(lockFile)) {
    await fs.rm(lockFile, { force: true });
    // eslint-disable-next-line no-console
    console.log(`Removed stale lock: ${path.relative(projectRoot, lockFile)}`);
  }

  if (!lockOnly && (await exists(nextDir))) {
    await fs.rm(nextDir, { recursive: true, force: true });
    // eslint-disable-next-line no-console
    console.log(`Removed: ${path.relative(projectRoot, nextDir)}`);
  }
}

await main();
