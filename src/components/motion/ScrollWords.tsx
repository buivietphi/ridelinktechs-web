'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '@/lib/animations';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type ScrollWordsProps = {
  text: string;
  className?: string;
  dim?: number;
};

export function ScrollWords({ text, className, dim = 0.14 }: ScrollWordsProps) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const words = text.split(' ');

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = ref.current;
      if (!el) return;
      gsap.fromTo(
        el.querySelectorAll('[data-word]'),
        { opacity: dim },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 84%', end: 'bottom 52%', scrub: true },
        },
      );
    },
    { scope: ref, dependencies: [text, dim] },
  );

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i}>
          <span data-word className="inline-block">
            {word}
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </p>
  );
}
