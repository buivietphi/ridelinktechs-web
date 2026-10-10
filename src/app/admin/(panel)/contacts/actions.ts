'use server';

import { revalidatePath } from 'next/cache';
import { actAs } from '@/lib/admin/session';

const text = (v: unknown) => (typeof v === 'string' ? v : '');

export async function setContactStatus(id: string, status: string) {
  const result = await actAs('ridelink_contact_update', {
    p_id: text(id),
    p_status: text(status),
    p_admin_note: null,
  });
  if (result.ok) revalidatePath('/admin/contacts');
  return result;
}

export async function saveContactNote(id: string, note: string) {
  const result = await actAs(
    'ridelink_contact_update',
    { p_id: text(id), p_status: null, p_admin_note: text(note).slice(0, 2000) },
    'Đã lưu ghi chú.',
  );
  if (result.ok) revalidatePath('/admin/contacts');
  return result;
}
