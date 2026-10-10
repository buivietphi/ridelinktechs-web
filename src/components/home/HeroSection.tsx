'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useTranslations } from 'next-intl';
import { ArrowDown, Browser, CheckCircle, Database, DeviceMobile, Gear } from 'phosphor-react';
import type { Icon } from 'phosphor-react';
import { Magnetic } from '@/components/motion/Magnetic';
import { TiltCard } from '@/components/motion/TiltCard';
import { prefersReducedMotion } from '@/lib/animations';
import { cn } from '@/lib/cn';

gsap.registerPlugin(useGSAP, SplitText);

const LinkField = dynamic(() => import('@/components/motion/LinkField').then((m) => m.LinkField), {
  ssr: false,
});

const chips: {
  key: 'mobile' | 'web' | 'backend' | 'run';
  Glyph: Icon;
  place: string;
  z: number;
}[] = [
  { key: 'mobile', Glyph: DeviceMobile, place: 'top-[8%] left-2 sm:-left-9', z: 70 },
  { key: 'web', Glyph: Browser, place: 'top-[33%] right-2 sm:-right-10', z: 95 },
  { key: 'backend', Glyph: Database, place: 'bottom-[24%] left-2 sm:-left-11', z: 60 },
  { key: 'run', Glyph: Gear, place: 'bottom-[8%] right-2 sm:-right-7', z: 110 },
];

