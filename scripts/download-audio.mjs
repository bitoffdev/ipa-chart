/**
 * Download IPA chart pronunciation MP3s from the official site into public/audio/.
 *
 * Usage:
 *   node scripts/download-audio.mjs              # skip existing files
 *   node scripts/download-audio.mjs --force      # re-download all
 *   node scripts/download-audio.mjs --speaker JE # one speaker only
 *   node scripts/download-audio.mjs --dry-run    # list URLs only
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SYMBOLS_PATH = join(ROOT, 'src', 'data', 'symbols.json');
const OUT_DIR = join(ROOT, 'public', 'audio');

const BASE_URL =
  'https://www.internationalphoneticassociation.org/IPAcharts/common_files/sounds';

const SPEAKERS = ['JE', 'JH', 'PL', 'JW'];
const CONCURRENCY = 6;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function parseArgs(argv) {
  const opts = {
    force: false,
    dryRun: false,
    speakers: [...SPEAKERS],
  };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--force' || arg === '-f') opts.force = true;
    else if (arg === '--dry-run' || arg === '-n') opts.dryRun = true;
    else if (arg === '--speaker' || arg === '-s') {
      const value = argv[++i];
      if (!value) throw new Error('--speaker requires JE, JH, PL, or JW');
      opts.speakers = value.split(',').map((s) => s.trim().toUpperCase());
    } else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node scripts/download-audio.mjs [options]

Options:
  --force, -f           Re-download even if the file already exists
  --dry-run, -n         Print URLs without downloading
  --speaker, -s ID      Comma-separated speaker IDs (JE, JH, PL, JW)
  --help, -h            Show this help
`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  for (const id of opts.speakers) {
    if (!SPEAKERS.includes(id)) {
      throw new Error(`Invalid speaker "${id}". Use: ${SPEAKERS.join(', ')}`);
    }
  }
  return opts;
}

function collectDownloads(symbols, speakers) {
  /** @type {Map<string, { speakerId: string, fileKey: string }>} */
  const tasks = new Map();
  for (const sym of symbols) {
    for (const entry of sym.audio ?? []) {
      if (!speakers.includes(entry.speakerId)) continue;
      for (const clip of entry.clips ?? []) {
        const key = `${entry.speakerId}/${clip.fileKey}`;
        if (!tasks.has(key)) {
          tasks.set(key, { speakerId: entry.speakerId, fileKey: clip.fileKey });
        }
      }
    }
  }
  return [...tasks.values()].sort(
    (a, b) => a.speakerId.localeCompare(b.speakerId) || a.fileKey.localeCompare(b.fileKey),
  );
}

function audioUrl(speakerId, fileKey) {
  return `${BASE_URL}/${speakerId}/${fileKey}.mp3`;
}

function outPath(speakerId, fileKey) {
  return join(OUT_DIR, speakerId, `${fileKey}.mp3`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'ipa-chart-audio-downloader/1.0 (educational)' },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 100) {
        throw new Error(`Response too small (${buf.length} bytes)`);
      }
      return buf;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS * attempt);
    }
  }
  throw lastError;
}

async function runPool(tasks, worker, concurrency) {
  let index = 0;
  async function runNext() {
    while (index < tasks.length) {
      const i = index++;
      await worker(tasks[i], i);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, runNext));
}

async function main() {
  const opts = parseArgs(process.argv);
  const symbols = JSON.parse(readFileSync(SYMBOLS_PATH, 'utf8'));
  const downloads = collectDownloads(symbols, opts.speakers);

  console.log(`Found ${downloads.length} unique audio file(s) for: ${opts.speakers.join(', ')}`);

  if (opts.dryRun) {
    for (const { speakerId, fileKey } of downloads) {
      console.log(audioUrl(speakerId, fileKey));
    }
    return;
  }

  for (const id of opts.speakers) {
    mkdirSync(join(OUT_DIR, id), { recursive: true });
  }

  const stats = { ok: 0, skipped: 0, failed: 0 };
  const failures = [];

  await runPool(
    downloads,
    async ({ speakerId, fileKey }) => {
      const dest = outPath(speakerId, fileKey);
      const url = audioUrl(speakerId, fileKey);

      if (!opts.force && existsSync(dest)) {
        const size = statSync(dest).size;
        if (size >= 100) {
          stats.skipped++;
          return;
        }
      }

      try {
        const data = await fetchWithRetry(url);
        writeFileSync(dest, data);
        stats.ok++;
        process.stdout.write(`\rDownloaded ${stats.ok + stats.skipped + stats.failed}/${downloads.length}…`);
      } catch (err) {
        stats.failed++;
        failures.push({ speakerId, fileKey, url, error: err.message ?? String(err) });
      }
    },
    CONCURRENCY,
  );

  console.log('\n');
  console.log(`Done: ${stats.ok} downloaded, ${stats.skipped} skipped, ${stats.failed} failed`);

  if (failures.length > 0) {
    console.log('\nFailures:');
    for (const f of failures.slice(0, 20)) {
      console.log(`  ${f.speakerId}/${f.fileKey}.mp3 — ${f.error}`);
    }
    if (failures.length > 20) {
      console.log(`  … and ${failures.length - 20} more`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
