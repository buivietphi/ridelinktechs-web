'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { Role } from '@/lib/admin/roles';

export function SessionWatch({ role }: { role: Role }) {
  const router = useRouter();

  useEffect(() => {
    let busy = false;
    const check = async () => {
      if (busy || document.visibilityState !== 'visible') return;
      busy = true;
      const res = await fetch('/admin/session', { cache: 'no-store' }).catch(() => null);
      if (res?.status === 401) {
        window.location.replace('/admin/login');
        return;
      }
      if (res?.ok) {
        const data = (await res.json().catch(() => null)) as { role?: Role } | null;
        if (data?.role && data.role !== role) router.refresh();
      }
      busy = false;
    };
    const timer = window.setInterval(check, 10_000);
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
    };
  }, [role, router]);

  return null;
}
