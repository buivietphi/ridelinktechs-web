'use client';

import { Car, Cube, Megaphone, PawPrint, Sparkle } from 'phosphor-react';
import type { IconProps } from 'phosphor-react';
import type { ProductIcon } from '@/content/products';

const glyphs = { car: Car, sparkle: Sparkle, paw: PawPrint, megaphone: Megaphone } as const;

export function ProductGlyph({ icon, ...props }: IconProps & { icon?: ProductIcon }) {
  const Glyph = (icon && glyphs[icon]) || Cube;
  return <Glyph aria-hidden {...props} />;
}
