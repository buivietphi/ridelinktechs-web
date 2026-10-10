import type { Metadata } from 'next';
import { requireSession } from '@/lib/admin/session';
import { PasswordForm } from './PasswordForm';

export const metadata: Metadata = { title: 'Đổi mật khẩu' };

export default async function PasswordPage() {
  const session = await requireSession('sub', { allowPending: true });
  return <PasswordForm temporary={session.mustChangePassword} />;
}
