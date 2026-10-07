# Tasks: RideLink Techs Corporate Website

**Input**: Design documents from `/specs/001-ridelink-techs-website/`
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/README.md](contracts/README.md), [quickstart.md](quickstart.md)

**Tests**: Not requested in the spec — manual smoke + Lighthouse per [quickstart.md](quickstart.md).

**Organization**: Tasks grouped by user story (P1 → P3). Each phase = independently testable increment.

**Format**: `- [ ] [ID] [P?] [Story] Description with file path`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Next.js project, install dependencies, set up linting/formatting/tooling.

- [ ] T001 Create Next.js project skeleton (App Router, TypeScript strict, ESLint) in repository root via `npx create-next-app@latest . --typescript --eslint --app --src-dir --import-alias "@/*" --no-tailwind --use-npm` then overwrite generated files
- [ ] T002 Install Tailwind CSS v4 (`npm install -D tailwindcss@latest @tailwindcss/postcss postcss`) and wire `@tailwindcss/postcss` into `postcss.config.mjs`; create `src/app/globals.css` with `@import "tailwindcss";`
- [ ] T003 Install runtime deps (`npm install gsap@latest lenis@latest next-themes@latest next-intl@latest lucide-react@latest clsx@latest tailwind-merge@latest`) in `package.json`
- [ ] T004 [P] Configure Prettier (`npm install -D prettier prettier-plugin-tailwindcss`) and add `.prettierrc` + `npm run format` / `npm run format:check` scripts in `package.json`
- [ ] T005 [P] Configure Next.js standalone output + TypeScript path aliases (`@/*`) in `next.config.mjs` and `tsconfig.json`
- [ ] T006 [P] Create folder skeleton per [plan.md](plan.md): `src/app/{products,about,contact}/`, `src/components/{layout,sections,products,ui,theme,i18n}/`, `src/content/`, `src/i18n/`, `src/lib/`, `src/styles/`, `public/{logo,images,seo}/`
- [ ] T007 Add `npm run check` aggregate script (typecheck + lint + format:check) in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Cross-cutting infrastructure that every page depends on. **No user-story work begins until this phase is complete.**

