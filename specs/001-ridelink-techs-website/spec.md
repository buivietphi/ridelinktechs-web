# Feature Specification: RideLink Techs Corporate Website

**Feature Branch**: `[001-ridelink-techs-website]`

**Created**: 2026-09-26

**Status**: Draft

**Input**: User description: "tôi muốn làm 1 trang web của công ty tôi, công ty tên RideLink Techs ... đưa ra dự án prod và outsource ... mail support@ridelinktechs.com, sdt 0967329308, địa chỉ 14 Tân Thái 1..."

## Clarifications

### Session 2026-09-26

- Q: Ngôn ngữ nào là ngôn ngữ chính cho nội dung website? → A: Song ngữ hoàn toàn — tiếng Việt là chính, tiếng Anh là phụ, có chuyển đổi ngôn ngữ (language switcher) trên web; ngôn ngữ mặc định là tiếng Việt.
- Q: Theme màu chính của website nên là gì? → A: Cả hai theme (light + dark) với toggle; mặc định là light.
- Q: Sản phẩm outsource Vibeholic — ngành / tagline là gì? → A: Dự án web cho khách hàng bên ngành marketing.
- Q: Phần "Thông tin công ty" / About nên được đặt ở đâu? → A: Một section ngắn trên homepage giới thiệu nhanh + một trang About riêng (route `/about`) với nội dung đầy đủ.
- Q: Bạn dự định deploy website lên đâu? → A: Self-host. (Build target phải tương thích self-host — tức là có thể chạy được trên một VPS riêng hoặc container, không phụ thuộc vào nền tảng cloud cụ thể.)
- Q: Hạ tầng / framework mong muốn? → A: Next.js (phiên bản mới nhất), tổ chức code theo phong cách MVP với component được đặt tên rõ ràng.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - First-time visitor explores the company homepage (Priority: P1)

A prospective client, partner, or candidate lands on the RideLink Techs homepage from a search, a shared link, or social media. They immediately understand who RideLink Techs is, what products the company builds, and how to reach the team. The page feels modern, on-brand (color palette derived from the company logo: deep blue → magenta/purple → cyan gradient), and visually polished — leaving a strong first impression of a credible Vietnamese tech studio. The homepage includes a short "About" teaser section that links to the full About page.

**Why this priority**: The homepage is the single highest-traffic entry point. It must communicate brand identity, the product portfolio, and contact info within seconds. Without a compelling landing experience, every other page loses conversion potential.

**Independent Test**: Can be fully tested by visiting the site root in a browser on desktop and mobile, with no navigation prior, and verifying that within 5 seconds the visitor can: (a) identify the company name and tagline, (b) see at least one product preview, (c) locate a working contact method (email or phone), (d) see a short About teaser with a link to the full About page.

**Acceptance Scenarios**:

1. **Given** a visitor arrives at the homepage, **When** the page loads, **Then** the company logo and tagline are visible above the fold within 1 second.
2. **Given** the homepage hero finishes animating in, **When** the visitor scrolls past the hero, **Then** they see at least one clearly labeled section introducing the company's products.
3. **Given** the visitor scrolls the homepage, **When** they reach the About teaser, **Then** a link/CTA to `/about` is visible and clickable.
4. **Given** the visitor is on any device width ≥ 320px, **When** the page renders, **Then** layout, typography, and animations adapt without horizontal scroll or broken elements.

---

### User Story 2 - Visitor browses the product portfolio (Priority: P1)

A visitor wants to evaluate whether RideLink Techs is a credible partner. They navigate to the Products section to see what the company has built. The portfolio is split into two clearly distinguishable categories: **in-house (prod)** products that the company owns and is actively developing, and **outsourced** products built for external clients. Each product entry shows: name, a one-line description, a representative visual / mock UI, current status (e.g., "in development"), and the timeline (idea → start of dev).

**Why this priority**: The portfolio is the company's primary sales asset on the website. It distinguishes RideLink Techs from generic agencies and signals depth of execution.

**Independent Test**: Can be tested by navigating to the Products page (or section) and verifying that each prod product is shown with the agreed status and that the outsource product is clearly labeled as client work.

**Acceptance Scenarios**:

