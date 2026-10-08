'use client';

import { Children, useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '@/lib/animations';
import { cn } from '@/lib/cn';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type CardSwapProps = {
  children: ReactNode;
  className?: string;
  ratio: number;
  stepX?: number;
  stepY?: number;
  skew?: number;
  every?: number;
};

export function CardSwap({
  children,
  className,
  ratio,
  stepX = 0.19,
  stepY = 0.085,
  skew = 4,
  every = 4.2,
}: CardSwapProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const cards = Children.toArray(children);
  const count = cards.length;

  useGSAP(
    () => {
      const el = root.current;
      if (!el || count === 0) return;
      const nodes = gsap.utils.toArray<HTMLElement>('[data-swap-card]', el);
      let order = nodes.map((_, i) => i);
      let dx = 0;
      let dy = 0;

      const slot = (i: number) => ({
        x: i * dx,
        y: (count - 1 - i) * dy,
        z: -i * dx * 1.4,
        zIndex: count - i,
      });

      const place = () => {
        dx = nodes[0].offsetWidth * stepX;
        dy = nodes[0].offsetHeight * stepY;
        order.forEach((idx, i) =>
          gsap.set(nodes[idx], { ...slot(i), skewY: skew, transformOrigin: '50% 100%' }),
        );
      };

      place();
      const observer = new ResizeObserver(place);
      observer.observe(el);

      if (prefersReducedMotion() || count < 2) {
        gsap.set(el, { autoAlpha: 1 });
        return () => observer.disconnect();
      }

      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 48 },
        { autoAlpha: 1, y: 0, duration: 1.2, delay: 0.3, ease: 'expo.out' },
      );

      const swap = () => {
        const [front, ...rest] = order;
        const frontEl = nodes[front];
        const back = slot(count - 1);
        const tl = gsap.timeline();
        tl.to(frontEl, { y: `+=${dy * 5}`, autoAlpha: 0, duration: 0.7, ease: 'power2.in' }, 0);
        rest.forEach((idx, i) => {
          const s = slot(i);
          tl.set(nodes[idx], { zIndex: s.zIndex }, 0.3).to(
            nodes[idx],
            { x: s.x, y: s.y, z: s.z, duration: 0.95, ease: 'expo.inOut' },
            0.3 + i * 0.07,
          );
        });
        tl.set(frontEl, { x: back.x, y: back.y + dy * 2, z: back.z, zIndex: back.zIndex }, 0.85).to(
          frontEl,
          { y: back.y, autoAlpha: 1, duration: 0.8, ease: 'expo.out' },
          0.9,
        );
        order = [...rest, front];
      };

      const loop = gsap.delayedCall(every, () => {
        swap();
        loop.restart(true);
      });
      loop.paused(!ScrollTrigger.isInViewport(el));

      const watch = ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => loop.paused(!self.isActive),
      });

      return () => {
        watch.kill();
        loop.kill();
        observer.disconnect();
      };
    },
    { scope: root, dependencies: [count, stepX, stepY, skew, every] },
  );

  return (
    <div
      ref={root}
      aria-hidden
      className={cn('pointer-events-none invisible relative [perspective:1100px]', className)}
      style={{
        width: `calc(var(--cw) * ${1 + (count - 1) * stepX})`,
        height: `calc(var(--cw) * ${ratio * (1 + (count - 1) * stepY)})`,
      }}
    >
      {cards.map((card, i) => (
        <div
          key={i}
          data-swap-card
          className="absolute top-0 left-0 [backface-visibility:hidden]"
          style={{ width: 'var(--cw)', height: `calc(var(--cw) * ${ratio})` }}
        >
          {card}
        </div>
      ))}
    </div>
  );
}
