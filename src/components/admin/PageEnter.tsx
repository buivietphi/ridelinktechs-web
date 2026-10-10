'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';
import { prefersReducedMotion } from '@/lib/animations';

gsap.registerPlugin(useGSAP);

export function PageEnter({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return;
      const targets = ref.current.querySelectorAll('[data-enter]');
      if (!targets.length) return;
      gsap.fromTo(
        targets,
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.42,
          ease: 'power3.out',
          stagger: 0.06,
          clearProps: 'transform,opacity',
        },
      );
    },
    { scope: ref, dependencies: [pathname] },
  );

  return <div ref={ref}>{children}</div>;
}
