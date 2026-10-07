import type { TimelineMark } from '@/content/products';
import type { Locale } from '@/i18n/config';
import { cn } from '@/lib/cn';

export function TimelineTag({
  mark,
  className,
  locale,
}: {
  mark: TimelineMark;
  className?: string;
  locale?: Locale;
}) {
  const label = mark.label[locale ?? 'vi'] ?? mark.label.en;
  return (
    <div className={cn('inline-flex items-center gap-3 font-mono text-[11px]', className)}>
      <span aria-hidden className="h-px w-6 bg-[var(--rule)]" />
      <span className="tracking-[0.16em] text-[var(--ink-soft)] uppercase">{label}</span>
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-[var(--radius-pill)] bg-[var(--ink-faint)]"
      />
    </div>
  );
}
