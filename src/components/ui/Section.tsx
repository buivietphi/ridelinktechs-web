import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Section({
  children,
  className,
  spacing = 'lg',
  as: As = 'section',
  id,
  noTopRule,
  withBottomRule = true,
}: {
  children: ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  as?: 'section' | 'div' | 'article';
  id?: string;
  noTopRule?: boolean;
  withBottomRule?: boolean;
}) {
  return (
    <As
      id={id}
      className={cn(
        spacing === 'sm' && 'py-12 sm:py-16',
        spacing === 'md' && 'py-16 sm:py-20',
        spacing === 'lg' && 'py-20 sm:py-28',
        spacing === 'xl' && 'py-24 sm:py-36',
        !noTopRule && 'border-t border-[var(--rule)]',
        withBottomRule && 'border-b border-[var(--rule)]',
        className,
      )}
    >
      {children}
    </As>
  );
}
