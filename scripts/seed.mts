/**
 * Creates a demo host account, an API key and the demo listings in the booking API.
 *
 *   npm run seed            # local API: writes the key to .env.local (skips if already seeded)
 *   npm run seed -- --force # always creates a fresh demo account
 *   BOOKING_API_URL=https://your-api.onrender.com npm run seed
 *                           # deployed API: prints the key to paste into your host's settings
 */
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const API_URL = (process.env.BOOKING_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const ENV_FILE = new URL('../.env.local', import.meta.url);
const IS_LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(API_URL);

interface Photo {
  url: string;
  author: string;
  license: string;
}
interface DemoListing {
  photos: string;
  metadata: Record<string, unknown>;
  [field: string]: unknown;
}

async function call(path: string, init: RequestInit & { token?: string; key?: string } = {}) {
  const response = await fetch(`${API_URL}/v1${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init.token ? { authorization: `Bearer ${init.token}` } : {}),
      ...(init.key ? { 'x-api-key': init.key } : {}),
    },
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`${init.method ?? 'GET'} ${path}: ${JSON.stringify(body)}`);
  return body;
}

function readEnvFile(): Record<string, string> {
  if (!existsSync(ENV_FILE)) return {};
  return Object.fromEntries(
    readFileSync(ENV_FILE, 'utf8')
      .split('\n')
      .filter((line) => line.includes('=') && !line.startsWith('#'))
      .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]),
  );
}

async function alreadySeeded(): Promise<boolean> {
  const key = readEnvFile().BOOKING_API_KEY;
  if (!key) return false;
  try {
    const page = await call('/resources?limit=1', { key });
    return page.data.length > 0;
  } catch {
    return false;
  }
}

if (IS_LOCAL && !process.argv.includes('--force') && (await alreadySeeded())) {
  console.log('Already seeded: .env.local has a working API key with listings. Use --force to redo.');
  process.exit(0);
}

const listings: DemoListing[] = JSON.parse(
  readFileSync(new URL('./demo-listings.json', import.meta.url), 'utf8'),
);
const photos: Record<string, Photo[]> = JSON.parse(
  readFileSync(new URL('./demo-photos.json', import.meta.url), 'utf8'),
);

const email = `demo-host-${randomBytes(4).toString('hex')}@example.com`;
const password = randomBytes(18).toString('base64url');
const { accessToken } = await call('/auth/signup', {
  method: 'POST',
  body: JSON.stringify({ email, password, name: 'Hourstay demo host' }),
});
const { key } = await call('/api-keys', {
  method: 'POST',
  token: accessToken,
  body: JSON.stringify({ name: 'Hourstay storefront' }),
});

for (const { photos: photoSet, metadata, ...resource } of listings) {
  const set = photos[photoSet] ?? [];
  await call('/resources', {
    method: 'POST',
    key,
    body: JSON.stringify({
      ...resource,
      metadata: {
        ...metadata,
        images: set.map((p) => p.url),
        photoCredits: set.map((p) => `${p.author} (${p.license})`),
      },
    }),
  });
  console.log(`  + ${resource.name}`);
}

if (!IS_LOCAL) {
  console.log(`\nSeeded ${listings.length} listings on ${API_URL}.`);
  console.log('Set these environment variables on your frontend host (e.g. Vercel):');
  console.log(`  BOOKING_API_URL=${API_URL}`);
  console.log(`  BOOKING_API_KEY=${key}`);
  console.log(`Demo host login (for the API docs): ${email} / ${password}`);
  process.exit(0);
}

writeFileSync(
  ENV_FILE,
  [
    '# Written by `npm run seed`. Do not commit.',
    `BOOKING_API_URL=${API_URL}`,
    `BOOKING_API_KEY=${key}`,
    `# Demo host login for the API docs: ${email} / ${password}`,
    '',
  ].join('\n'),
);
console.log(`Seeded ${listings.length} listings. API key saved to .env.local`);
