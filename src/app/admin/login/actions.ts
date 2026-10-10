'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { deviceName } from '@/lib/admin/device-name';
import { rpc } from '@/lib/admin/rpc';
import { SESSION_COOKIE, SESSION_TTL_SECS, hashToken, newToken } from '@/lib/admin/session';
import { hashIp } from '@/lib/ip';

export type LoginCode =
  'invalid' | 'rate' | 'account_blocked' | 'device_blocked' | 'device' | 'unavailable';

export type LoginState = { code: LoginCode | null; until?: string | null };

type LoginRow = {
  ok: boolean;
  code: LoginCode | null;
  until?: string;
  must_change_password?: boolean;
};

const str = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v : '');

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = str(form.get('email')).trim().toLowerCase();
  const password = str(form.get('password'));
  const device = str(form.get('device')).trim().toLowerCase();

  if (!/^[0-9a-f]{8,128}$/.test(device)) return { code: 'device' };
  if (!email || email.length > 254 || !password || password.length > 200) {
    return { code: 'invalid' };
  }

  const h = await headers();
  const ua = (h.get('user-agent') ?? '').slice(0, 512);
  const token = newToken();

  let row: LoginRow;
  try {
    row = await rpc<LoginRow>('ridelink_auth_login', {
      p_email: email,
      p_password: password,
      p_device_hash: device,
      p_device_name: deviceName(ua),
      p_user_agent: ua || null,
      p_ip_hash: hashIp(h),
      p_token_hash: hashToken(token),
      p_ttl_secs: SESSION_TTL_SECS,
    });
  } catch {
    return { code: 'unavailable' };
  }

  if (!row.ok) return { code: row.code ?? 'unavailable', until: row.until ?? null };

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: SESSION_TTL_SECS,
  });
  redirect(row.must_change_password ? '/admin/password' : '/admin');
}