1. **Given** the visitor reaches the Products page, **When** it loads, **Then** they see two labeled groups: "Sản phẩm RideLink Techs" (prod) and "Sản phẩm Outsource".
2. **Given** the visitor views a prod product card, **When** they hover/tap it, **Then** they see the product name, a brief description, an "in development / ongoing" status indicator, and the idea-to-dev timeline.
3. **Given** the visitor views the outsource product, **When** they look at it, **Then** it is visually distinguished from prod (e.g., different badge or tag) and clearly credited as client work.

---

### User Story 3 - Visitor opens a product detail page (Priority: P2)

A visitor interested in a specific product (e.g., Ridelink Go) clicks into its detail page to learn more. The detail page expands on the product: longer description, mock UI screens or visual, problem solved, target user, and a "coming soon" / "in development" status banner. There is no public live link or download — only a teaser.

**Why this priority**: Detail pages are P2 because the homepage + product list can already communicate the portfolio. They deepen the experience for serious evaluators but are not required for a viable v1.

**Independent Test**: Can be tested by clicking any product card on the Products page and verifying a dedicated route exists with that product's expanded content.

**Acceptance Scenarios**:

1. **Given** the visitor clicks on a product card, **When** the detail page loads, **Then** the page header shows the product name and a clear status banner ("Đang phát triển" / "In development" / "Outsource — client work").
2. **Given** the visitor is on a product detail page, **When** they scroll, **Then** they see an expanded description and at least one visual (mock UI screenshot or logo).
3. **Given** the visitor is on a product detail page, **When** they want to return, **Then** a back-to-portfolio link or breadcrumb is visible.

---

### User Story 4 - Visitor contacts the company (Priority: P2)

A visitor is ready to reach out — for a partnership, a job inquiry, or a service request. They look for the Contact page or section and find: a working email link, the company phone number, the company address, and (optionally) a contact form. Each contact method is one click/tap away.

**Why this priority**: Contact is P2 because most visitors first browse, then contact. It must be reachable from the navigation and the homepage CTA, but the form does not need to be live in v1 if email + phone are visible.

**Independent Test**: Can be tested by locating the Contact section/page from any other page (via nav or footer) and verifying that email, phone, and address are displayed with at least one of them being directly actionable (clickable mailto/tel).

**Acceptance Scenarios**:

1. **Given** the visitor reaches the Contact section, **When** it loads, **Then** the email `support@ridelinktechs.com`, the phone `0967329308`, and the company address are visible.
2. **Given** the visitor clicks the email link, **When** their mail client opens, **Then** the "to" field is pre-filled with `support@ridelinktechs.com`.
3. **Given** the visitor clicks the phone link on a mobile device, **When** the tap registers, **Then** the dialer opens with `0967329308` ready to call.

---

### User Story 6 - Visitor reads the full About page (Priority: P3)

A visitor who wants to know more about RideLink Techs — its story, mission, team, and values — clicks into the About page from the homepage teaser or the navigation. They find a richer, longer-form view: company story, mission statement, what the team focuses on, and (optionally) team member cards. The page is honest about the company's current stage and uses real facts (Đà Nẵng-based, Vietnamese, building mobile + web products).

**Why this priority**: About page is P3 — it adds depth for evaluators and partners but is not on the critical path for a v1 marketing site. Without it the site still works; with it the site feels more trustworthy.

**Independent Test**: Can be tested by clicking the About CTA from the homepage or nav, reaching `/about`, and verifying that an extended company description is visible (longer than the homepage teaser), with at least 3 distinct sections of content (e.g., story, mission, focus areas).

**Acceptance Scenarios**:

1. **Given** the visitor clicks the About CTA from the homepage or nav, **When** the About page loads, **Then** the URL is `/about` and the page is reachable in one click from anywhere in the site.
2. **Given** the visitor reads the About page, **When** they scroll, **Then** they see the extended story / mission / focus areas in clearly distinguished sections.
3. **Given** the visitor is on the About page, **When** they want to contact the team, **Then** a CTA linking to `/contact` is visible.

---

### User Story 5 - Visitor navigates the site smoothly (Priority: P1)

A visitor moves between Home / Products / Product detail / Contact using the navigation bar. On scroll, the navigation stays accessible. A language switcher in the header lets the visitor toggle between Vietnamese and English instantly. Page transitions are smooth, animations feel intentional, and the site never feels like a static brochure — but it never gets in the way either. Animations respect `prefers-reduced-motion`.

**Why this priority**: Polish is a stated priority (the user wants hallmark-quality visuals and GSAP animations). A janky navigation immediately destroys credibility. Bilingual support with a switcher is a confirmed requirement.

