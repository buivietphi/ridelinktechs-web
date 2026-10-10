import type { Metadata } from 'next';
import { callAs, requireSession } from '@/lib/admin/session';
import { DevicesView, type Device } from './DevicesView';

export const metadata: Metadata = { title: 'Thiết bị' };

export default async function DevicesPage() {
  const session = await requireSession('owner');
  const devices = await callAs<Device[]>('ridelink_admin_list_devices');
  return <DevicesView devices={devices} role={session.role} />;
}
