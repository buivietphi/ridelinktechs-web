'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { toResult, type ActionResult } from '@/lib/admin/result';
import { rpc } from '@/lib/admin/rpc';
import { SESSION_COOKIE, actAs, sessionTokenHash } from '@/lib/admin/session';

const text = (v: unknown) => (typeof v === 'string' ? v : '');

export async function logout() {
  const tokenHash = await sessionTokenHash();
  if (tokenHash) await rpc('ridelink_auth_logout', { p_token_hash: tokenHash }).catch(() => null);
  (await cookies()).delete({ name: SESSION_COOKIE, path: '/admin' });
  redirect('/admin/login');
}

export async function changePassword(input: {
  current: string;
  next: string;
  confirm: string;
}): Promise<ActionResult> {
  const next = text(input?.next);
  if (next !== text(input?.confirm)) return toResult({ ok: false, code: 'mismatch' });
  const bytes = Buffer.byteLength(next);
  if (bytes < 10 || bytes > 72) return toResult({ ok: false, code: 'weak' });

  const result = await actAs('ridelink_auth_change_password', {
    p_current: text(input?.current),
    p_new: next,
  });
  if (!result.ok) return result;
  redirect('/admin');
}
