'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowSquareOut,
  CaretDown,
  ChatsCircle,
  Key,
  Monitor,
  SignOut,
  UserCircle,
  UsersThree,
} from 'phosphor-react';
import { useRef } from 'react';
import { logout } from '@/app/admin/(panel)/actions';
import { CelestialToggle } from '@/components/theme/CelestialToggle';
import { LogoMark } from '@/components/ui/LogoMark';
import { prefersReducedMotion } from '@/lib/animations';
import { ROLE_LABEL, type Role } from '@/lib/admin/roles';
import { cn } from '@/lib/cn';
import { Menu, MenuItem } from './Menu';
import { Avatar } from './ui';

gsap.registerPlugin(useGSAP);

const ICONS = { contacts: ChatsCircle, accounts: UsersThree, devices: Monitor };

export type NavItem = { href: string; label: string; icon: keyof typeof ICONS };

type AdminBarProps = {
  items: NavItem[];
  user: { name: string; email: string; role: Role; avatar: string | null };
};

const COLS = ['', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3'];

const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

function useIndicator(pathname: string) {
  const nav = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);

  useGSAP(
    () => {
      const box = nav.current;
      if (!box) return;
      const place = (animate: boolean) => {
        const active = box.querySelector<HTMLElement>('[aria-current="page"]');
        if (!active) {
          gsap.to(pill.current, { autoAlpha: 0, duration: 0.2 });
          placed.current = false;
          return;
        }
        const right = box.clientWidth - active.offsetLeft - active.offsetWidth;
        const bottom = box.clientHeight - active.offsetTop - active.offsetHeight;
        const target = {
          clipPath: `inset(${active.offsetTop}px ${right}px ${bottom}px ${active.offsetLeft}px round 999px)`,
          autoAlpha: 1,
        };
        if (animate && placed.current && !prefersReducedMotion()) {
          gsap.to(pill.current, { ...target, duration: 0.42, ease: 'power3.out' });
        } else {
          gsap.set(pill.current, target);
        }
        placed.current = true;
      };
      place(true);
      let first = true;
      const observer = new ResizeObserver(() => {
        if (first) {
          first = false;
          return;
        }
        place(false);
      });
      observer.observe(box);
      return () => observer.disconnect();
    },
    { dependencies: [pathname] },
  );

  return { nav, pill };
}

function NavLinks({
  items,
  pathname,
  compact,
}: {
  items: NavItem[];
  pathname: string;
  compact?: boolean;
}) {
  return items.map((item) => {
    const Icon = ICONS[item.icon];
    const active = isActive(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'relative z-[1] flex items-center justify-center rounded-full font-medium whitespace-nowrap transition-colors duration-200',
          compact ? 'h-12 flex-col gap-0.5 text-[11px]' : 'h-10 gap-2 px-4 text-[14px]',
          active ? 'text-[var(--ground)]' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]',
        )}
      >
        <Icon size={compact ? 20 : 18} weight={active ? 'fill' : 'regular'} aria-hidden />
        {item.label}
      </Link>
    );
  });
}

export function AdminBar({ items, user }: AdminBarProps) {
  const pathname = usePathname();
  const top = useIndicator(pathname);
  const bottom = useIndicator(pathname);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5">
        <div className="glass-bar mx-auto flex h-[60px] max-w-[1240px] items-center gap-2 rounded-full px-2">
          <Link
            href="/admin"
            className="flex shrink-0 items-center gap-2.5 rounded-full py-1 pr-3 pl-1"
            aria-label="RideLink Techs, trang quản trị"
          >
            <LogoMark size={40} plateOnDark className="rounded-[var(--radius-md)]" />
            <span className="hidden leading-none lg:block">
              <span className="block text-[15px] font-bold">RideLink Techs</span>
              <span className="mt-1 block text-[12px] text-[var(--ink-faint)]">Quản trị</span>
            </span>
          </Link>

          {items.length ? (
            <nav aria-label="Quản trị" className="hidden md:block">
              <div ref={top.nav} className="relative flex items-center">
                <span
                  ref={top.pill}
                  aria-hidden
                  className="invisible absolute inset-0 bg-[var(--ink)]"
                />
                <NavLinks items={items} pathname={pathname} />
              </div>
            </nav>
          ) : null}

          <div className="ml-auto flex items-center gap-1.5">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Mở trang web trong tab mới"
              title="Mở trang web trong tab mới"
              className="icon-btn lg:inline-flex lg:w-auto lg:gap-2 lg:px-4"
            >
              <ArrowSquareOut size={18} aria-hidden />
              <span className="hidden text-[14px] font-medium lg:inline">Trang web</span>
            </Link>
            <Menu
              label={`Tài khoản của ${user.name}`}
              triggerClassName="flex h-11 items-center gap-2.5 rounded-full py-1 pr-3 pl-1 transition-colors duration-200 hover:bg-[var(--ground-lift)]"
              trigger={
                <>
                  <Avatar name={user.name} role={user.role} src={user.avatar} size={36} />
                  <span className="hidden max-w-[12rem] truncate text-[14px] font-medium sm:block">
                    {user.name}
                  </span>
                  <CaretDown
                    size={14}
                    weight="bold"
                    aria-hidden
                    className="text-[var(--ink-faint)]"
                  />
                </>
              }
            >
              {(close) => (
                <>
                  <div className="flex items-center gap-3 px-3 pt-2.5 pb-3">
                    <Avatar name={user.name} role={user.role} src={user.avatar} size={40} />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold">{user.name}</p>
                      <p className="truncate text-[13px] text-[var(--ink-faint)]">{user.email}</p>
                      <p className="data-label mt-0.5">{ROLE_LABEL[user.role]}</p>
                    </div>
                  </div>
                  <div className="my-1 h-px bg-[var(--rule-2)]" />
                  <Link href="/admin/profile" onClick={close} className="menu-item">
                    <span
                      aria-hidden
                      className="grid size-5 shrink-0 place-items-center opacity-80"
                    >
                      <UserCircle size={18} />
                    </span>
                    Tài khoản của tôi
                  </Link>
                  <Link href="/admin/password" onClick={close} className="menu-item">
                    <span
                      aria-hidden
                      className="grid size-5 shrink-0 place-items-center opacity-80"
                    >
                      <Key size={18} />
                    </span>
                    Đổi mật khẩu
                  </Link>
                  <form action={logout}>
                    <MenuItem type="submit" icon={<SignOut size={18} />}>
                      Đăng xuất
                    </MenuItem>
                  </form>
                </>
              )}
            </Menu>
            <CelestialToggle className="h-11 w-11 border-transparent hover:border-transparent hover:bg-[var(--ground-lift)]" />
          </div>
        </div>
      </header>

      {items.length > 1 ? (
        <nav
          aria-label="Quản trị"
          className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden"
        >
          <div
            ref={bottom.nav}
            className={cn(
              'glass-bar relative mx-auto grid max-w-md rounded-full p-1.5',
              COLS[items.length],
            )}
          >
            <span
              ref={bottom.pill}
              aria-hidden
              className="invisible absolute inset-0 bg-[var(--ink)]"
            />
            <NavLinks items={items} pathname={pathname} compact />
          </div>
        </nav>
      ) : null}
    </>
  );
}
