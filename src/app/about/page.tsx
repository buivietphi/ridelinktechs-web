import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { about } from '@/content/about';
import type { Locale } from '@/i18n/config';
import { PageIntro } from '@/components/motion/PageIntro';
import { Reveal, RevealGroup } from '@/components/motion/Reveal';
import { Magnetic } from '@/components/motion/Magnetic';

export default async function AboutPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('about');

  const paragraphs = about.story[locale].split('\n\n');

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
                  {about.heroTitle[locale]}
                </span>
              </span>
            </h1>
            <p
              className="mt-8 max-w-[54ch] text-[18px] leading-[1.62] text-[var(--ink-soft)]"
              data-intro-meta
            >
              {about.heroSubtitle[locale]}
            </p>
          </PageIntro>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <Reveal className="grid grid-cols-12 gap-x-0 gap-y-10 lg:gap-x-8">
          <h2 className="display-lg col-span-12 text-[var(--ink-faint)] lg:col-span-3">
            {t('storyHeading')}
          </h2>
          <div className="col-span-12 lg:col-span-8 lg:col-start-5">
            {paragraphs.map((para, i) => (
              <p
                key={i}
                className={`max-w-[64ch] text-[16px] leading-[1.75] text-[var(--ink-soft)] ${
                  i > 0 ? 'mt-6' : ''
                }`}
              >
                {para}
              </p>
            ))}
            <p className="mt-10 max-w-[60ch] border-l-2 border-[var(--signal)] pl-6 text-[19px] leading-[1.6] text-[var(--ink)]">
              {about.mission[locale]}
            </p>
          </div>
        </Reveal>
      </section>

      <section className="border-y border-[var(--rule)] bg-[var(--ground-raise)]">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <Reveal className="grid grid-cols-12 items-end gap-x-0 gap-y-6 lg:gap-x-8">
            <h2 className="display-xl col-span-12 max-w-[20ch] lg:col-span-7">
              {t('principlesHeading')}
            </h2>
            <p className="col-span-12 max-w-[42ch] text-[16px] leading-[1.6] text-[var(--ink-soft)] lg:col-span-4 lg:col-start-9">
              {t('principlesLede')}
            </p>
          </Reveal>

          <RevealGroup
            className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2"
            stagger={0.07}
          >
            {about.focusAreas.map((f) => (
              <div
                key={f.title.en}
                data-reveal-item
                className="card p-6 transition-[transform,box-shadow] duration-[560ms] ease-[var(--ease-out-quint)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
              >
                <h3 className="display-lg max-w-[22ch]">{f.title[locale]}</h3>
                <p className="mt-4 max-w-[46ch] text-[15px] leading-[1.7] text-[var(--ink-soft)]">
                  {f.description[locale]}
                </p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <Reveal className="grid grid-cols-12 items-end gap-x-0 gap-y-6 lg:gap-x-8">
          <h2 className="display-xl col-span-12 max-w-[16ch] lg:col-span-5">{t('stackHeading')}</h2>
          <p className="col-span-12 max-w-[44ch] text-[16px] leading-[1.6] text-[var(--ink-soft)] lg:col-span-5 lg:col-start-8">
            {t('stackLede')}
          </p>
        </Reveal>

        <dl className="mt-12 flex flex-col">
          {about.stack.map((row) => (
            <div
              key={row.label.en}
              className="grid grid-cols-12 items-baseline gap-x-0 border-t border-[var(--rule)] py-5 last:border-b lg:gap-x-8"
            >
              <dt className="col-span-12 sm:col-span-3">
                <span className="font-mono text-[12px] text-[var(--ink-faint)]">
                  {row.label[locale]}
                </span>
              </dt>
              <dd className="col-span-12 sm:col-span-9">
                <span className="text-[15px] leading-[1.5] text-[var(--ink)]">
                  {row.note[locale]}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-t border-[var(--rule)] bg-[var(--ground-raise)]">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <Reveal className="grid grid-cols-12 items-end gap-x-0 gap-y-8 lg:gap-x-8">
            <p className="col-span-12 max-w-[52ch] text-[17px] leading-[1.65] text-[var(--ink-soft)] lg:col-span-7">
              {t('closingLede')}
            </p>
            <div className="col-span-12 lg:col-span-3 lg:col-start-10 lg:text-right">
              <Magnetic>
                <Link href="/contact" className="btn btn-primary">
                  {t('cta')}
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
