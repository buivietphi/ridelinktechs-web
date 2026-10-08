'use client';

import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { scrollToElement } from '@/lib/animations';

type JumpLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string };

export function JumpLink({ to, children, ...rest }: JumpLinkProps) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(to);
    if (!target) return;
    e.preventDefault();
    const header = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
    scrollToElement(target.querySelector<HTMLElement>('h1, h2') ?? target, -(header + 8));
  };

  return (
    <a {...rest} href={`#${to}`} onClick={onClick}>
      {children}
    </a>
  );
}
