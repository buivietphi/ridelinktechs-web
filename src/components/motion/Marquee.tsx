'use client';

import type { ReactNode } from 'react';
import type { CSSProperties } from 'react';
import { useId } from 'react';
import { cn } from '@/lib/cn';

interface MarqueeProps {
  children: ReactNode;
  duration?: number;
  gap?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
}

export function Marquee({
  children,
  duration = 36,
  gap = 64,
  reverse,
  pauseOnHover,
  className,
}: MarqueeProps) {
  const id = useId();
  const style = {
    '--marquee-duration': `${duration}s`,
    '--marquee-gap': `${gap}px`,
  } as CSSProperties;

  return (
    <div className={cn('relative w-full overflow-hidden', className)} style={style}>
      <div
        className={cn(
          'flex w-max whitespace-nowrap',
          reverse ? 'bleed-marquee-reverse' : 'bleed-marquee',
          pauseOnHover && 'hover:paused',
        )}
        style={{ columnGap: `var(--marquee-gap)` }}
      >
        <div className={cn('flex shrink-0', `marquee-group-${id}`)}>{children}</div>
        <div className={cn('flex shrink-0', `marquee-group-${id}`)} aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
