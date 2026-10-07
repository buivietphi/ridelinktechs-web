'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { List, X } from 'phosphor-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/Sheet';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import { LogoMark } from '@/components/ui/LogoMark';
import { company } from '@/content/company';
import { cn } from '@/lib/cn';

const items = [
  { key: 'home' as const, href: '/' },
  { key: 'products' as const, href: '/products' },
  { key: 'about' as const, href: '/about' },
  { key: 'contact' as const, href: '/contact' },
];

export function MobileNav() {
  const t = useTranslations('nav');
  const briefLabel = useTranslations('nav.brief')('label');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={t('openMenu')}
        className="inline-flex h-10 w-10 items-center justify-center border border-[var(--rule)] text-[var(--ink)] transition-colors duration-150 hover:border-[var(--ink-faint)]"
      >
        <List size={18} weight="regular" aria-hidden />
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex h-full w-[86%] max-w-sm flex-col gap-0 border-l border-[var(--rule)] bg-[var(--ground)] p-0"
      >
        <SheetHeader className="flex flex-row items-center justify-between border-b border-[var(--rule)] px-5 py-4">
          <SheetTitle className="flex items-center gap-2.5 text-[16px] font-semibold text-[var(--ink)]">
            <LogoMark size={28} />
            {company.name}
          </SheetTitle>
          <SheetClose
            aria-label={t('closeMenu')}
            className="inline-flex h-9 w-9 items-center justify-center border border-[var(--rule)] text-[var(--ink)] transition-colors duration-150 hover:border-[var(--ink-faint)]"
          >
            <X size={16} weight="regular" aria-hidden />
          </SheetClose>
        </SheetHeader>

        <nav className="flex flex-col">
          {items.map((it) => (
            <SheetClose asChild key={it.key}>
              <Link
                href={it.href}
                className={cn(
                  'flex items-center justify-between gap-3 border-b border-[var(--rule-2)] px-5 py-5 text-[19px] font-semibold tracking-[-0.02em] transition-colors',
                  isActive(it.href) ? 'text-[var(--signal)]' : 'text-[var(--ink)]',
                )}
              >
                {t(it.key)}
                {isActive(it.href) ? (
                  <span aria-hidden className="status-dot bg-[var(--signal)]" />
                ) : null}
              </Link>
            </SheetClose>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-5 border-t border-[var(--rule)] p-5">
          <SheetClose asChild>
            <Link href="/contact" className="btn btn-primary w-full">
              {briefLabel}
            </Link>
          </SheetClose>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
