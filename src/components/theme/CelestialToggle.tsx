'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import gsap from 'gsap';
import { prefersReducedMotion } from '@/lib/animations';
import { cn } from '@/lib/cn';

export function CelestialToggle({ className }: { className?: string }) {
  const t = useTranslations('theme');
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const sunRef = useRef<SVGSVGElement>(null);
  const moonRef = useRef<SVGSVGElement>(null);
  const raysRef = useRef<SVGGElement>(null);
  const moonBodyRef = useRef<SVGGElement>(null);
  const star1Ref = useRef<SVGPathElement>(null);
  const star2Ref = useRef<SVGPathElement>(null);

  const isDark = mounted && resolvedTheme === 'dark';

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    gsap.set(sunRef.current, {
      autoAlpha: isDark ? 0 : 1,
      rotate: isDark ? -180 : 0,
      scale: isDark ? 0 : 1,
    });
    gsap.set(moonRef.current, {
      autoAlpha: isDark ? 1 : 0,
      rotate: isDark ? 0 : 180,
      scale: isDark ? 1 : 0,
    });
  }, [isDark, mounted]);

  useEffect(() => {
    if (!mounted || prefersReducedMotion()) return;
    if (!isDark && raysRef.current) {
      const tween = gsap.to(raysRef.current, {
        rotate: '+=360',
        duration: 18,
        ease: 'none',
        repeat: -1,
        svgOrigin: '12 12',
      });
      return () => {
        tween.kill();
      };
    }
  }, [isDark, mounted]);

  useEffect(() => {
    if (!mounted || !isDark || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      if (moonBodyRef.current) {
        gsap.to(moonBodyRef.current, {
          y: -2.2,
          rotate: -8,
          duration: 2.5,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          svgOrigin: '12 12',
        });
      }
      if (star1Ref.current) {
        gsap.to(star1Ref.current, {
          scale: 1.5,
          opacity: 0.1,
          duration: 1.2,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          svgOrigin: '16 5',
        });
      }
      if (star2Ref.current) {
        gsap.to(star2Ref.current, {
          scale: 1.3,
          opacity: 0.2,
          duration: 1.8,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          svgOrigin: '7 8',
          delay: 0.4,
        });
      }
    });
    return () => ctx.revert();
  }, [isDark, mounted]);

  const toggle = () => {
    const next = isDark ? 'light' : 'dark';
    const outEl = next === 'light' ? moonRef.current : sunRef.current;
    const inEl = next === 'light' ? sunRef.current : moonRef.current;

    gsap
      .timeline({ defaults: { duration: 0.25, ease: 'expo.out' } })
      .to(outEl, { rotate: -180, scale: 0, autoAlpha: 0 }, 0)
      .fromTo(
        inEl,
        { rotate: 180, scale: 0, autoAlpha: 0 },
        { rotate: 0, scale: 1, autoAlpha: 1, duration: 0.35 },
        0.1,
      )
      .call(() => setTheme(next));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t('toggle')}
      title={isDark ? t('light') : t('dark')}
      suppressHydrationWarning
      className={cn(
        'relative inline-grid h-10 w-10 shrink-0 place-items-center rounded-full',
        'border border-[var(--rule)] transition-colors duration-300',
        'hover:border-[var(--ink-faint)] hover:bg-[var(--ground-raise)]',
        'focus-visible:border-[var(--signal)]',
        className,
      )}
    >
      <svg
        ref={sunRef}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
        className="col-start-1 row-start-1 text-[var(--signal)] will-change-transform"
      >
        <g ref={raysRef}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </g>
      </svg>

      <svg
        ref={moonRef}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
        className="col-start-1 row-start-1 text-[var(--signal-cyan)] will-change-transform"
      >
        <g ref={moonBodyRef}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </g>
        <path ref={star1Ref} d="M16 3v4M14 5h4" strokeWidth="1.5" className="opacity-80" />
        <path ref={star2Ref} d="M7 6v4M5 8h4" strokeWidth="1.5" className="opacity-80" />
      </svg>
    </button>
  );
}
