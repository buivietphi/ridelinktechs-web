'use client';

import gsap from 'gsap';
import { CheckCircle, Warning, X } from 'phosphor-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { prefersReducedMotion } from '@/lib/animations';

type ToastInput = {
  message: string;
  tone?: 'ok' | 'error';
  action?: { label: string; run: () => void };
};

type ToastItem = ToastInput & { id: number };

const ToastContext = createContext<(toast: ToastInput) => void>(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const counter = useRef(0);

  const show = useCallback((input: ToastInput) => {
    counter.current += 1;
    setToast({ ...input, id: counter.current });
  }, []);

  const dismiss = useCallback((id: number) => {
    const el = ref.current;
    const clear = () => setToast((current) => (current?.id === id ? null : current));
    if (!el || prefersReducedMotion()) return clear();
    gsap.to(el, { y: 14, opacity: 0, duration: 0.22, ease: 'power2.in', onComplete: clear });
  }, []);

  useLayoutEffect(() => {
    if (!toast || !ref.current || prefersReducedMotion()) return;
    gsap.fromTo(
      ref.current,
      { y: 18, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 0.42, ease: 'power3.out' },
    );
  }, [toast]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => dismiss(toast.id), toast.action ? 8000 : 4200);
    return () => window.clearTimeout(timer);
  }, [toast, dismiss]);

  const Icon = toast?.tone === 'error' ? Warning : CheckCircle;

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+6rem)] z-50 flex justify-center px-4 md:bottom-7"
      >
        {toast ? (
          <div
            ref={ref}
            key={toast.id}
            className="pointer-events-auto flex max-w-[min(100%,34rem)] items-center gap-3 rounded-[var(--radius-xl)] bg-[var(--ink)] py-2 pr-2 pl-4 text-[14px] leading-[1.45] text-[var(--ground)] shadow-[var(--shadow-device)]"
          >
            <Icon size={20} weight="fill" className="shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 py-1.5">{toast.message}</span>
            {toast.action ? (
              <button
                type="button"
                onClick={() => {
                  toast.action?.run();
                  dismiss(toast.id);
                }}
                className="toast-action"
              >
                {toast.action.label}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Đóng thông báo"
              className="toast-action grid size-9 place-items-center px-0"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}
