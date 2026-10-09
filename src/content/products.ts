import rawData from './products.json';
import type { Product } from './products.schema';

export const products = rawData as Product[];

export const inHouseProducts = products.filter((p) => p.category === 'prod');
export const outsourceProducts = products.filter((p) => p.category === 'outsource');

export function findProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export type {
  Product,
  ProductCategory,
  ProductIcon,
  ProductStatus,
  LocalizedString,
  TimelineMark,
} from './products.schema';
