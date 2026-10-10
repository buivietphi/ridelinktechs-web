import { getLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { JsonLd } from '@/components/JsonLd';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SmoothScroll } from '@/lib/animations';
import { graph, organization, website } from '@/lib/schema';

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const locale = (await getLocale()) as Locale;

  return (
    <>
      <JsonLd data={graph(organization(locale), website(locale))} />
      <SmoothScroll />
      <Header />
      <main id="main" className="relative pt-[92px] md:pt-[132px]">
        {children}
      </main>
      <Footer />
    </>
  );
}
