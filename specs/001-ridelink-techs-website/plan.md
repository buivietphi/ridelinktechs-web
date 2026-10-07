# Implementation Plan: RideLink Techs Corporate Website

**Branch**: `[001-ridelink-techs-website]` | **Date**: 2026-09-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-ridelink-techs-website/spec.md`

## Summary

Build a multi-route, bilingual (VI primary / EN secondary), light+dark themed marketing website for RideLink Techs, a Vietnamese tech studio based in Đà Nẵng. The site presents the company's identity (logo-derived gradient palette), an in-house product portfolio (Ridelink Go, GlossLink Beautiful, Pawly, Motorbike Rescue — all in active development) plus one outsource engagement (Vibeholic — a web project for a marketing-industry client). Target stack is **Next.js (latest stable)** with **App Router**, structured in an **MVP-style layout** with clearly named components, deployed via **self-host** (Node.js runtime on a VPS or container). Animations are premium-grade (hallmark-tier) using GSAP, with full `prefers-reduced-motion` respect. Public visitor flows: landing on the homepage, browsing the portfolio, opening a product detail, reading the About page, and contacting the company via `mailto:` / `tel:`.

## Technical Context

**Language/Version**: TypeScript 5.x (strict); Node.js ≥ 22 LTS

**Primary Dependencies**:

- **Next.js** (latest stable — 16.x at the time of writing) — App Router, RSC by default, SSR/SSG hybrid
- **React** 19.x (paired with Next.js)
- **Tailwind CSS** 4.x — utility-first styling, used to express the logo-derived color tokens (deep blue, magenta/purple, cyan) in both light and dark themes
- **GSAP** 3.x (free + ScrollTrigger plugin) — premium animations (intro, scroll-triggered reveals, hover micro-interactions)
- **Lenis** (smooth scroll) — paired with GSAP ScrollTrigger for premium feel
- **next-intl** (or equivalent) — bilingual routing & message loading (`vi` default, `en` switchable)
- **next-themes** (or equivalent) — class-strategy theme toggle (light default, no flash of unstyled content)
- **lucide-react** — icon set
- **shadcn/ui** (selective primitives only) — accessible, themeable primitives (Button, Sheet, Dialog, Tooltip) for forms / overlays when needed; not a wholesale dependency

**Storage**: None for v1 — content lives in code (`src/content/products.ts`, `src/content/company.ts`, `src/content/about.ts`) and message catalogs (`src/i18n/{vi,en}.json`). No CMS, no DB.

**Testing**:

- **Manual smoke** via `npm run dev` for every route in both themes and both languages
- **Lighthouse** audit (Performance ≥ 85, Accessibility ≥ 90, Best Practices, SEO) on the production build
- **Accessibility checks**: keyboard tab-through, focus visibility, color contrast (WCAG AA), `prefers-reduced-motion` honoring
- **Responsive checks**: 320px / 375px / 768px / 1024px / 1440px viewport widths
- **Build verification**: `npm run build && npm run start` runs cleanly on a self-host container

**Target Platform**: Web — modern evergreen browsers (Chrome / Edge / Firefox / Safari latest 2 versions). Server runtime: any Node.js ≥ 22 environment (VPS, Docker container). Static asset delivery via the same Node server or a fronting reverse proxy (nginx/Caddy).

**Project Type**: Web application — frontend-only (no backend). Multi-route marketing site with light interactive surfaces (language switcher, theme toggle, animated hero).

**Performance Goals**:

- **LCP** < 1.5s on a typical 4G connection
- **CLS** < 0.05 (no layout shift on theme/language switch)
- **TTFB** < 400ms (from self-host origin, not measured from CDN)
- **JS shipped to client** ≤ 200 KB gzipped for the homepage (excluding animation libs which may be deferred / dynamic-imported on scroll)
- **Lighthouse Performance ≥ 85** on production build

**Constraints**:

- **Self-hostable**: build output runs on a plain Node.js process with no vendor lock-in (no Vercel-only features, no `edge runtime`-only APIs in critical paths)
- **MVP-style code organization**: small, focused, clearly named components — no god-components, no premature abstractions
- **Animation accessibility**: `prefers-reduced-motion: reduce` MUST disable non-essential motion; reveal / scroll-trigger animations MUST degrade gracefully to static state
- **Theme accessibility**: light + dark themes BOTH pass WCAG AA contrast for body text and interactive elements
- **Bilingual completeness**: no key identifier / fallback English shown to visitors — every visible string has a translation in both `vi.json` and `en.json`
- **SEO**: per-page `<title>` and `<meta name="description">`; Open Graph + Twitter card meta; sitemap.xml + robots.txt; canonical URLs; `lang` attribute on `<html>` reflects active locale

**Scale/Scope**:

- **5 routes**: `/`, `/products`, `/products/[slug]` (5 slugs), `/about`, `/contact`
- **5 products**: 4 in-house (Ridelink Go, GlossLink Beautiful, Pawly, Motorbike Rescue) + 1 outsource (Vibeholic)
- **2 languages**: `vi` (default), `en`
- **2 themes**: `light` (default), `dark`
- **~25–35 components** total, organized into `layout/`, `sections/`, `products/`, `ui/`, `theme/` MVP-style buckets
- **Single-developer velocity**, MVP first — small polished v1, not a sprawling v1.5

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

> **Note**: The project constitution at `.specify/memory/constitution.md` is currently a placeholder template (no concrete principles defined yet). Gates are therefore informational only — the plan honors these implicit constraints, drawn from the spec:

| #   | Implicit Gate                                            | Status   | Notes                                                                                                                               |
| --- | -------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| G1  | No implementation details leak into the spec             | **Pass** | Spec lists user-facing behavior; the `## Assumptions` section captures user-stated stack preferences without contaminating FRs/SCs. |
| G2  | All functional requirements are testable and unambiguous | **Pass** | 15 FRs, each with a `MUST` clause and a corresponding acceptance scenario.                                                          |
| G3  | Success criteria are measurable & tech-agnostic          | **Pass** | 9 SCs, no framework mentions.                                                                                                       |
| G4  | Scope is bounded (no scope creep)                        | **Pass** | v1 explicitly excludes CMS, contact form backend, auth, e-commerce.                                                                 |
| G5  | User-stated constraints honored                          | **Pass** | Next.js latest, MVP structure, self-host, bilingual, theme toggle, About page all reflected.                                        |
| G6  | Accessibility baseline present                           | **Pass** | Reduced-motion, keyboard focus, WCAG AA contrast, semantic HTML are required.                                                       |
| G7  | Build artifact deployable without vendor lock-in         | **Pass** | Self-host target documented; no Vercel-specific primitives in the critical path.                                                    |

