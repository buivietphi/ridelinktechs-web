'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface LogoMarkProps {
  size?: number;
  className?: string;
  priority?: boolean;
  plateOnDark?: boolean;
}

export function LogoMark({ size = 28, className, priority, plateOnDark = false }: LogoMarkProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <span
        className={className ?? 'inline-block border border-[var(--rule-2)]'}
        style={{ width: size, height: size, background: 'var(--ground-raise)' }}
        aria-hidden
      />
    );
  }

  const isDark = resolvedTheme === 'dark';
  const src = isDark && plateOnDark ? '/logo/logo-dark.webp' : '/logo/logo-light.webp';

  return (
    <Image
      src={src}
      alt="RideLink Techs"
      width={size}
      height={size}
      priority={priority}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