**Independent Test**: Can be tested by navigating between every public route and verifying smooth transitions, persistent nav, no broken links, no layout shift on scroll. Can also be tested by switching the language from any page and verifying that all visible copy updates to the chosen language without losing navigation state.

**Acceptance Scenarios**:

1. **Given** the visitor is on any page, **When** they use the nav bar, **Then** they can reach Home, Products, and Contact within one click.
2. **Given** the visitor is on any page, **When** they use the language switcher to choose `en`, **Then** all user-facing copy on the current page (and the rest of the site) is rendered in English.
3. **Given** the visitor has `prefers-reduced-motion: reduce` set in their OS, **When** any animation is about to play, **Then** it is either disabled or replaced with a static state.
4. **Given** the visitor scrolls past the hero, **When** the nav reaches the top, **Then** it remains visible (sticky / fixed).

---

### Edge Cases

- **Visitor with very slow network / no JS**: Core content (company name, products list, contact info) must still be reachable — either via SSR/SSG or graceful fallback. Animations must not block content.
- **Visitor on a 320px-wide phone**: All sections must remain legible and tappable; no horizontal scroll.
- **Visitor who lands directly on a product detail page (deep link)**: Must still be able to navigate to the rest of the site from there.
- **Product information changes (e.g., a project launches)**: Status indicators must be easy to update without a redesign — content is data-driven from a single source.
- **Outsource product confidentiality**: The outsource product is shown publicly but must not misrepresent the relationship — clearly tagged as client work.
- **Outsource product "Vibeholic" content gap**: The user has confirmed the outsource product name is **Vibeholic**, but a detailed description / industry / client for it has not yet been provided. The website should display the name, the "outsource / client work" tag, and a generic visual mock — without fabricating details. A short description can be supplied later without restructuring the page.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The site MUST render a multi-route experience with at minimum: Home (`/`), Products list (`/products`), Product detail (one route per product), About (`/about`), and Contact (`/contact`).
- **FR-002**: The site MUST display the company logo and tagline prominently on the homepage hero.
- **FR-003**: The site MUST present two distinct product groupings: in-house (prod) and outsourced (outsource).
- **FR-004**: The site MUST list the following in-house (prod) products with the statuses and timelines the user provided:
  - **Ridelink Go** — idea Aug 2024 → dev start Aug 2025 → currently in development
  - **GlossLink Beautiful** — idea Apr 2025 → dev start Jun 2026 → upcoming
  - **Pawly** — idea Dec 2025 → dev start Jul 2026 → upcoming
  - **Motorbike Rescue** — in development (motorbike rescue / repair service)
- **FR-005**: The site MUST list the outsource product **Vibeholic** as a clearly labeled client-work entry, distinct from in-house products.
- **FR-006**: Each product entry MUST show: product name, short description, visual/mock UI, status, and timeline (idea → start of dev where applicable).
- **FR-007**: The Contact section/page MUST display: email `support@ridelinktechs.com`, phone `0967329308`, and the company address `14 Tân Thái 1, Phường Sơn Trà, Thành phố Đà Nẵng, Việt Nam`.
- **FR-008**: The email link MUST be a `mailto:` to `support@ridelinktechs.com`. The phone link MUST be a `tel:` link to `+84967329308`.
- **FR-009**: The site MUST support both light and dark themes with a user-toggleable switch in the header. The default theme on first visit is **light**; the user's choice persists within the session. Both themes MUST use the logo-derived accent palette (deep blue, magenta/purple, cyan) and pass WCAG AA contrast for all text and interactive elements.
- **FR-010**: The site MUST be responsive across desktop, tablet, and mobile (≥ 320px width).
- **FR-011**: The site MUST include smooth, intentional animations (intro, scroll-triggered, hover) consistent with a premium tech-company feel, while honoring `prefers-reduced-motion`.
- **FR-012**: The site MUST load and display core content (company name, product list, contact) within 3 seconds on a typical 4G connection.
- **FR-013**: All interactive elements MUST have keyboard-accessible focus states and sufficient color contrast.
- **FR-014**: The site MUST be fully bilingual (Vietnamese primary, English secondary) with a visible language switcher in the navigation/header so visitors can switch the entire UI between `vi` and `en` at any time. Vietnamese is the default language on first visit; the user's choice persists across pages within the session.
- **FR-015**: The site MUST include a footer with company name, contact summary, and (optionally) social placeholders.

