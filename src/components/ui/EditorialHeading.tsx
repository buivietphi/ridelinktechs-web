import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type DisplaySize = 'hero' | 'chapter' | 'section' | 'entry' | 'inline';

interface EditorialHeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  size?: DisplaySize;
  weight?: 400 | 500 | 600 | 700;
  opsz?: number;
  children: ReactNode;
  className?: string;
  inline?: boolean;
}

const SIZE_TO_TAG: Record<DisplaySize, 'h1' | 'h2' | 'h3' | 'h4'> = {
  hero: 'h1',
  chapter: 'h2',
  section: 'h3',
  entry: 'h4',
  inline: 'h4',
};

const SIZE_TO_CLASS: Record<DisplaySize, string> = {
  hero: 'text-[44px] leading-[1.02] sm:text-[64px] sm:leading-[1.0] md:text-[80px] md:leading-[0.98] lg:text-[96px]',
  chapter:
    'text-[36px] leading-[1.05] sm:text-[44px] sm:leading-[1.04] md:text-[56px] md:leading-[1.02] lg:text-[72px]',
  section:
    'text-[28px] leading-[1.1] sm:text-[32px] sm:leading-[1.06] md:text-[40px] md:leading-[1.04] lg:text-[44px]',
  entry:
    'text-[22px] leading-[1.15] sm:text-[24px] sm:leading-[1.12] md:text-[28px] md:leading-[1.1]',
  inline: 'text-[18px] leading-[1.25]',
};

const SIZE_TO_TRACKING: Record<DisplaySize, string> = {
  hero: 'tracking-[-0.045em]',
  chapter: 'tracking-[-0.035em]',
  section: 'tracking-[-0.03em]',
  entry: 'tracking-[-0.025em]',
  inline: 'tracking-[-0.02em]',
};

const SIZE_TO_DEFAULT_OPSZ: Record<DisplaySize, number> = {
  hero: 36,
  chapter: 28,
  section: 20,
  entry: 16,
  inline: 14,
};

const SIZE_TO_DEFAULT_WEIGHT: Record<DisplaySize, 400 | 500 | 600> = {
  hero: 500,
  chapter: 500,
  section: 500,
  entry: 500,
  inline: 500,
};

export function EditorialHeading({
  as,
  size = 'chapter',
  weight,
  opsz,
  children,
  className,
  inline,
}: EditorialHeadingProps) {
  const Tag: ElementType = inline ? 'span' : (as ?? SIZE_TO_TAG[size]);
  const opszValue = opsz ?? SIZE_TO_DEFAULT_OPSZ[size];
  const weightValue = weight ?? SIZE_TO_DEFAULT_WEIGHT[size];
  return (
    <Tag
      className={cn(
        'display font-[var(--font-display-loaded)] text-[var(--ink)]',
        SIZE_TO_CLASS[size],
        SIZE_TO_TRACKING[size],
        'font-medium',
        className,
      )}
      style={{
        fontVariationSettings: `"opsz" ${opszValue}`,
        fontWeight: weightValue,
      }}
    >
      {children}
    </Tag>
  );
}
