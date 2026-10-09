import Image from 'next/image';
import { cn } from '@/lib/cn';

type FrameProps = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

export function PhoneFrame({ src, alt, sizes, priority, className }: FrameProps) {
  return (
    <div
      className={cn(
        'relative aspect-[554/1200] rounded-[2.1rem] bg-[var(--ground-sink)] p-[3px] shadow-[var(--shadow-device)] ring-1 ring-white/12',
        className,
      )}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[1.8rem] bg-black">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}

export function BrowserFrame({
  src,
  alt,
  sizes,
  priority,
  label,
  className,
}: FrameProps & { label?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--ground-sink)] shadow-[var(--shadow-device)] ring-1 ring-white/12',
        className,
      )}
    >
      {label ? (
        <div className="flex h-7 items-center border-b border-white/10 px-3">
          <span className="font-mono text-[10.5px] text-[var(--ink-faint)]">{label}</span>
        </div>
      ) : null}
      <div className="relative aspect-[158/100]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover object-left-top"
        />
      </div>
    </div>
  );
}
