# Phase 0 — Research & Decisions

**Date**: 2026-09-26 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

> All `NEEDS CLARIFICATION` markers from Technical Context are resolved below. Each decision records rationale and rejected alternatives.

## Decision 1 — Framework: Next.js (latest stable, App Router)

**Decision**: Use **Next.js** with the **App Router**, **TypeScript strict**, and **React Server Components by default**. The user explicitly requested "Next.js version mới nhất".

**Rationale**:

- The user explicitly requested Next.js (latest stable). App Router is the recommended path for new builds.
- App Router gives us **file-system routing** (Home, Products list, Products detail, About, Contact) without a custom router.
- **Server Components by default** means our static product / about / company content can be rendered on the server — zero JS shipped for those payloads, and Lighthouse Performance stays high.
- Built-in **i18n routing** (or `next-intl`) integrates cleanly with App Router.
- Built-in **image optimization** (`next/image`) handles responsive images for mock product visuals.
- **Self-host friendly**: Next.js supports a `standalone` build output that packages only the runtime files needed for a Node process — ideal for a VPS / Docker container.

**Alternatives considered**:

- **Astro**: Best for content-heavy sites with islands of interactivity. Slightly less ecosystem support for the GSAP + premium-animation feel we want. Doesn't fit user's explicit Next.js request.
- **Pure React + Vite**: No SSR / SSG out of the box; we'd have to bolt on routing, image opt, i18n, etc. More moving parts, slower Lighthouse on first paint.
- **Remix**: Excellent server-first story, but the user asked for Next.js explicitly.
- **Static HTML/CSS/JS**: Cheapest to host, but loses us i18n routing, theme persistence without FOUC, and server-rendered metadata for SEO.

**Open follow-up (not blocking planning)**: Confirm the actual latest stable version at install time. As of plan authoring, Next.js 15.x / 16.x are current; the implementation phase will pin whatever `npm view next version` returns as latest stable, and lock to that.

## Decision 2 — Styling: Tailwind CSS v4 (theme tokens via CSS variables)

**Decision**: Use **Tailwind CSS v4** with **CSS custom properties** for theme tokens (light + dark). Tailwind's v4 `@theme` directive lets us declare design tokens that auto-generate utilities.

**Rationale**:

- Fast iteration for a content site with predictable component blocks.
- v4's CSS-variable-driven theming is the cleanest way to power a **light + dark toggle with no flash of unstyled content** — variables resolve before paint.
- Plays well with **GSAP** (no runtime CSS-in-JS overhead, no FOUC).
- Compatible with the user's mention of `shadcn` MCP — `shadcn/ui` primitives work on top of Tailwind.

**Alternatives considered**:

- **CSS Modules**: Fine, but adds boilerplate per component and doesn't give us the same density of utility classes.
- **styled-components / Emotion**: Runtime cost + FOUC risk for theme switching. Not worth it for a content site.
- **Vanilla CSS with BEM**: Too slow for the iteration speed we want; harder to keep tokens consistent across components.

## Decision 3 — Animation: GSAP + ScrollTrigger (deferred / dynamic)

**Decision**: Use **GSAP 3.x** with the free **ScrollTrigger** plugin. Load on the client only — never ship GSAP on the server.

**Rationale**:

- GSAP is the de-facto standard for the kind of **hallmark / Awwwards-tier** animation the user requested (logo motion, hero reveals, scroll-triggered section intros, hover micro-interactions).
- ScrollTrigger is the only plugin we need for "scroll-driven storytelling" — no need for the full GSAP bonus plugins (SplitText, MorphSVG, etc.).
- Bundle impact: GSAP is ~50 KB gzipped. We can **dynamic-import** the animation bundle on the client (via `next/dynamic` with `ssr: false`) so the homepage's first paint is not blocked.
- **`prefers-reduced-motion: reduce`**: every animation is gated by a check at startup; reduced-motion users get a static final state with zero transforms.

**Alternatives considered**:

- **Framer Motion** (now `motion`): Excellent for component-level animation, weaker for choreographed scroll-driven sequences. Adds React coupling.
- **Lottie / Rive**: Good for embedded vector animations, but overkill for site-wide reveal patterns.
- **CSS-only animations**: Limited for scroll-triggered, sequence-driven motion. Doesn't hit the "hallmark" bar.

**Pairing with smooth scroll**: **Lenis** (~3 KB gzipped) for buttery scroll, wired to ScrollTrigger so reveals sync to scroll velocity. Disabled entirely under `prefers-reduced-motion`.

## Decision 4 — Internationalization: next-intl

**Decision**: Use **next-intl** for `vi` (default) / `en` bilingual support, with a header switcher.

**Rationale**:

- **next-intl** is the most actively maintained i18n library for the Next.js App Router. Supports locale-based routing (`/vi/...`, `/en/...`) or locale-prefix-free routing with a cookie / header — we'll pick the simpler **locale-prefix-free** approach with a session cookie so the URLs stay clean (`/products`, not `/vi/products`).
- **Server Component friendly**: messages can be loaded on the server, no client-side fetch flicker.
- The bilingual content in our `src/content/*.ts` data files uses a `{ vi, en }` shape; the message catalogs `src/i18n/{vi,en}.json` cover all UI chrome strings (nav, buttons, error messages, footer).

