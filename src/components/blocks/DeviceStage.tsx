'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { BrowserFrame, PhoneFrame } from '@/components/ui/Frames';
import { prefersReducedMotion } from '@/lib/animations';
import { cn } from '@/lib/cn';

gsap.registerPlugin(useGSAP);

export type StageShot = { src: string; alt: string };

type DeviceStageProps = {
  shots: StageShot[];
  kind: 'phone' | 'web';
  label?: string;
  className?: string;
};

const PHONE_SLOTS = [
  { place: 'left-1/2 top-[3%] z-20 h-[92%] -translate-x-1/2', depth: 22 },
  { place: 'left-[2%] top-[15%] z-10 h-[76%] -rotate-[6deg]', depth: 12 },
  { place: 'right-[2%] top-[15%] z-10 h-[76%] rotate-[6deg]', depth: 12 },
];

const WEB_SLOTS = [
  { place: 'left-0 bottom-[6%] z-20 w-[84%]', depth: 22 },
  { place: 'right-0 top-[6%] z-10 w-[78%] opacity-85', depth: 10 },
];

export function DeviceStage({ shots, kind, label, className }: DeviceStageProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const phone = kind === 'phone';
  const slots = phone ? PHONE_SLOTS : WEB_SLOTS;
  const visible = shots.slice(0, slots.length);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const devices = gsap.utils.toArray<HTMLElement>('[data-device]', el);

      gsap.from(devices, {
        y: 70,
        autoAlpha: 0,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.12,
        delay: 0.2,
      });

      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

      const movers = devices.map((device, i) => ({
        x: gsap.quickTo(device, 'x', { duration: 0.9, ease: 'power3.out' }),
        y: gsap.quickTo(device, 'y', { duration: 0.9, ease: 'power3.out' }),
        depth: slots[i]?.depth ?? 10,
      }));

      const onMove = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        movers.forEach((m) => {
          m.x(nx * m.depth * 2);
          m.y(ny * m.depth);
        });
      };

      window.addEventListener('pointermove', onMove, { passive: true });
      return () => window.removeEventListener('pointermove', onMove);
    },
    { scope: root, dependencies: [kind, visible.length] },
  );

  return (
    <div
      ref={root}
      className={cn(
        'relative mx-auto',
        phone
          ? 'h-[min(560px,calc(100dvh-250px))] min-h-[320px] w-full max-w-[520px]'
          : 'aspect-[5/4] w-full max-w-[640px]',
        className,
      )}
    >
      {visible.map((shot, i) => (
        <div
          key={shot.src}
          data-device
          className={cn('absolute', slots[i].place, phone ? 'aspect-[554/1200]' : '')}
        >
          {phone ? (
            <PhoneFrame
              src={shot.src}
              alt={shot.alt}
              sizes="260px"
              priority
              className="h-full w-full"
            />
          ) : (
            <BrowserFrame
              src={shot.src}
              alt={shot.alt}
              sizes="(min-width: 1024px) 520px, 90vw"
              priority
              label={i === 0 ? label : undefined}
              className="w-full"
            />
          )}
        </div>
      ))}
    </div>
  );
}
