import type { Metadata } from 'next';
import { SITE as ORIGIN } from '@/lib/schema';

const SITE = 'RideLink Techs';
const abs = (path: string) => (path.startsWith('http') ? path : `${ORIGIN}${path}`);

const OG = {
  url: abs('/og.png'),
  width: 1200,
  height: 630,
  alt: `${SITE} — Công ty phần mềm tại Đà Nẵng`,
};

type PageMetadataInput = {
  title: string | { absolute: string };
  description: string;
  path: string;
};

export function pageMetadata({ title, description, path }: PageMetadataInput): Metadata {
  const shown = typeof title === 'string' ? `${title} · ${SITE}` : title.absolute;
  return {
    title,
    description,
    alternates: { canonical: abs(path) },
    openGraph: {
      type: 'website',
      siteName: SITE,
      title: shown,
      description,
      url: abs(path),
      images: [OG],
      locale: 'vi_VN',
      alternateLocale: ['en_US'],
    },
    twitter: {
      card: 'summary_large_image',
      title: shown,
      description,
      images: [OG.url],
    },
  };
}

export function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max).replace(/\s+\S*$/, '');
  return `${cut}...`;
}
