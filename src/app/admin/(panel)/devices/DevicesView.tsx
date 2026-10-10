'use client';

import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { useLayoutEffect, useRef, useState } from 'react';
import { DeviceActions } from '@/components/admin/DeviceActions';
import {
  DEVICE_STATE,
  OsIcon,
  deviceState,
  type DeviceLite,
  type DeviceState,
} from '@/components/admin/devices';
import { Avatar, Chip, PageHead } from '@/components/admin/ui';
import { prefersReducedMotion } from '@/lib/animations';
import { ago, when } from '@/lib/admin/format';
import { ROLE_LABEL, type Role } from '@/lib/admin/roles';
import { cn } from '@/lib/cn';

gsap.registerPlugin(Flip);

export type Device = DeviceLite & {
  user_id: string;
  email: string;
  display_name: string;
  role: Role;
  avatar: string | null;
  blocked_at: string | null;
};

type Filter = 'all' | DeviceState;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'online', label: 'Đang đăng nhập' },
  { key: 'offline', label: 'Đã đăng xuất' },
  { key: 'blocked', label: 'Đã khoá' },
];

export function DevicesView({ devices, role }: { devices: Device[]; role: Role }) {
  const grid = useRef<HTMLUListElement>(null);
  const flip = useRef<Flip.FlipState | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const counts: Record<Filter, number> = { all: devices.length, online: 0, offline: 0, blocked: 0 };
  for (const device of devices) counts[deviceState(device)] += 1;

  useLayoutEffect(() => {
    const state = flip.current;
    if (!state) return;
    flip.current = null;
    Flip.from(state, {
      duration: 0.48,
      ease: 'power3.out',
      absolute: true,
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.42, ease: 'power3.out' },
        ),
      onLeave: (els) => gsap.to(els, { opacity: 0, y: -10, duration: 0.22, ease: 'power2.in' }),
    });
  }, [filter]);

  const choose = (next: Filter) => {
    if (next === filter) return;
    if (grid.current && !prefersReducedMotion()) {
      flip.current = Flip.getState(grid.current.querySelectorAll('[data-device]'));
    }
    setFilter(next);
  };

  return (
    <div className="flex flex-col gap-7">
      <PageHead
        title="Thiết bị"
        description={
          role === 'admin'
            ? 'Mỗi trình duyệt đăng nhập được ghi nhận bằng ThumbmarkJS. Đăng xuất, khoá hay xoá một thiết bị đều đưa trình duyệt đó về trang đăng nhập trong vài giây.'
            : 'Thiết bị của các tài khoản Sub, cùng thiết bị của bạn. Đăng xuất, khoá hay xoá một thiết bị đều đưa trình duyệt đó về trang đăng nhập trong vài giây.'
        }
      />

      <div data-enter role="group" aria-label="Lọc thiết bị" className="flex flex-wrap gap-2">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => choose(key)}
            className={cn('choice-pill', filter === key && 'is-checked')}
          >
            {label}
            <span className="tabnum opacity-70">{counts[key]}</span>
          </button>
        ))}
      </div>

      {devices.length === 0 ? (
        <p data-enter className="text-[15px] text-[var(--ink-soft)]">
          Chưa có thiết bị nào đăng nhập.
        </p>
      ) : null}

      <ul ref={grid} data-enter className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {devices.map((device) => {
          const state = deviceState(device);
          const visible = filter === 'all' || filter === state;
          return (
            <li
              key={device.id}
              data-device
              data-flip-id={device.id}
              className={cn(
                'panel flex-col gap-5 p-5 sm:p-6',
                visible ? 'flex' : 'hidden',
                device.is_blocked && 'opacity-80',
              )}
            >
              <div className="flex items-start gap-3.5">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--admin-lane)] text-[var(--ink)] shadow-[var(--shadow-1)]">
                  <OsIcon name={device.device_name} />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h2 className="flex flex-wrap items-center gap-2 text-[16px] leading-tight font-semibold tracking-normal">
                    <span className="min-w-0 break-words">{device.device_name}</span>
                    {device.is_current ? <span className="self-chip">Thiết bị này</span> : null}
                  </h2>
                  <p className="mt-1.5 flex min-w-0 items-center gap-2 text-[13px] text-[var(--ink-soft)]">
                    <Avatar
                      name={device.display_name}
                      role={device.role}
                      src={device.avatar}
                      size={20}
                    />
                    <span className="truncate">
                      {device.display_name} · {ROLE_LABEL[device.role]}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Chip color={DEVICE_STATE[state].color}>{DEVICE_STATE[state].label}</Chip>
                {device.user_agent ? (
                  <span
                    title={device.user_agent}
                    className="min-w-0 flex-1 truncate font-mono text-[11px] text-[var(--ink-faint)]"
                  >
                    {device.user_agent}
                  </span>
                ) : null}
              </div>

              <dl className="grid grid-cols-3 gap-3 border-t border-[var(--rule-2)] pt-4 text-[13px]">
                <div className="min-w-0">
                  <dt className="data-label">Lần đầu</dt>
                  <dd className="mt-1" title={when(device.first_seen_at)} suppressHydrationWarning>
                    {ago(device.first_seen_at)}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="data-label">Đăng nhập</dt>
                  <dd className="mt-1" title={when(device.last_login_at)} suppressHydrationWarning>
                    {ago(device.last_login_at)}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="data-label">Hoạt động</dt>
                  <dd className="mt-1" title={when(device.last_seen_at)} suppressHydrationWarning>
                    {ago(device.last_seen_at)}
                  </dd>
                </div>
              </dl>

              <DeviceActions device={device} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
