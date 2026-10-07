import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface DatelineRowProps {
  caption: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
  className?: string;
  tabular?: boolean;
}

export function DatelineRow({
  caption,
  children,
  hint,
  className,
  tabular = true,
}: DatelineRowProps) {
  return (
    <div
      className={cn(
        'dateline-row grid grid-cols-[1fr_2fr] items-baseline gap-x-6 border-t border-[var(--rule)] py-4',
        className,
      )}
    >
      <span className="kicker text-[var(--ink-soft)]">{caption}</span>
      <div className="flex flex-col items-end gap-1 text-right">
        <span className={cn('text-[var(--ink)]', tabular && 'tabnum')}>{children}</span>
        {hint ? <span className="kicker text-[var(--ink-faint)]">{hint}</span> : null}
      </div>
    </div>
  );
}
