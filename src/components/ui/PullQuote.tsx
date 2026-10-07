import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PullQuoteProps {
  children: ReactNode;
  attribution?: ReactNode;
  tone?: 'hero' | 'inline';
  className?: string;
}

export function PullQuote({ children, attribution, tone = 'hero', className }: PullQuoteProps) {
  const sizeClass =
    tone === 'hero'
      ? 'text-[28px] leading-[1.18] sm:text-[32px] sm:leading-[1.16] md:text-[36px] md:leading-[1.14]'
      : 'text-[20px] leading-[1.28] sm:text-[22px]';

  return (
    <figure
      className={cn(
        'pull-quote my-10 border-l-[1.5px] border-l-[var(--signal)] pl-6 sm:pl-8',
        className,
      )}
    >
      <blockquote
        className={cn(
          'pull-quote font-[var(--font-display-loaded)] text-[var(--ink)]',
          sizeClass,
          'tracking-[-0.028em]',
        )}
        style={{ fontVariationSettings: '"opsz" 32', fontWeight: 600 }}
      >
        {children}
      </blockquote>
      {attribution ? (
        <figcaption className="kicker mt-4 text-[var(--ink-soft)]">{attribution}</figcaption>
      ) : null}
    </figure>
  );
}