**Alternatives considered**:

- **Built-in Next.js i18n routing** (legacy `i18n` config in `next.config`): Doesn't compose well with App Router. Deprecated for App Router projects.
- **next-i18next**: Built for the Pages Router; awkward on App Router.
- **Custom context-based i18n**: Reinventing the wheel — slow and error-prone for type-safety.

## Decision 5 — Theme Toggle: next-themes (class strategy)

**Decision**: Use **next-themes** with the **`class` strategy** — adds / removes a `dark` class on `<html>`. Default theme is **light**; the choice persists in `localStorage`.

**Rationale**:

- **Zero flash of unstyled content**: next-themes injects a tiny blocking script that sets the `dark` class **before** React hydrates. This is critical for Lighthouse + UX.
- **System-preference awareness**: respects `prefers-color-scheme` only on the very first visit (when there's no saved preference), then the explicit user choice takes over.
- Tiny footprint (~1 KB gzipped) — fits the "lean client bundle" goal.

**Alternatives considered**:

- **Custom cookie + SSR class injection**: Possible, but next-themes already solves it correctly with edge cases handled.
- **CSS-only via `prefers-color-scheme`**: No way for the user to override the OS preference; we need a toggle.

## Decision 6 — UI primitives (shadcn/ui — selective)

**Decision**: Adopt **shadcn/ui** primitives **selectively** — only what we need (likely `Button`, `Sheet` for mobile nav, `Tooltip` for status badges). Each primitive lives in `src/components/ui/` and is owned by us (copied, not installed as a dependency).

**Rationale**:

- shadcn primitives are **accessible by default** (Radix under the hood) — saves us a11y work.
- They sit naturally on top of Tailwind + CSS variables, so our theme tokens (light + dark) work without modification.
- Selective adoption keeps the bundle small; we don't ship a `node_modules`-style kitchen-sink.

**Alternatives considered**:

- **Headless UI**: Solid, but lower-level — we'd write more for the same primitive.
- **Radix UI directly**: Same idea as shadcn but without the pre-wired Tailwind styling; we'd style from scratch.
- **Roll-our-own**: Slower; risks subtle a11y bugs in interactive primitives.

## Decision 7 — Static content as typed data files

**Decision**: All structured content (products, company info, About copy) lives in **`src/content/*.ts`** as typed TypeScript files. Translation strings for UI chrome live in **`src/i18n/{vi,en}.json`**.

**Rationale**:

- **Type safety**: a single `Product` type gives us compile-time guarantees that each product has the required fields in both languages.
- **Build-time validation**: a quick `npm run check:content` script can verify every product has both `vi` and `en` translations, every status is valid, every slug is unique.
- **No CMS for v1** — keeps the surface area small, no auth, no admin UI to maintain.

**Alternatives considered**:

- **Markdown content collections** (Next.js Contentlayer / Velite): Overkill for 5 products.
- **JSON files**: Lose type safety.
- **MDX per product**: Verbose for short copy; we'd need a build pipeline.

## Decision 8 — Self-host deployment target

**Decision**: The build artifact runs on a plain **Node.js (≥ 22) process** behind a reverse proxy (nginx / Caddy). Provide a minimal **`Dockerfile`** as the recommended deployment path; running bare-metal with `npm run start` is also documented.

**Rationale**:

- Next.js `output: 'standalone'` produces a self-contained `server.js` + minimal `node_modules`, ideal for a small container.
- No vendor lock-in: this runs anywhere Node runs — Hetzner, DigitalOcean, an on-prem box, etc.
- A reverse proxy handles TLS, gzip, and static asset caching. The proxy config is **out of scope** for this spec but the README will sketch the standard pattern.

**Alternatives considered**:

- **Static export (`output: 'export'`)**: Eliminates the Node runtime but loses us server-rendered metadata per locale + dynamic OG images. Acceptable trade-off if SEO requirements stay light, but a Node runtime gives more flexibility for v1.5+.
- **Edge runtime**: Vendor-specific; conflicts with the self-host constraint.

## Decision 9 — Accessibility baseline

**Decision** (already in spec, re-confirmed here):

- **WCAG AA contrast** in both themes for all body text and interactive elements.
- **Keyboard navigation** for all interactive surfaces; visible focus rings.
- **Semantic HTML** (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- **`prefers-reduced-motion: reduce`** disables all non-essential animation; content remains accessible.
- **`lang` attribute** on `<html>` reflects the active locale.
- **`aria-label`** on icon-only buttons (theme toggle, language switcher).
- **Skip-to-content link** for keyboard users.

## Decisions deferred (no blocker)

- **Form backend**: Out of scope for v1 (spec confirmed no contact-form backend). Revisit if user requests it.
- **CMS**: Out of scope for v1.
- **Analytics**: Not mentioned in spec; will add a thin integration point (e.g., a single `<Analytics />` mount) when the user requests one.
- **Real product screenshots**: Vibeholic client work shouldn't expose real screenshots; the 4 prod products are mid-build. The plan uses **gradient-based mock UI frames** (`ProductMock` component) as honest stand-ins.
