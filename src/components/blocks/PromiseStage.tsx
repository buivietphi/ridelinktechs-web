'use client';

import Image from 'next/image';
import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Reveal } from '@/components/motion/Reveal';
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
  extra?: ReactNode;
};

function Shot({ chapter, className }: { chapter: PracticeChapter; className?: string }) {
  const phone = chapter.frame === 'phone';
  return (
    <div
      className={cn(
        'relative bg-[var(--ground-sink)] shadow-[var(--shadow-device)] ring-1 ring-white/12',
        phone
          ? 'aspect-[554/1200] rounded-[2.1rem] p-[3px]'
          : 'aspect-[1200/758] rounded-[var(--radius-lg)]',
        className,
      )}
    >
      <div
        className={cn(
          'relative h-full w-full overflow-hidden bg-black',
          phone ? 'rounded-[1.8rem]' : 'rounded-[var(--radius-lg)]',
        )}
      >
        <Image
          src={chapter.image}
          alt={chapter.alt}
          fill
          sizes={phone ? '300px' : '(min-width: 1024px) 480px, 90vw'}
          className={phone ? 'object-cover object-top' : 'object-cover object-left-top'}
        />
      </div>
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
                <Shot
                  chapter={chapter}
                  className={
                    chapter.frame === 'phone'
                      ? 'h-[88%]'
                      : 'w-[104%] shrink-0 [transform:perspective(1400px)_rotateY(-9deg)_rotateX(3deg)]'
                  }
                />
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
                <Shot
                  chapter={chapter}
                  className={chapter.frame === 'phone' ? 'mx-auto w-[min(220px,62%)]' : 'w-full'}
                />
              </div>
              {chapter.extra}
            </Reveal>
          </article>
        ))}
      </div>
    </div>
  );
}
