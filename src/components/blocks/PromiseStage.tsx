'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Reveal } from '@/components/motion/Reveal';
import { BrowserFrame, PhoneFrame } from '@/components/ui/Frames';
import { prefersReducedMotion } from '@/lib/animations';
import { cn } from '@/lib/cn';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export type PracticeChapter = {
  id: string;
  title: string;
  body: string;
  image: string;
  alt: string;
  frame: 'phone' | 'wide';
  secondary?: { src: string; alt: string };
  extra?: ReactNode;
};

function PhoneShot({ chapter, className }: { chapter: PracticeChapter; className?: string }) {
  return <PhoneFrame src={chapter.image} alt={chapter.alt} sizes="300px" className={className} />;
}

function WideShot({ chapter, className }: { chapter: PracticeChapter; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      {chapter.secondary ? (
        <BrowserFrame
          src={chapter.secondary.src}
          alt={chapter.secondary.alt}
          sizes="(min-width: 1024px) 400px, 75vw"
          className="absolute top-0 right-0 w-[80%] opacity-80"
        />
      ) : null}
      <BrowserFrame
        src={chapter.image}
        alt={chapter.alt}
        sizes="(min-width: 1024px) 440px, 85vw"
        className={cn(
          'absolute left-0',
          chapter.secondary ? 'bottom-0 w-[88%]' : 'top-1/2 w-full -translate-y-1/2',
        )}
      />
    </div>
  );
}

export function PromiseStage({ chapters }: { chapters: PracticeChapter[] }) {
  const root = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const figs = gsap.utils.toArray<HTMLElement>('[data-stage-fig]', el);
      const parts = gsap.utils.toArray<HTMLElement>('[data-chapter]', el);
      const instant = prefersReducedMotion();

      const show = (active: number) => {
        parts.forEach((part, i) => part.setAttribute('data-active', String(i === active)));
        figs.forEach((fig, i) => {
          gsap.to(fig, {
            autoAlpha: i === active ? 1 : 0,
            yPercent: i === active ? 0 : i < active ? -5 : 5,
            scale: i === active ? 1 : 0.96,
            duration: instant ? 0 : 0.8,
            ease: 'expo.out',
            overwrite: 'auto',
          });
        });
      };

      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        gsap.set(figs.slice(1), { autoAlpha: 0, yPercent: 5, scale: 0.96 });
        gsap.set(figs[0], { autoAlpha: 1, yPercent: 0, scale: 1 });
        parts.forEach((part, i) => {
          ScrollTrigger.create({
            trigger: part,
            start: 'top 58%',
            end: 'bottom 58%',
            onEnter: () => show(i),
            onEnterBack: () => show(i),
          });
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="grid grid-cols-1 gap-x-10 lg:grid-cols-12">
      <div className="hidden lg:col-span-5 lg:block">
        <div className="sticky top-[136px] h-[min(600px,calc(100dvh-168px))]">
          <div className="panel relative h-full overflow-hidden">
            {chapters.map((chapter, i) => (
              <div
                key={chapter.id}
                data-stage-fig
                className={cn(
                  'absolute inset-0 flex items-center justify-center p-8',
                  i > 0 && 'invisible opacity-0',
                )}
              >
                {chapter.frame === 'phone' ? (
                  <PhoneShot chapter={chapter} className="h-[88%]" />
                ) : (
                  <WideShot chapter={chapter} className="h-[72%] w-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-6 lg:col-start-7">
        {chapters.map((chapter, i) => (
          <article
            key={chapter.id}
            data-chapter
            data-active={i === 0}
            className="flex min-h-[52dvh] flex-col justify-center py-10 transition-opacity duration-500 ease-[var(--ease-out-quint)] lg:min-h-[76dvh] lg:opacity-30 lg:last:min-h-[56dvh] lg:data-[active=true]:opacity-100"
          >
            <Reveal>
              <h3 className="text-[clamp(2.2rem,4.4vw,3.6rem)] leading-[1.04] font-extrabold tracking-[-0.04em]">
                {chapter.title}
              </h3>
              <p className="mt-5 max-w-[52ch] text-[16px] leading-[1.75] text-[var(--ink-soft)]">
                {chapter.body}
              </p>
              <div className="mt-8 lg:hidden">
                {chapter.frame === 'phone' ? (
                  <PhoneShot chapter={chapter} className="mx-auto w-[min(220px,62%)]" />
                ) : (
                  <WideShot chapter={chapter} className="aspect-[4/3] w-full" />
                )}
              </div>
              {chapter.extra}
            </Reveal>
          </article>
        ))}
      </div>
    </div>
  );
}
