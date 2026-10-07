import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ChapterFrameProps {
  kicker?: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
  body?: ReactNode;
  as?: 'section' | 'article' | 'div';
  id?: string;
  className?: string;
  containerClassName?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  noTopRule?: boolean;
  noBottomRule?: boolean;
}

export function ChapterFrame({
  kicker,
  meta,
  children,
  body,
  as: As = 'section',
  id,
  className,
  containerClassName,
  spacing = 'lg',
  noTopRule,
  noBottomRule,
}: ChapterFrameProps) {
  const spaceY =
    spacing === 'sm'
      ? 'py-12 sm:py-16'
      : spacing === 'md'
        ? 'py-16 sm:py-20'
        : spacing === 'xl'
          ? 'py-24 sm:py-36'
          : 'py-20 sm:py-28';

  return (
    <As
      id={id}
      className={cn(
        'chapter-frame relative',
        !noTopRule && 'border-t border-[var(--rule)]',
        !noBottomRule && 'border-b border-[var(--rule)]',
        spaceY,
        className,
      )}
    >
      <div
        className={cn('mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12', containerClassName)}
      >
        {kicker || meta ? (
          <div className="mb-8 flex items-baseline justify-between gap-6 sm:mb-10">
            <div className="kicker text-[var(--ink-soft)]">{kicker}</div>
            {meta ? <div className="kicker text-[var(--ink-faint)]">{meta}</div> : null}
          </div>
        ) : null}
        {children}
        {body}
      </div>
    </As>
  );
}
