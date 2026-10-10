'use client';

import { Check, CheckCircle, Copy, Sparkle } from 'phosphor-react';
import { useEffect, useRef, useState } from 'react';
import { randomPassword } from '@/lib/admin/password';
import { ROLE_HINT, ROLE_LABEL, ROLES, type Role } from '@/lib/admin/roles';
import { cn } from '@/lib/cn';

export function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-[var(--ink-faint)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Actions({ children }: { children: React.ReactNode }) {
  return <div className="mt-2 flex flex-wrap justify-end gap-2">{children}</div>;
}

export function FormError({ message }: { message: string | null }) {
  return message ? (
    <p role="alert" className="text-[14px] leading-[1.5] text-[var(--warn)]">
      {message}
    </p>
  ) : null;
}

export function RolePicker({
  name,
  value,
  onChange,
  roles = ROLES,
  note,
}: {
  name: string;
  value: Role;
  onChange: (role: Role) => void;
  roles?: Role[];
  note?: string;
}) {
  return (
    <fieldset>
      <legend className="label">Quyền</legend>
      <div className={cn('grid gap-2', roles.length > 1 && 'sm:grid-cols-3')}>
        {roles.map((role) => (
          <label key={role} className={cn('choice-card', value === role && 'is-checked')}>
            <input
              type="radio"
              name={name}
              value={role}
              checked={value === role}
              onChange={() => onChange(role)}
              className="sr-only"
            />
            <span className="block text-[14px] font-semibold">{ROLE_LABEL[role]}</span>
            <span className="mt-1 block text-[12px] leading-[1.45] text-[var(--ink-faint)]">
              {ROLE_HINT[role]}
            </span>
          </label>
        ))}
      </div>
      {note ? <p className="mt-1.5 text-[13px] text-[var(--ink-faint)]">{note}</p> : null}
    </fieldset>
  );
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field id={id} label={label} hint="10 đến 72 ký tự.">
      <div className="flex gap-2">
        <input
          id={id}
          required
          minLength={10}
          maxLength={72}
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={`${id}-hint`}
          className="field font-mono"
        />
        <button
          type="button"
          onClick={() => onChange(randomPassword())}
          className="btn shrink-0 px-4 text-[13px]"
        >
          <Sparkle size={16} aria-hidden />
          Tạo mới
        </button>
      </div>
    </Field>
  );
}

export function Credentials({
  title,
  email,
  password,
  note,
  onDone,
}: {
  title: string;
  email: string;
  password: string;
  note: string;
  onDone: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const done = useRef<HTMLButtonElement>(null);

  useEffect(() => done.current?.focus(), []);

  return (
    <div className="flex flex-col gap-5">
      <p className="flex items-center gap-2 text-[15px] font-semibold">
        <CheckCircle size={20} weight="fill" aria-hidden className="text-[var(--ok)]" />
        {title}
      </p>
      <dl className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--rule)] bg-[var(--admin-lane)] p-4 text-[14px]">
        <div>
          <dt className="data-label">Email</dt>
          <dd className="mt-1 break-all">{email}</dd>
        </div>
        <div>
          <dt className="data-label">Mật khẩu tạm</dt>
          <dd className="mt-1 font-mono text-[15px] break-all">{password}</dd>
        </div>
      </dl>
      <p className="text-[14px] leading-[1.55] text-[var(--ink-soft)]">{note}</p>
      <Actions>
        <button
          type="button"
          onClick={() =>
            navigator.clipboard
              .writeText(`Email: ${email}\nMật khẩu tạm: ${password}`)
              .then(() => setCopied(true))
              .catch(() => setCopied(false))
          }
          className="btn"
        >
          {copied ? <Check size={16} weight="bold" aria-hidden /> : <Copy size={16} aria-hidden />}
          {copied ? 'Đã chép' : 'Sao chép'}
        </button>
        <button ref={done} type="button" onClick={onDone} className="btn btn-primary">
          Xong
        </button>
      </Actions>
    </div>
  );
}
