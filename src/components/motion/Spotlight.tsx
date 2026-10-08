'use client';

import type { HTMLAttributes, PointerEvent } from 'react';
import { cn } from '@/lib/cn';

export function Spotlight({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--sx', `${e.clientX - box.left}px`);
    e.currentTarget.style.setProperty('--sy', `${e.clientY - box.top}px`);
  };

  return (
    <div {...rest} onPointerMove={onMove} className={cn('spotlight', className)}>
      {children}
    </div>
  );
}
