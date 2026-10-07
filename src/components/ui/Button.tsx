import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps & {
  href: string;
  external?: boolean;
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

const baseClass =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] transition-colors duration-200 ease-[var(--ease-out-quint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ground)] disabled:pointer-events-none disabled:opacity-40';

const variantClass: Record<Variant, string> = {
  primary:
    'rounded-[var(--radius-pill)] border border-[var(--ink)] bg-[var(--ink)] px-5 py-3 text-[var(--ground)] hover:bg-[#1c1c20]',
  ghost:
    'rounded-[var(--radius-pill)] border border-transparent bg-transparent px-1 py-1 text-[var(--ink)] hover:text-[var(--signal)]',
  outline:
    'rounded-[var(--radius-pill)] border border-[var(--rule)] bg-[var(--ground)] px-5 py-3 text-[var(--ink)] hover:border-[var(--ink)]',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-8 px-3 text-[10px]',
  md: 'h-10 px-5',
  lg: 'h-12 px-7 text-[12px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, children, ...rest },
  ref,
) {
  const classes = cn(
    baseClass,
    variantClass[variant],
    variant !== 'ghost' && sizeClass[size],
    className,
  );

  if ('href' in rest && rest.href) {
    const { href, external, ...linkRest } = rest as ButtonAsLink;
    if (external) {
      return (
        <a
          href={href}
          className={classes}
          target="_blank"
          rel="noreferrer noopener"
          {...(linkRest as object)}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...(linkRest as object)}>
        {children}
      </Link>
    );
  }

  return (
    <button ref={ref} className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
});
