import type { MetadataRoute } from 'next';
import { products } from '@/content/products';

const SITE = 'https://ridelinktechs.com';

/** "2024-08" -> a real Date, so crawlers see an actual last-modified day. */
function latestMarkDate(slug: string): Date | undefined {
  const product = products.find((p) => p.slug === slug);
  if (!product?.timeline.length) return undefined;
  const newest = product.timeline
    .map((m) => m.date)
    .sort()
    .pop();
  return newest ? new Date(`${newest}-01T00:00:00.000Z`) : undefined;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths: {
    path: string;
    priority: number;
    changeFrequency: 'daily' | 'monthly' | 'yearly';
  }[] = [
    { path: '/', priority: 1, changeFrequency: 'monthly' },
    { path: '/products', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.7, changeFrequency: 'yearly' },
    { path: '/contact', priority: 0.8, changeFrequency: 'yearly' },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map(
    ({ path, priority, changeFrequency }) => ({
      url: `${SITE}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    }),
  );

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE}/products/${p.slug}`,
    lastModified: latestMarkDate(p.slug) ?? now,
    changeFrequency: 'monthly',
    priority: p.featured ? 0.9 : 0.7,
  }));

  return [...staticEntries, ...productEntries];
}
