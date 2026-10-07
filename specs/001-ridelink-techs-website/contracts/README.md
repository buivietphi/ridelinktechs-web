# UI Contracts — RideLink Techs Website

**Date**: 2026-09-26 | **Spec**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md)

> This folder documents the **shape of each public route** as a contract between the page composition and the visitor's expectations. Each contract defines: route path, primary purpose, required sections (in order), the entities it reads, the URL parameters it accepts, and the behavior on error / not-found.

---

## Contract: `GET /`

**Purpose**: First impression. Establish company identity, showcase the portfolio, give a fast path to contact.

**Reads**: `CompanyProfile`, `Product[]`, `AboutContent` (teaser only).

**Sections (top → bottom, in order)**:

1. **Header** (sticky, persistent across all routes)
2. **Hero** — animated logo + tagline + primary CTA → `/products`
3. **ProductGrid** — all 5 products grouped by `category` (prod block, then outsource block)
4. **AboutTeaser** — truncated story + CTA → `/about`
5. **ContactSection** — email, phone, address card
6. **Footer**

**A11y**:

- Hero is the `<main>` landmark.
- One `<h1>` (hero title), all other headings descend in correct order.
- All CTAs are real `<a>` or `<button>` elements, keyboard-reachable.

**Animation contract**:

- Hero intro plays once on mount.
- Each section reveals on scroll (GSAP ScrollTrigger), then locks.
- All animations short-circuit to static state under `prefers-reduced-motion: reduce`.

**i18n contract**:

- Hero title / subtitle, section headings, all CTAs are localized via `next-intl`.
- Product names / taglines come from the `Product` entity's `LocalizedString` fields.
- Teaser text comes from `AboutContent.story` (first paragraph only in `vi` and `en`).

**Errors**: Page must never error to the user; content is static. If a `Product` is somehow missing a field at build time, the build fails (caught by `scripts/check-content.mjs`).

---

## Contract: `GET /products`

**Purpose**: Browse the full portfolio.

**Reads**: `Product[]`.

**Sections (in order)**:

1. Header
2. Page title — "Sản phẩm" / "Products"
3. **Prod group** — heading "Sản phẩm RideLink Techs", grid of `ProductCard`s for in-house products
4. **Outsource group** — heading "Sản phẩm Outsource", grid of `ProductCard`s for outsource products (visually distinguished)
5. Footer

**Behavior**:

- Each `ProductCard` is a real link to `/products/[slug]`.
- Hover/focus state animates the card (gradient sheen + lift).

**i18n contract**:

- Section headings are message-catalog strings.
- Product copy is from the entity's localized fields.

**Errors**: Not applicable — content is static.

---

## Contract: `GET /products/[slug]`

**Purpose**: Show one product in depth.

**Reads**: one `Product` resolved by `slug`; `CompanyProfile` for the back-link CTA in the footer.

**URL parameter**:

- `slug` — kebab-case. Must match a known product.

**Sections (in order)**:

1. Header
2. Breadcrumb — Home / Products / `<Product Name>`
3. **ProductDetail hero** — name, status badge, tagline, primary visual (mock)
4. **Body** — description, optional problem / targetUser, timeline pill row
5. **Secondary visuals** — additional mock screens (1–3)
6. CTA strip — "Quay lại danh sách sản phẩm" / "Back to products" → `/products`, and "Liên hệ hợp tác" / "Contact us" → `/contact`
7. Footer

**Behavior on unknown slug**:

- App Router returns a built-in 404 (via `notFound()` from `next/navigation`).
- 404 page itself follows the site's layout (Header + Footer + simple "Không tìm thấy" / "Not found" message + CTA home).

**i18n contract**:

- All visible strings from the product entity's localized fields.
- Section labels (breadcrumb, CTAs) from the message catalog.

**Errors**: Unknown slug → 404 with friendly localized message.

---

## Contract: `GET /about`

**Purpose**: Tell the company's story.

**Reads**: `AboutContent`; `CompanyProfile` (footer signature).

**Sections (in order)**:

1. Header
2. About hero — title + subtitle
3. **Story** — long-form paragraphs
4. **Mission** — single statement, typographically elevated
5. **Focus areas** — grid of 3–6 `FocusArea` cards
6. **Team** (optional) — grid of `TeamMember` cards if `teamMembers` is non-empty
7. CTA strip — "Liên hệ với chúng tôi" / "Get in touch" → `/contact`
8. Footer

**Behavior**:

- Section reveals stagger as the visitor scrolls.
- If `teamMembers` is empty (v1 may launch without team cards), the Team section is omitted entirely (no empty-state placeholder).

**i18n contract**:

- All copy from `AboutContent`'s localized fields.
- Section labels from the message catalog.

**Errors**: Not applicable.

---

## Contract: `GET /contact`

**Purpose**: Provide every way to reach the team.

**Reads**: `CompanyProfile`.

**Sections (in order)**:

1. Header
2. Page title — "Liên hệ" / "Contact"
3. Email block — icon + `support@ridelinktechs.com` as a `mailto:` link
4. Phone block — icon + `0967329308` as a `tel:` link
5. Address block — icon + full address
6. (Optional) Map embed — out of scope for v1; address text only
7. Footer

**Behavior**:

- All three blocks are clickable / tappable on supported devices.
- `mailto:` opens the user's mail client pre-filled.
- `tel:` opens the dialer on mobile devices.

**i18n contract**:

- Section labels from the message catalog.
- Address uses `CompanyProfile.address` localized field.

**Errors**: Not applicable.

---

## Cross-route contracts

### Theme toggle (Header)

- Present in `Header` on every page.
- Click cycles `light` → `dark` → `light`.
- Choice persists in `localStorage` under next-themes' default key.
- Choice applies via a `dark` class on `<html>`.
- No FOUC: next-themes' blocking script sets the class before React hydrates.

### Language switcher (Header)

- Present in `Header` on every page.
- Visible options: `Tiếng Việt` (default, marked as "active" when locale is `vi`), `English`.
- Switching language updates the UI immediately without a page reload (client-side locale swap).
- Choice persists for the session via cookie.
- `<html lang>` attribute updates to match the active locale.

### Sticky header behavior

- `Header` is `position: sticky; top: 0`.
- Becomes opaque / adds a backdrop blur once the visitor scrolls past the hero.
- Hides itself when scrolled down, shows when scrolled up (auto-hide behavior — optional, can be disabled if it feels noisy on touch devices).

### 404 page

- Matches the site layout (Header + Footer).
- Friendly bilingual message.
- CTA back to `/`.

### Sitemap & robots

- `/sitemap.xml` lists all static routes and all `Product` slugs.
- `/robots.txt` allows all, points to the sitemap.
