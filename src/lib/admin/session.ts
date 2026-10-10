import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { toResult, type ActionResult, type RpcResult } from './result';
import { RpcError, rpc } from './rpc';
import { can, type Role } from './roles';

export const SESSION_COOKIE = 'rl_admin';
export const SESSION_TTL_SECS = 7 * 24 * 60 * 60;

export type AdminSession = {
  userId: string;
  email: string;
  displayName: string;
  role: Role;
  avatar: string | null;
  mustChangePassword: boolean;
  deviceId: string;
};

export type EndReason =
  | 'admin_logout'
  | 'self_logout'
  | 'account_blocked'
  | 'device_blocked'
  | 'password_reset'
  | 'password_changed'
  | 'expired'
  | 'ended';

type SessionRow =
  | { ok: false; reason: EndReason }
  | {
      ok: true;
      user_id: string;
      email: string;
      display_name: string;
      role: Role;
      avatar: string | null;
      must_change_password: boolean;
      device_id: string;
    };

export const newToken = () => randomBytes(32).toString('base64url');
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export async function sessionTokenHash(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? hashToken(token) : null;
}

export const getSessionState = cache(
  async (): Promise<{ session: AdminSession | null; ended: EndReason | null }> => {
    const tokenHash = await sessionTokenHash();
    if (!tokenHash) return { session: null, ended: null };
    const row = await rpc<SessionRow>('ridelink_auth_session', { p_token_hash: tokenHash });
    if (!row.ok) return { session: null, ended: row.reason };
    return {
      session: {
        userId: row.user_id,
        email: row.email,
        displayName: row.display_name,
        role: row.role,
        avatar: row.avatar,
        mustChangePassword: row.must_change_password,
        deviceId: row.device_id,
      },
      ended: null,
    };
  },
);

export const getSession = async () => (await getSessionState()).session;

export async function requireSession(
  min: Role,
  { allowPending = false }: { allowPending?: boolean } = {},
): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  if (session.mustChangePassword && !allowPending) redirect('/admin/password');
  if (!can(session.role, min)) redirect('/admin');
  return session;
}

export async function callAs<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  const tokenHash = await sessionTokenHash();
  if (!tokenHash) redirect('/admin/login');
  let failure: RpcError | null = null;
  try {
    return await rpc<T>(name, { p_token_hash: tokenHash, ...args });
  } catch (error) {
    if (!(error instanceof RpcError)) throw error;
    failure = error;
  }
  if (failure.code === 'unauthenticated') redirect('/admin/login');
  if (failure.code === 'password_change_required') redirect('/admin/password');
  if (failure.code === 'forbidden') redirect('/admin');
  throw failure;
}

export async function actAs(
  name: string,
  args: Record<string, unknown>,
  success: string | null = null,
): Promise<ActionResult> {
  let row: RpcResult;
  try {
    row = await callAs<RpcResult>(name, args);
  } catch (error) {
    if (error instanceof RpcError) return toResult({ ok: false, code: null });
    throw error;
  }
  return toResult(row, success);
}
