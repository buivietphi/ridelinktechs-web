import { AdminBar, type NavItem } from '@/components/admin/AdminBar';
import { PageEnter } from '@/components/admin/PageEnter';
import { SessionWatch } from '@/components/admin/SessionWatch';
import { ToastProvider } from '@/components/admin/Toast';
import { can, type Role } from '@/lib/admin/roles';
import { requireSession } from '@/lib/admin/session';

const SECTIONS: (NavItem & { min: Role })[] = [
  { href: '/admin/contacts', label: 'Liên hệ', icon: 'contacts', min: 'sub' },
  { href: '/admin/accounts', label: 'Tài khoản', icon: 'accounts', min: 'owner' },
  { href: '/admin/devices', label: 'Thiết bị', icon: 'devices', min: 'owner' },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession('sub', { allowPending: true });
  const items = session.mustChangePassword
    ? []
    : SECTIONS.filter((section) => can(session.role, section.min)).map(({ href, label, icon }) => ({
        href,
        label,
        icon,
      }));

  return (
    <ToastProvider>
      <div className="admin-shell min-h-dvh bg-[var(--ground)]">
        <AdminBar
          items={items}
          user={{
            name: session.displayName,
            email: session.email,
            role: session.role,
            avatar: session.avatar,
          }}
        />
        <main
          id="main"
          className="mx-auto w-full max-w-[1240px] px-4 pt-28 pb-32 sm:px-6 md:pb-16 lg:px-8"
        >
          <PageEnter>{children}</PageEnter>
        </main>
        <SessionWatch role={session.role} />
      </div>
    </ToastProvider>
  );
}
