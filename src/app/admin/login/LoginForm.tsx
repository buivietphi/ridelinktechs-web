'use client';

import { Info } from 'phosphor-react';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { login, type LoginCode, type LoginState } from './actions';

const MESSAGE: Record<LoginCode, string> = {
  invalid: 'Email hoặc mật khẩu không đúng.',
  rate: 'Đăng nhập sai quá nhiều lần, tài khoản tạm khoá.',
  account_blocked: 'Tài khoản này đang bị khoá. Liên hệ admin để mở lại.',
  device_blocked:
    'Thiết bị này đang bị khoá. Mở khoá trong Tài khoản của tôi ở thiết bị khác, hoặc nhờ admin.',
  device: 'Không nhận diện được thiết bị. Tắt trình chặn script cho trang này rồi tải lại.',
  unavailable: 'Chưa đăng nhập được. Thử lại sau ít phút.',
};

const untilLabel = (iso: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(iso));

export function LoginForm({ notice }: { notice: string | null }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { code: null });
  const [device, setDevice] = useState('');
  const [deviceFailed, setDeviceFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    import('@thumbmarkjs/thumbmarkjs')
      .then(({ Thumbmark }) => new Thumbmark({ logging: false }).get())
      .then((result) => {
        if (alive) setDevice(result.thumbmark);
      })
      .catch(() => {
        if (alive) setDeviceFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const code = deviceFailed ? 'device' : state.code;
  const error = code
    ? code === 'rate' && state.until
      ? `${MESSAGE.rate} Thử lại sau ${untilLabel(state.until)}.`
      : MESSAGE[code]
    : null;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => action(data));
      }}
      className="mt-8 flex flex-col gap-5"
      aria-describedby="login-status"
    >
      {notice && !code ? (
        <div
          data-rise
          role="status"
          className="-mt-2 flex gap-3 rounded-[var(--radius-lg)] border border-[var(--rule)] bg-[var(--admin-card)] px-4 py-3.5 text-[14px] leading-[1.55] shadow-[var(--shadow-1)]"
        >
          <Info
            size={20}
            weight="fill"
            aria-hidden
            className="mt-px shrink-0 text-[var(--signal)]"
          />
          {notice}
        </div>
      ) : null}
      <div data-rise>
        <label htmlFor="login-email" className="label">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="field"
          aria-invalid={code === 'invalid' || undefined}
        />
      </div>
      <div data-rise>
        <label htmlFor="login-password" className="label">
          Mật khẩu
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field"
          aria-invalid={code === 'invalid' || undefined}
        />
      </div>
      <input type="hidden" name="device" value={device} />

      <div id="login-status" role="status" aria-live="polite" className="min-h-[1.4em]">
        {error ? (
          <p className="text-[14px] leading-[1.5] text-[var(--warn)]">{error}</p>
        ) : !device ? (
          <p className="text-[13px] text-[var(--ink-faint)]">Đang nhận diện thiết bị…</p>
        ) : null}
      </div>

      <button
        data-rise
        type="submit"
        className="btn btn-primary min-h-12 w-full"
        disabled={pending || !device || deviceFailed}
      >
        {pending ? 'Đang đăng nhập…' : 'Đăng nhập'}
      </button>
    </form>
  );
}
