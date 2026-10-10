import 'server-only';
import { createHmac } from 'node:crypto';

const PEPPER = process.env.CONTACT_IP_PEPPER ?? '';

export function clientIp(h: Headers): string | undefined {
  const raw =
    h.get('cf-connecting-ip') ?? h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0];
  const ip = raw?.trim();
  return ip && /^[0-9a-f:.]{3,45}$/i.test(ip) ? ip : undefined;
}

export function hashIp(h: Headers): string | null {
  const ip = clientIp(h);
  if (!ip || !PEPPER) return null;
  return createHmac('sha256', PEPPER).update(ip).digest('hex');
}
