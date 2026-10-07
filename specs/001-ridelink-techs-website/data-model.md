# Phase 1 — Data Model

**Date**: 2026-09-26 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

> All entities below are stored as **typed TypeScript modules** in `src/content/`. No database, no CMS. This document defines the shape, validation rules, and relationships so the implementation can encode them as types and runtime guards.

---

## Entity 1 — `Product`

Represents one entry on the products page and one product-detail page. There are exactly **5 instances** in v1: 4 in-house + 1 outsource.

### Shape

```ts
// src/content/products.ts
export type ProductCategory = 'prod' | 'outsource';
export type ProductStatus = 'in-development' | 'upcoming' | 'shipped';

export interface LocalizedString {
  vi: string;
  en: string;
}

export interface ProductMock {
  /** Visual placeholder. Either a static asset path or a 'gradient' mock descriptor. */
  kind: 'gradient' | 'image';
  /** Used when kind = 'image' — relative path under /public/images/products/<slug>/cover.png */
  src?: string;
  /** Tailwind gradient stops (e.g. "from-blue-700 via-fuchsia-600 to-cyan-400"). */
  gradient?: string;
  /** Caption shown beneath the mock on the detail page. */
  caption?: LocalizedString;
}

export interface TimelineMark {
  /** Phase label, e.g. "Ý tưởng" / "Idea". */
  label: LocalizedString;
  /** ISO date (YYYY-MM) — display-only, no timezone math. */
  date: string;
}

export interface Product {
  /** Stable, kebab-case, used as URL slug. Unique across all products. */
  slug: string;
  /** Display name. Same in both languages for now; bilingual names allowed. */
  name: LocalizedString;
  /** One-line pitch shown on cards. ≤ 80 chars per language. */
  tagline: LocalizedString;
  /** 2–4 sentence description on the detail page. */
  description: LocalizedString;
  /** 'prod' (in-house) or 'outsource' (client work). */
  category: ProductCategory;
  /** Lifecycle status — drives the StatusBadge. */
  status: ProductStatus;
  /** Ordered list of timeline milestones shown as a pill row. */
  timeline: TimelineMark[];
  /** Visual mock — gradient placeholder or static image. */
  mock: ProductMock;
  /** Optional target user / persona line, shown on detail page. */
  targetUser?: LocalizedString;
  /** Optional problem-solved headline, shown on detail page. */
  problem?: LocalizedString;
  /** Outsource-only — NOT displayed publicly for Vibeholic. Reserved for future entries. */
  clientName?: string;
}
```

### Seed data (the 5 products from the spec)

| slug                  | category  | status         | timeline (idea → dev start) |
| --------------------- | --------- | -------------- | --------------------------- |
| `ridelink-go`         | prod      | in-development | 2024-08 → 2025-08           |
| `glosslink-beautiful` | prod      | upcoming       | 2025-04 → 2026-06           |
| `pawly`               | prod      | upcoming       | 2025-12 → 2026-07           |
| `motorbike-rescue`    | prod      | in-development | (TBD)                       |
| `vibeholic`           | outsource | shipped        | n/a                         |

> Concrete `vi`/`en` strings for tagline / description / targetUser / problem / timeline labels are written in `src/content/products.ts` during implementation. The plan assumes sensible bilingual placeholder copy in line with each product's domain; user review before public deploy.

### Validation rules

