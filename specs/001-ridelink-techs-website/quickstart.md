# Quickstart — Validation Guide

**Date**: 2026-09-26 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

> A runnable guide to verify the feature works end-to-end after implementation. Use this in CI smoke tests, manual QA, and stakeholder demos. Implementation details belong in `tasks.md` (Phase 2); this document stays focused on **what to verify and how to verify it**.

---

## Prerequisites

- Node.js ≥ 22 LTS
- npm ≥ 10 (or pnpm / yarn — the implementation will pick one)
- A modern browser (Chrome / Edge / Firefox / Safari latest 2 versions)
- 10 minutes for the full smoke pass

## Setup

```bash
# Install dependencies
npm install

# Verify content + i18n parity
npm run check:content
npm run check:i18n

# Start the dev server
npm run dev
# → http://localhost:3000
```

## Production build (self-host target)

```bash
# Build the standalone self-host output
npm run build

# Start the production server
npm run start
# → http://localhost:3000
```

Optional Docker self-host:

```bash
docker build -t ridelinks-techs-web .
docker run --rm -p 3000:3000 ridelinks-techs-web
```

---

## Scenario 1 — Visitor lands on the homepage (P1)

**What it proves**: SC-001, SC-003, SC-006.

**Steps**:

1. Open `http://localhost:3000/` in a fresh browser tab.
2. **Observe** (without scrolling): the company logo + tagline are visible above the fold.
3. **Observe**: the primary CTA is visible.
4. **Scroll** past the hero. **Observe**: a labeled product section appears.
5. **Observe**: a clickable email link is visible somewhere in the visible region OR the contact section is reachable in ≤ 2 scrolls.

**Pass criteria**:

- All five observations hold within the first 5 seconds.
- Lighthouse Performance ≥ 85, Accessibility ≥ 90 on the homepage.

## Scenario 2 — Visitor switches language (bilingual)

**What it proves**: FR-014, SC-008.

**Steps**:

1. On any page, click the language switcher in the header.
2. Choose **English**.
3. **Observe**: nav labels, hero text, all visible CTAs, and footer copy are now in English.
4. Navigate to `/products`.
5. **Observe**: section headings and product taglines are in English.
6. Click the language switcher again, choose **Tiếng Việt**.
7. **Observe**: all UI returns to Vietnamese without a page reload.

**Pass criteria**:

- No key identifier / untranslated string is visible in either language.
- `<html lang>` attribute matches the active locale (`en` or `vi`).
- Choice persists across navigation within the session.

## Scenario 3 — Visitor toggles theme (light ↔ dark)

**What it proves**: FR-009, SC-006, SC-009.

**Steps**:

1. On any page, click the theme toggle.
2. **Observe**: the page transitions from light to dark without a flash.
3. Click it again.
4. **Observe**: the page returns to light.
5. Reload the page.
6. **Observe**: the theme choice persists.
7. **Observe**: in both themes, body text is legible (WCAG AA contrast).

**Pass criteria**:

- Theme choice persists across reload.
- Brand gradient (deep blue → magenta/purple → cyan) remains visible on the hero in both themes.

## Scenario 4 — Visitor browses the portfolio

**What it proves**: User Story 2, SC-002.

**Steps**:

1. Navigate to `/products`.
2. **Observe**: two labeled groups are visible — "Sản phẩm RideLink Techs" (4 cards) and "Sản phẩm Outsource" (1 card).
3. **Observe**: each card shows the product name, tagline, status badge, and idea → dev-start timeline.
4. **Observe**: the outsource card is visually distinguished from the prod cards (different badge or styling).
5. Hover over any card.
6. **Observe**: hover animation plays.

**Pass criteria**:

- 5 product cards visible (4 prod + 1 outsource).
- Each card links to its `/products/[slug]` route.

## Scenario 5 — Visitor opens a product detail page

**What it proves**: User Story 3.

**Steps**:

1. From `/products`, click the **Ridelink Go** card.
2. **Observe**: the URL is `/products/ridelink-go`.
3. **Observe**: the page header shows the product name and a status banner ("Đang phát triển" / "In development").
4. **Observe**: an extended description and at least one visual mock are visible below the fold.
5. **Observe**: a back-to-portfolio link / breadcrumb is visible.
6. **Click** the back link.
7. **Observe**: the visitor returns to `/products`.

