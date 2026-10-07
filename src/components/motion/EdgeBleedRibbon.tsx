'use client';

import { cn } from '@/lib/cn';

interface EdgeBleedRibbonProps {
  items: readonly string[];
  duration?: number;
  separator?: string;
  className?: string;
}

export function EdgeBleedRibbon({
  items,
  duration = 38,
  separator = '·',
  className,
}: EdgeBleedRibbonProps) {
  if (items.length === 0) return null;

  return (
    <div
      role="marquee"
      aria-label="Edge bleed"
      className={cn(
        'relative w-screen max-w-none overflow-hidden border-y border-[var(--rule)] bg-[var(--paper-elev)] py-4',
        'right-1/2 left-1/2 -mx-[50vw]',
        className,
      )}
    >
      <div
        className="bleed-marquee font-mono text-[11px] tracking-[0.18em] whitespace-nowrap text-[var(--ink-soft)] uppercase"
        style={{ ['--marquee-duration' as string]: `${duration}s` }}
      >
        {[0, 1].map((dup) => (
          <span key={dup} aria-hidden={dup === 1} className="flex shrink-0 items-center">
            {items.map((it, i) => (
              <span key={`${dup}-${i}`} className="flex shrink-0 items-center">
                <span className="px-6">{it}</span>
                <span aria-hidden className="text-[var(--signal)]">
                  {separator}
                </span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
