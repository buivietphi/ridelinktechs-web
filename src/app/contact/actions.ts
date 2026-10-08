'use server';

import { createHmac } from 'node:crypto';
import { headers } from 'next/headers';
import { defaultLocale, isLocale } from '@/i18n/config';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY ?? '';
const PEPPER = process.env.CONTACT_IP_PEPPER ?? '';
const ALLOWED_HOSTNAMES = (process.env.CONTACT_ALLOWED_HOSTNAMES ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const TABLE = 'ridelink_contact_message';
const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const WIDGET_ACTION = 'contact';

const MAX = { name: 120, email: 254, message: 4000, phone: 32, from: 80, token: 2048 } as const;
const RAW_CAP = 20_000;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 3_600_000;

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
// Deliberately loose, and identical to the client regex in ContactForm and the
// CHECK in the migration: no whitespace survives, so no CRLF header injection.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// What a phone reduces to once every separator a human might type is dropped:
// an optional leading + and 6-20 digits. Mirrors
// ridelink_contact_message_phone_ck exactly, so a value that survives here
// cannot be rejected by Postgres.
const PHONE = /^\+?[0-9]{6,20}$/;

export type ContactState = {
  ok: boolean;
  code: 'invalid' | 'captcha' | 'rate' | 'unavailable' | null;
  field: 'name' | 'email' | 'message' | 'phone' | 'from' | null;
};

// In-process pre-siteverify limiter. The database count only ever sees requests
// that already passed Turnstile, so a bot that never solves the widget would
// otherwise make unlimited siteverify calls. This one bounds that path.
// Per-instance and lost on restart; the database count is the durable half.
const hits = new Map<string, number[]>();
const MAX_TRACKED_IPS = 5_000;

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  if (!SUPABASE_URL || !KEY || !TURNSTILE_SECRET || !PEPPER) {
    console.error('[contact] server env incomplete');
    return { ok: false, code: 'unavailable', field: null };
  }

  const h = await headers();

  // Honeypot: answer as if it worked, so the field is never tuned or removed.
  if (str(formData.get('website')) !== '') {
    return { ok: true, code: null, field: null };
  }

  const raw = {
    name: str(formData.get('name')),
    email: str(formData.get('email')),
    message: str(formData.get('message')),
    phone: str(formData.get('phone')),
    from: str(formData.get('from')),
  };
  for (const v of Object.values(raw)) {
    if (v.length > RAW_CAP) return { ok: false, code: 'invalid', field: null };
  }

  // Trim everything: the CHECKs use btrim() and a whitespace-free email regex,
  // so an untrimmed payload (trailing newline from a paste) would fail loudly.
  const name = raw.name.replace(/\s+/g, ' ').replace(CONTROL, '').trim();
  const email = raw.email.replace(/\s+/g, ' ').replace(CONTROL, '').trim().toLowerCase();
  const message = raw.message.replace(/\r/g, '').replace(CONTROL, '').trim();

  // Both of these are optional, so blank means "not given" and must survive.
  // The phone is normalised rather than validated as typed: a human writes
  // "0912 345 678" or "+84 912.345.678", and neither should be a failed
  // submission. Everything but a leading + and the digits is dropped.
  //
  // Whether the field was FILLED is judged on the raw input, not on the
  // normalised one. Judging the normalised value collapses any digit-free typo
  // ("abc", "khong co") to the same thing as leaving the box empty, so the
  // visitor gets silence where they needed to be told. An untouched box stays
  // optional; a filled box that reduces to nothing dialled is reported.
  const phone = raw.phone.replace(CONTROL, '').trim();
  const phoneDigits = phone.replace(/[^0-9]/g, '');
  const phoneClean = phone.startsWith('+') ? `+${phoneDigits}` : phoneDigits;

  // Free text, so only length is capped. NULL rather than '' because the CHECK
  // rejects an empty string and PostgREST would 400 the whole insert.
  const from = raw.from.replace(/\s+/g, ' ').replace(CONTROL, '').trim();

  const localeRaw = str(formData.get('locale'));
  const locale = isLocale(localeRaw) ? localeRaw : defaultLocale;

  const token = str(formData.get('cf-turnstile-response'));

  const ipHash = hashIp(h);

  if (name === '' || name.length > MAX.name) return { ok: false, code: 'invalid', field: 'name' };
  if (email.length > MAX.email || !EMAIL.test(email)) {
    return { ok: false, code: 'invalid', field: 'email' };
  }
  if (message.length < 10 || message.length > MAX.message) {
    return { ok: false, code: 'invalid', field: 'message' };
  }
  // Both optional, so blank is accepted. A phone that was typed but cannot be
  // dialled is a typo worth reporting rather than silently dropping.
  if (phone !== '' && !PHONE.test(phoneClean)) {
    return { ok: false, code: 'invalid', field: 'phone' };
  }
  if (from.length > MAX.from) return { ok: false, code: 'invalid', field: 'from' };
  if (!token || token.length > MAX.token) return { ok: false, code: 'captcha', field: null };

  // Cheapest gate first: a rejected bot never reaches Cloudflare or Postgres.
  if (ipHash && (hitRate(ipHash) || (await overRateLimit(ipHash)))) {
    return { ok: false, code: 'rate', field: null };
  }

  // Fail CLOSED. Cloudflare being unreachable must not silently disable the bot
  // gate on a public write endpoint. The visitor still has the phone and email
  // rendered directly above this form.
  if (!(await turnstileOk(token, h))) {
    return { ok: false, code: 'captcha', field: null };
  }

  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers: dbHeaders({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
      body: JSON.stringify({
        name,
        email,
        message,
        phone: phone === '' ? null : phoneClean,
        from_source: from === '' ? null : from,
        locale,
        status: 'new',
        ip_hash: ipHash,
        source_url: refererPath(h),
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    });
  } catch (err) {
    console.error('[contact] insert unreachable', err);
    return { ok: false, code: 'unavailable', field: null };
  }

  if (!res.ok) {
    // The PostgREST error body is {code, details, hint, message} and carries no
    // request headers, so logging it cannot leak the service key.
    console.error('[contact] insert failed', res.status, (await res.text()).slice(0, 500));
    return { ok: false, code: 'unavailable', field: null };
  }

  if (ipHash) recordHit(ipHash);
  return { ok: true, code: null, field: null };
}

// --- helpers. A 'use server' module may only export async functions. ---

function dbHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    Accept: 'application/json',
    ...extra,
  };
}

