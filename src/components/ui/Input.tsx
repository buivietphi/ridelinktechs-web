import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const inputVariants = cva(
  [
    'block w-full bg-transparent text-[var(--ink)]',
    'font-[var(--font-body)] text-[16px] leading-[1.5]',
    'border border-[var(--rule)] ',
    'transition-[border-color,box-shadow,background-color] duration-150',
    'placeholder:text-[var(--ink-faint)] placeholder:font-normal',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'focus-visible:outline-none focus-visible:border-[var(--ink)]',
    'focus-visible:ring-2 focus-visible:ring-[var(--signal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ground)]',
    'aria-[invalid=true]:border-[var(--warn)]',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'h-9 px-3 text-[13px]',
        md: 'h-12 px-4',
        lg: 'h-14 px-5 text-[20px]',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, type = 'text', ...props }, ref) => (
    <input ref={ref} type={type} className={cn(inputVariants({ size }), className)} {...props} />
  ),
);
Input.displayName = 'Input';

export { Input, inputVariants };
