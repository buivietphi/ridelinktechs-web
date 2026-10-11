'use client';

import gsap from 'gsap';
import { Trash } from 'phosphor-react';
import { useLayoutEffect, useRef, useState, useTransition } from 'react';
import { prefersReducedMotion } from '@/lib/animations';
import { deleteContact } from './actions';

const FAILED = 'Chưa xoá được. Thử lại sau.';

export function DeleteContact({
  id,
  name,
  onDeleted,
}: {
  id: string;
  name: string;
  onDeleted: () => void;
}) {
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const panel = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = panel.current;
    if (!asking || !el) return;
    el.querySelector<HTMLButtonElement>('button')?.focus();
    if (prefersReducedMotion()) return;
    gsap.fromTo(el, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.22, ease: 'power3.out' });
  }, [asking]);

  const confirm = () =>
    start(async () => {
      setError(null);
      const result = await deleteContact(id);
      if (result.ok) onDeleted();
      else setError(result.message ?? FAILED);
    });

  return (
    <div className="border-t border-[var(--rule-2)] pt-6" aria-busy={pending}>
      {asking ? (
        <div
          ref={panel}
          className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--rule)] bg-[var(--admin-lane)] p-4"
        >
          <p className="text-[14px] leading-[1.55]">
            Xoá brief của {name}? Brief bị xoá hẳn khỏi hệ thống và không hoàn tác được.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAsking(false)}
              className="btn min-h-10 px-4 text-[13px]"
            >
              Huỷ
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={confirm}
              className="btn btn-danger min-h-10 px-4 text-[13px]"
            >
              {pending ? 'Đang xoá…' : 'Xoá brief'}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setAsking(true);
          }}
          className="btn min-h-10 px-4 text-[13px] text-[var(--warn)]"
        >
          <Trash size={16} aria-hidden />
          Xoá brief
        </button>
      )}
      {error ? (
        <p role="alert" className="mt-3 text-[13px] text-[var(--warn)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
