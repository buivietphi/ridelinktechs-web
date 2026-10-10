import type { Metadata } from 'next';
import { callAs, requireSession } from '@/lib/admin/session';
import { ProfileView, type Profile } from './ProfileView';

export const metadata: Metadata = { title: 'Tài khoản của tôi' };

export default async function ProfilePage() {
  await requireSession('sub');
  const profile = await callAs<Profile>('ridelink_auth_profile');
  return <ProfileView profile={profile} />;
}
