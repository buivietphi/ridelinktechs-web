'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function Curtain() {
  const ref = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      node.remove();
      return;
    }
    node.style.transformOrigin = 'top';
    requestAnimationFrame(() => {
      node.style.transition = 'transform var(--dur-curtain) var(--ease-in-out) 60ms';
      node.style.transform = 'scaleY(1)';
    });
    const t = setTimeout(() => node.remove(), 1300);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="page-curtain"
      style={{
        background: 'var(--ink)',
        transform: 'scaleY(0)',
      }}
    />
  );
}
