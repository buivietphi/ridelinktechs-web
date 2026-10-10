'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '@/lib/animations';
import { cn } from '@/lib/cn';

type Dot = { x: number; y: number; vx: number; vy: number; r: number; tone: number };
type Rgb = [number, number, number];

const FALLBACK: Rgb[] = [
  [111, 141, 255],
  [155, 109, 240],
  [63, 184, 216],
];

function parseHex(value: string): Rgb | null {
  const hex = value.trim().replace('#', '');
  if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(hex)) return null;
  const full = hex.length === 3 ? hex.replace(/./g, (c) => c + c) : hex;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function LinkField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !host || !ctx) return;

    const still = prefersReducedMotion();
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const pointer = { x: -1e4, y: -1e4 };
    let width = 0;
    let height = 0;
    let reach = 150;
    let dots: Dot[] = [];
    let palette = FALLBACK;

    const readPalette = () => {
      const css = getComputedStyle(document.documentElement);
      palette = ['--signal', '--signal-violet', '--signal-cyan'].map(
        (name, i) => parseHex(css.getPropertyValue(name)) ?? FALLBACK[i],
      );
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      if (!still) {
        for (const d of dots) {
          d.x += d.vx;
          d.y += d.vy;
          if (d.x < -24) d.x = width + 24;
          else if (d.x > width + 24) d.x = -24;
          if (d.y < -24) d.y = height + 24;
          else if (d.y > height + 24) d.y = -24;
          const dx = pointer.x - d.x;
          const dy = pointer.y - d.y;
          if (dx * dx + dy * dy < 36000) {
            d.x += dx * 0.0022;
            d.y += dy * 0.0022;
          }
        }
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 >= reach * reach) continue;
          const [r, g, bl] = palette[a.tone];
          ctx.strokeStyle = `rgba(${r},${g},${bl},${(1 - Math.sqrt(d2) / reach) * 0.42})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        const px = pointer.x - a.x;
        const py = pointer.y - a.y;
        const pd = Math.sqrt(px * px + py * py);
        if (pd < 200) {
          const [r, g, bl] = palette[a.tone];
          ctx.strokeStyle = `rgba(${r},${g},${bl},${(1 - pd / 200) * 0.6})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }

      for (const d of dots) {
        const [r, g, b] = palette[d.tone];
        ctx.fillStyle = `rgba(${r},${g},${b},0.82)`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const resize = () => {
      const box = host.getBoundingClientRect();
      width = box.width;
      height = box.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(
        16,
        Math.min(coarse ? 34 : 64, Math.round((width * height) / (coarse ? 24000 : 16000))),
      );
      reach = Math.max(110, Math.min(170, width / 8));
      dots = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: 1.2 + Math.random() * 1.6,
        tone: i % palette.length,
      }));
      draw();
    };

    const onMove = (e: PointerEvent) => {
      const box = host.getBoundingClientRect();
      pointer.x = e.clientX - box.left;
      pointer.y = e.clientY - box.top;
    };
    const onLeave = () => {
      pointer.x = -1e4;
      pointer.y = -1e4;
    };

    readPalette();
    resize();

    const resizer = new ResizeObserver(resize);
    resizer.observe(host);
    const themer = new MutationObserver(() => {
      readPalette();
      if (still) draw();
    });
    themer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    let running = false;
    const run = (on: boolean) => {
      if (still || on === running) return;
      running = on;
      if (on) gsap.ticker.add(draw);
      else gsap.ticker.remove(draw);
    };
    const watcher = new IntersectionObserver(([entry]) => run(entry.isIntersecting));
    watcher.observe(host);

    if (!coarse) {
      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerleave', onLeave);
    }

    return () => {
      run(false);
      watcher.disconnect();
      resizer.disconnect();
      themer.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={cn('pointer-events-none block', className)} />;
}
