import type { Metadata } from 'next';

const SITE = 'RideLink Techs';

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
    alternates: { canonical: path },
    openGraph: { type: 'website', siteName: SITE, title: shown, description, url: path },
    twitter: { card: 'summary', title: shown, description },
  };
}

export function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max).replace(/\s+\S*$/, '');
  return `${cut}...`;
}
