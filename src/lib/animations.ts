'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useState } from 'react';

let registered = false;

export function ensureGsapRegistered(): void {
  if (typeof window === 'undefined') return;
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

type LenisLike = {
  raf: (t: number) => void;
  destroy: () => void;
  on: (e: string, f: () => void) => void;
  off: (e: string, f: () => void) => void;
  scrollTo: (target: HTMLElement, options?: { offset?: number }) => void;
};

let activeLenis: LenisLike | null = null;

export function scrollToElement(el: HTMLElement, offset = 0): void {
  if (activeLenis) {
    activeLenis.scrollTo(el, { offset });
    return;
  }
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY + offset,
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  });
}

export const EASE = {
  out: 'power4.out',
  inOut: 'power2.inOut',
  soft: 'power3.out',
} as const;

export function SmoothScroll(): null {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let cancelled = false;
    let tick: ((time: number) => void) | null = null;
    let onScroll: (() => void) | null = null;
    let instance: LenisLike | null = null;

    (async () => {
      ensureGsapRegistered();
      const { default: Lenis } = await import('lenis');
      if (cancelled) return;
      const lenis = new Lenis({ duration: 0.9, lerp: 0.09, smoothWheel: true });
      instance = lenis as unknown as LenisLike;
      activeLenis = instance;

      tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      onScroll = () => ScrollTrigger.update();
      lenis.on('scroll', onScroll);
    })();

    return () => {
      cancelled = true;
      if (tick) gsap.ticker.remove(tick);
      if (onScroll) instance?.off('scroll', onScroll);
      if (activeLenis === instance) activeLenis = null;
      instance?.destroy();
    };
  }, []);

  return null;
}

export function pinnedRail(track: HTMLElement, trigger: HTMLElement, onDone?: () => void) {
  const distance = track.scrollWidth - window.innerWidth;
  const tl = gsap.to(track, {
    x: -distance,
    ease: 'none',
    scrollTrigger: {
      trigger,
      start: 'top top',
      end: () => `+=${distance}`,
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        if (self.progress > 0.985) onDone?.();
      },
    },
  });
  return tl;
}

export { gsap, ScrollTrigger };
