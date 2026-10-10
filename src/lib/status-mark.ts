import type { CSSProperties } from 'react';
import type { ProductStatus } from '@/content/products';

export function statusMark(status: ProductStatus): {
  'data-state': 'upcoming' | undefined;
  style: CSSProperties;
} {
  return {
    'data-state': status === 'upcoming' ? 'upcoming' : undefined,
    style: {
      backgroundColor:
        status === 'shipped'
          ? 'var(--signal)'
          : status === 'upcoming'
            ? 'var(--quiet)'
            : 'transparent',
      border:
        status === 'in-development'
          ? '1.5px solid var(--signal)'
          : status === 'shipped' || status === 'upcoming'
            ? 'none'
            : '1.5px solid var(--quiet)',
    },
  };
}
