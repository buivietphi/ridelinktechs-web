'use client';

import { Key } from 'phosphor-react';
import { useState, useTransition } from 'react';
import { Field, FormError } from '@/components/admin/forms';
import { changePassword } from '../actions';

export function PasswordForm({ temporary }: { temporary: boolean }) {
  const [values, setValues] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (key: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: event.target.value }));

  return (
    <section data-enter className="panel mx-auto w-full max-w-[520px] px-6 py-8 sm:px-9 sm:py-10">
      <span className="grid size-12 place-items-center rounded-full bg-[var(--admin-lane)] shadow-[var(--shadow-1)]">
        <Key size={22} weight="duotone" aria-hidden />
      </span>
      <h1 className="display-lg mt-5">Đổi mật khẩu</h1>
      <p className="mt-2 text-[15px] leading-[1.6] text-[var(--ink-soft)]">
        {temporary
          ? 'Tài khoản đang dùng mật khẩu tạm. Đặt mật khẩu của riêng bạn để tiếp tục.'
          : 'Đổi xong, các thiết bị khác đang đăng nhập tài khoản này sẽ được đưa về trang đăng nhập.'}
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          start(async () => {
            const result = await changePassword(values);
            if (!result.ok) setError(result.message);
          });
        }}
        className="mt-7 flex flex-col gap-5"
      >
        <Field id="pw-current" label="Mật khẩu hiện tại">
          <input
            id="pw-current"
            type="password"
            autoComplete="current-password"
            required
            value={values.current}
            onChange={set('current')}
            className="field"
          />
        </Field>
        <Field id="pw-next" label="Mật khẩu mới" hint="10 đến 72 ký tự.">
          <input
            id="pw-next"
            type="password"
            autoComplete="new-password"
            minLength={10}
            maxLength={72}
            required
            aria-describedby="pw-next-hint"
            value={values.next}
            onChange={set('next')}
            className="field"
          />
        </Field>
        <Field id="pw-confirm" label="Nhập lại mật khẩu mới">
          <input
            id="pw-confirm"
            type="password"
            autoComplete="new-password"
            minLength={10}
            maxLength={72}
            required
            value={values.confirm}
            onChange={set('confirm')}
            className="field"
          />
        </Field>
        <FormError message={error} />
        <button type="submit" disabled={pending} className="btn btn-primary self-start">
          {pending ? 'Đang lưu…' : 'Lưu mật khẩu'}
        </button>
      </form>
    </section>
  );
}
