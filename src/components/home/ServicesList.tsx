'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'phosphor-react';
import { prefersReducedMotion } from '@/lib/animations';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Service = { title: string; body: string; tags: string[] };

export function ServicesList({ items }: { items: Service[] }) {
  const root = useRef<HTMLUListElement | null>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const lines = el.querySelectorAll('[data-svc-line]');
      const titles = el.querySelectorAll('[data-svc-title]');
      const bodies = el.querySelectorAll('[data-svc-body]');
      const tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      });
      tl.from(lines, { scaleX: 0, transformOrigin: 'left center', duration: 1.1, stagger: 0.12 }, 0)
        .from(titles, { yPercent: 115, duration: 1, stagger: 0.12 }, 0.1)
        .from(bodies, { autoAlpha: 0, y: 18, duration: 0.8, stagger: 0.12 }, 0.35);
    },
    { scope: root },
  );

  return (
    <ul
      ref={root}
      className="border-b border-[var(--rule)] [&:has(li:hover)>li:not(:hover)]:opacity-40"
    >
      {items.map((item) => (
        <li key={item.title} className="group/row relative transition-opacity duration-300">
          <span
            data-svc-line
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-[var(--rule)]"
          />
          <span
            aria-hidden
            className="absolute inset-0 origin-left scale-x-0 rounded-2xl bg-[var(--ground-raise)] opacity-0 transition-[transform,opacity] duration-500 ease-[var(--ease-out-quint)] group-hover/row:scale-x-100 group-hover/row:opacity-100"
          />
          <div className="relative grid grid-cols-12 items-center gap-x-8 gap-y-5 px-2 py-8 sm:px-5 lg:py-11">
            <h3 className="col-span-12 lg:col-span-7">
              <span className="hero-line-mask block overflow-hidden">
                <span
                  data-svc-title
                  className="block text-[clamp(1.85rem,3.9vw,3.2rem)] leading-[1.06] font-bold tracking-[-0.04em]"
                >
                  {item.title}
                </span>
              </span>
            </h3>
            <div data-svc-body className="col-span-12 lg:col-span-4">
              <p className="max-w-[42ch] text-[16px] leading-[1.65] text-[var(--ink-soft)]">
                {item.body}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-[var(--rule)] px-3 py-1 text-[12px] text-[var(--ink-soft)]"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
            <ArrowUpRight
              aria-hidden
              size={30}
              weight="bold"
              className="col-span-1 hidden justify-self-end text-[var(--ink-faint)] transition-[transform,color] duration-500 ease-[var(--ease-out-quint)] group-hover/row:translate-x-1 group-hover/row:-translate-y-1 group-hover/row:text-[var(--signal)] lg:block"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
