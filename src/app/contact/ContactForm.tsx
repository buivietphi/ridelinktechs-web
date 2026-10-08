'use client';
import Script from 'next/script';
import { useActionState, useCallback, useEffect, useId, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { company } from '@/content/company';
import { submitContact, type ContactState } from './actions';
type Field = 'name' | 'email' | 'message';
type Captcha = 'loading' | 'ready' | 'failed';
const FIELDS: Field[] = ['name', 'email', 'message'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const INITIAL: ContactState = { ok: false, code: null, field: null };
type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string | undefined;
  remove: (id: string) => void;
};
function api(): TurnstileApi | undefined {
  return (window as unknown as { turnstile?: TurnstileApi }).turnstile;
}
export function ContactForm({ siteKey }: { siteKey: string }) {
  const t = useTranslations('contact');
  const locale = useLocale();
  const formId = useId();
  const theme = useTheme().resolvedTheme === 'light' ? 'light' : 'dark';
  const [state, formAction, isPending] = useActionState(submitContact, INITIAL);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<ContactState | null>(null);
  const [clientError, setClientError] = useState(false);
  const [captcha, setCaptcha] = useState<Captcha>('loading');
  const [ready, setReady] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [form, setForm] = useState<Record<Field, string>>({
    name: '',
    email: '',
    message: '',
  });
  const hostRef = useRef<HTMLDivElement | null>(null);
  const widgetRef = useRef<string | undefined>(undefined);
  const sentRef = useRef<HTMLDivElement | null>(null);
  const handledRef = useRef(state);
  const onChange = (k: Field, v: string) => setForm((s) => ({ ...s, [k]: v }));
  const markTouched = (k: Field) => setTouched((s) => ({ ...s, [k]: true }));
  const renderWidget = useCallback(() => {
    const ts = api();
    const host = hostRef.current;
    if (!ts || !host || !siteKey) return;
    if (widgetRef.current !== undefined) ts.remove(widgetRef.current);
    widgetRef.current = ts.render(host, {
      sitekey: siteKey,
      action: 'contact',
      theme,
      size: 'flexible',
      language: locale,
      'error-callback': () => setCaptcha('failed'),
    });
    setCaptcha('ready');
  }, [theme, locale, siteKey]);
  useEffect(() => {
    if (api()) {
      setReady(true);
      return;
    }
    const el = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SRC}"]`);
    if (!el) return;
    const onLoad = () => setReady(true);
    el.addEventListener('load', onLoad);
    return () => el.removeEventListener('load', onLoad);
  }, []);
  useEffect(() => {
    if (!ready) return;
    renderWidget();
    return () => {
      const ts = api();
      if (widgetRef.current !== undefined) {
        ts?.remove(widgetRef.current);
        widgetRef.current = undefined;
      }
    };
  }, [renderWidget, ready, sent]);
  useEffect(() => {
    if (!siteKey) setCaptcha('failed');
  }, [siteKey]);
  useEffect(() => {
    if (isPending || handledRef.current === state) return;
    handledRef.current = state;
    if (state.ok || state.code === 'captcha' || state.code === 'unavailable') renderWidget();
    setSent(state.ok);
    setServerError(state.ok ? null : state);
    if (state.ok) sentRef.current?.focus();
    else if (state.field) document.getElementById(`${formId}-${state.field}`)?.focus();
  }, [state, isPending, renderWidget, formId]);
  const fieldError = (k: Field): 'required' | 'email' | null => {
    if (!touched[k]) return null;
    const v = form[k].trim();
    if (v === '') return 'required';
    if (k === 'email' && !EMAIL_RE.test(v)) return 'email';
    return null;
  };
  const invalid = (k: Field) => fieldError(k) !== null;
  const hasErrors = FIELDS.some(invalid);
  const errorText = (k: Field) =>
    fieldError(k) === 'email' ? t('form.errEmail') : t('form.errRequired');
  const guard = (e: React.FormEvent<HTMLFormElement>) => {
    const missing = FIELDS.filter((f) => form[f].trim() === '');
    const badEmail = form.email.trim() !== '' && !EMAIL_RE.test(form.email.trim());
    const tooShort = form.message.trim() !== '' && form.message.trim().length < 10;
    if (missing.length === 0 && !badEmail && !tooShort) return;
    e.preventDefault();
    setTouched(Object.fromEntries(FIELDS.map((f) => [f, true])));
    setClientError(true);
    const focusField: Field | null =
      missing[0] ?? (badEmail ? 'email' : tooShort ? 'message' : null);
    if (focusField) document.getElementById(`${formId}-${focusField}`)?.focus();
  };
  const onSendAnother = () => {
    setSent(false);
    setServerError(null);
    setClientError(false);
    setTouched({});
    setForm({ name: '', email: '', message: '' });
  };
  const phoneRejected = serverError?.code === 'invalid' && serverError.field === 'phone';
  const serverErrorText =
    serverError?.code === 'captcha'
      ? t('form.errCaptcha')
      : serverError?.code === 'invalid'
        ? phoneRejected
          ? t('form.errPhone')
          : t('form.errInvalid')
        : serverError?.code === 'rate'
          ? t('form.errRate')
          : t('form.errUnavailable');
  return (
    <>
      <Script
        src={TURNSTILE_SRC}
        strategy="afterInteractive"
        onReady={() => setReady(true)}
        onError={() => setCaptcha('failed')}
      />
      <form action={formAction} onSubmit={guard} noValidate aria-describedby={`${formId}-note`}>
        {/* Always mounted and empty at rest: a live region inserted already
            carrying text is announced unreliably. */}
        <div role="status" aria-live="polite" aria-atomic="true">
          {sent ? (
            <div
              ref={sentRef}
              tabIndex={-1}
              className="rounded-[var(--radius-field)] border border-[var(--rule)] bg-[var(--ground-sink)] p-5"
            >
              <p className="text-[15px] leading-[1.5] font-semibold text-[var(--ink)]">
                {t('form.sent')}
              </p>
            </div>
          ) : null}
        </div>
        {!sent ? (
          <>
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
                  maxLength={120}
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => onChange('name', e.target.value)}
                  onBlur={() => markTouched('name')}
                  aria-invalid={invalid('name') || undefined}
                  aria-describedby={invalid('name') ? `${formId}-name-err` : undefined}
                  className="field"
                />
                {invalid('name') ? (
                  <p id={`${formId}-name-err`} className="mt-2 text-[12px] text-[var(--warn)]">
                    {errorText('name')}
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
                  maxLength={254}
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => onChange('email', e.target.value)}
                  onBlur={() => markTouched('email')}
                  aria-invalid={invalid('email') || undefined}
                  aria-describedby={invalid('email') ? `${formId}-email-err` : undefined}
                  className="field"
                />
                {invalid('email') ? (
                  <p id={`${formId}-email-err`} className="mt-2 text-[12px] text-[var(--warn)]">
                    {errorText('email')}
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
                  minLength={10}
                  maxLength={4000}
                  value={form.message}
                  onChange={(e) => onChange('message', e.target.value)}
                  onBlur={() => markTouched('message')}
                  aria-invalid={invalid('message') || undefined}
                  aria-describedby={invalid('message') ? `${formId}-message-err` : undefined}
                  className="field min-h-[132px] resize-y"
                />
                {invalid('message') ? (
                  <p id={`${formId}-message-err`} className="mt-2 text-[12px] text-[var(--warn)]">
                    {errorText('message')}
                  </p>
                ) : null}
              </div>
            </div>
            {/* Optional. Uncontrolled, like the honeypot: adding these to FIELDS
                would make `guard` block the submit when they are empty, which is
                the opposite of the request. They still serialise into FormData
                and are validated and normalised in actions.ts. */}
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor={`${formId}-phone`} className="label">
                  {t('form.phone')}
                  <span className="ml-2 font-normal text-[var(--ink-faint)]">
                    {t('form.optional')}
                  </span>
                </label>
                <input
                  id={`${formId}-phone`}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={32}
                  defaultValue=""
                  aria-invalid={phoneRejected || undefined}
                  aria-describedby={phoneRejected ? `${formId}-phone-err` : undefined}
                  className="field"
                />
                {phoneRejected ? (
                  <p id={`${formId}-phone-err`} className="mt-2 text-[12px] text-[var(--warn)]">
                    {t('form.errPhone')}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor={`${formId}-from`} className="label">
                  {t('form.from')}
                  <span className="ml-2 font-normal text-[var(--ink-faint)]">
                    {t('form.optional')}
                  </span>
                </label>
                <input
                  id={`${formId}-from`}
                  name="from"
                  type="text"
                  maxLength={80}
                  defaultValue=""
                  className="field"
                />
              </div>
            </div>
            <div className="mt-8">
              <span className="label" id={`${formId}-captcha-label`}>
                {t('form.captchaLabel')}
              </span>
              {/* Sibling, not child: React and turnstile.render() must never
                  share one DOM node. */}
              {captcha === 'loading' ? (
                <p
                  role="status"
                  className="mb-2 text-[12px] leading-[1.55] text-[var(--ink-faint)]"
                >
                  {t('form.captchaLoading')}
                </p>
              ) : null}
              <div
                ref={hostRef}
                aria-describedby={`${formId}-captcha-label`}
                data-state={captcha}
                className="rounded-[var(--radius-field)] border border-[var(--rule)] bg-[var(--ground-sink)] px-3 py-3.5"
              />
              {captcha === 'failed' ? (
                <p role="alert" className="mt-2 text-[12px] text-[var(--warn)]">
                  {t('form.captchaBlocked')}
                </p>
              ) : null}
              {/* cf-turnstile-response is Cloudflare's own, inside the host div. */}
              <input type="hidden" name="locale" value={locale} />
              <div aria-hidden="true" className="absolute top-0 left-[-9999px]">
                <label htmlFor={`${formId}-website`}>Website</label>
                <input
                  id={`${formId}-website`}
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  defaultValue=""
                />
              </div>
              {/* Without JS the widget never renders, so the action would reject
                  an empty token and useActionState has nothing to report it with.
                  The mail link is the path that always works. */}
              <noscript>
                <p className="mt-3 text-[13px] leading-[1.6] text-[var(--ink-soft)]">
                  <a className="link" href={`mailto:${company.email}`}>
                    {company.email}
                  </a>
                </p>
              </noscript>
            </div>
          </>
        ) : null}
        {serverError ? (
          <p
            role="alert"
            data-source="server"
            className="mt-8 border-t border-[var(--rule)] pt-5 text-[13px] leading-[1.6] text-[var(--warn)]"
          >
            {serverErrorText}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {sent ? (
            <button type="button" className="btn" onClick={onSendAnother}>
              {t('form.sentAgain')}
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isPending}
              data-state={isPending ? 'submitting' : 'idle'}
              aria-live="polite"
            >
              {isPending ? t('form.sendingNow') : t('form.cta')}
            </button>
          )}
          <p
            id={`${formId}-note`}
            className="max-w-[36ch] text-[12px] leading-[1.55] text-[var(--ink-faint)]"
          >
            {t('formNoteStored')}
          </p>
        </div>
        {clientError && hasErrors ? (
          <p role="alert" data-source="client" className="mt-5 text-[13px] text-[var(--warn)]">
            {t('form.errSummary')}
          </p>
        ) : null}
      </form>
    </>
  );
}
