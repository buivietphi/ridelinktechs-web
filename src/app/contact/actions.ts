'use server';

import { createHmac } from 'node:crypto';
import { headers } from 'next/headers';
import { inHouseProducts } from '@/content/products';
import { defaultLocale, isLocale } from '@/i18n/config';
import { isInquiry } from './inquiry';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY ?? '';
const PEPPER = process.env.CONTACT_IP_PEPPER ?? '';
const ALLOWED_HOSTNAMES = (process.env.CONTACT_ALLOWED_HOSTNAMES ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const RPC = 'ridelink_contact_submit';
const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const WIDGET_ACTION = 'contact';

const MAX = { name: 120, email: 254, message: 4000, phone: 32, from: 80, token: 2048 } as const;
const RAW_CAP = 20_000;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 3_600_000;

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9]{6,20}$/;

export type ContactState = {
  ok: boolean;
  code: 'invalid' | 'captcha' | 'rate' | 'unavailable' | null;
  field: 'name' | 'email' | 'inquiry' | 'message' | 'phone' | 'from' | 'project' | null;
};

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

  if (str(formData.get('website')) !== '') {
    return { ok: true, code: null, field: null };
  }

  const raw = {
    name: str(formData.get('name')),
    email: str(formData.get('email')),
    message: str(formData.get('message')),
    phone: str(formData.get('phone')),
    from: str(formData.get('from')),
    project: str(formData.get('project')),
  };
  for (const v of Object.values(raw)) {
    if (v.length > RAW_CAP) return { ok: false, code: 'invalid', field: null };
  }

  const name = raw.name.replace(/\s+/g, ' ').replace(CONTROL, '').trim();
  const email = raw.email.replace(/\s+/g, ' ').replace(CONTROL, '').trim().toLowerCase();
  const message = raw.message.replace(/\r/g, '').replace(CONTROL, '').trim();

  const phone = raw.phone.replace(CONTROL, '').trim();
  const phoneDigits = phone.replace(/[^0-9]/g, '');
  const phoneClean = phone.startsWith('+') ? `+${phoneDigits}` : phoneDigits;

  const from = raw.from.replace(/\s+/g, ' ').replace(CONTROL, '').trim();
  const inquiry = str(formData.get('inquiry'));

  const localeRaw = str(formData.get('locale'));
  const locale = isLocale(localeRaw) ? localeRaw : defaultLocale;

  const projectSlug = raw.project.trim();
  const product = inHouseProducts.find((p) => p.slug === projectSlug);
  const project = product?.name[locale] ?? '';

  const token = str(formData.get('cf-turnstile-response'));

  const ipHash = hashIp(h);

  if (name === '' || name.length > MAX.name) return { ok: false, code: 'invalid', field: 'name' };
  if (email.length > MAX.email || !EMAIL.test(email)) {
    return { ok: false, code: 'invalid', field: 'email' };
  }
  if (!isInquiry(inquiry)) return { ok: false, code: 'invalid', field: 'inquiry' };
  if (message.length < 10 || message.length > MAX.message) {
    return { ok: false, code: 'invalid', field: 'message' };
  }
  if (phone !== '' && !PHONE.test(phoneClean)) {
    return { ok: false, code: 'invalid', field: 'phone' };
  }
  if (from.length > MAX.from) return { ok: false, code: 'invalid', field: 'from' };
  if (projectSlug !== '' && !product) return { ok: false, code: 'invalid', field: 'project' };
  if (!token || token.length > MAX.token) return { ok: false, code: 'captcha', field: null };

  if (ipHash && hitRate(ipHash)) {
    return { ok: false, code: 'rate', field: null };
  }

  if (!(await turnstileOk(token, h))) {
    return { ok: false, code: 'captcha', field: null };
  }

  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${RPC}`, {
      method: 'POST',
      headers: dbHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        p_name: name,
        p_email: email,
        p_message: message,
        p_phone: phone === '' ? null : phoneClean,
        p_from_source: from === '' ? null : from,
        p_source_url: refererPath(h),
        p_locale: locale,
        p_ip_hash: ipHash,
        p_rate_limit: RATE_LIMIT,
        p_window_secs: Math.round(RATE_WINDOW_MS / 1000),
        p_inquiry_type: inquiry,
        p_project: project === '' ? null : project,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    });
  } catch (err) {
    console.error('[contact] submit unreachable', err);
    return { ok: false, code: 'unavailable', field: null };
  }

  if (!res.ok) {
    console.error('[contact] submit failed', res.status, (await res.text()).slice(0, 500));
    return { ok: false, code: 'unavailable', field: null };
  }

  const body = (await res.json()) as { ok?: boolean; code?: string };
  if (body?.ok !== true) {
    if (body?.code === 'rate') return { ok: false, code: 'rate', field: null };
    console.error('[contact] submit returned', body);
    return { ok: false, code: 'unavailable', field: null };
  }

  if (ipHash) recordHit(ipHash);
  return { ok: true, code: null, field: null };
}

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

  const testing = json.metadata?.result_with_testing_key === true;
  if (testing) {
    console.error('[contact] turnstile accepted a TESTING keypair — the captcha is not enforced');
  }

  if (!testing && json.action !== WIDGET_ACTION) return false;

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
  try {
    return new URL(ref).pathname.slice(0, 300);
  } catch {
    return null;
  }
}
