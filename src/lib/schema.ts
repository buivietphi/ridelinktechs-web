import { company } from '@/content/company';
import { products, type Product } from '@/content/products';
import type { Locale } from '@/i18n/config';

export const SITE = 'https://ridelinktechs.com';

const abs = (path: string) => (path.startsWith('http') ? path : `${SITE}${path}`);

/** "2024-08" -> "2024-08-01" so schema.org validators accept it. */
const iso = (ym: string) => `${ym}-01`;

const OS: Record<Product['platform'], string> = {
  mobile: 'Android, iOS',
  web: 'Web',
};

const CATEGORY: Record<Product['category'], string> = {
  prod: 'BusinessApplication',
  outsource: 'WebSite',
};

export function organization(locale: Locale) {
  return {
    '@type': 'Organization',
    '@id': `${SITE}/#organization`,
    name: company.name,
    url: SITE,
    logo: {
      '@type': 'ImageObject',
      url: abs(company.logoDark),
      width: 512,
      height: 512,
    },
    image: abs(company.logoDark),
    description: company.tagline[locale],
    slogan: company.tagline[locale],
    email: company.email,
    telephone: company.phoneHref,
    foundingDate: '2025',
    foundingLocation: { '@type': 'Place', name: 'Da Nang, Vietnam' },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '14 Tan Thai 1, Son Tra Ward',
      addressLocality: 'Da Nang',
      addressRegion: 'Da Nang',
      addressCountry: 'VN',
    },
    areaServed: { '@type': 'Country', name: 'Vietnam' },
    knowsLanguage: ['vi', 'en'],
    sameAs: company.socials.map((s) => s.url),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: company.email,
        telephone: company.phoneHref,
        availableLanguage: ['Vietnamese', 'English'],
        areaServed: 'Worldwide',
      },
    ],
  };
}

export function website(locale: Locale) {
  return {
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    url: SITE,
    name: company.name,
    description: company.tagline[locale],
    inLanguage: locale,
    publisher: { '@id': `${SITE}/#organization` },
  };
}

export function softwareApplication(product: Product, locale: Locale) {
  const detail = `${product.tagline[locale]} ${product.description[locale]}`;
  const url = `${SITE}/products/${product.slug}`;

  return {
    '@type': 'SoftwareApplication',
    '@id': `${url}#app`,
    name: product.name[locale],
    alternateName: product.name.vi === product.name.en ? undefined : product.name.en,
    url,
    description: detail,
    applicationCategory: CATEGORY[product.category],
    applicationSubCategory: product.kind[locale],
    operatingSystem: OS[product.platform],
    inLanguage: locale,
    publisher: { '@id': `${SITE}/#organization` },
    image: (product.screens ?? (product.image ? [product.image] : [])).map(abs),
    datePublished: product.timeline[0] ? iso(product.timeline[0].date) : undefined,
    featureList: product.features[locale],
    keywords: [product.kind[locale], product.status.replace(/-/g, ' '), 'Da Nang', 'Vietnam'],
    isAccessibleForFree: true,
  };
}

export function breadcrumb(trail: { name: string; path: string }[], locale: Locale) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${abs(trail[trail.length - 1].path)}#breadcrumb`,
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
    inLanguage: locale,
  };
}

export function faqPage(
  faqs: { q: Record<Locale, string>; a: Record<Locale, string> }[],
  locale: Locale,
) {
  if (!faqs.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q[locale],
      acceptedAnswer: { '@type': 'Answer', text: f.a[locale] },
    })),
  };
}

export function productList(locale: Locale, heading: string) {
  return {
    '@type': 'CollectionPage',
    name: heading,
    url: `${SITE}/products`,
    inLanguage: locale,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE}/products/${p.slug}`,
        name: p.name[locale],
      })),
    },
  };
}

export function contactPage(locale: Locale, description: string) {
  return {
    '@type': 'ContactPage',
    url: `${SITE}/contact`,
    name: description,
    inLanguage: locale,
    mainEntity: { '@id': `${SITE}/#organization` },
  };
}

/** Wraps nodes into one @graph document so ids can cross-reference. */
export function graph(...nodes: (object | null)[]) {
  const clean = nodes.filter((n): n is object => n !== null);
  return { '@context': 'https://schema.org', '@graph': clean };
}