function hitRate(ipHash: string): boolean {
  const since = Date.now() - RATE_WINDOW_MS;
  const seen = (hits.get(ipHash) ?? []).filter((t) => t > since);
  hits.set(ipHash, seen);
  return seen.length >= RATE_LIMIT;
}

function recordHit(ipHash: string): void {
  const seen = hits.get(ipHash) ?? [];
  seen.push(Date.now());
  hits.set(ipHash, seen);
  if (hits.size > MAX_TRACKED_IPS) hits.clear();
}

async function overRateLimit(ipHash: string): Promise<boolean> {
  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?select=id&ip_hash=eq.${ipHash}` +
        `&submitted_at=gt.${since}&limit=${RATE_LIMIT + 1}`,
      { headers: dbHeaders(), cache: 'no-store', signal: AbortSignal.timeout(8_000) },
    );
    // Never lock the form out because the limiter itself is unavailable.
    if (!res.ok) return false;
    const rows: unknown = await res.json();
    return Array.isArray(rows) && rows.length > RATE_LIMIT;
  } catch (err) {
    console.error('[contact] rate limit check failed', err);
    return false;
  }
}

async function turnstileOk(token: string, h: Headers): Promise<boolean> {
  const body = new URLSearchParams({ secret: TURNSTILE_SECRET, response: token });
  const ip = clientIp(h);
  if (ip) body.set('remoteip', ip);

  let res: Response;
  try {
    res = await fetch(SITEVERIFY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    console.error('[contact] siteverify unreachable');
    return false;
  }

  // Siteverify answers HTTP 200 for every application-level outcome, so the
  // status is worthless here. Verified live with a bogus token:
  // 200 {"error-codes":["invalid-input-response"],"success":false}
  if (!res.ok) return false;

  let json: {
    success?: boolean;
    action?: string;
    hostname?: string;
    metadata?: { result_with_testing_key?: boolean };
  };
  try {
    json = (await res.json()) as typeof json;
  } catch {
    return false;
  }

  if (json.success !== true) {
    console.warn('[contact] turnstile denied');
    return false;
  }

  // Cloudflare's own flag for a response produced by a dummy keypair. Verified
  // live: a testing-key response carries no `action` field at all, so the
  // action check below would reject every dev submission forever.
  const testing = json.metadata?.result_with_testing_key === true;
  if (testing) {
    // Loud on purpose. A testing keypair accepts every token, so shipping one
    // to production silently turns the bot gate off; this line is the only
    // thing standing between that mistake and a spam-filled table.
    console.error('[contact] turnstile accepted a TESTING keypair — the captcha is not enforced');
  }

  // The widget renders with action="contact"; a token minted for another action
  // on this sitekey is not valid here.
  if (!testing && json.action !== WIDGET_ACTION) return false;

  // Turnstile binds a token to the sitekey/secret pair, not to an action, and
  // one sitekey may be registered for many hostnames. Surface every hostname
  // that ever passes so a shared sitekey shows up in the logs on day one.
  console.warn('[contact] turnstile accepted from', json.hostname);
  if (ALLOWED_HOSTNAMES.length > 0 && !ALLOWED_HOSTNAMES.includes(json.hostname ?? '')) {
    return false;
  }

  return true;
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v : '';
}

function clientIp(h: Headers): string | undefined {
  const raw =
    h.get('cf-connecting-ip') ?? h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0];
  const ip = raw?.trim();
  return ip && /^[0-9a-f:.]{3,45}$/i.test(ip) ? ip : undefined;
}

function hashIp(h: Headers): string | null {
  const ip = clientIp(h);
  if (!ip) return null;
  return createHmac('sha256', PEPPER).update(ip).digest('hex');
}

function refererPath(h: Headers): string | null {
  const ref = h.get('referer');
  if (!ref) return null;
  // pathname only: a full Referer carries campaign params and pasted search text
  try {
    return new URL(ref).pathname.slice(0, 300);
  } catch {
    return null;
  }
}
