import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SiteShell } from '@/components/layout/SiteShell';
import { Reveal } from '@/components/motion/Reveal';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('common');
  return { title: t('notFound') };
}

export default async function NotFound() {
  const t = await getTranslations('common');

  return (
    <SiteShell>
      <Reveal className="mx-auto flex min-h-[74dvh] w-full max-w-[1440px] flex-col justify-center px-5 py-20 sm:px-8 lg:px-10">
        <p aria-hidden className="display-hero text-[var(--signal)]">
          404
        </p>
        <h1 className="display-xl mt-8 max-w-[18ch]">{t('notFound')}</h1>
        <p className="mt-6 max-w-[50ch] text-[17px] leading-[1.6] text-[var(--ink-soft)]">
          {t('notFoundHint')}
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link href="/" className="btn btn-primary">
            {t('notFoundReturn')}
          </Link>
          <Link href="/contact" className="btn">
            {t('notFoundBriefs')}
          </Link>
        </div>
      </Reveal>
    </SiteShell>
  );
}
