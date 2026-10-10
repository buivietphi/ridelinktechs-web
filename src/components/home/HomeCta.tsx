'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Magnetic } from '@/components/motion/Magnetic';
import { prefersReducedMotion } from '@/lib/animations';
import { cn } from '@/lib/cn';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Action = { title: string; lede: string; cta: string; href: string; primary?: boolean };

export function HomeCta({ actions }: { actions: Action[] }) {
  const root = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;

      gsap.from(el.querySelectorAll('[data-cta-card]'), {
        autoAlpha: 0,
        y: 40,
        scale: 0.97,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.14,
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      });

      const drift = gsap.timeline({
        repeat: -1,
        yoyo: true,
        paused: true,
        defaults: { ease: 'sine.inOut' },
      });
      drift
        .to(el.querySelector('[data-blob="a"]'), { x: 90, y: -40, scale: 1.2, duration: 9 }, 0)
        .to(el.querySelector('[data-blob="b"]'), { x: -80, y: 50, scale: 1.15, duration: 11 }, 0);
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => drift.paused(!self.isActive),
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="wash relative isolate overflow-hidden rounded-[2.25rem] border border-[var(--rule)] p-4 sm:p-6 lg:p-8"
    >
      <div
        aria-hidden
        data-blob="a"
        className="absolute -top-24 -right-16 -z-10 size-[26rem] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--signal-violet) 50%, transparent), transparent 70%)',
        }}
      />
      <div
        aria-hidden
        data-blob="b"
        className="absolute -bottom-28 -left-16 -z-10 size-[28rem] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--signal-cyan) 42%, transparent), transparent 70%)',
        }}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        {actions.map((action) => (
          <div
            key={action.title}
            data-cta-card
            className="flex flex-col justify-between gap-12 rounded-[1.75rem] border border-[var(--rule)] bg-[var(--ground)]/62 p-8 backdrop-blur-xl lg:min-h-[340px] lg:p-10"
          >
            <div>
              <h3 className="max-w-[18ch] text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-[var(--ink)]">
                {action.title}
              </h3>
              <p className="mt-5 max-w-[42ch] text-[16px] leading-[1.65] text-[var(--ink-soft)]">
                {action.lede}
              </p>
            </div>
            <Magnetic>
              <Link href={action.href} className={cn('btn', action.primary && 'btn-primary')}>
                {action.cta}
              </Link>
            </Magnetic>
          </div>
        ))}
      </div>
    </div>
  );
}
