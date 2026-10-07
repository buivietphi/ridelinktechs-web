'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/animations';

export interface ParallaxFloatProps {
  strength?: number;
  direction?: 'up' | 'down';
  offset?: number;
  children: React.ReactNode;
  className?: string;
}

export function ParallaxFloat({
  strength = 20,
  direction = 'up',
  offset = 0,
  children,
  className,
}: ParallaxFloatProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [y, setY] = useState<number>(0);

  useEffect(() => {
    if (reduced || !ref.current) return;
    const el = ref.current;
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      const clamped = Math.max(-1, Math.min(1, progress + offset));
      const targetY = -clamped * strength * (direction === 'up' ? 1 : -1);
      setY(targetY);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strength, direction, offset, reduced]);

  return (
    <div
      ref={ref}
      className={cn('parallax-float will-change-transform', className)}
      style={{
        transform: reduced ? undefined : `translate3d(0, ${y.toFixed(2)}px, 0)`,
      }}
    >
      {children}
    </div>
  );
}
