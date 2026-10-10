import type { Metadata } from 'next';
import { callAs, requireSession } from '@/lib/admin/session';
import { AccountsView, type Account } from './AccountsView';

export const metadata: Metadata = { title: 'Tài khoản' };

export default async function AccountsPage() {
  const session = await requireSession('owner');
  const accounts = await callAs<Account[]>('ridelink_admin_list_users');
  return <AccountsView accounts={accounts} role={session.role} />;
}
