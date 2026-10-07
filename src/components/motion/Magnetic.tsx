'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { prefersReducedMotion } from '@/lib/animations';

type MagneticProps = {
  children: React.ReactNode;
  className?: string;
  strength?: number;
};

export function Magnetic({ children, className, strength = 14 }: MagneticProps) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) return;
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

      const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'expo.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'expo.out' });

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * (strength / Math.max(r.width, 1)));
        yTo((e.clientY - (r.top + r.height / 2)) * (strength / Math.max(r.height, 1)));
      };

      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      return () => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
      };
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={`magnetic inline-flex ${className ?? ''}`}>
      {children}
    </span>
  );
}
