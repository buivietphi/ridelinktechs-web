'use client';

import { AndroidLogo, AppleLogo, Desktop, LinuxLogo, WindowsLogo } from 'phosphor-react';
import { ago, when } from '@/lib/admin/format';
import { DeviceActions, type DeviceTarget } from './DeviceActions';

export type DeviceState = 'online' | 'offline' | 'blocked';

export const deviceState = (device: { is_blocked: boolean; session_count: number }): DeviceState =>
  device.is_blocked ? 'blocked' : device.session_count > 0 ? 'online' : 'offline';

export const DEVICE_STATE: Record<DeviceState, { label: string; color: string }> = {
  online: { label: 'Đang đăng nhập', color: 'var(--ok)' },
  offline: { label: 'Đã đăng xuất', color: 'var(--quiet)' },
  blocked: { label: 'Đã khoá', color: 'var(--warn)' },
};

export type DeviceLite = DeviceTarget & {
  device_name: string;
  user_agent: string | null;
  first_seen_at: string;
  last_login_at: string;
  last_seen_at: string;
};

export function OsIcon({ name, size = 24 }: { name: string; size?: number }) {
  const Icon = /iOS|macOS/.test(name)
    ? AppleLogo
    : /Windows/.test(name)
      ? WindowsLogo
      : /Android/.test(name)
        ? AndroidLogo
        : /Linux|ChromeOS/.test(name)
          ? LinuxLogo
          : Desktop;
  return <Icon size={size} weight="duotone" aria-hidden />;
}

export function DeviceRow({ device, manage = false }: { device: DeviceLite; manage?: boolean }) {
  const state = DEVICE_STATE[deviceState(device)];
  return (
    <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--admin-lane)] shadow-[var(--shadow-1)]">
          <OsIcon name={device.device_name} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-[14px] leading-tight font-semibold">
            <span className="min-w-0 break-words">{device.device_name}</span>
            {device.is_current ? <span className="self-chip">Thiết bị này</span> : null}
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--ink-soft)]">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span
                aria-hidden
                className="size-1.5 rounded-full"
                style={{ backgroundColor: state.color }}
              />
              {state.label}
            </span>
            <span title={when(device.last_seen_at)} suppressHydrationWarning>
              Hoạt động {ago(device.last_seen_at).toLowerCase()}
            </span>
          </p>
        </div>
      </div>
      {manage ? <DeviceActions device={device} small /> : null}
    </li>
  );
}
