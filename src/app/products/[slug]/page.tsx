import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { findProduct, products } from '@/content/products';
import { imageRatio, isPortrait } from '@/content/image-ratio';
import type { Locale } from '@/i18n/config';
import { PageIntro } from '@/components/motion/PageIntro';
import { Reveal } from '@/components/motion/Reveal';
import { Parallax } from '@/components/motion/Parallax';
import { ScreenGallery } from '@/components/ui/ScreenGallery';
import { Magnetic } from '@/components/motion/Magnetic';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();

  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('productDetail');
  const tStatus = await getTranslations('status');
  const tCaption = await getTranslations('product.caption');

  const isOutsource = product.category === 'outsource';
  const displayName = product.name[locale];
  const statusLabel = tStatus(product.status);

  const mark = {
    'data-state': product.status === 'upcoming' ? ('upcoming' as const) : undefined,
    style: {
      backgroundColor:
        product.status === 'shipped'
          ? 'var(--signal)'
          : product.status === 'upcoming'
            ? 'var(--quiet)'
            : 'transparent',
      border:
        product.status === 'in-development'
          ? '1.5px solid var(--signal)'
          : product.status === 'shipped' || product.status === 'upcoming'
            ? 'none'
            : '1.5px solid var(--quiet)',
    },
  } as const;

  return (
    <>
      <section>
        <div className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 lg:px-10">
          <Link href="/products" className="link text-[14px]">
            {t('allProductsCta')}
          </Link>
        </div>
      </section>

      <section>
        <PageIntro>
          <div className="mx-auto w-full max-w-[1440px] px-5 pb-12 sm:px-8 lg:px-10 lg:pb-16">
            <div className="flex flex-wrap items-end justify-between gap-4 pb-6" data-intro-meta>
              <div>
                <p className="font-mono text-[11px] tracking-[0.1em] text-[var(--ink-faint)] uppercase">
                  {isOutsource ? t('categoryOutsource') : t('categoryInHouse')}
                </p>
                <h1 className="display-xl mt-3">
                  <span className="block overflow-hidden pb-[0.08em]">
                    <span className="block" data-intro-line>
                      {displayName}
                    </span>
                  </span>
                </h1>
              </div>
              <span className="flex items-center gap-2.5 pb-2" data-intro-action>
                <span aria-hidden className="status-dot" {...mark} />
                <span className="text-[12px] leading-none text-[var(--ink-soft)]">
                  {statusLabel}
                </span>
              </span>
            </div>
            {product.image && isPortrait(product.image) ? (
              <div className="flex justify-center">
                <div
                  className="relative h-[min(500px,58vh)] overflow-hidden rounded-[2.2rem] bg-[var(--ground-sink)] p-2 shadow-[var(--shadow-device)] ring-1 ring-white/10 lg:h-[min(580px,64vh)]"
                  style={{ aspectRatio: imageRatio(product.image) }}
                >
                  <div className="absolute inset-2 overflow-hidden rounded-[1.7rem] bg-black">
                    <Image
                      src={product.image}
                      alt={`${product.name[locale]} — ảnh minh hoạ`}
                      fill
                      priority
                      sizes="(min-width: 1024px) 270px, 58vh"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="photo aspect-[16/9] w-full lg:aspect-[21/9]">
                <Parallax className="absolute inset-0" distance={40}>
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={`${product.name[locale]} — ảnh minh hoạ`}
                      fill
                      priority
                      sizes="100vw"
                      className="object-cover"
                    />
                  ) : null}
                </Parallax>
              </div>
            )}
          </div>
        </PageIntro>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <Reveal className="grid grid-cols-12 gap-x-0 gap-y-14 lg:gap-x-8">
          <div className="col-span-12 lg:col-span-7">
            <Reveal>
              <p className="text-[21px] leading-[1.5] text-[var(--ink)]">
                {product.tagline[locale]}
              </p>
            </Reveal>

            {product.problem ? (
              <div className="mt-12">
                <h2 className="display-md text-[var(--ink-faint)]">{t('problem')}</h2>
                <p className="mt-3 max-w-[60ch] text-[16px] leading-[1.7] text-[var(--ink-soft)]">
                  {product.problem[locale]}
                </p>
              </div>
            ) : null}

            {product.targetUser ? (
              <div className="mt-10">
                <h2 className="display-md text-[var(--ink-faint)]">{t('targetUser')}</h2>
                <p className="mt-3 max-w-[60ch] text-[16px] leading-[1.7] text-[var(--ink-soft)]">
                  {product.targetUser[locale]}
                </p>
              </div>
            ) : null}

            <div className="mt-10">
              <h2 className="display-md text-[var(--ink-faint)]">{t('description')}</h2>
              <p className="mt-3 max-w-[60ch] text-[16px] leading-[1.7] text-[var(--ink-soft)]">
                {product.description[locale]}
              </p>
            </div>

            {product.imageCredit ? (
              <p className="mt-12 max-w-[62ch] border-t border-[var(--rule-2)] pt-4 text-[12px] leading-[1.6] text-[var(--ink-faint)]">
                {tCaption(product.slug)}
              </p>
            ) : null}
          </div>

          <div className="col-span-12 lg:col-span-7">
            <p className="eyebrow mt-14">{t('features')}</p>
            <ul className="mt-6 flex flex-col">
              {product.features[locale].map((f) => (
                <li
                  key={f}
                  className="flex items-baseline gap-4 border-t border-[var(--rule)] py-4 text-[16px] leading-[1.55] text-[var(--ink)]"
                >
                  <span aria-hidden className="h-px w-5 shrink-0 bg-[var(--signal)]" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <aside className="col-span-12 lg:col-span-4 lg:col-start-9">
            <dl className="flex flex-col">
              <div className="border-t border-[var(--rule)] py-5">
                <dt className="font-mono text-[11px] tracking-[0.12em] text-[var(--ink-faint)] uppercase">
                  {t('status')}
                </dt>
                <dd className="mt-2.5 flex items-center gap-2.5 text-[15px] text-[var(--ink)]">
                  <span aria-hidden className="status-dot" {...mark} />
                  {statusLabel}
                </dd>
              </div>

              <div className="border-t border-[var(--rule)] py-5">
                <dt className="font-mono text-[11px] tracking-[0.12em] text-[var(--ink-faint)] uppercase">
                  {t('category')}
                </dt>
                <dd className="mt-2.5 text-[15px] text-[var(--ink)]">
                  {isOutsource ? t('categoryOutsource') : t('categoryInHouse')}
                </dd>
              </div>

              <div className="border-t border-[var(--rule)] py-5">
                <dt className="font-mono text-[11px] tracking-[0.12em] text-[var(--ink-faint)] uppercase">
                  {t('timeline')}
                </dt>
                <dd className="mt-2.5 flex flex-col gap-2.5">
                  {product.timeline.length > 0 ? (
                    product.timeline.map((m) => (
                      <span
                        key={m.date}
                        className="flex items-baseline justify-between gap-4 text-[15px] text-[var(--ink-soft)]"
                      >
                        <span>{m.label[locale]}</span>
                        <span className="font-mono text-[12px] text-[var(--ink-faint)]">
                          {m.date}
                        </span>
                      </span>
                    ))
                  ) : (
                    <span className="text-[15px] text-[var(--ink-soft)]">{t('timelineEmpty')}</span>
                  )}
                </dd>
              </div>

              <div className="border-y border-[var(--rule)] py-5">
                <dt className="font-mono text-[11px] tracking-[0.12em] text-[var(--ink-faint)] uppercase">
                  {t('open')}
                </dt>
                <dd className="mt-3 flex flex-col gap-2">
                  {product.demoUrl ? (
                    <a
                      href={product.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary w-full"
                    >
                      {t('demo')}
                    </a>
                  ) : null}
                  <Magnetic>
                    <Link href="/contact" className="btn w-full">
                      {t('openBrief')}
                    </Link>
                  </Magnetic>
                </dd>
              </div>
            </dl>
          </aside>
        </Reveal>
      </section>

      {product.screens && product.screens.length > 0 ? (
        <section className="mx-auto w-full max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
          <p className="eyebrow">{t('screens')}</p>
          <ScreenGallery screens={product.screens} name={product.name[locale]} />
        </section>
      ) : null}

      <section className="border-t border-[var(--rule)] bg-[var(--ground-raise)]">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-5 py-8 sm:px-8 lg:px-10">
          <Link href="/products" className="link text-[15px]">
            {t('allProductsCta')}
          </Link>
          <span className="font-mono text-[12px] text-[var(--ink-faint)]">
            {String(products.indexOf(product) + 1).padStart(2, '0')} /{' '}
            {String(products.length).padStart(2, '0')}
          </span>
        </div>
      </section>
    </>
  );
}