**Pass criteria**:

- All 5 product slugs route correctly.
- Unknown slug (e.g., `/products/nope`) returns the site's 404 page.

## Scenario 6 — Visitor reads the About page

**What it proves**: User Story 6.

**Steps**:

1. From the homepage or header nav, click the About link.
2. **Observe**: the URL is `/about`.
3. **Observe**: at least 3 distinct sections of content (story, mission, focus areas).
4. **Observe**: a CTA linking to `/contact` is visible.
5. Click the CTA.
6. **Observe**: the visitor is taken to `/contact`.

**Pass criteria**:

- About page is reachable in one click from any other page.
- Content reflects real company facts (Đà Nẵng-based, Vietnamese, building mobile + web).

## Scenario 7 — Visitor contacts the company

**What it proves**: User Story 4, FR-007, FR-008, SC-007.

**Steps**:

1. Navigate to `/contact` (or scroll to the contact section on the homepage).
2. **Observe**: email `support@ridelinktechs.com`, phone `0967329308`, and the full address are visible.
3. Click the email link.
4. **Observe**: the user's mail client opens with `support@ridelinktechs.com` pre-filled in the "to" field.
5. (On a mobile device or emulator) Tap the phone link.
6. **Observe**: the dialer opens with `+84967329308` ready to call.

**Pass criteria**:

- All three contact methods reachable from the contact page and from the footer of every other page.

## Scenario 8 — Responsive layout

**What it proves**: FR-010, SC-004.

**Steps**:

1. Open the site in a browser.
2. Resize the viewport to each of: 320, 375, 768, 1024, 1440.
3. For each width:
   - **Observe**: no horizontal scrollbar.
   - **Observe**: nav becomes a hamburger menu at narrow widths.
   - **Observe**: typography is legible without zoom.

**Pass criteria**:

- No layout breakage at any of the 5 target widths.
- Tap targets on mobile are ≥ 44×44 px.

## Scenario 9 — Reduced motion

**What it proves**: FR-011, FR-013, SC-005.

**Steps**:

1. In the OS, enable "Reduce motion" (macOS: Accessibility → Display → Reduce motion; Windows: Settings → Accessibility → Visual effects → Animation effects off).
2. Reload the site.
3. **Observe**: hero animation does NOT play; the hero is in its final state immediately.
4. **Scroll** through every page.
5. **Observe**: no scroll-triggered reveals play; content is in its final position immediately.
6. **Observe**: all content is reachable and legible.

**Pass criteria**:

- No non-essential animation plays.
- All content remains accessible and visible.

## Scenario 10 — Keyboard navigation

**What it proves**: FR-013.

**Steps**:

1. Reload the site with the mouse untouched.
2. Press **Tab** repeatedly from the top of the page.
3. **Observe**: focus moves through nav, CTAs, and interactive elements in a logical order.
4. **Observe**: the currently focused element has a visible focus ring.
5. **Enter** on the language switcher — observe the menu opens.
6. **Tab** through the menu options; **Enter** selects.
7. Same drill for the theme toggle.

**Pass criteria**:

- Every interactive element is reachable by keyboard.
- Focus rings are clearly visible in both themes.

---

## Build-time gates

These run automatically on `npm run check` / `npm run build`:

| Check            | Command                 | What it verifies                                                                                              |
| ---------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------- |
| TypeScript       | `npm run typecheck`     | All `.ts` / `.tsx` compile under strict mode.                                                                 |
| ESLint           | `npm run lint`          | Lint passes.                                                                                                  |
| Prettier         | `npm run format:check`  | Formatting passes.                                                                                            |
| Content parity   | `npm run check:content` | All `Product` entries have bilingual fields, valid slugs, valid status. See [data-model.md](./data-model.md). |
| i18n parity      | `npm run check:i18n`    | Every key in `vi.json` exists in `en.json` and vice versa.                                                    |
| Production build | `npm run build`         | Next.js builds successfully (standalone output).                                                              |

Any failure blocks deploy.

---

## Acceptance summary

The feature is **shippable** when:

- All 10 manual scenarios above pass.
- Lighthouse Production scores (homepage, in production build): Performance ≥ 85, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90.
- All build-time gates pass.
- Content (taglines, descriptions, About copy) has been reviewed by the user / stakeholder before public deploy.
