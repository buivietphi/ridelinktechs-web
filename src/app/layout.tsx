import type { Metadata, Viewport } from 'next';
import { getLocale, getMessages } from 'next-intl/server';
import { Be_Vietnam_Pro, IBM_Plex_Mono } from 'next/font/google';
import { I18nProvider } from '@/i18n/I18nProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ThemeBinding } from '@/components/theme/ThemeBinding';
import { RouteProgress } from '@/components/motion/RouteProgress';
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
    'Công ty phần mềm tại Đà Nẵng — sản phẩm của riêng mình và dự án phần mềm trọn gói, bàn giao đủ mã nguồn.',
  applicationName: 'RideLink Techs',
  authors: [{ name: 'RideLink Techs' }],
  creator: 'RideLink Techs',
  keywords: [
    'công ty phần mềm Đà Nẵng',
    'phát triển phần mềm theo yêu cầu',
    'ứng dụng mobile Việt Nam',
    'lập trình web Đà Nẵng',
    'bàn giao mã nguồn',
    'software company Da Nang',
    'custom software development Vietnam',
  ],
  category: 'technology',
  openGraph: {
    type: 'website',
    siteName: 'RideLink Techs',
    title: 'RideLink Techs — Phần mềm tại Đà Nẵng',
    description:
      'Công ty phần mềm tại Đà Nẵng — sản phẩm của riêng mình và dự án phần mềm trọn gói, bàn giao đủ mã nguồn.',
    images: [
      {
        url: 'https://ridelinktechs.com/og.png',
        width: 1200,
        height: 630,
        alt: 'RideLink Techs — Công ty phần mềm tại Đà Nẵng',
      },
    ],
    locale: 'vi_VN',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://ridelinktechs.com/og.png'],
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
            <RouteProgress />
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
