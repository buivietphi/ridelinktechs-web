'use client';

import gsap from 'gsap';
import { X } from 'phosphor-react';
import { useEffect, useId, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/animations';
import { cn } from '@/lib/cn';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  side?: boolean;
  children: React.ReactNode;
};

export function Dialog({ open, onClose, title, description, side = false, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.killTweensOf(el);
    const wide = window.matchMedia('(min-width: 640px)').matches;
    const offset = side && wide ? { x: 56, y: 0 } : { x: 0, y: wide ? 18 : 64 };
    const still = prefersReducedMotion();

    if (open) {
      if (!el.open) el.showModal();
      el.querySelector<HTMLElement>('[data-autofocus]')?.focus();
      if (still) return;
      gsap.fromTo(
        el,
        { ...offset, opacity: 0, scale: side ? 1 : 0.97 },
        { x: 0, y: 0, opacity: 1, scale: 1, duration: 0.42, ease: 'power3.out' },
      );
      return;
    }
    if (!el.open) return;
    if (still) {
      el.close();
      return;
    }
    gsap.to(el, {
      ...offset,
      opacity: 0,
      duration: 0.22,
      ease: 'power2.in',
      onComplete: () => {
        el.close();
        gsap.set(el, { clearProps: 'all' });
      },
    });
  }, [open, side]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onBackdrop = (event: MouseEvent) => {
      if (event.target === el) onClose();
    };
    el.addEventListener('click', onBackdrop);
    return () => el.removeEventListener('click', onBackdrop);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={cn('admin-dialog', side && 'admin-dialog-side')}
    >
      <div className="flex h-full max-h-[inherit] flex-col">
        <header className="flex items-start gap-4 px-6 pt-6 pb-4 sm:px-7">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="display-md">
              {title}
            </h2>
            {description ? (
              <p
                id={descriptionId}
                className="mt-1.5 text-[14px] leading-[1.55] text-[var(--ink-soft)]"
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="icon-btn -mt-1 -mr-2"
          >
            <X size={18} weight="bold" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6 sm:px-7 sm:pb-7">
          {children}
        </div>
      </div>
    </dialog>
  );
}