No violations → no complexity-tracking entries required.

## Project Structure

### Documentation (this feature)

```text
specs/001-ridelink-techs-website/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command) — UI contracts
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
ridelinks-techs-web/
├── public/
│   ├── logo/                       # Brand assets (logo_congty.png, logo_congty_white.png)
│   ├── images/                     # Static imagery (product mock placeholders)
│   └── seo/                        # favicon, OG image
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout: html lang, theme provider, i18n provider
│   │   ├── globals.css             # Tailwind base, theme tokens (CSS variables)
│   │   ├── page.tsx                # Home route (/)
│   │   ├── products/
│   │   │   ├── page.tsx            # Products list (/products)
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # Product detail (/products/[slug])
│   │   ├── about/
│   │   │   └── page.tsx            # About (/about)
│   │   └── contact/
│   │       └── page.tsx            # Contact (/contact)
│   ├── components/                 # MVP-style buckets, one component per file
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Sticky nav, logo, language switcher, theme toggle
│   │   │   ├── Footer.tsx          # Company name, contact summary, social placeholders
│   │   │   ├── MobileNav.tsx       # Slide-in mobile navigation
│   │   │   └── NavLinks.tsx        # Active-route aware nav links
│   │   ├── sections/
│   │   │   ├── Hero.tsx            # Hero with animated logo + tagline + CTA
│   │   │   ├── ProductGrid.tsx     # Product portfolio grid (prod + outsource groups)
│   │   │   ├── AboutTeaser.tsx     # Short About preview + CTA to /about
│   │   │   ├── ContactSection.tsx  # Inline contact card on homepage
│   │   │   └── ScrollReveal.tsx    # Generic scroll-trigger wrapper (GSAP)
│   │   ├── products/
│   │   │   ├── ProductCard.tsx     # Card: name, tagline, status, timeline, visual
│   │   │   ├── ProductDetail.tsx   # Detail page composition
│   │   │   ├── ProductMock.tsx     # Mock-UI placeholder renderer (frame + gradient)
│   │   │   ├── StatusBadge.tsx     # in-development / upcoming / outsource badge
│   │   │   └── TimelineTag.tsx     # Idea → Dev date pill
│   │   ├── ui/
│   │   │   ├── Button.tsx          # Primary / secondary / ghost variants
│   │   │   ├── Container.tsx       # Max-width page container
│   │   │   ├── Section.tsx         # Standard vertical rhythm wrapper
│   │   │   ├── Skeleton.tsx        # Loading placeholders (if needed)
│   │   │   └── VisuallyHidden.tsx  # a11y-only utility
│   │   ├── theme/
│   │   │   ├── ThemeProvider.tsx   # next-themes wrapper, class strategy
│   │   │   ├── ThemeToggle.tsx     # Sun/Moon button (a11y labeled)
│   │   │   └── theme-tokens.ts     # Token map (light + dark values per surface)
│   │   └── i18n/
│   │       ├── I18nProvider.tsx    # next-intl provider client wrapper
│   │       └── LanguageSwitcher.tsx# VI/EN dropdown / toggle
│   ├── content/                    # Static structured content (data in code)
│   │   ├── products.ts             # Product[] catalog (typed, bilingual)
│   │   ├── company.ts              # CompanyProfile (typed, bilingual)
│   │   └── about.ts                # AboutContent (typed, bilingual)
│   ├── i18n/
│   │   ├── config.ts               # Locale list, default, label map
│   │   ├── vi.json                 # Vietnamese UI strings
│   │   ├── en.json                 # English UI strings
│   │   └── request.ts              # next-intl request config
│   ├── lib/
│   │   ├── animations.ts           # Shared GSAP setup, eased reveals, prefers-reduced-motion guard
│   │   └── cn.ts                   # className merge helper
│   └── styles/
│       └── tokens.css              # CSS variables for light/dark + brand gradient stops
├── .gitignore
├── .eslintrc.json (or eslint.config.mjs)
├── .prettierrc
├── next.config.mjs
├── tailwind.config.ts (or @theme in CSS for v4)
├── postcss.config.mjs
├── tsconfig.json
├── package.json
├── README.md                       # Run/build/deploy instructions
└── Dockerfile                      # Optional self-host container
```

**Structure Decision**: Next.js App Router with `src/` containing `app/` (routes), `components/` (MVP buckets), `content/` (typed static data), `i18n/` (locale catalogs), and `lib/` (shared utilities). No `backend/`, `api/`, `tests/` subtrees are needed — v1 is frontend-only with manual smoke / Lighthouse validation.

## Complexity Tracking

> No constitution violations; complexity-tracking table is empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| _(none)_  | —          | —                                    |
