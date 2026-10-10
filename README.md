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
| `npm run admin:create`  | Create the first `/admin` account                 |

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

1. **Docker**: build with `output: 'standalone'` (default), generate an image from the included [`Dockerfile`](Dockerfile), and run it behind a reverse-proxy on port 3000.
2. **Any Node 22 host**: `npm run build && node .next/standalone/server.js`.

### Environment

There are two tracked env files, and which one loads depends on `NODE_ENV`:

| File               | Loaded by                                   | Turnstile     |
| ------------------ | ------------------------------------------- | ------------- |
| `.env.development` | `npm run dev` (`NODE_ENV=development`)      | dummy keys    |
| `.env.production`  | `npm run build` and `npm start` / the image | the real keys |

`.env.example` is the blank template. `.env.development` uses Cloudflare's
official dummy Turnstile pair, which validates on any host including
`localhost`; a production secret rejects a dummy token, so the two must never be
mixed.

Next.js resolves these automatically — the standalone server loads
`.env.production` from its own directory on startup, and the `Dockerfile` copies
the file next to `server.js` for that reason. **No `-e` flags and no build
arguments are required**: a fresh clone is deployable as is.

Every server variable is read per request, so nothing is baked into the bundle.
`NEXT_PUBLIC_` values would be frozen at build time, which is why the Turnstile
sitekey is read by a server component in `src/app/contact/page.tsx` and handed to
the form as a prop instead.

> `.env.production` holds `SUPABASE_SERVICE_ROLE_KEY`, which bypasses row level
> security. It is tracked in git by choice. If this repository ever becomes
> public, rotate that key in Supabase before anything else.

### The Supabase project is shared with VibeHolic

`qyqhoegexqmzdzrosztm` ("vibeholic-media") backs both products. The contact
table is therefore **dedicated** — `ridelink_contact_message`, never merged
into VibeHolic's `contact_lead`, which its admin dashboard reads through
`rpc/list_admin_leads`.

That sharing is also why the write path is an RPC. `service_role` carries
`BYPASSRLS`, so a key holding a plain `INSERT` grant on one table can read and
write **every** table in the project, VibeHolic's included. Instead:

| Role           | Can do                                                 |
| -------------- | ------------------------------------------------------ |
| `anon`         | nothing                                                |
| `authed`       | nothing                                                |
| `service_role` | `EXECUTE ridelink_contact_submit` only, no table grant |

The function is `SECURITY DEFINER` with an empty `search_path`, so it inserts
as its owner and no caller-controlled `search_path` can shadow it. Postgres
grants `EXECUTE` to `PUBLIC` by default, so the migration revokes that first —
without it, an anonymous key could call the function from a browser and skip
Turnstile, the honeypot and the rate limit entirely. The trailing `do $$`
block aborts the migration if any of that drifts.

> **Revoking from `PUBLIC` is not sufficient on this project.** It carries
> `ALTER DEFAULT PRIVILEGES` that grants `EXECUTE` on every new function in
> `schema public` to `anon` and `authenticated`:
>
> ```
> pg_default_acl: {defaclobjtype='f', defaclrole='postgres',
>                  acl={postgres=X, anon=X, authenticated=X, service_role=X}}
> ```
>
> Every new function is therefore born with `anon=X` regardless of the `PUBLIC`
> default, so the migration must revoke by role name as well:
>
> ```sql
> revoke execute on function public.ridelink_contact_submit(...) from anon;
> revoke execute on function public.ridelink_contact_submit(...) from authenticated;
> ```
>
> The migration's trailing guard fails loudly if this ever regresses. Do not
> "simplify" it back to revoking from `PUBLIC` only.

A leaked key now costs one blind write endpoint instead of the whole project.

Run the migrations once each, in filename order, in the SQL Editor of project
`qyqhoegexqmzdzrosztm`:

1. [`supabase/migrations/20260930120000_ridelink_contact.sql`](supabase/migrations/20260930120000_ridelink_contact.sql)
   creates the table and the function. Without it, every submit fails with `PGRST205`.
