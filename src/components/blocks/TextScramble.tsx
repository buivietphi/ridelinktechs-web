'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/animations';
import { cn } from '@/lib/cn';

const SCRAMBLE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789·—/';

export interface TextScrambleProps {
  text: string;
  speed?: number;
  duration?: number;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
  'aria-label'?: string;
}

export function TextScramble({
  text,
  speed = 32,
  duration = 700,
  as: Tag = 'span',
  className,
  'aria-label': ariaLabel,
}: TextScrambleProps) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState<string>(reduced ? text : '');
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (reduced) {
      setDisplay(text);
      return;
    }
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(1, elapsed / duration);
      const lockedCount = Math.floor(progress * text.length);
      let next = '';
      for (let i = 0; i < text.length; i += 1) {
        const ch = text[i];
        if (ch === ' ') {
          next += ' ';
          continue;
        }
        if (i < lockedCount) {
          next += ch;
        } else {
          next += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }
      setDisplay(next);
      if (progress < 1) {
        rafRef.current = window.setTimeout(
          () => requestAnimationFrame(tick),
          Math.max(0, speed - 16),
        ) as unknown as number;
      } else {
        setDisplay(text);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [text, duration, speed, reduced]);

  return (
    <Tag
      aria-label={ariaLabel ?? text}
      className={cn('inline-block font-[var(--font-display)] text-[var(--ink)]', className)}
    >
      <span aria-hidden>{display || ' '}</span>
    </Tag>
  );
}
