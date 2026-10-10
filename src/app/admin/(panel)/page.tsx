import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/admin/session';

export default async function AdminHome() {
  await requireSession('sub');
  redirect('/admin/contacts');
}