export function HeroSection() {
  const t = useTranslations('home');
  const root = useRef<HTMLElement | null>(null);
  const lines = t.raw('hero.titleLines') as string[];
  const trust = t.raw('hero.trust') as string[];

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);

      const split = SplitText.create(q('[data-hero-line]'), {
        type: 'lines,words',
        mask: 'lines',
        aria: 'none',
        autoSplit: true,
        linesClass: 'hero-line',
        wordsClass: 'hero-word',
        onSplit(self) {
          return gsap.from(self.words, {
            yPercent: 118,
            duration: 0.85,
            ease: 'expo.out',
            stagger: { each: 0.05, from: 'start' },
          });
        },
      });

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.05 });
      tl.fromTo(
        q('[data-hero-eyebrow]'),
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.7 },
        0,
      )
        .fromTo(
          q('[data-hero-meta]'),
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.09 },
          0.5,
        )
        .fromTo(
          q('[data-hero-card]'),
          { autoAlpha: 0, y: 46, scale: 0.93 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 1.3 },
          0.15,
        )
        .fromTo(
          q('[data-hero-chip]'),
          { autoAlpha: 0, scale: 0.6, y: 18 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'back.out(1.8)' },
          0.75,
        )
        .fromTo(q('[data-hero-cue]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 1.2);

      q('[data-hero-chip-body]').forEach((chip, i) => {
        gsap.to(chip, {
          y: i % 2 ? -10 : 10,
          duration: 2.6 + i * 0.45,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 1.4 + i * 0.2,
        });
      });

      gsap.fromTo(
        q('[data-hero-sweep]'),
        { xPercent: -120 },
        {
          xPercent: 240,
          duration: 3.4,
          ease: 'sine.inOut',
          repeat: -1,
          repeatDelay: 1.8,
          delay: 1.6,
        },
      );

      const arrow = q('[data-hero-arrow]');
      gsap.fromTo(
        arrow,
        { y: -4 },
        { y: 4, duration: 1, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5 },
      );

      const glow = q('[data-hero-glow]');
      const gx = gsap.quickTo(glow, 'x', { duration: 1.4, ease: 'power3.out' });
      const gy = gsap.quickTo(glow, 'y', { duration: 1.4, ease: 'power3.out' });
      const onMove = (e: PointerEvent) => {
        gx((e.clientX / window.innerWidth - 0.5) * 140);
        gy((e.clientY / window.innerHeight - 0.5) * 100);
      };
      window.addEventListener('pointermove', onMove, { passive: true });

      return () => {
        window.removeEventListener('pointermove', onMove);
        split.revert();
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [mask-image:radial-gradient(120%_95%_at_70%_40%,black_30%,transparent_80%)] [-webkit-mask-image:radial-gradient(120%_95%_at_70%_40%,black_30%,transparent_80%)]"
      >
        <LinkField className="size-full" />
      </div>
      <div
        aria-hidden
        data-hero-glow
        className="pointer-events-none absolute top-[38%] left-[68%] -z-10 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--signal-violet) 30%, transparent) 0%, color-mix(in oklab, var(--signal-cyan) 18%, transparent) 38%, transparent 68%)',
        }}
      />

      <div className="mx-auto w-full max-w-[1440px] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid grid-cols-12 items-center gap-x-0 gap-y-16 lg:min-h-[calc(100svh-210px)] lg:gap-x-8">
          <div className="col-span-12 lg:col-span-7">
            <p
              data-hero-eyebrow
              className="group/eyebrow relative inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-[color-mix(in_oklab,var(--signal-violet)_22%,var(--rule))] bg-[var(--ground-raise)]/75 px-4 py-2 text-[13px] text-[var(--ink-soft)] shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_6px_18px_-8px_color-mix(in_oklab,var(--signal)_45%,transparent)] backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-px hover:border-[color-mix(in_oklab,var(--signal-violet)_38%,var(--rule))] hover:text-[var(--ink)]"
            >
              <span aria-hidden className="relative flex size-2.5 items-center justify-center">
                <span className="absolute size-2.5 rounded-full bg-[var(--signal)]/35 motion-safe:animate-[eyebrow-ping_2.6s_cubic-bezier(0.16,1,0.3,1)_infinite]" />
                <span className="relative size-2 rounded-full bg-[linear-gradient(135deg,var(--signal-violet),var(--signal)_55%,var(--signal-cyan))] shadow-[0_0_8px_color-mix(in_oklab,var(--signal)_70%,transparent)]" />
              </span>
              <span className="relative">
                {t('hero.eyebrow')}
                <span
                  aria-hidden
                  className="absolute -bottom-px left-0 h-px w-0 bg-[linear-gradient(90deg,var(--signal-violet),var(--signal-cyan))] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/eyebrow:w-full"
                />
              </span>
            </p>

            <h1 className="mt-7 text-[clamp(2.6rem,6.3vw,5.4rem)] leading-[0.98] font-extrabold tracking-[-0.045em] text-[var(--ink)]">
              {lines.map((line, i) => (
                <span key={line} className="block">
                  <span
                    data-hero-line
                    className={cn('block', i === lines.length - 1 && 'text-brand')}
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h1>

            <p
              data-hero-meta
              className="mt-8 max-w-[48ch] text-[clamp(1.05rem,1.5vw,1.25rem)] leading-[1.6] text-[var(--ink-soft)]"
            >
              {t('hero.lede')}
            </p>

            <div data-hero-meta className="mt-9 flex flex-wrap items-center gap-4">
              <Magnetic>
                <Link href="/contact" className="btn btn-primary">
                  {t('hero.ctaPrimary')}
                </Link>
              </Magnetic>
              <Link href="/products" className="btn">
                {t('hero.ctaSecondary')}
              </Link>
            </div>

            <ul data-hero-meta className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
              {trust.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-[14px] text-[var(--ink-soft)]"
                >
                  <CheckCircle
                    aria-hidden
                    size={18}
                    weight="duotone"
                    className="text-[var(--signal)]"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <TiltCard
              idle
              max={8}
              className="mx-auto w-full max-w-[440px] lg:max-w-[480px]"
              innerClassName="rounded-[2rem]"
            >
              <div
                data-hero-card
                className="panel relative aspect-[5/6] rounded-[2rem] border border-[var(--rule)] [transform-style:preserve-3d]"
              >
                <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
                  <div
                    className="absolute -top-1/4 -right-1/4 size-[75%] rounded-full opacity-80 blur-3xl"
                    style={{
                      background:
                        'radial-gradient(circle, color-mix(in oklab, var(--signal-violet) 55%, transparent), transparent 70%)',
                    }}
                  />
                  <div
                    className="absolute -bottom-1/4 -left-1/4 size-[75%] rounded-full opacity-80 blur-3xl"
                    style={{
                      background:
                        'radial-gradient(circle, color-mix(in oklab, var(--signal-cyan) 48%, transparent), transparent 70%)',
                    }}
                  />
                  <div
                    className="absolute top-1/3 left-1/4 size-[55%] rounded-full opacity-60 blur-3xl"
                    style={{
                      background:
                        'radial-gradient(circle, color-mix(in oklab, var(--signal) 42%, transparent), transparent 70%)',
                    }}
                  />
                  <div
                    data-hero-sweep
                    aria-hidden
                    className="pointer-events-none absolute -inset-y-1/2 left-0 w-[58%] skew-x-[-16deg] mix-blend-soft-light"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, color-mix(in oklab, var(--ink) 13%, transparent), transparent)',
                    }}
                  />
                </div>

                <div
                  className="absolute inset-0 grid place-items-center"
                  style={{ transform: 'translateZ(60px)' }}
                >
                  <div className="relative aspect-square w-[64%]">
                    <Image
                      src="/logo/logo-light.webp"
                      alt="RideLink Techs"
                      fill
                      priority
                      sizes="(min-width: 1024px) 320px, 64vw"
                      className="object-contain drop-shadow-[0_24px_40px_rgba(47,91,216,0.35)]"
                    />
                  </div>
                </div>

                {chips.map(({ key, Glyph, place, z }) => (
                  <div
                    key={key}
                    data-hero-chip
                    className={cn('absolute', place)}
                    style={{ transform: `translateZ(${z}px)` }}
                  >
                    <div
                      data-hero-chip-body
                      className="flex items-center gap-2.5 rounded-full border border-[var(--rule)] bg-[var(--ground)]/85 py-1.5 pr-4 pl-1.5 text-[13px] font-semibold whitespace-nowrap text-[var(--ink)] shadow-[var(--shadow-1)] backdrop-blur-md"
                    >
                      <span
                        aria-hidden
                        className="grid size-7 place-items-center rounded-full bg-[var(--signal)]/12"
                      >
                        <Glyph size={16} weight="duotone" className="text-[var(--signal)]" />
                      </span>
                      {t(`hero.chips.${key}`)}
                    </div>
                  </div>
                ))}
              </div>
            </TiltCard>
          </div>
        </div>

        <div
          data-hero-cue
          className="mt-14 hidden items-center gap-2.5 text-[13px] text-[var(--ink-faint)] lg:flex"
        >
          <ArrowDown aria-hidden data-hero-arrow size={15} weight="bold" />
          {t('hero.cue')}
        </div>
      </div>
    </section>
  );
}
