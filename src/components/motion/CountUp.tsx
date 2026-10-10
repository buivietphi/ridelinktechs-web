'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '@/lib/animations';
import { cn } from '@/lib/cn';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type CountUpProps = {
  to: number;
  from?: number;
  duration?: number;
  className?: string;
};

export function CountUp({ to, from = 0, duration = 1.6, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useGSAP(
    () => {
      const node = ref.current?.firstChild;
      if (!node || prefersReducedMotion()) return;
      const state = { value: from };
      node.nodeValue = String(from);
      gsap.to(state, {
        value: to,
        duration,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 92%', once: true },
        onUpdate: () => {
          node.nodeValue = String(Math.round(state.value));
        },
      });
    },
    { scope: ref, dependencies: [to, from, duration] },
  );

  return (
    <span ref={ref} className={cn('tabnum', className)}>
      {to}
    </span>
  );
}
