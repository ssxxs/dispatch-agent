/**
 * Record a browser session of /demo/hvac (text mode) as WebM via Playwright.
 * Output: recordings/*.webm (one file per browser context)
 *
 * Usage: npm run record:demo-hvac
 * Env:   DEMO_URL (optional), RECORD_WAIT_MS (default 45000)
 */

import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BASE =
  process.env.DEMO_URL?.replace(/\/$/, '') ||
  'https://dispatch-agent-seven.vercel.app';
const URL = `${BASE}/demo/hvac`;
const OUT_DIR = join(process.cwd(), 'recordings');
const WAIT_MS = Number(process.env.RECORD_WAIT_MS || 45000);

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

console.log('Recording ->', URL);
console.log('Per-step wait', WAIT_MS, 'ms');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 720 } },
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
});

context.setDefaultTimeout(120000);

const page = await context.newPage();

try {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 180000 });
  await page.getByRole('heading', { name: /Meet/i }).waitFor({ state: 'visible', timeout: 120000 });

  await page.getByRole('button', { name: /Text chat/i }).click();
  await page.getByPlaceholder(/message/i).waitFor({ state: 'visible', timeout: 120000 });
  await sleep(1500);

  await page.getByPlaceholder(/message/i).fill('My AC stopped cooling. When can someone come?');
  await page.getByRole('button', { name: 'Send' }).click();
  await sleep(WAIT_MS);

  await page.getByRole('button', { name: /^Reset$/i }).click();
  await sleep(2000);

  await page.getByPlaceholder(/message/i).fill(
    "There's water flooding from my unit, this is an emergency!"
  );
  await page.getByRole('button', { name: 'Send' }).click();
  await sleep(WAIT_MS);
} catch (e) {
  const shot = join(OUT_DIR, `record-error-${Date.now()}.png`);
  await page.screenshot({ path: shot, fullPage: true }).catch(() => {});
  console.error('Script failed:', e.message);
  console.error('Screenshot:', shot);
  throw e;
} finally {
  await context.close();
  await browser.close();
}

console.log('Done. WebM files under:', OUT_DIR);
