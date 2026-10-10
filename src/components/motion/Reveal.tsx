'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '@/lib/animations';

gsap.registerPlugin(ScrollTrigger);

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  y?: number;
  scale?: number;
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'article' | 'span';
};

export function Reveal({
  children,
  className,
  y = 26,
  scale = 1,
  delay = 0,
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = ref.current;
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y, scale },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          delay,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref as React.Ref<never>} className={className}>
      {children}
    </Tag>
  );
}

type RevealGroupProps = {
  children: React.ReactNode;
  className?: string;
  itemSelector?: string;
  stagger?: number;
  y?: number;
};

export function RevealGroup({
  children,
  className,
  itemSelector = '[data-reveal-item]',
  stagger = 0.09,
  y = 30,
}: RevealGroupProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = ref.current;
      if (!el) return;
      const items = el.querySelectorAll(itemSelector);
      if (items.length === 0) return;
      gsap.fromTo(
        items,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
