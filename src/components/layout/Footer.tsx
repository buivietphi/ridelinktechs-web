'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLocale, useTranslations } from 'next-intl';
import { FacebookLogo } from 'phosphor-react';
import { company } from '@/content/company';
import { LogoMark } from '@/components/ui/LogoMark';
import { prefersReducedMotion } from '@/lib/animations';

gsap.registerPlugin(ScrollTrigger);

export function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale() as 'vi' | 'en';
  const year = new Date().getFullYear();
  const root = useRef<HTMLElement | null>(null);

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address.vi)}`;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      gsap.fromTo(
        q('[data-f-band]'),
        { y: 16 },
        {
          y: 0,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 94%', once: true },
        },
      );
    },
    { scope: root },
  );

  return (
    <footer ref={root} className="mt-28 border-t border-[var(--rule)]">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <div
          data-f-band
          className="grid grid-cols-1 gap-8 py-8 sm:grid-cols-[1fr_auto] sm:gap-x-12 lg:grid-cols-3"
        >
          <div className="flex items-center gap-3">
            <LogoMark size={28} />
            <span className="text-[14px] font-semibold text-[var(--ink)]">{company.name}</span>
          </div>

          <div className="min-w-0 lg:w-72">
            <p className="text-[12px] font-medium text-[var(--ink-soft)]">{t('location')}</p>
            <p className="mt-1.5 text-[14px] leading-[1.55] text-[var(--ink-soft)]">
              {company.address[locale]}
            </p>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t('mapOpen')} ${t('opensNewTab')}`}
              className="f-out mt-2 inline-block text-[14px]"
            >
              {t('mapOpen')}
            </a>
          </div>

          <div className="flex min-w-0 flex-col items-start gap-1.5">
            <p className="text-[12px] font-medium text-[var(--ink-soft)]">{t('reach')}</p>
            <a href={`mailto:${company.email}`} className="link text-[14px]">
              {company.email}
            </a>
            <a href={`tel:${company.phoneHref}`} className="f-out inline-block text-[14px]">
              {company.phoneDisplay}
            </a>
            {company.socials.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${s.label} ${t('opensNewTab')}`}
                className="f-out inline-flex items-center gap-1.5 text-[14px]"
              >
                <FacebookLogo aria-hidden size={15} weight="fill" />
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div
          data-f-band
          className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--rule-2)] py-5"
        >
          <p className="font-mono text-[12px] text-[var(--ink-soft)]">
            © {year} {company.name}
          </p>
          <p className="font-mono text-[12px] text-[var(--ink-soft)]">{t('rights')}</p>
          <a href="#main" className="font-mono text-[12px] text-[var(--ink-soft)] sm:ml-auto">
            {t('toTop')}
          </a>
        </div>
      </div>
    </footer>
  );
}