2. [`supabase/migrations/20261009120000_ridelink_contact_inquiry.sql`](supabase/migrations/20261009120000_ridelink_contact_inquiry.sql)
   adds `inquiry_type` (`invest`, `build` or `other`) and `project`, and replaces the function with a
   12-argument version. The server action sends both new arguments, so every submit fails with
   `PGRST202` until it has run.

Never re-run the first migration after the second: it recreates the 10-argument function next to
the new one, and PostgREST cannot choose between them.

3. [`supabase/migrations/20261010120000_ridelink_admin.sql`](supabase/migrations/20261010120000_ridelink_admin.sql)
   adds the `/admin` accounts, devices, sessions and sign-in counters, plus the `ridelink_auth_*`,
   `ridelink_admin_*` and `ridelink_contact_list` / `ridelink_contact_update` functions.
4. [`supabase/migrations/20261010130000_ridelink_session_revoke.sql`](supabase/migrations/20261010130000_ridelink_session_revoke.sql)
   keeps ended sessions with a reason (`revoked_at`, `revoked_reason`) so a signed-out browser can say
   why, adds `ridelink_admin_logout_user`, and lets `ridelink_contact_update` change only the status
   or only the note (a `null` argument keeps the current value).
5. [`supabase/migrations/20261010140000_ridelink_roles_avatar.sql`](supabase/migrations/20261010140000_ridelink_roles_avatar.sql)
   lets `owner` manage `sub` accounts and their devices, opens contacts to `sub`, records who last
   changed a brief's status (`status_by`, `status_by_name`, `status_at`), adds `ridelink_user.avatar`
   and the `ridelink_auth_profile` / `ridelink_auth_set_avatar` functions, and lets an admin sign out
   or delete the device they are using.
6. [`supabase/migrations/20261010150000_ridelink_self_devices.sql`](supabase/migrations/20261010150000_ridelink_self_devices.sql)
   lets every role sign out, lock and delete its own devices from `/admin/profile`. A device someone
   else locked can only be unlocked by a role that manages its owner, and the device in use can
   never be locked.
7. [`supabase/migrations/20261010160000_ridelink_self_logout.sql`](supabase/migrations/20261010160000_ridelink_self_logout.sql)
   adds the `self_logout` reason so a device you signed out yourself does not say an admin did it.
8. [`supabase/migrations/20261011090000_ridelink_current_device_guard.sql`](supabase/migrations/20261011090000_ridelink_current_device_guard.sql)
   makes `ridelink_admin_delete_device` refuse the device the session is running on, like the lock
   already did. The device in use can only be signed out.

### Admin area (`/admin`)

Its own accounts in `ridelink_user`, never `auth.users` or VibeHolic's `admin_user`. Passwords are
bcrypt hashes made by `pgcrypto`; the browser holds only a random session token whose SHA-256 sits
in `ridelink_session`. Every admin function takes that hash and checks the role inside Postgres, so a
page that forgets a check still cannot read or change anything.

| Role    | Contacts | Accounts and devices                                 |
| ------- | -------- | ---------------------------------------------------- |
| `admin` | yes      | every account and device                             |
| `owner` | yes      | `sub` accounts and their devices; sees the rest only |
| `sub`   | yes      | no                                                   |

Everyone can open `/admin/profile` from the avatar menu to see their own account, sign out, lock or
delete their own other devices (the device in use can only be signed out), and change their profile
picture (resized in the browser to a 192 px WebP and stored in
`ridelink_user.avatar`).

Each sign-in records the browser by its ThumbmarkJS hash. A blocked device or account is signed out
at once and cannot sign in again until it is unblocked. Five wrong passwords lock that email for
15 minutes; twenty from one IP lock the IP for an hour.

Every open `/admin` tab asks `GET /admin/session` every 10 seconds and when it regains focus. When an
admin signs a device or an account out, blocks it, resets its password, deletes it, or the person
changes their password on another device, the tab goes to `/admin/login`, which tells them why. A
role change reloads the page with the new permissions instead.

Create the first admin after the migration has run:

```bash
pnpm admin:create
```

It reads `.env.production`, asks for an email, a name and a password, and works only while
`ridelink_user` is empty. Add everyone else from `/admin/accounts`; new accounts must change their
temporary password on first sign-in.

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
