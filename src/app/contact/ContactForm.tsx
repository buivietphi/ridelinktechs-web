'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { company } from '@/content/company';

type Field = 'name' | 'email' | 'message';
type Status = 'idle' | 'submitting' | 'error';

const FIELDS: Field[] = ['name', 'email', 'message'];

export function ContactForm() {
  const t = useTranslations('contact');
  const formId = useId();
  const [status, setStatus] = useState<Status>('idle');
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [form, setForm] = useState<Record<Field, string>>({
    name: '',
    email: '',
    message: '',
  });

  const onChange = (k: Field, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const missing = FIELDS.filter((f) => form[f].trim() === '');
    if (missing.length > 0) {
      setTouched(Object.fromEntries(FIELDS.map((f) => [f, true])));
      setStatus('error');
      document.getElementById(`${formId}-${missing[0]}`)?.focus();
      return;
    }

    setStatus('submitting');
    const subject = encodeURIComponent(`[RideLink Techs] ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n—\nFrom: ${form.name} <${form.email}>`);
    window.location.href = `mailto:${company.email}?subject=${subject}&body=${body}`;
  };

  const invalid = (k: Field) => Boolean(touched[k]) && form[k].trim() === '';
  const hasErrors = FIELDS.some(invalid);

  return (
    <form onSubmit={onSubmit} noValidate aria-describedby={`${formId}-note`}>
      <div className="flex flex-col gap-6">
        <div>
          <label htmlFor={`${formId}-name`} className="label">
            {t('form.name')}
          </label>
          <input
            id={`${formId}-name`}
            name="name"
            type="text"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => onChange('name', e.target.value)}
            onBlur={() => setTouched((s) => ({ ...s, name: true }))}
            aria-invalid={invalid('name') || undefined}
            aria-describedby={invalid('name') ? `${formId}-name-err` : undefined}
            className="field"
          />
          {invalid('name') ? (
            <p id={`${formId}-name-err`} className="mt-2 text-[12px] text-[var(--warn)]">
              {t('form.errRequired')}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={`${formId}-email`} className="label">
            {t('form.email')}
          </label>
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => onChange('email', e.target.value)}
            onBlur={() => setTouched((s) => ({ ...s, email: true }))}
            aria-invalid={invalid('email') || undefined}
            aria-describedby={invalid('email') ? `${formId}-email-err` : undefined}
            className="field"
          />
          {invalid('email') ? (
            <p id={`${formId}-email-err`} className="mt-2 text-[12px] text-[var(--warn)]">
              {t('form.errRequired')}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={`${formId}-message`} className="label">
            {t('form.message')}
          </label>
          <textarea
            id={`${formId}-message`}
            name="message"
            required
            rows={5}
            value={form.message}
            onChange={(e) => onChange('message', e.target.value)}
            onBlur={() => setTouched((s) => ({ ...s, message: true }))}
            aria-invalid={invalid('message') || undefined}
            aria-describedby={invalid('message') ? `${formId}-message-err` : undefined}
            className="field min-h-[132px] resize-y"
          />
          {invalid('message') ? (
            <p id={`${formId}-message-err`} className="mt-2 text-[12px] text-[var(--warn)]">
              {t('form.errRequired')}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={status === 'submitting'}
          data-state={status}
          aria-live="polite"
        >
          {status === 'submitting' ? t('form.sending') : t('form.cta')}
        </button>

        <p
          id={`${formId}-note`}
          className="max-w-[36ch] text-[12px] leading-[1.55] text-[var(--ink-faint)]"
        >
          {t('formNote')}
        </p>
      </div>

      {}
      {status === 'error' && hasErrors ? (
        <p role="alert" className="mt-5 text-[13px] text-[var(--warn)]">
          {t('form.errSummary')}
        </p>
      ) : null}
    </form>
  );
}
