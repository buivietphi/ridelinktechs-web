'use server';

import { revalidatePath } from 'next/cache';
import { toResult } from '@/lib/admin/result';
import { actAs } from '@/lib/admin/session';

const AVATAR = /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/;

export async function setAvatar(value: string | null) {
  const avatar = typeof value === 'string' ? value : '';
  if (avatar && (avatar.length > 120_000 || !AVATAR.test(avatar))) {
    return toResult({ ok: false, code: 'invalid' });
  }
  const result = await actAs('ridelink_auth_set_avatar', { p_avatar: avatar || null });
  if (result.ok) revalidatePath('/admin', 'layout');
  return result;
}
