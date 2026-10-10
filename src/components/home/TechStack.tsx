'use client';

import type { CSSProperties } from 'react';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { LocalizedString } from '@/content/products';
import { prefersReducedMotion } from '@/lib/animations';
import { techLogoSlug } from '@/lib/tech-logos';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Group = { label: LocalizedString; items: string[] };

const REACH = 190;

export function TechStack({
  title,
  groups,
  locale,
}: {
  title: string;
  groups: Group[];
  locale: 'vi' | 'en';
}) {
  const root = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;

      const marks = gsap.utils.toArray<HTMLElement>('[data-tech-inner]', el);
      const lift = marks.map((m) => gsap.quickTo(m, 'y', { duration: 0.45, ease: 'power3.out' }));
      const fade = marks.map((m) =>
        gsap.quickTo(m, 'opacity', { duration: 0.45, ease: 'power3.out' }),
      );

      let centres: { x: number; y: number }[] = [];
      let pointerX = -1e4;
      let pointerY = -1e4;
      let frame = 0;

      const measure = () => {
        centres = marks.map((m) => {
          const r = m.getBoundingClientRect();
          return {
            x: r.left + r.width / 2 + window.scrollX,
            y: r.top + r.height / 2 + window.scrollY,
          };
        });
      };

      const paint = () => {
        frame = 0;
        const inside = pointerX > -1e3;
        centres.forEach((c, i) => {
          const near = inside
            ? Math.max(0, 1 - Math.hypot(pointerX - c.x, pointerY - c.y) / REACH)
            : 0;
          lift[i](near * -5);
          fade[i](inside ? 0.62 + near * 0.38 : 1);
        });
      };

      const onMove = (e: PointerEvent) => {
        pointerX = e.clientX + window.scrollX;
        pointerY = e.clientY + window.scrollY;
        if (!frame) frame = requestAnimationFrame(paint);
      };

      const onLeave = () => {
        pointerX = -1e4;
        pointerY = -1e4;
        if (!frame) frame = requestAnimationFrame(paint);
      };

      const remeasure = () => {
        measure();
        paint();
      };

      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (marks.length && fine) {
        measure();
        el.addEventListener('pointermove', onMove, { passive: true });
        el.addEventListener('pointerleave', onLeave);
        window.addEventListener('resize', remeasure);
        ScrollTrigger.addEventListener('refresh', remeasure);
      }

      const enter = { trigger: el, start: 'top 84%', once: true } as const;
      gsap.from(el.querySelectorAll('[data-tech-col]'), {
        opacity: 0,
        y: 26,
        duration: 0.85,
        ease: 'expo.out',
        stagger: 0.09,
        onComplete: remeasure,
        scrollTrigger: enter,
      });
      gsap.from(el.querySelectorAll('[data-tech-mark]'), {
        opacity: 0,
        scale: 0.82,
        y: 12,
        duration: 0.6,
        ease: 'expo.out',
        stagger: { each: 0.022, from: 'start' },
        onComplete: remeasure,
        scrollTrigger: enter,
      });

      return () => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
        window.removeEventListener('resize', remeasure);
        ScrollTrigger.removeEventListener('refresh', remeasure);
        if (frame) cancelAnimationFrame(frame);
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} className="py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <p className="text-[14px] font-medium text-[var(--ink-soft)]">{title}</p>

        <div className="panel relative mt-6 overflow-hidden rounded-[1.75rem] border border-[var(--rule)] px-6 py-8 sm:px-8 lg:px-10 lg:py-11">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                'radial-gradient(120% 90% at 12% 0%, color-mix(in oklab, var(--signal-violet) 12%, transparent), transparent 58%), radial-gradient(90% 80% at 96% 100%, color-mix(in oklab, var(--signal-cyan) 11%, transparent), transparent 60%)',
            }}
          />

          <div className="relative grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12">
            {groups.map((group) => (
              <div key={group.label.en} data-tech-col className="group/col">
                <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--ink-faint)] uppercase">
                  {group.label[locale]}
                </p>
                <ul className="mt-5 flex flex-col gap-1">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      data-tech-mark
                      className="-mx-2.5 rounded-xl px-2.5 py-1.5 transition-colors duration-300 hover:bg-[var(--ground-lift)]"
                    >
                      <span
                        data-tech-inner
                        className="flex items-center gap-3 text-[var(--ink-soft)] transition-colors duration-300 group-hover/col:text-[var(--ink)]"
                      >
                        <span
                          aria-hidden
                          className="tech-mark shrink-0"
                          style={
                            { '--mark': `url(/tech/${techLogoSlug(item)}.svg)` } as CSSProperties
                          }
                        />
                        <span className="text-[14px] leading-[1.3]">{item}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
