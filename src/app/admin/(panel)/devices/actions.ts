'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, actAs } from '@/lib/admin/session';

const text = (v: unknown) => (typeof v === 'string' ? v : '');

async function run(name: string, args: Record<string, unknown>) {
  const result = await actAs(name, args);
  if (result.ok && result.self) {
    (await cookies()).delete({ name: SESSION_COOKIE, path: '/admin' });
    redirect('/admin/login');
  }
  if (result.ok) {
    revalidatePath('/admin/devices');
    revalidatePath('/admin/accounts');
    revalidatePath('/admin/profile');
  }
  return result;
}

export async function logoutDevice(id: string) {
  return run('ridelink_admin_logout_device', { p_device_id: text(id) });
}

export async function setDeviceBlocked(id: string, blocked: boolean) {
  return run('ridelink_admin_set_device_blocked', {
    p_device_id: text(id),
    p_blocked: blocked === true,
  });
}

export async function deleteDevice(id: string) {
  return run('ridelink_admin_delete_device', { p_device_id: text(id) });
}
