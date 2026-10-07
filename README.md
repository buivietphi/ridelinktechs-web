# RideLink Techs — corporate website

Single-brand corporate site for RideLink Techs (Đà Nẵng, Vietnam). Built with Next.js App Router, bilingual (VI / EN) via cookie-stored locale, light + dark theme, and editorial-atelier motion via GSAP + ScrollTrigger + Lenis.

The visual language is **Atelier Editorial · Studio Almanac** — warm bone paper, Spectral editorial serif, Inter Tight body, JetBrains Mono ticks, deep oxblood accent on a single warm signal. See [`design.md`](design.md) for the full system of record.

## Stack

- Next.js 15 (App Router, standalone output)
- TypeScript strict
- Tailwind CSS v4 (`@theme inline`)
- next-intl (cookie locale persistence, no URL prefix)
- next-themes (class strategy)
- GSAP 3 + ScrollTrigger + `@gsap/react` + Lenis
- Phosphor React icons (single icon family)
- radix-ui (Tabs, Accordion, Tooltip, Dialog, Sheet)
- embla-carousel-react

## Getting started

```bash
npm install
npm run dev
```

The dev server is locked to **port 7421** (port 3100 collides with the local Paperclip helper — avoid that one).

Open <http://localhost:7421>. Default theme is **light**, default locale is **Vietnamese**.

Toggle the theme (top-right), switch language (top-right), scroll — animated reveals are on everywhere except where reduced-motion is set.

## Scripts

| Command                 | What it does                                      |
| ----------------------- | ------------------------------------------------- |
| `npm run dev`           | Start the dev server on **port 7421** (Turbopack) |
| `npm run build`         | Production build (standalone output)              |
| `npm run start`         | Run the built server                              |
| `npm run lint`          | ESLint                                            |
| `npm run typecheck`     | TypeScript no-emit check                          |
| `npm run format`        | Prettier write                                    |
| `npm run check:content` | Validate `src/content/*.ts` + `products.json`     |
| `npm run check:i18n`    | Validate `vi.json` ↔ `en.json` parity             |
| `npm run check`         | Aggregate quality gates                           |

## Structure

```
src/
├── app/                 # Routes
│   ├── layout.tsx       # Root: providers + chrome
│   ├── page.tsx         # Homepage
│   ├── products/        # /products, /products/[slug]
│   ├── about/           # /about
│   ├── contact/         # /contact
│   ├── sitemap.ts       # Build-time sitemap
│   └── robots.ts        # /robots.txt
├── components/
│   ├── blocks/          # Cross-route compositions (Marquee, ParallaxFloat, …)
│   ├── layout/          # Header, Footer, MobileNav
│   ├── motion/          # GSAP-bound primitives (Curtain, Reveal, ChapterReveal)
│   ├── theme/           # ThemeProvider, ThemeBinding, ThemeToggle
│   ├── ui/              # Editorial primitives (ChapterFrame, DatelineRow, …)
│   └── i18n/            # I18nProvider, LanguageSwitcher
├── content/             # Single source of truth
│   ├── products.json    # Product catalog (edit here to add a product)
│   ├── products.ts      # Thin typed loader
│   ├── products.schema.ts
│   ├── company.ts
│   └── about.ts
├── i18n/                # request config + JSON catalogs (vi.json, en.json)
├── lib/                 # cn, animations, motion tokens
└── styles/              # tokens.css (Atelier Editorial palette)
```

## Deployment

The Next.js standalone output ships with two builds:

1. **Static-hosting-style**: build with `output: 'standalone'` (default), generate a Docker image from the included [`Dockerfile`](Dockerfile), and run with a reverse-proxy in front of `node server.js` on port 3000.
2. **Any Node 22 host**: `npm ci && npm run build && node .next/standalone/server.js`.

## Brand & content rules

- **Bilingual is non-negotiable**: every string lives in both `vi.json` and `en.json`. Validation (`npm run check:i18n`) fails CI when they diverge.
- **No fabricated proof**: no testimonials, no customer logos, no press quotes. Product counts and statuses come from `products.json` only.
- **Atelier Editorial palette**: warm bone `#F4F0E6` paper, deep oxblood `#7A2E2A` accent (≤2% surface budget), JetBrains Mono for ticks. Tokens live in [`src/styles/tokens.css`](src/styles/tokens.css).
- **Typography**: Spectral (display, opsz axis) + Inter Tight (body) + JetBrains Mono (utility). All bilingual via `next/font/google`.
- **Accessibility**: WCAG AA contrast on text, focus-visible oxblood ring, skip-to-main link, reduced-motion guard (animation-duration clamped to 0.001ms under the media query).
- **Outsource NDA**: the 5th product is NDA-locked. URL slug is `/products/outsource` via a `next.config.mjs` rewrite; visible label is `/ OUTSOURCE`; image is `/products/outsource.jpg`. Never expose the real client name in markup or alt text.

## Maintenance

### How to add a product

1. Open [`src/content/products.json`](src/content/products.json) and copy the nearest existing entry. Replace:
   - `slug` (kebab-case, lowercase, matches `/^[a-z0-9]+(-[a-z0-9]+)*$/`)
   - `displaySlug` (omit or null for normal products; set to e.g. `"OUTSOURCE"` for NDA)
   - `name` (both `vi` and `en`)
   - `tagline` (both languages, ≤80 chars each)
   - `description` (both languages, 50–600 chars each)
   - `category` (`"prod"` for in-house, `"outsource"` for client work)
   - `status` (`"in-development"`, `"upcoming"`, or `"shipped"`)
   - `timeline` array (every non-shipped product needs an "Idea" and a "Dev" mark)
   - `image` — drop the JPG into `/public/products/{slug}.jpg`
2. Run `npm run check:content` to validate the JSON shape.
3. Update bilingual strings in any new copy inside the relevant namespace of `vi.json` + `en.json`. Then `npm run check:i18n`.
4. If you introduced new copy keys, add them to **both** files in the same edit (parity is enforced).
5. `npm run dev` (already on port 7421) and the new product appears on `/products` immediately.

### When adding a page

1. Create `src/app/<route>/page.tsx` (cookie locale — no `force-dynamic` needed; next-intl handles it).
2. Add the page title + namespace to **both** `vi.json` and `en.json`.
3. Add it to `src/app/sitemap.ts`.
4. If the page uses interactive chrome (Sheet / Tabs / Accordion / Tooltip / Dialog / Carousel), import from the PascalCase primitives in `src/components/ui/` — `Sheet`, `Tabs`, `Accordion`, `Tooltip`, `Dialog`, `Carousel`. The lowercase shadcn-style paths are reserved out.

## License

Internal to RideLink Techs.
