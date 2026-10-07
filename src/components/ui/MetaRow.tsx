import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function MetaRow({
  caption,
  children,
  className,
}: {
  caption: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-[1fr_2fr] items-baseline gap-x-6 border-t border-[var(--rule)] py-4',
        className,
      )}
    >
      <span className="kicker">{caption}</span>
      <span className="text-right text-sm leading-relaxed text-[var(--ink)] md:text-base">
        {children}
      </span>
    </div>
  );
}
