'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslations } from 'next-intl';
import { ArrowDown } from 'phosphor-react';
import { LogoMark } from '@/components/ui/LogoMark';
import { GridBackdrop } from '@/components/blocks/GridBackdrop';
import { prefersReducedMotion } from '@/lib/animations';

gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger);

export function HomeHero() {
  const t = useTranslations('home');
  const root = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);

      const split = SplitText.create(q('[data-hero-line]'), {
        type: 'lines,words',
        mask: 'lines',
        autoSplit: true,
        linesClass: 'hero-line',
        wordsClass: 'hero-word',
        onSplit(self) {
          return gsap.from(self.words, {
            yPercent: 118,
            duration: 0.85,
            ease: 'expo.out',
            stagger: { each: 0.045, from: 'start' },
          });
        },
      });

      const glow = q('[data-backdrop-glow]');
      const onMove = (e: PointerEvent) => {
        if (!glow[0]) return;
        const x = (e.clientX / window.innerWidth - 0.5) * 120;
        const y = (e.clientY / window.innerHeight - 0.5) * 90;
        gsap.to(glow[0], { x, y, duration: 1.4, ease: 'power3.out', overwrite: 'auto' });
      };
      window.addEventListener('pointermove', onMove, { passive: true });

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.1 });

      tl.fromTo(
        q('[data-hero-mark]'),
        { autoAlpha: 0, scale: 0.82, rotation: -8 },
        { autoAlpha: 1, scale: 1, rotation: 0, duration: 1.3, ease: 'back.out(1.6)' },
        0,
      )
        .fromTo(
          q('[data-hero-eyebrow]'),
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.7 },
          0.25,
        )
        .fromTo(
          q('[data-hero-meta]'),
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 },
          0.55,
        )
        .fromTo(q('[data-hero-cue]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0.95)
        .fromTo(
          q('[data-hero-arrow]'),
          { y: -5 },
          { y: 3, duration: 0.9, ease: 'expo.inOut', yoyo: true, repeat: 1 },
          1.35,
        );

      return () => {
        window.removeEventListener('pointermove', onMove);
        split.revert();
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative isolate flex min-h-[calc(100svh-92px)] items-center overflow-hidden"
    >
      <GridBackdrop className="-z-10" />

      <div className="mx-auto w-full max-w-[1440px] px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
        <div className="grid grid-cols-12 items-end gap-x-0 gap-y-14 lg:gap-x-8">
          <div className="col-span-12 lg:col-span-8">
            <p data-hero-eyebrow className="text-[13px] text-[var(--ink-faint)]">
              {t('hero.eyebrow')}
            </p>

            <h1 className="mt-7 text-[clamp(2.6rem,8.2vw,6.5rem)] leading-[0.94] font-extrabold tracking-[-0.045em] text-[var(--ink)]">
              {(t.raw('hero.titleLines') as string[]).map((line) => (
                <span key={line} className="block">
                  <span className="block" data-hero-line>
                    {line}
                  </span>
                </span>
              ))}
            </h1>

            <div
              data-hero-meta
              className="mt-9 flex max-w-[46ch] flex-col gap-4 text-[18px] leading-[1.62] text-[var(--ink-soft)]"
            >
              {t('hero.lede')
                .split('\n\n')
                .map((para) => (
                  <p key={para}>{para}</p>
                ))}
            </div>

            <div data-hero-meta className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/products" className="btn btn-primary">
                {t('hero.ctaPrimary')}
              </Link>
              <Link href="/contact" className="btn">
                {t('hero.ctaSecondary')}
              </Link>
            </div>
          </div>

          <div className="col-span-12 flex flex-col items-start gap-5 lg:col-span-4 lg:items-end">
            <LogoMark
              data-hero-mark
              size={180}
              priority
              className="w-[min(180px,42vw)] max-w-full"
            />
            <div data-hero-meta className="lg:text-right">
              <p className="text-[17px] font-semibold text-[var(--ink)]">{t('brandName')}</p>
              <p className="mt-1.5 text-[13px] text-[var(--ink-faint)]">{t('place')}</p>
            </div>
          </div>
        </div>

        <div
          data-hero-cue
          className="mt-20 flex items-center gap-2.5 text-[13px] text-[var(--ink-faint)]"
        >
          <ArrowDown aria-hidden data-hero-arrow size={15} weight="bold" />
          {t('hero.cue')}
        </div>
      </div>
    </section>
  );
}