### Key Entities _(include if feature involves data)_

- **Product**: Represents a single product card / detail page. Attributes: `id`, `slug`, `name`, `category` (prod | outsource), `tagline` (vi, en), `description` (vi, en), `status` (in-development | upcoming | shipped), `ideaDate`, `devStartDate`, `coverImage`, `mockScreens` (list), `clientName` (only for outsource — not displayed publicly for Vibeholic).
- **CompanyProfile**: Single global entity holding company facts. Attributes: `name`, `tagline` (vi, en), `email`, `phone`, `address`, `socials`, `logoLight`, `logoDark`.
- **AboutContent**: Single global entity holding About-page copy. Attributes: `story` (vi, en), `mission` (vi, en), `focusAreas` (list of {title, description} in vi/en), `teamMembers` (optional list of {name, role, avatar, bio}).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A first-time visitor can identify the company name, see at least one product, and find a clickable email contact within 5 seconds of landing on the homepage (measured by manual review against an information-architecture checklist).
- **SC-002**: All five products (4 prod + 1 outsource) are reachable from the Products page or homepage within 2 clicks.
- **SC-003**: The site achieves a Lighthouse Performance score ≥ 85 and Accessibility score ≥ 90 on the homepage in production build.
- **SC-004**: The site renders without horizontal scroll or broken layout at viewport widths of 320px, 375px, 768px, 1024px, and 1440px.
- **SC-005**: With `prefers-reduced-motion: reduce` enabled, no non-essential animation plays and all content remains visible and accessible.
- **SC-006**: Color palette is consistent with the logo across all pages: deep blue, magenta/purple, and cyan are visible on the homepage hero in both light and dark themes.
- **SC-009**: A theme toggle is available from every page; toggling switches the entire UI between light and dark with no flash of unstyled content, and the choice persists across navigation within the session.
- **SC-007**: Email link, phone link, and address are reachable from every page (via nav or footer) within one click.
- **SC-008**: When the visitor switches the language to `en` from any page, all user-facing copy (nav, hero, product cards, detail pages, contact, footer) updates to English without page reload and without broken/missing translations.

## Assumptions

- The website is the primary marketing surface for RideLink Techs, targeting prospective clients, partners, and job candidates who speak Vietnamese and/or English.
- "Prod" products are in-house and currently being built. Their public representation should be honest ("đang phát triển" / "in development") — not over-promised.
- The outsource product shown is representative of past client work. Confidential details are not required to be displayed; a name, category, and visual mock are sufficient.
- Product information (names, timelines, status) will be supplied as structured data so that updates do not require redesign.
- The site will be deployed to a public URL (e.g., `ridelinktechs.com` or a subdomain) and is intended to be indexable by search engines.
- v1 does not include a CMS or contact form backend — content is in code, and contact goes via mailto/tel.
- v1 does not include authentication, user accounts, or e-commerce functionality.
- The full company address is **14 Tân Thái 1, Phường Sơn Trà, Thành phố Đà Nẵng, Việt Nam** (clarified).
- The outsource product is named **Vibeholic** (clarified). It is a web project delivered for an external client in the **marketing industry**. Tagline for the website can be written as "Dự án web cho khách hàng ngành marketing" / "Web project for a marketing-industry client". Client name is not displayed publicly.
- The motorbike in-house product is named **Motorbike Rescue** (clarified). It is a motorbike rescue / repair service.
- The user has indicated a strong preference for premium / Awwwards-tier visuals with smooth animations; this influences the visual design choices but is captured in user stories, not implementation.
- Brand voice is professional, modern, slightly bold — consistent with the gradient, motion-line logo aesthetic.
- The site is fully bilingual (VI primary, EN secondary) with a switcher; default language is Vietnamese.
- The site must show product content (name, tagline, description, status, timeline) consistently across both languages — no language may show a partial translation or fall back to a key identifier visible to visitors.
- The site supports both light and dark themes with a toggle in the header; default is light.
- Build target is self-host friendly — the production output must be runnable on a plain VPS / container (Node.js runtime) without requiring a specific cloud platform. Deployment details (reverse proxy, TLS, etc.) are out of scope for this spec but the build artifact should not be tied to any single vendor.
- User has indicated a preference for **Next.js (latest stable version)** as the framework, with code organized in an **MVP-style structure** and components named clearly so each block of UI is easy to locate and modify.
