'use client';

import gsap from 'gsap';
import Link from 'next/link';
import { Camera, Key, Trash } from 'phosphor-react';
import { useEffect, useLayoutEffect, useRef, useState, useTransition } from 'react';
import { DeviceRow, type DeviceLite } from '@/components/admin/devices';
import { Avatar, Chip, PageHead } from '@/components/admin/ui';
import { prefersReducedMotion } from '@/lib/animations';
import { when } from '@/lib/admin/format';
import { ROLE_HINT, ROLE_LABEL, type Role } from '@/lib/admin/roles';
import { cn } from '@/lib/cn';
import { setAvatar } from './actions';

export type Profile = {
  id: string;
  email: string;
  display_name: string;
  role: Role;
  avatar: string | null;
  created_at: string;
  last_login_at: string | null;
  password_changed_at: string | null;
  devices: DeviceLite[];
};

const SMALL = 'min-h-10 px-4 text-[13px]';

async function squareImage(file: File, size: number): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvas');
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size,
  );
  bitmap.close();
  const webp = canvas.toDataURL('image/webp', 0.86);
  return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.86);
}

export function ProfileView({ profile }: { profile: Profile }) {
  const [preview, setPreview] = useState<string | null>(profile.avatar);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const file = useRef<HTMLInputElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const changed = useRef(false);

  useEffect(() => setPreview(profile.avatar), [profile.avatar]);

  useLayoutEffect(() => {
    if (!changed.current || !photo.current || prefersReducedMotion()) return;
    gsap.fromTo(
      photo.current,
      { scale: 0.86, opacity: 0.4 },
      { scale: 1, opacity: 1, duration: 0.42, ease: 'power3.out' },
    );
  }, [preview]);

  const save = (value: string | null) => {
    const previous = preview;
    changed.current = true;
    setError(null);
    setPreview(value);
    start(async () => {
      const result = await setAvatar(value);
      if (result.ok) return;
      setPreview(previous);
      setError(result.message ?? 'Chưa lưu được ảnh. Thử lại sau.');
    });
  };

  const pick = async (picked: File | undefined) => {
    setError(null);
    if (!picked) return;
    if (!/^image\/(png|jpeg|webp)$/.test(picked.type)) {
      setError('Chọn một ảnh JPG, PNG hoặc WebP.');
      return;
    }
    if (picked.size > 10 * 1024 * 1024) {
      setError('Ảnh lớn quá. Chọn ảnh dưới 10 MB.');
      return;
    }
    const data = await squareImage(picked, 192).catch(() => null);
    if (!data) {
      setError('Không đọc được ảnh này. Thử một ảnh khác.');
      return;
    }
    save(data);
  };

  const facts: [string, string][] = [
    ['Quyền', ROLE_HINT[profile.role]],
    ['Tạo lúc', when(profile.created_at)],
    ['Đăng nhập gần nhất', profile.last_login_at ? when(profile.last_login_at) : 'Chưa có'],
    [
      'Đổi mật khẩu gần nhất',
      profile.password_changed_at ? when(profile.password_changed_at) : 'Chưa đổi',
    ],
  ];

  return (
    <div className="flex flex-col gap-7">
      <PageHead
        title="Tài khoản của tôi"
        description="Thông tin của tài khoản bạn đang đăng nhập."
      />

      <div
        data-enter
        className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      >
        <section aria-labelledby="me-name" className="panel p-6 sm:p-8">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div ref={photo} className="rounded-full">
              <Avatar name={profile.display_name} role={profile.role} src={preview} size={96} />
            </div>
            <div className="min-w-0">
              <h2 id="me-name" className="display-lg break-words">
                {profile.display_name}
              </h2>
              <p className="mt-1 text-[14px] break-all text-[var(--ink-soft)]">{profile.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip>{ROLE_LABEL[profile.role]}</Chip>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <input
              ref={file}
              id="avatar-file"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(event) => {
                void pick(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
            <button
              type="button"
              disabled={pending}
              onClick={() => file.current?.click()}
              className={cn('btn', SMALL)}
            >
              <Camera size={16} aria-hidden />
              {preview ? 'Đổi ảnh đại diện' : 'Thêm ảnh đại diện'}
            </button>
            {preview ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => save(null)}
                className={cn('btn', SMALL)}
              >
                <Trash size={16} aria-hidden />
                Gỡ ảnh
              </button>
            ) : null}
            <Link href="/admin/password" className={cn('btn', SMALL)}>
              <Key size={16} aria-hidden />
              Đổi mật khẩu
            </Link>
          </div>
          <p
            role="status"
            className={cn(
              'mt-3 min-h-[1lh] text-[13px]',
              error ? 'text-[var(--warn)]' : 'text-[var(--ink-soft)]',
            )}
          >
            {error ?? (pending ? 'Đang lưu ảnh…' : '')}
          </p>

          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-[var(--rule-2)] pt-5 text-[14px]">
            {facts.map(([term, value]) => (
              <div key={term} className="min-w-0">
                <dt className="data-label">{term}</dt>
                <dd className="mt-1 break-words">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="me-devices" className="panel p-6 sm:p-8">
          <h2 id="me-devices" className="display-sm">
            Thiết bị của bạn
          </h2>
          <p className="mt-1 text-[14px] leading-[1.55] text-[var(--ink-soft)]">
            Các trình duyệt đã đăng nhập bằng tài khoản này. Đăng xuất, khoá hay xoá thiết bị bạn
            không còn dùng.
          </p>
          <ul className="mt-5 divide-y divide-[var(--rule-2)]">
            {profile.devices.map((device) => (
              <DeviceRow key={device.id} device={device} manage />
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
