import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface DropCapProps {
  children: ReactNode;
  letter?: string;
  opsz?: number;
  className?: string;
}

export function DropCap({ children, letter, opsz = 96, className }: DropCapProps) {
  let resolved: string | undefined = letter;
  if (!resolved) {
    if (typeof children === 'string') resolved = children.charAt(0);
    else if (Array.isArray(children) && typeof children[0] === 'string') {
      resolved = children[0].charAt(0);
    }
  }
  const remainder =
    typeof children === 'string'
      ? children.slice(1)
      : Array.isArray(children) && typeof children[0] === 'string'
        ? children[0].slice(1)
        : children;

  return (
    <p className={cn('drop-cap', className)}>
      <span
        aria-hidden
        className="float-left mt-1 mr-2 block font-[var(--font-display-loaded)] text-[var(--ink)]"
        style={{
          fontSize: '5.25rem',
          lineHeight: 0.9,
          fontWeight: 500,
          fontVariationSettings: `"opsz" ${opsz}`,
          letterSpacing: '-0.04em',
        }}
      >
        {resolved ?? ''}
      </span>
      {remainder}
    </p>
  );
}
