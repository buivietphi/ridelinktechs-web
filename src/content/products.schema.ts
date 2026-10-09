export type ProductCategory = 'prod' | 'outsource';
export type ProductStatus = 'in-development' | 'upcoming' | 'shipped';
export type ProductShot = 'ui' | 'brand' | 'photo';
export type ProductPlatform = 'web' | 'mobile';
export type ProductIcon = 'car' | 'sparkle' | 'paw' | 'megaphone';

export interface LocalizedString {
  vi: string;
  en: string;
}

export interface TimelineMark {
  label: LocalizedString;
  date: string;
}

export interface ProductStep {
  title: LocalizedString;
  body: LocalizedString;
}

export interface ProductFaq {
  q: LocalizedString;
  a: LocalizedString;
}

export interface Product {
  slug: string;
  name: LocalizedString;
  kind: LocalizedString;
  icon?: ProductIcon;
  tagline: LocalizedString;
  description: LocalizedString;
  category: ProductCategory;
  status: ProductStatus;
  shot: ProductShot;
  platform: ProductPlatform;
  demoUrl?: string;
  screens?: string[];
  screenCaptions?: LocalizedString[];
  featured?: boolean;
  features: { vi: string[]; en: string[] };
  howItWorks?: ProductStep[];
  faq?: ProductFaq[];
  timeline: TimelineMark[];
  targetUser?: LocalizedString;
  problem?: LocalizedString;
  image?: string;
  imageCredit?: { name: string; url: string };
  clientName?: string;
}
