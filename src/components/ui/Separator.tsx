import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const separatorVariants = cva('block shrink-0', {
  variants: {
    orientation: {
      horizontal: 'w-full h-px bg-[var(--rule)]',
      vertical: 'h-full w-px bg-[var(--rule)]',
    },
    weight: {
      default: 'bg-[var(--rule)]',
      strong: 'bg-[var(--rule-2)]',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    weight: 'default',
  },
});

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof separatorVariants> {
  decorative?: boolean;
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation, weight, decorative = true, ...props }, ref) => (
    <div
      ref={ref}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : (orientation ?? undefined)}
      className={cn(separatorVariants({ orientation, weight }), className)}
      {...props}
    />
  ),
);
Separator.displayName = 'Separator';

export { Separator, separatorVariants };
