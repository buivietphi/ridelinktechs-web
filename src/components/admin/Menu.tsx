'use client';

import gsap from 'gsap';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/animations';
import { cn } from '@/lib/cn';

type MenuProps = {
  label: string;
  trigger: React.ReactNode;
  triggerClassName?: string;
  children: (close: () => void) => React.ReactNode;
};

export function Menu({ label, trigger, triggerClassName, children }: MenuProps) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      button.current?.focus();
    };
    const onFocus = (event: FocusEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    document.addEventListener('focusin', onFocus);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('focusin', onFocus);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !panel.current || prefersReducedMotion()) return;
    gsap.fromTo(
      panel.current,
      { opacity: 0, y: -6, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.22, ease: 'power3.out' },
    );
  }, [open]);

  return (
    <div ref={wrap} className="relative">
      <button
        ref={button}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((value) => !value)}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open ? (
        <div
          ref={panel}
          id={id}
          className="absolute top-full right-0 z-50 mt-2 w-max max-w-[min(18rem,calc(100vw-2rem))] min-w-56 origin-top-right rounded-[var(--radius-lg)] border border-[var(--rule-2)] bg-[var(--ground-raise)] bg-[image:var(--surface-tint)] p-1.5 shadow-[var(--shadow-2)]"
        >
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}

type MenuItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: React.ReactNode;
  danger?: boolean;
};

export function MenuItem({ icon, danger, className, children, ...props }: MenuItemProps) {
  return (
    <button
      type="button"
      {...props}
      className={cn('menu-item', danger && 'text-[var(--warn)]', className)}
    >
      {icon ? (
        <span aria-hidden className="grid size-5 shrink-0 place-items-center opacity-80">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}
