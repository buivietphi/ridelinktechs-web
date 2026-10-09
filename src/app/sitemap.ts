import type { MetadataRoute } from 'next';
import { products } from '@/content/products';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://ridelinktechs.com';
  const now = new Date();

  const staticPaths = ['/', '/products', '/about', '/contact'];
  const productPaths = products.map((p) => `/products/${p.slug}`);

  return [...staticPaths, ...productPaths].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
  }));
}
