import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface KickerProps {
  children: ReactNode;
  className?: string;
  withDot?: boolean;
}

export function Kicker({ children, className, withDot }: KickerProps) {
  return (
    <span className={cn('kicker', className)}>
      {withDot ? (
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-[var(--radius-pill)] bg-[var(--signal)]"
        />
      ) : null}
      <span>{children}</span>
    </span>
  );
}
