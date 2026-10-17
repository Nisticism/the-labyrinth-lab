// Thin async wrapper around data/gallery-config.json with mutation helpers.
// All writes are atomic (write to .tmp then rename) and serialized via a tiny
// in-process mutex to avoid concurrent-write corruption.

const fs = require('fs/promises');
const fssync = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const CONFIG_PATH = path.join(DATA_DIR, 'gallery-config.json');

let writeChain = Promise.resolve();

async function ensureDir() {
  if (!fssync.existsSync(DATA_DIR)) {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function read() {
  await ensureDir();
  if (!fssync.existsSync(CONFIG_PATH)) return [];
  const raw = await fs.readFile(CONFIG_PATH, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function write(data) {
  await ensureDir();
  const tmp = CONFIG_PATH + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, CONFIG_PATH);
}

function withLock(fn) {
  const next = writeChain.then(fn, fn);
  // Keep chain alive even if fn rejects; swallow rejection in the chain only.
  writeChain = next.catch(() => {});
  return next;
}

module.exports = { read, write, withLock, CONFIG_PATH };
