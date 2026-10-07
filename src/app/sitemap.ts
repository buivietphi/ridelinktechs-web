import type { MetadataRoute } from 'next';
import { products } from '@/content/products';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://ridelinktechs.com';
  const now = new Date();

  const staticPaths = ['/', '/products', '/about', '/contact'];

  const productPaths = products
    .filter((p) => p.category !== 'outsource')
    .map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: now }));

  return [...staticPaths.map((u) => ({ url: `${base}${u}`, lastModified: now })), ...productPaths];
}
