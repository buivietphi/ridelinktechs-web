import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Chip({
  children,
  className,
  tone = 'neutral',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'neutral' | 'accent' | 'muted';
}) {
  const tones = {
    neutral: 'border-[var(--rule)] text-[var(--ink-soft)]',
    accent:
      'border-l-2 border-l-[var(--signal)] border-r border-t border-b border-[var(--rule)] text-[var(--ink)]',
    muted: 'border-transparent bg-[var(--ground-sink)] text-[var(--ink-faint)]',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] tracking-[0.16em] uppercase',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
