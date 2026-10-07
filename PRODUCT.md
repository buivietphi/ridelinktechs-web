<!-- impeccable:product-schema 1 -->

# Product

**Project**: RideLink Techs — Corporate Website
**Owner**: RideLink Techs (Đà Nẵng, Việt Nam)
**Status**: v1 — greenfield, design phase complete (spec/plan/research/data-model/contracts/quickstart/tasks all generated via Spec Kit on 2026-09-26)
**Source artifacts**: [specs/001-ridelink-techs-website/](specs/001-ridelink-techs-website/spec.md)

---

## Platform

web

## Stack

Next.js (latest stable) on App Router, TypeScript strict, Node.js ≥ 22 LTS runtime, Tailwind CSS v4, GSAP 3.x with ScrollTrigger + Lenis for premium motion, next-intl (vi default / en switchable), next-themes (class strategy, light default), lucide-react icons, selective shadcn/ui primitives. Output: `output: 'standalone'` for self-host (Dockerfile + bare-metal Node process).

**User-chosen** — explicitly confirmed via Spec Kit clarification Q5 (2026-09-26). MVP-style component organization with one component per file, named by purpose.

## Users

**Primary**: prospective clients evaluating RideLink Techs as a partner for in-house or outsource software work. They arrive from search, social, or referral; they need to form an opinion about the studio's credibility and capability within ~5 seconds.

**Secondary**: potential partners (co-development, integration), and job candidates evaluating the studio as a place to work.

**Situation**: A first-time visitor on the homepage, on desktop or mobile, often bilingual (Vietnamese or English). They want to (a) understand what the company does, (b) see evidence of past or in-progress work, (c) find a way to reach the team. They are not logged in, not returning visitors, and not authenticated.

## Product Purpose

The website is the **primary marketing surface** for RideLink Techs. It exists to convert a curious visitor into a qualified lead by communicating the studio's identity, capabilities, and product portfolio, and giving them a frictionless path to contact the team via `mailto:` / `tel:`.

**Success** = a first-time visitor can identify the company, see the product portfolio, and find a clickable email contact within 5 seconds of landing. Source: [spec.md SC-001](specs/001-ridelink-techs-website/spec.md).

## Positioning

A small Vietnamese tech studio with its **own in-house product line** (Ridelink Go, GlossLink Beautiful, Pawly, Motorbike Rescue — all in active development) plus a track record of **outsource delivery** (Vibeholic, a web project for a marketing-industry client). Distinct from generic agencies because the studio builds and ships its own products, not just billable hours.

## Operating Context