- [ ] T008 [P] Create brand color tokens in `src/styles/tokens.css` — CSS variables for `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-accent-blue`, `--color-accent-magenta`, `--color-accent-cyan`, plus gradient stop set; export both light and dark variants and import from `src/app/globals.css`
- [ ] T009 [P] Create typed content module `src/content/products.ts` exporting `Product[]` per [data-model.md](data-model.md) rules 1–10 with all 5 seed products (ridelink-go, glosslink-beautiful, pawly, motorbike-rescue, vibeholic), bilingual `vi`/`en` fields
- [ ] T010 [P] Create typed content module `src/content/company.ts` exporting `CompanyProfile` per [data-model.md](data-model.md) — `name="RideLink Techs"`, `email="support@ridelinktechs.com"`, `phoneDisplay="0967329308"`, `phoneHref="+84967329308"`, full address, `logoLight="/logo/logo_congty.png"`, `logoDark="/logo/logo_congty_white.png"`
- [ ] T011 [P] Create typed content module `src/content/about.ts` exporting `AboutContent` per [data-model.md](data-model.md) — bilingual story, mission, 3–6 focus areas, empty `teamMembers` for v1
- [ ] T012 [P] Create `src/i18n/config.ts` exporting `locales`, `defaultLocale='vi'`, `localeLabels` per [data-model.md](data-model.md)
- [ ] T013 [P] Create `src/i18n/vi.json` and `src/i18n/en.json` message catalogs — start with nav labels, button text, section headings, error messages, footer copy; parity-checked (see T014)
- [ ] T014 [P] Create `scripts/check-i18n.mjs` that loads `vi.json` and `en.json`, fails on any missing key in either direction, and is wired to `npm run check:i18n` in `package.json`
- [ ] T015 [P] Create `scripts/check-content.mjs` that imports `src/content/*.ts` via tsx and validates rules 1–10 from [data-model.md](data-model.md); wire to `npm run check:content`
- [ ] T016 [P] Create `src/lib/cn.ts` (`cn(...inputs: ClassValue[])` using `clsx` + `tailwind-merge`)
- [ ] T017 Create `src/components/theme/ThemeProvider.tsx` — wrap `next-themes` with `attribute="class"`, `defaultTheme="light"`, `enableSystem`, `disableTransitionOnChange`
- [ ] T018 [P] Create `src/components/theme/ThemeToggle.tsx` — accessible button (`aria-label` localized), Sun/Moon icons from `lucide-react`, toggles via `useTheme()`
- [ ] T019 Create `src/components/i18n/I18nProvider.tsx` + `src/i18n/request.ts` — `next-intl` `NextIntlClientProvider` wrapper with locale messages from `vi.json` / `en.json`
- [ ] T020 [P] Create `src/components/i18n/LanguageSwitcher.tsx` — accessible dropdown (`<button aria-haspopup>` + `<ul role="menu">`), options "Tiếng Việt" / "English", sets locale via cookie and updates `useRouter().replace` to refresh
- [ ] T021 [P] Create utility components: `src/components/ui/Container.tsx` (max-width wrapper), `src/components/ui/Section.tsx` (vertical rhythm), `src/components/ui/Button.tsx` (`variant: 'primary' | 'secondary' | 'ghost'`, `asChild` slot), `src/components/ui/VisuallyHidden.tsx`
- [ ] T022 Create `src/components/layout/Header.tsx` — sticky `<header>` with logo (`<Link href="/">` rendering `<Image>` from `CompanyProfile.logoLight` / `logoDark`), `NavLinks` (Home / Products / About / Contact — each from message catalog, active state via `usePathname()`), `LanguageSwitcher`, `ThemeToggle`; backdrop blur when scrolled past hero
- [ ] T023 [P] Create `src/components/layout/MobileNav.tsx` — slide-in sheet (use `shadcn/ui` Sheet or simple `<dialog>`); opens from header burger button; closes on route change
- [ ] T024 [P] Create `src/components/layout/Footer.tsx` — company name + tagline + email + phone + address + social placeholders; uses `CompanyProfile` entity
- [ ] T025 Create `src/lib/animations.ts` — GSAP setup helpers (`registerScrollTrigger`, `revealOnScroll(el, opts)`, `prefersReducedMotion()` guard that returns the user's motion preference, `initHeroIntro()` for first-paint intro); registers `ScrollTrigger` plugin once
- [ ] T026 Create root layout `src/app/layout.tsx` — `<html lang={locale} suppressHydrationWarning>`, wraps `{children}` in `ThemeProvider` + `I18nProvider`, includes `<Header>` + `<main>{children}</main>` + `<Footer>`; imports `src/app/globals.css`
- [ ] T027 [P] Copy brand assets into `public/logo/`: `logo_congty.png` (light) and `logo_congty_white.png` (dark) from `/Users/phibui/ridelinks-techs-web/logo/` (already provided by user)

**Checkpoint**: Foundation ready. Header / Footer / theme / i18n / content all importable. `npm run check` passes.

---

## Phase 3: User Story 1 — First-time visitor explores the company homepage (Priority: P1) 🎯 MVP

**Goal**: A first-time visitor lands on `/`, immediately understands who RideLink Techs is, sees the product portfolio and an About teaser, and can reach contact in ≤ 2 clicks. Hero animation + scroll-revealed sections feel premium but respect `prefers-reduced-motion`.

**Independent Test**: Visit `/` on desktop and mobile; verify hero, product grid (5 cards), About teaser, and contact card are all visible without breaking layout. Toggle theme and language — both apply without FOUC or page reload.

- [ ] T028 [P] [US1] Create `src/components/sections/Hero.tsx` — full-bleed section with logo (large, gradient-tinted background), bilingual tagline from `CompanyProfile`, primary CTA button (label "Xem sản phẩm" / "See products" → `/products`), secondary CTA ghost button → `/contact`; uses `useTranslations('home')`
- [ ] T029 [P] [US1] Create `src/components/products/StatusBadge.tsx` — pill rendering `Product.status` with localized label + color (in-development = cyan tint, upcoming = magenta tint, outsource = neutral/slate)
- [ ] T030 [P] [US1] Create `src/components/products/TimelineTag.tsx` — renders a single `TimelineMark` as a date pill (`2024-08` etc.), with a localized phase label
- [ ] T031 [P] [US1] Create `src/components/products/ProductMock.tsx` — renders a placeholder frame: `kind: 'gradient'` → CSS gradient block with the product's accent gradient; `kind: 'image'` → `<Image>` from `/images/products/[slug]/cover.png` (falls back to gradient if image missing); caption beneath in `LocalizedString`
- [ ] T032 [P] [US1] Create `src/components/products/ProductCard.tsx` — `<Link href="/products/[slug]">` wrapper with `ProductMock`, `name`, `tagline`, `StatusBadge`, optional `TimelineTag` row; hover animation (gradient sheen + lift) via Tailwind transitions; respects reduced-motion
- [ ] T033 [US1] Create `src/components/sections/ProductGrid.tsx` — accepts `products: Product[]`, splits by `category` into two labeled groups ("Sản phẩm RideLink Techs" / "Sản phẩm Outsource"), renders grid of `ProductCard`s per group; uses `useTranslations('products')` for group headings
- [ ] T034 [P] [US1] Create `src/components/sections/AboutTeaser.tsx` — first paragraph of `AboutContent.story` + CTA button ("Tìm hiểu thêm" / "Learn more" → `/about`); uses `useTranslations('about')`
- [ ] T035 [P] [US1] Create `src/components/sections/ContactSection.tsx` — compact card with email (`mailto:` link), phone (`tel:` link), address text; rendered as a homepage section above the footer
- [ ] T036 [US1] Create `src/components/sections/ScrollReveal.tsx` — generic wrapper that registers `ScrollTrigger` reveal (fade + Y translate) on its child via `lib/animations.ts`; renders children unchanged; short-circuits under reduced-motion
- [ ] T037 [US1] Compose homepage in `src/app/page.tsx` — `<Hero>` → `<ProductGrid products={allProducts}>` (wrapped in `<ScrollReveal>`) → `<AboutTeaser>` (wrapped in `<ScrollReveal>`) → `<ContactSection>` (wrapped in `<ScrollReveal>`); triggers hero intro via `useEffect` on mount
- [ ] T038 [US1] Add SEO metadata for homepage in `src/app/page.tsx` — `metadata` export with bilingual `<title>` ("RideLink Techs — Công ty phần mềm tại Đà Nẵng" / "RideLink Techs — Software studio in Đà Nẵng"), `description`, `openGraph`, `twitter` card meta; canonical URL `/`

**Checkpoint**: User Story 1 fully functional — homepage loads, all 5 products visible, About teaser visible, contact reachable, theme/language toggle work, no layout breaks.

---

## Phase 4: User Story 2 — Visitor browses the product portfolio (Priority: P1)

**Goal**: A visitor on `/products` sees two labeled groups (4 in-house prod + 1 outsource), each card links to its detail page.

**Independent Test**: Visit `/products`, count cards = 5 (4 prod + 1 outsource), click any card → routes to `/products/[slug]`.

- [ ] T039 [US2] Create `src/app/products/page.tsx` — page header with bilingual title + subtitle (`useTranslations('products')`), then renders `<ProductGrid products={allProducts}>` from `src/components/sections/ProductGrid.tsx`
- [ ] T040 [US2] Add SEO metadata for `/products` — bilingual `<title>`, `description`, OG image pointing at a default `seo/og-products.png`

**Checkpoint**: User Story 2 fully functional.

---

## Phase 5: User Story 5 — Visitor navigates the site smoothly (Priority: P1)

**Goal**: Header / Footer / theme toggle / language switcher behave correctly on every page; sticky header sticks; `prefers-reduced-motion` disables animations.

**Independent Test**: From any page: switch language → all visible copy updates without reload; toggle theme → entire UI swaps without FOUC; scroll past hero → header stays visible; enable OS reduced-motion → no non-essential animation plays.

- [ ] T041 [P] [US5] Verify header active-state highlighting: `NavLinks` compares `href` with `usePathname()` and applies `aria-current="page"` + visual emphasis
- [ ] T042 [P] [US5] Verify sticky-header behavior — header uses `position: sticky; top: 0`, gains a backdrop blur class once scroll > hero height (use `IntersectionObserver` on a sentinel element); toggle the header visibility on scroll-down/up only on viewports ≥ 768px
- [ ] T043 [US5] Verify language switcher persistence — set a cookie via `document.cookie` (or `next-intl` `setLocale`) on selection; root layout `src/app/layout.tsx` reads the cookie to set `<html lang>` on the server for the next request; switcher does not full-reload — uses `router.replace` with `{ scroll: false }`
- [ ] T044 [US5] Verify theme persistence + no-FOUC — `next-themes` blocking script in `src/app/layout.tsx` `<head>` sets `class="dark"` before hydration; toggling in any page persists via `localStorage`
- [ ] T045 [US5] Add `prefers-reduced-motion` audit — every animation entrypoint in `src/lib/animations.ts` checks `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and short-circuits to the final state if true

**Checkpoint**: User Story 5 verified end-to-end across all pages.

---

## Phase 6: User Story 3 — Visitor opens a product detail page (Priority: P2)

**Goal**: Each product has its own page at `/products/[slug]` with status banner, expanded description, mock visual, timeline, and back-to-portfolio link. Unknown slug → friendly 404.

**Independent Test**: Click each of 5 product cards → corresponding `/products/[slug]` loads with correct content. Visit `/products/nonexistent` → 404 page (with site layout).

- [ ] T046 [P] [US3] Create `src/components/products/ProductDetail.tsx` — composition: header (name + status badge + tagline) → mock visual → description (paragraphs) → optional `targetUser` / `problem` blocks → `TimelineMark` row → CTA strip (Back to `/products` + Contact `/contact`); uses `useTranslations('productDetail')` for chrome
- [ ] T047 [US3] Create `src/app/products/[slug]/page.tsx` — server component, looks up `Product` by `params.slug` from `src/content/products.ts`; if not found calls `notFound()`; otherwise renders `<ProductDetail product={product}>`. Generate `generateStaticParams()` returning all 5 product slugs
- [ ] T048 [US3] Create `src/app/not-found.tsx` — site-layout-aware 404: localized "Không tìm thấy" / "Not found" + CTA back to `/`; uses `Header` / `Footer` from root layout
- [ ] T049 [US3] Add per-product SEO metadata via `generateMetadata()` in `src/app/products/[slug]/page.tsx` — bilingual `<title>` with product name, `description` from `Product.tagline`, OG image from product's `mock.gradient` (or static image when available)
- [ ] T050 [P] [US3] Add breadcrumb to `ProductDetail` — "Trang chủ / Sản phẩm / `<name>`" / "Home / Products / `<name>`", each segment a link except the current page

**Checkpoint**: User Story 3 fully functional — all 5 slugs resolve, 404 works.

---

## Phase 7: User Story 4 — Visitor contacts the company (Priority: P2)

**Goal**: `/contact` renders the email (clickable `mailto:`), phone (clickable `tel:`), and full address; same blocks also appear in `Footer` on every page.

**Independent Test**: Visit `/contact` — all three blocks visible. Click email → mail client opens pre-filled. Click phone on mobile → dialer opens.

- [ ] T051 [P] [US4] Create `src/components/products/ContactInfo.tsx` (rename from `ContactSection` for clarity, or keep as-is) — three labeled blocks (Email, Phone, Address) each with icon + localized label + value; email wrapped in `<a href="mailto:...">`, phone in `<a href="tel:...">`; uses `CompanyProfile` entity
- [ ] T052 [US4] Create `src/app/contact/page.tsx` — page header (bilingual title via `useTranslations('contact')`) → full-width `<ContactInfo>` block → optional small map placeholder (out of scope for v1, omit if not provided)
- [ ] T053 [US4] Verify footer also shows contact — `src/components/layout/Footer.tsx` includes email, phone, address in compact form on every page (already in Phase 2 but double-check that `mailto:` / `tel:` links are wired)

**Checkpoint**: User Story 4 fully functional; contact reachable from `/contact` and the footer of every other page.

---

## Phase 8: User Story 6 — Visitor reads the full About page (Priority: P3)

**Goal**: `/about` renders an extended story, mission, focus areas, optional team list, and a CTA to `/contact`.

**Independent Test**: Visit `/about` — at least 3 distinct sections (story, mission, focus areas) are visible; CTA to `/contact` works.

- [ ] T054 [P] [US6] Create `src/components/sections/AboutSections.tsx` — composes `Story`, `Mission`, `FocusAreaGrid`, optional `TeamGrid` from `AboutContent`; each section wrapped in `<ScrollReveal>` for stagger
- [ ] T055 [P] [US6] Create `src/components/sections/AboutCta.tsx` — bilingual CTA strip ("Liên hệ với chúng tôi" / "Get in touch") → `/contact`
- [ ] T056 [US6] Create `src/app/about/page.tsx` — page header (bilingual title + subtitle from `AboutContent.heroTitle` / `heroSubtitle`) → `<AboutSections>` → `<AboutCta>`
- [ ] T057 [US6] Add SEO metadata for `/about` — bilingual `<title>` and `description` from `AboutContent.heroSubtitle`

**Checkpoint**: User Story 6 fully functional.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Production-readiness, SEO, deployment, validation runs.

- [ ] T058 [P] Create `src/app/sitemap.ts` — Next.js sitemap generator that returns `/`, `/products`, `/products/[slug]` (×5), `/about`, `/contact` with `lastModified` and `changeFrequency`
- [ ] T059 [P] Create `src/app/robots.ts` — Next.js robots config allowing all + pointing at `/sitemap.xml`
- [ ] T060 [P] Create `Dockerfile` in repo root — multi-stage build (deps → build → runner with `output: 'standalone'` artifacts), expose port 3000, run `node server.js`; non-root user; small final image
- [ ] T061 [P] Create `.dockerignore` excluding `node_modules`, `.next`, `.git`, `specs`, `*.log`
- [ ] T062 [P] Create `README.md` with sections: project overview, dev commands (`npm run dev` / `build` / `start`), Docker self-host instructions, content update guide (how to edit `src/content/*.ts`), theme + i18n overview, deploy notes (reverse proxy sketch)
- [ ] T063 Responsive QA pass — manual verification at viewport widths **320 / 375 / 768 / 1024 / 1440**: no horizontal scroll, tap targets ≥ 44×44 px, nav collapses to burger at < 768 px, no text overflow
- [ ] T064 Lighthouse audit on production build — run `npm run build && npm run start`, then Lighthouse against `/`, `/products`, `/products/ridelink-go`, `/about`, `/contact`; verify Performance ≥ 85 and Accessibility ≥ 90 on `/`
- [ ] T065 Reduced-motion pass — enable `prefers-reduced-motion: reduce` in OS, reload every page, verify no non-essential animations play and all content is reachable
- [ ] T066 Keyboard-nav pass — reload site, tab through every page from top to bottom, verify focus order, visible focus rings, language-switcher / theme-toggle keyboard operability
- [ ] T067 Cross-browser smoke — verify `/` renders correctly on Chrome, Firefox, Safari latest 2 versions (manual or via Playwright if available)
- [ ] T068 Run all 10 validation scenarios from [quickstart.md](quickstart.md) end-to-end; mark each pass / fail; fix any failing scenario before declaring shippable
- [ ] T069 [P] Code cleanup — remove any leftover scaffolding, unused imports, dead branches; run `npm run check`; verify zero ESLint warnings
- [ ] T070 Final content review — present `src/content/*.ts` and `src/i18n/*.json` to user for review of taglines, descriptions, and About copy; update any wording per user feedback before public deploy

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** → no dependencies; can start immediately.
- **Phase 2 (Foundational)** → depends on Phase 1; **BLOCKS** all user-story work.
- **Phase 3 (US1 Homepage)** → depends on Phase 2.
- **Phase 4 (US2 Products list)** → depends on Phase 2 (reuses `ProductGrid` from Phase 3 task T033 — but `ProductGrid` is in US1's tasks, so US2 needs Phase 3 to have started T033).
- **Phase 5 (US5 Navigation)** → depends on Phase 2 (Header / theme / language already exist); verification tasks touch every page, so run after the relevant pages exist.
- **Phase 6 (US3 Product detail)** → depends on Phase 2 (uses `ProductCard` types).
- **Phase 7 (US4 Contact)** → depends on Phase 2 (uses `ContactInfo` from US1's T035).
- **Phase 8 (US6 About)** → depends on Phase 2 (uses `AboutContent` entity).
- **Phase 9 (Polish)** → depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)** — no dependencies on other stories. The MVP slice.
- **US2 (P1)** — depends on US1 having built `ProductGrid` (T033). Otherwise US2 is independent.
- **US5 (P1)** — cross-cutting; verification depends on every other page existing.
- **US3 (P2)** — depends on Phase 2 only. Independent of US1 / US2.
- **US4 (P2)** — depends on Phase 2 only. Independent.
- **US6 (P3)** — depends on Phase 2 only. Independent.

### Within Each User Story

- Story work goes: components (`P` tasks first, parallel) → composition → metadata → verification.
- Models / content are pre-staged in Phase 2 (T009–T011) so story phases don't redefine shapes.

---

## Parallel Opportunities

### Phase 1 — all `[P]` tasks can run in parallel

```text
T004 Prettier config          ─┐
T005 Next.js + TS config      ─┤
T006 Folder skeleton          ─┼─→ all independent files, parallel
T007 Check-script wiring      ─┘
```

### Phase 2 — large parallel block

```text
T008 tokens.css          ─┐
T009 products.ts         ─┤
T010 company.ts          ─┤
T011 about.ts            ─┤
T012 i18n/config.ts      ─┤
T013 vi.json + en.json   ─┼─→ all independent files, parallel
T014 check-i18n.mjs      ─┤
T015 check-content.mjs   ─┤
T016 lib/cn.ts           ─┤
T018 ThemeToggle.tsx     ─┤
T020 LanguageSwitcher.tsx─┤
T021 UI primitives       ─┤
T023 MobileNav.tsx       ─┤
T024 Footer.tsx          ─┤
T027 Logo assets copy    ─┘
```

Sequential within Phase 2: T017 (ThemeProvider) → T026 (root layout wiring). T019, T022 depend on T017/T018/T020.

### Phase 3 — homepage components are parallel

```text
T028 Hero           ─┐
T029 StatusBadge    ─┤
T030 TimelineTag    ─┤
T031 ProductMock    ─┼─→ parallel
T032 ProductCard    ─┤
T034 AboutTeaser    ─┤
T035 ContactSection ─┘
```

Then sequential: T033 `ProductGrid` (needs `ProductCard`) → T036 `ScrollReveal` → T037 compose `page.tsx` → T038 metadata.

### Across User Stories

After Phase 2 completes, US1, US3, US4, US6 can all start in parallel (different files, no cross-story imports). US2 needs `ProductGrid` from US1.

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 + 5 — all P1)

1. Complete **Phase 1** (Setup)
2. Complete **Phase 2** (Foundational — CRITICAL, blocks everything)
3. Complete **Phase 3** (US1 Homepage — the home slice)
4. Complete **Phase 4** (US2 Products list)
5. Complete **Phase 5** (US5 Navigation verification)
6. **STOP and VALIDATE** — run [quickstart.md](quickstart.md) Scenarios 1–4, 7–10 against MVP
7. Demo / deploy the MVP (homepage + portfolio + smooth navigation + bilingual + theming)

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 → deploy MVP (homepage live)
3. US2 → deploy products list
4. US3 → deploy product detail pages
5. US4 → deploy contact page
6. US6 → deploy About page
7. Polish → ship

Each story adds visible value without breaking previous stories.

### Single-Developer Path (most likely)

With one developer, execute phases sequentially in the listed order. Treat Phase 2's `[P]` block as one focused work session (most files are small).

### Parallel Team Path (if applicable)

With multiple developers:

1. Together: Setup + Foundational (Phase 1 + 2).
2. Once Phase 2 done:
   - Dev A: US1 (homepage + product cards + animations)
   - Dev B: US3 (product detail + 404)
   - Dev C: US4 (contact) + US6 (about)
3. Dev D (or anyone free): US2 (products list — needs `ProductGrid` from US1)
4. Verification (US5) after every page exists.
5. Polish phase together.

---

## Notes

- `[P]` tasks = different files, no in-flight dependencies — safe to parallelize.
- `[Story]` labels (US1, US2, …) keep each task tied to its acceptance scenario in [spec.md](spec.md).
- Each user-story phase is independently testable against the matching [quickstart.md](quickstart.md) scenario.
- Commit after each phase, or after each `[P]` group within a phase.
- Stop at any checkpoint to validate a story in isolation — the foundation is robust enough that early stories don't depend on later ones.
- Test discipline: manual smoke + Lighthouse is the v1 bar; add automated tests only if the user requests them.
