export type ProductCategory = 'prod' | 'outsource';
export type ProductStatus = 'in-development' | 'upcoming' | 'shipped';
export type ProductShot = 'ui' | 'brand' | 'photo';
export type ProductPlatform = 'web' | 'mobile';

export interface LocalizedString {
  vi: string;
  en: string;
}

export interface TimelineMark {
  label: LocalizedString;
  date: string;
}

export interface Product {
  slug: string;
  name: LocalizedString;
  tagline: LocalizedString;
  description: LocalizedString;
  category: ProductCategory;
  status: ProductStatus;
  shot: ProductShot;
  platform: ProductPlatform;
  demoUrl?: string;
  screens?: string[];
  features: { vi: string[]; en: string[] };
  timeline: TimelineMark[];
  targetUser?: LocalizedString;
  problem?: LocalizedString;
  image?: string;
  imageCredit?: { name: string; url: string };
  clientName?: string;
}
