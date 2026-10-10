'use server';

import { revalidatePath } from 'next/cache';
import { actAs } from '@/lib/admin/session';

const text = (v: unknown) => (typeof v === 'string' ? v : '');

async function run(name: string, args: Record<string, unknown>, success: string | null = null) {
  const result = await actAs(name, args, success);
  if (result.ok) {
    revalidatePath('/admin/accounts');
    revalidatePath('/admin/devices');
    revalidatePath('/admin/profile');
  }
  return result;
}

export async function createAccount(input: {
  email: string;
  name: string;
  role: string;
  password: string;
}) {
  return run('ridelink_admin_create_user', {
    p_email: text(input?.email).trim().toLowerCase(),
    p_display_name: text(input?.name).trim(),
    p_role: text(input?.role),
    p_password: text(input?.password),
  });
}

export async function updateAccount(id: string, name: string, role: string) {
  return run('ridelink_admin_update_user', {
    p_user_id: text(id),
    p_display_name: text(name).trim(),
    p_role: text(role),
  });
}

export async function setAccountBlocked(id: string, blocked: boolean) {
  return run('ridelink_admin_set_user_blocked', {
    p_user_id: text(id),
    p_blocked: blocked === true,
  });
}

export async function resetAccountPassword(id: string, password: string) {
  return run('ridelink_admin_reset_password', { p_user_id: text(id), p_password: text(password) });
}

export async function logoutAccount(id: string) {
  return run('ridelink_admin_logout_user', { p_user_id: text(id) });
}

export async function deleteAccount(id: string) {
  return run('ridelink_admin_delete_user', { p_user_id: text(id) });
}
