'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/animations';
import { cn } from '@/lib/cn';

interface StatCounterProps {
  to: number;
  from?: number;
  duration?: number;
  padTo?: number;
  prefix?: string;
  suffix?: string;
  onView?: boolean;
  className?: string;
}

export function StatCounter({
  to,
  from = 0,
  duration = 900,
  padTo = 1,
  prefix = '',
  suffix = '',
  onView = false,
  className,
}: StatCounterProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement | null>(null);
  const [started, setStarted] = useState(!onView);

  useEffect(() => {
    if (reduced || !started || !ref.current) return;
    const el = ref.current;
    const start = performance.now();
    let raf = 0;
    const pad = (n: number) => String(Math.round(n)).padStart(padTo, '0');

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = from + (to - from) * eased;
      el.textContent = `${prefix}${pad(v)}${suffix}`;
      if (t < 1) raf = requestAnimationFrame(tick);
      else el.textContent = `${prefix}${pad(to)}${suffix}`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, started, from, to, duration, padTo, prefix, suffix]);

  useEffect(() => {
    if (!onView || started || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setStarted(true);
            io.disconnect();
            return;
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onView, started]);

  const pad = (n: number) => String(n).padStart(padTo, '0');
  const final = `${prefix}${pad(to)}${suffix}`;

  return (
    <span ref={ref} className={cn('tabnum', className)} aria-label={final}>
      {final}
    </span>
  );
}
