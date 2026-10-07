import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface FootnoteProps {
  index: string | number;
  children: ReactNode;
  inline?: boolean;
  className?: string;
}

export function Footnote({ index, children, inline, className }: FootnoteProps) {
  if (inline) {
    return (
      <sup
        className={cn(
          'footnote-ref ml-0.5 font-mono text-[0.7em] tracking-[0.04em] text-[var(--ink-soft)]',
          className,
        )}
        aria-label={`Footnote ${index}`}
      >
        {index}
      </sup>
    );
  }

  return (
    <div
      className={cn('mt-4 flex items-baseline gap-3 border-t border-[var(--rule)] pt-3', className)}
    >
      <span className="kicker shrink-0 text-[var(--ink-faint)]">{index}</span>
      <span className="text-[13px] leading-[1.55] text-[var(--ink-soft)]">{children}</span>
    </div>
  );
}
