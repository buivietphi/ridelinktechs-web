'use client';

import Image from 'next/image';
import { useState } from 'react';
import { imageRatio, isPortrait } from '@/content/image-ratio';

type ScreenGalleryProps = {
  screens: string[];
  name: string;
};

export function ScreenGallery({ screens, name }: ScreenGalleryProps) {
  const [loaded, setLoaded] = useState<number | null>(null);

  if (screens.length === 0) return null;

  return (
    <ul className="mt-8 flex snap-x snap-mandatory items-start gap-5 overflow-x-auto pb-6">
      {screens.map((src, i) => {
        const phone = isPortrait(src);
        return (
          <li key={src} className="w-[min(260px,72vw)] shrink-0 snap-center lg:w-[min(220px,20vw)]">
            <div
              className={`relative overflow-hidden bg-[var(--ground-sink)] ring-1 ring-white/10 ${
                phone ? 'rounded-[1.5rem] p-[3px]' : 'rounded-[var(--radius-lg)]'
              }`}
            >
              <div
                className={`relative w-full overflow-hidden ${
                  phone ? 'rounded-[1.2rem] bg-black' : ''
                }`}
                style={{ aspectRatio: imageRatio(src) }}
              >
                <Image
                  src={src}
                  alt={`${name} — màn hình ${i + 1}`}
                  fill
                  sizes={
                    phone ? '(min-width: 1024px) 220px, 72vw' : '(min-width: 1024px) 40vw, 72vw'
                  }
                  onLoad={() => setLoaded(i)}
                  className={`object-cover transition-opacity duration-500 ${
                    loaded === null || loaded === i ? 'opacity-100' : 'opacity-100'
                  }`}
                />
              </div>
            </div>
            <p className="mt-3 font-mono text-[11px] text-[var(--ink-faint)]">
              {String(i + 1).padStart(2, '0')} / {String(screens.length).padStart(2, '0')}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