1. `slug` MUST be unique across all products.
2. `slug` MUST match `/^[a-z0-9]+(-[a-z0-9]+)*$/`.
3. `name.vi` and `name.en` MUST both be non-empty.
4. `tagline.vi` and `tagline.en` MUST each be ≤ 80 characters.
5. `description.vi` and `description.en` MUST each be 50–600 characters.
6. `category = 'prod'` ⇒ `clientName` MUST be absent.
7. `category = 'outsource'` ⇒ status MUST be one of `upcoming | shipped` (we don't show "in-development" for client work in v1).
8. `status = 'in-development' | 'upcoming'` ⇒ `timeline` MUST contain at least one entry labeled "Ý tưởng" / "Idea" and at least one labeled "Bắt đầu phát triển" / "Dev start".
9. `mock.kind = 'image'` ⇒ `mock.src` MUST be a non-empty string.
10. `mock.kind = 'gradient'` ⇒ `mock.gradient` MUST be a non-empty Tailwind gradient class string.

### Build-time check

A small `scripts/check-content.mjs` (added in implementation phase, not now) verifies rules 1–10 against the typed module and fails the build on any violation. This satisfies the spec's "content is data-driven and easy to update" requirement.

### Relationships

- A `Product` has **zero or one** `mock` (composition).
- A `Product` belongs to **exactly one** `category` (enum).
- No cross-product relationships in v1 — each product is an island.

---

## Entity 2 — `CompanyProfile`

Single global entity. One instance, defined once in `src/content/company.ts`.

### Shape

```ts
// src/content/company.ts
export interface SocialLink {
  /** e.g. 'linkedin' | 'github' | 'facebook' | 'x' | 'youtube' */
  platform: string;
  /** Absolute URL. Empty string = placeholder (icon shown but no navigation). */
  url: string;
  /** Display label for screen readers / tooltips. */
  label: string;
}

export interface CompanyProfile {
  name: string; // "RideLink Techs"
  tagline: LocalizedString;
  email: string; // "support@ridelinktechs.com"
  phoneDisplay: string; // "0967329308"  — shown to users
  phoneHref: string; // "+84967329308" — tel: link target
  address: LocalizedString;
  socials: SocialLink[]; // May be empty placeholders in v1
  logoLight: string; // "/logo/logo_congty.png"
  logoDark: string; // "/logo/logo_congty_white.png"
}
```

### Validation rules

1. `name` non-empty, ≤ 60 chars.
2. `email` matches a basic email regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
3. `phoneDisplay` matches `/^0\d{9,10}$/`.
4. `phoneHref` matches `/^\+84\d{9,10}$/` (Vietnam country code).
5. `address.vi` and `address.en` both non-empty.
6. `socials` length ≤ 8.
7. `logoLight` and `logoDark` are absolute paths under `/public/`.

### Usage

- The single `CompanyProfile` is imported wherever the company facts are needed: Header, Footer, ContactSection, About page, `mailto:` / `tel:` links.

---

## Entity 3 — `AboutContent`

Single global entity holding About-page copy. One instance, defined once in `src/content/about.ts`.

### Shape

```ts
// src/content/about.ts
export interface FocusArea {
  title: LocalizedString;
  description: LocalizedString;
}

export interface TeamMember {
  name: string;
  role: LocalizedString;
  avatar?: string; // path under /public/, optional
  bio?: LocalizedString; // optional short bio
}

export interface AboutContent {
  /** Hero headline for /about. */
  heroTitle: LocalizedString;
  /** Sub-headline / tagline for /about. */
  heroSubtitle: LocalizedString;
  /** Long-form story (2–4 paragraphs). */
  story: LocalizedString;
  /** Mission statement (1–2 sentences). */
  mission: LocalizedString;
  /** Ordered list of focus areas — shown as cards on /about. */
  focusAreas: FocusArea[];
  /** Optional team roster. May be empty in v1 if user opts not to list members. */
  teamMembers: TeamMember[];
}
```

### Validation rules

1. `heroTitle` and `heroSubtitle` non-empty, each ≤ 80 chars.
2. `story` 200–1500 characters in each language.
3. `mission` 50–300 characters in each language.
4. `focusAreas.length` between 3 and 6 (inclusive).
5. `teamMembers.length` ≤ 12.
6. `FocusArea.title` ≤ 60 chars per language.
7. `FocusArea.description` ≤ 200 chars per language.

### Usage

- Imported by `/about/page.tsx` and by the homepage's `AboutTeaser` section (which uses a truncated `story` for the teaser).

---

## Locale catalogs (UI strings)

```ts
// src/i18n/config.ts
export const locales = ['vi', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'vi';
export const localeLabels: Record<Locale, string> = { vi: 'Tiếng Việt', en: 'English' };
```

UI chrome strings — nav labels, button text, error messages, footer headings, About-page section headings — live in `src/i18n/{vi,en}.json` and are loaded via `next-intl`. Content entities (Product, CompanyProfile, AboutContent) carry their own bilingual fields and do NOT use the message catalogs.

### Catalog validation rules

1. Every key present in `vi.json` MUST also be present in `en.json` and vice versa.
2. No value may be empty.
3. A small `scripts/check-i18n.mjs` validates parity at build time and fails the build on any missing key.

---

## Routes ↔ Entities

| Route              | Primary entities rendered                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `/`                | `CompanyProfile` (hero), `Product[]` (portfolio grid), `AboutContent` (teaser), `CompanyProfile` (contact section) |
| `/products`        | `Product[]` grouped by `category`                                                                                  |
| `/products/[slug]` | one `Product` resolved by `slug`; 404 fallback if not found                                                        |
| `/about`           | `AboutContent`                                                                                                     |
| `/contact`         | `CompanyProfile`                                                                                                   |
