import { getLocale, getTranslations } from 'next-intl/server';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/Accordion';
import { company } from '@/content/company';
import type { Locale } from '@/i18n/config';
import { ContactForm } from './ContactForm';
import { PageIntro } from '@/components/motion/PageIntro';
import { Reveal } from '@/components/motion/Reveal';

export default async function ContactPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('contact');
  const faqItems = t.raw('faq.items') as Array<{ q: string; a: string }>;

  // Read here, on the server, and hand it down as a prop rather than letting
  // next/script inline a NEXT_PUBLIC_ value at build time. That keeps the
  // sitekey on the same footing as every other secret in the app: whatever the
  // container was started with, no rebuild and no build argument required.
  const siteKey = process.env.TURNSTILE_SITE_KEY ?? '';

  // The env split follows NODE_ENV, not the hostname: `next dev` reads
  // .env.development and `next start`/the image reads .env.production. That is
  // right, but it also means running `npm run dev` on the server over the real
  // domain serves Cloudflare's always-pass key to real visitors — the captcha
  // looks alive and gates nothing. The `1x` prefix is Cloudflare's documented
  // shape for a dummy key, so this is a prefix test, not a guess.
  if (siteKey.startsWith('1x')) {
    console.error(
      '[contact] Turnstile is running on a TESTING keypair — the bot gate is OFF. This is fine under `npm run dev`. If this is a public deploy, the server is running the development env.'
    );
  }

  const details = [
    { label: t('channels.email'), value: company.email, href: `mailto:${company.email}` },
    { label: t('channels.location'), value: company.address[locale] },
    { label: t('channels.hours'), value: t('values.hours') },
    { label: t('channels.response'), value: t('values.response') },
  ];

  return (
    <>
      <section>
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <PageIntro>
            <p
              className="font-mono text-[12px] tracking-[0.04em] text-[var(--ink-faint)]"
              data-intro-meta
            >
              {t('dateline')}
            </p>
            <h1 className="display-hero mt-6 max-w-[15ch]">
              <span className="block overflow-hidden pb-[0.08em]">
                <span className="block" data-intro-line>
                  {t('title')}
                </span>
              </span>
            </h1>
            <p
              className="mt-8 max-w-[52ch] text-[17px] leading-[1.62] text-[var(--ink-soft)]"
              data-intro-meta
            >
              {t('subtitle')}
            </p>
          </PageIntro>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <Reveal className="grid grid-cols-12 gap-x-0 gap-y-16 lg:gap-x-8">
          <div className="col-span-12 lg:col-span-4">
            <dl className="flex flex-col">
              {details.map((d) => (
                <div key={d.label} className="border-t border-[var(--rule)] py-5 last:border-b">
                  <dt className="font-mono text-[11px] tracking-[0.12em] text-[var(--ink-faint)] uppercase">
                    {d.label}
                  </dt>
                  <dd className="mt-2.5 text-[15px] leading-[1.5] text-[var(--ink)]">
                    {d.href ? (
                      <a href={d.href} className="link">
                        {d.value}
                      </a>
                    ) : (
                      d.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <ContactForm siteKey={siteKey} />
          </div>
        </Reveal>
      </section>

      <section className="border-t border-[var(--rule)] bg-[var(--ground-raise)]">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <Reveal className="grid grid-cols-12 items-start gap-x-0 gap-y-10 lg:gap-x-8">
            <div className="col-span-12 lg:col-span-4">
              <p className="font-mono text-[12px] tracking-[0.04em] text-[var(--ink-faint)]">
                {t('faq.kicker')}
              </p>
              <h2 className="display-xl mt-5 max-w-[14ch]">{t('faq.title')}</h2>
            </div>

            <div className="col-span-12 lg:col-span-7 lg:col-start-6">
              <Accordion type="single" collapsible defaultValue="item-0">
                {faqItems.map((item, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger>{item.q}</AccordionTrigger>
                    <AccordionContent>{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
