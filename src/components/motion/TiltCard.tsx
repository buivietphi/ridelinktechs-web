'use client';

import { useRef } from 'react';
import type { ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { prefersReducedMotion } from '@/lib/animations';
import { cn } from '@/lib/cn';

gsap.registerPlugin(useGSAP);

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  max?: number;
  glare?: boolean;
  idle?: boolean;
};

export function TiltCard({
  children,
  className,
  innerClassName,
  max = 8,
  glare = true,
  idle = false,
}: TiltCardProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const card = useRef<HTMLDivElement | null>(null);
  const shine = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const el = root.current;
      const body = card.current;
      if (!el || !body || prefersReducedMotion()) return;

      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (!fine) {
        if (idle) {
          gsap.fromTo(
            body,
            { rotationY: -max * 0.5, rotationX: max * 0.25 },
            {
              rotationY: max * 0.5,
              rotationX: -max * 0.25,
              duration: 3.6,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
            },
          );
        }
        return;
      }

      const rx = gsap.quickTo(body, 'rotationX', { duration: 0.7, ease: 'power3.out' });
      const ry = gsap.quickTo(body, 'rotationY', { duration: 0.7, ease: 'power3.out' });
      const glow = shine.current
        ? gsap.quickTo(shine.current, 'opacity', { duration: 0.4, ease: 'power2.out' })
        : null;

      const onMove = (e: PointerEvent) => {
        const box = el.getBoundingClientRect();
        const px = (e.clientX - box.left) / box.width;
        const py = (e.clientY - box.top) / box.height;
        ry((px - 0.5) * max * 2);
        rx((0.5 - py) * max * 2);
        body.style.setProperty('--gx', `${px * 100}%`);
        body.style.setProperty('--gy', `${py * 100}%`);
        glow?.(1);
      };
      const onLeave = () => {
        rx(0);
        ry(0);
        glow?.(0);
      };

      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      return () => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className={cn('[perspective:1100px]', className)}>
      <div
        ref={card}
        className={cn('relative h-full [transform-style:preserve-3d]', innerClassName)}
      >
        {children}
        {glare ? (
          <div
            ref={shine}
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0"
            style={{
              background:
                'radial-gradient(520px circle at var(--gx, 50%) var(--gy, 50%), var(--signal-soft), transparent 62%)',
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
