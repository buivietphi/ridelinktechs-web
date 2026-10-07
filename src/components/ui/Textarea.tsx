import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const textareaVariants = cva(
  [
    'block w-full bg-transparent text-[var(--ink)] resize-y',
    'font-[var(--font-body)] text-[16px] leading-[1.55]',
    'border border-[var(--rule)] p-4 min-h-[140px]',
    'transition-[border-color,box-shadow,background-color] duration-150',
    'placeholder:text-[var(--ink-faint)]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'focus-visible:outline-none focus-visible:border-[var(--ink)]',
    'focus-visible:ring-2 focus-visible:ring-[var(--signal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ground)]',
    'aria-[invalid=true]:border-[var(--warn)]',
  ].join(' '),
);

export interface TextareaProps
  extends
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 6, ...props }, ref) => (
    <textarea ref={ref} rows={rows} className={cn(textareaVariants(), className)} {...props} />
  ),
);
Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