- **Geography**: Đà Nẵng, Việt Nam. Address: 14 Tân Thái 1, Phường Sơn Trà, Thành phố Đà Nẵng, Việt Nam.
- **Brand assets on hand**: [logo/](logo/) — `logo_congty.png` (light), `logo_congty_white.png` (dark). Color palette is logo-derived: deep blue (#1E3A8A / #1E40AF), magenta/purple (#A855F7 / #D946EF), cyan (#0EA5E9). Cover image `anh bia chplay (1).jpg` also present in [logo/](logo/) for marketing surface use.
- **Operating model**: small studio, lean team. Visitors should not be misled by fabrication — product status (in-development / upcoming) and outsource relationship are presented honestly.
- **Indexing**: site is intended to be publicly indexable; SEO and per-locale `<title>` / `<meta>` are in scope.
- **Out of scope for v1**: contact form backend, CMS, auth, e-commerce, analytics, team-roster display (deferred to v1.x).

## Capabilities and Constraints

**Capabilities (v1)**:

- Five public routes: `/`, `/products`, `/products/[slug]` (5 slugs), `/about`, `/contact`.
- Bilingual content: Vietnamese (default) + English, with a header switcher that updates the UI without page reload; `<html lang>` reflects the active locale.
- Light + dark themes with a header toggle; default light; choice persists across navigation and reloads via `localStorage`; no FOUC.
- Smooth, premium-tier animations (hero intro, scroll-revealed sections, hover micro-interactions) using GSAP + ScrollTrigger + Lenis, dynamic-imported on the client.
- Responsive from 320 px to 1440 px+; keyboard navigable; `prefers-reduced-motion` honored; WCAG AA contrast in both themes.
- SEO: per-page metadata, Open Graph + Twitter cards, sitemap.xml, robots.txt, canonical URLs.

**Constraints**:

- **Self-host only**: production artifact MUST run on a plain Node.js process (VPS / Docker container). No Vercel-only or edge-only primitives in the critical path. Reverse-proxy details are out of scope.
- **MVP code organization**: small focused components, one per file, named clearly. No premature abstractions, no god-components.
- **Bilingual completeness**: every visible string has a translation in both `vi.json` and `en.json`. No fallback English / key identifiers shown to visitors. Enforced by `npm run check:i18n`.
- **Content is data**: all product, company, and About copy lives in `src/content/*.ts` typed modules. Updates do not require redesign. Enforced by `npm run check:content`.
- **Performance budget**: Lighthouse Performance ≥ 85 on the homepage; LCP < 1.5 s; CLS < 0.05; first-load JS ≤ 200 KB gzipped excluding deferred animation libs.

**Explicitly undecided**:

- Team roster — `teamMembers` is optional in the data model; v1 may launch without team cards. Decision deferred until user provides names + roles + bios.
- Custom domain / final public URL — `ridelinktechs.com` mentioned in the spec as illustrative, not confirmed.
- Contact form backend — out of scope for v1 per spec.
- Analytics — not requested in spec; thin mount point may be added in v1.x if requested.

## Brand Commitments

- **Name**: RideLink Techs (fixed).
- **Logo**: `logo_congty.png` (light theme) and `logo_congty_white.png` (dark theme) are the only authorized logo files. Both are bound to logo-derived color tokens.
- **Color palette**: deep blue → magenta/purple → cyan gradient. Visible on the homepage hero in both light and dark themes (per SC-006). No additional accent colors are added without owner approval.
- **Typography**: not yet pinned. Visual-world decisions (font choice, scale) are recorded in `DESIGN.md` via `/impeccable shape` or `/impeccable document`, not in PRODUCT.md.
- **Voice**: professional, modern, slightly bold — consistent with the gradient, motion-line logo aesthetic. The user has indicated a strong preference for hallmark / Awwwards-tier visuals; this is a behavior commitment (animation quality, layout polish) but the specific aesthetic direction is set in `DESIGN.md` via `/impeccable shape`, not invented here.
- **Bilingual**: every visitor-facing string has a Vietnamese and an English form. The user is Vietnamese; the studio works in both languages.

## Evidence on Hand

| Asset                         | Path                                                                              | Status                                                                                                                                                                                                                                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Logo (light)                  | [logo/logo_congty.png](logo/logo_congty.png)                                      | Provided by user                                                                                                                                                                                                                                                                                         |
| Logo (dark)                   | [logo/logo_congty_white.png](logo/logo_congty_white.png)                          | Provided by user                                                                                                                                                                                                                                                                                         |
| Marketing cover               | [logo/anh bia chplay (1).jpg](logo/anh bia chplay (1).jpg)                        | Provided by user                                                                                                                                                                                                                                                                                         |
| Spec artifacts                | [specs/001-ridelink-techs-website/](specs/001-ridelink-techs-website/)            | Generated via Spec Kit                                                                                                                                                                                                                                                                                   |
| Contact info                  | `support@ridelinktechs.com`, `0967329308`, 14 Tân Thái 1, Phường Sơn Trà, Đà Nẵng | Confirmed                                                                                                                                                                                                                                                                                                |
| Product facts                 | 4 in-house + 1 outsource, with timelines and statuses                             | Confirmed in spec / data-model                                                                                                                                                                                                                                                                           |
| Product screenshots / mockups | **None**                                                                          | **Not fabricated.** v1 ships with gradient-frame placeholders only — every product card renders a Tailwind gradient frame derived from the brand palette, labeled with the product name + tagline + status. Real screenshots, when supplied, replace the gradient frame via the `ProductMock` component. |

**Absences future work must NOT fabricate**: client testimonials, named customers beyond the confirmed outsource engagement (Vibeholic, marketing-industry, client name not displayed), team-member names, awards, metrics, press quotes, or specific product screenshots. The outsource relationship for Vibeholic is honored without naming the client.

## Product Principles

1. **The logo sets the palette.** All accent color decisions trace back to the logo gradient. Adding a new color is a deliberate act, not a default.
2. **Bilingual parity is non-negotiable.** No visitor ever sees a missing translation or a key identifier. Both languages are first-class.
3. **Honest product representation.** In-development products say "đang phát triển" / "in development". Outsource work is clearly credited as client work. Never fabricate a launch date, a customer, or a screenshot.
4. **Animation serves the brand, not the eye candy.** GSAP-driven motion is hallmark-tier but always gated by `prefers-reduced-motion` and always subordinate to content readability.
5. **Self-host portability.** The build artifact runs anywhere Node runs. No vendor lock-in.

## Accessibility & Inclusion

- WCAG AA contrast for all text and interactive elements in **both** themes.
- Full keyboard navigation with visible focus rings.
- Semantic HTML landmarks (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`).
- `prefers-reduced-motion: reduce` disables all non-essential animation; content remains accessible and visible.
- `lang` attribute on `<html>` reflects the active locale.
- `aria-label` on icon-only buttons (theme toggle, language switcher).
- Skip-to-content link for keyboard users.
- Tap targets ≥ 44 × 44 px on mobile.
- Works at viewport widths from 320 px upward.
