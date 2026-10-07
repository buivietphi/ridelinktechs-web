import type { Metadata, Viewport } from 'next';
import { getLocale, getMessages } from 'next-intl/server';
import { Be_Vietnam_Pro, IBM_Plex_Mono } from 'next/font/google';
import { I18nProvider } from '@/i18n/I18nProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ThemeBinding } from '@/components/theme/ThemeBinding';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SmoothScroll } from '@/lib/animations';
import '@/styles/tokens.css';
import './globals.css';

const display = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-display-loaded',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const body = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-body-loaded',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const mono = IBM_Plex_Mono({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-mono-loaded',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ridelinktechs.com'),
  title: {
    default: 'RideLink Techs — Phần mềm tại Đà Nẵng',
    template: '%s · RideLink Techs',
  },
  description:
    'Công ty phần mềm độc lập tại Đà Nẵng — sản phẩm mobile và web, kèm dự án cho khách hàng.',
  applicationName: 'RideLink Techs',
  authors: [{ name: 'RideLink Techs' }],
  creator: 'RideLink Techs',
  openGraph: {
    type: 'website',
    siteName: 'RideLink Techs',
    title: 'RideLink Techs — Phần mềm tại Đà Nẵng',
    description:
      'Công ty phần mềm độc lập tại Đà Nẵng — sản phẩm mobile và web, kèm dự án cho khách hàng.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0C0E14' },
    { media: '(prefers-color-scheme: light)', color: '#F1F2F5' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const skipLabel = locale === 'vi' ? 'Bỏ qua đến nội dung' : 'Skip to content';

  return (
    <html
      lang={locale}
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-[var(--ground)] font-[var(--font-body)] text-[var(--ink)]">
        <ThemeProvider defaultTheme="dark">
          <ThemeBinding />
          <I18nProvider locale={locale} messages={messages}>
            <a href="#main" className="skip-link">
              {skipLabel}
            </a>
            <SmoothScroll />
            <Header />
            <main id="main" className="relative pt-[132px]">
              {children}
            </main>
            <Footer />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
