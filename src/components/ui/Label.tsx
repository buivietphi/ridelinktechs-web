import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const labelVariants = cva(
  'block font-[var(--font-mono)] uppercase tracking-[0.16em] text-[11px] text-[var(--ink-soft)] mb-2',
  {
    variants: {
      tone: {
        default: '',
        signal: 'text-[var(--signal)]',
      },
      required: {
        true: "after:content-['*'] after:ml-1 after:text-[var(--signal)]",
        false: '',
      },
    },
    defaultVariants: { tone: 'default', required: false },
  },
);

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>, VariantProps<typeof labelVariants> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, tone, required, htmlFor, children, ...props }, ref) => (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={cn(labelVariants({ tone, required }), className)}
      {...props}
    >
      {children}
    </label>
  ),
);
Label.displayName = 'Label';

export { Label, labelVariants };
