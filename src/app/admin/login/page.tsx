import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionState } from '@/lib/admin/session';
import { LoginScreen } from './LoginScreen';

export const metadata: Metadata = { title: 'Đăng nhập' };

export default async function LoginPage() {
  const { session, ended } = await getSessionState().catch(() => ({ session: null, ended: null }));
  if (session) redirect('/admin');
  return <LoginScreen ended={ended} />;
}
