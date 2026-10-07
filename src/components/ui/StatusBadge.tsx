import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

type Status = 'in-development' | 'upcoming' | 'shipped';

const DOT: Record<Status, string> = {
  'in-development': 'bg-[var(--hold)]',
  upcoming: 'bg-[var(--ink-faint)]',
  shipped: 'bg-[var(--ok)]',
};

const FG: Record<Status, string> = {
  'in-development': 'text-[var(--hold)]',
  upcoming: 'text-[var(--ink-soft)]',
  shipped: 'text-[var(--ok)]',
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const t = useTranslations('status');
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 border border-[var(--rule)] px-2 py-1 font-mono text-[11px] tracking-[0.16em] uppercase',
        FG[status],
        className,
      )}
    >
      <span aria-hidden className={cn('h-1.5 w-1.5 rounded-[var(--radius-pill)]', DOT[status])} />
      <span>{t(status)}</span>
    </span>
  );
}
