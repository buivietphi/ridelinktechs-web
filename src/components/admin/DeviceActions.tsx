'use client';

import gsap from 'gsap';
import { Lock, LockOpen, SignOut, Trash } from 'phosphor-react';
import { useLayoutEffect, useRef, useState, useTransition } from 'react';
import { deleteDevice, logoutDevice, setDeviceBlocked } from '@/app/admin/(panel)/devices/actions';
import { prefersReducedMotion } from '@/lib/animations';
import type { ActionResult } from '@/lib/admin/result';
import { cn } from '@/lib/cn';

export type DeviceTarget = {
  id: string;
  is_blocked: boolean;
  session_count: number;
  is_current: boolean;
  can_manage: boolean;
  can_unlock?: boolean;
};

type Ask = 'logout' | 'block' | 'delete';

const FAILED = 'Chưa làm được. Thử lại sau.';

export function DeviceActions({ device, small }: { device: DeviceTarget; small?: boolean }) {
  const [ask, setAsk] = useState<Ask | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const box = useRef<HTMLDivElement>(null);
  const touched = useRef(false);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el || !touched.current) return;
    el.querySelector<HTMLButtonElement>('button')?.focus();
    if (prefersReducedMotion()) return;
    gsap.fromTo(el, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.22, ease: 'power3.out' });
  }, [ask]);

  if (!device.can_manage) {
    return <p className="text-[13px] text-[var(--ink-faint)]">Bạn chỉ xem được thiết bị này.</p>;
  }

  if (device.is_blocked && device.can_unlock !== true) {
    return (
      <p className="text-[13px] leading-[1.5] text-[var(--ink-faint)]">
        Admin đã khoá thiết bị này. Nhờ admin mở khoá nếu cần dùng lại.
      </p>
    );
  }

  const choose = (next: Ask | null) => {
    touched.current = true;
    setError(null);
    setAsk(next);
  };

  const run = (action: () => Promise<ActionResult>) =>
    start(async () => {
      setError(null);
      const result = await action();
      if (!result.ok) setError(result.message ?? FAILED);
      else setAsk(null);
    });

  const online = device.session_count > 0 && !device.is_blocked;
  const size = small ? 'min-h-9 px-3.5 text-[13px]' : 'min-h-10 px-4 text-[13px]';

  const QUESTION: Record<Ask, [string, string, () => Promise<ActionResult>]> = {
    logout: ['Đăng xuất khỏi thiết bị bạn đang dùng?', 'Đăng xuất', () => logoutDevice(device.id)],
    block: [
      'Khoá thiết bị này? Phiên đang mở bị đăng xuất ngay, và thiết bị không đăng nhập lại được cho đến khi mở khoá.',
      'Khoá thiết bị',
      () => setDeviceBlocked(device.id, true),
    ],
    delete: [
      'Xoá thiết bị khỏi danh sách? Phiên đang mở bị đăng xuất, lần đăng nhập sau nó được ghi nhận như thiết bị mới.',
      'Xoá thiết bị',
      () => deleteDevice(device.id),
    ],
  };

  return (
    <div ref={box} className="flex flex-col gap-2" aria-busy={pending}>
      {ask ? (
        <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--rule)] bg-[var(--admin-lane)] p-3.5">
          <p className="text-[13px] leading-[1.5]">{QUESTION[ask][0]}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => choose(null)} className={cn('btn', size)}>
              Huỷ
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(QUESTION[ask][2])}
              className={cn('btn btn-danger', size)}
            >
              {pending ? 'Đang xử lý…' : QUESTION[ask][1]}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {online ? (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                device.is_current ? choose('logout') : run(() => logoutDevice(device.id))
              }
              className={cn('btn', size)}
            >
              <SignOut size={16} aria-hidden />
              Đăng xuất
            </button>
          ) : null}
          {device.is_blocked ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => setDeviceBlocked(device.id, false))}
              className={cn('btn', size)}
            >
              <LockOpen size={16} aria-hidden />
              Mở khoá
            </button>
          ) : device.is_current ? null : (
            <button
              type="button"
              disabled={pending}
              onClick={() => choose('block')}
              className={cn('btn', size)}
            >
              <Lock size={16} aria-hidden />
              Khoá
            </button>
          )}
          {device.is_blocked || device.is_current ? null : (
            <button
              type="button"
              disabled={pending}
              onClick={() => choose('delete')}
              className={cn('btn text-[var(--warn)]', size)}
            >
              <Trash size={16} aria-hidden />
              Xoá
            </button>
          )}
        </div>
      )}
      {!ask && device.is_current ? (
        <p className="text-[12px] leading-[1.5] text-[var(--ink-faint)]">
          Đây là thiết bị bạn đang dùng, nên không khoá hay xoá được.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-[13px] text-[var(--warn)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
