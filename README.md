# RideLink Techs — corporate website

Single-brand corporate site for RideLink Techs (Đà Nẵng, Vietnam). Built with Next.js App Router, bilingual (VI / EN) via cookie-stored locale, light + dark theme, and editorial-atelier motion via GSAP + ScrollTrigger + Lenis.

The visual language is **Atelier Editorial · Studio Almanac** — warm bone paper, Spectral editorial serif, Inter Tight body, JetBrains Mono ticks, deep oxblood accent on a single warm signal. See [`design.md`](design.md) for the full system of record.

## Stack

- Next.js 16 (App Router, standalone output)
- Node.js 24 LTS and pnpm 12 (versions pinned by the project and Dockerfile)
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
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

The dev server defaults to port **3000**. Use `corepack pnpm dev --port 7421` to
run it on port 7421.

Open <http://localhost:3000>. Default theme is **dark**, default locale is **Vietnamese**.

Toggle the theme (top-right), switch language (top-right), scroll — animated reveals are on everywhere except where reduced-motion is set.

## Scripts

| Command                 | What it does                                      |
| ----------------------- | ------------------------------------------------- |
| `npm run dev`           | Start the dev server on **port 3000** (Turbopack) |
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

Production uses Node 24 and the standalone image built by the included
[`Dockerfile`](Dockerfile). The image runs `node server.js` as UID/GID 1001 and
checks `/robots.txt` every 30 seconds. It builds without application credentials.

The project pins pnpm in `package.json`, and the Dockerfile installs the same
version. Dokploy's own pnpm installation is not used for Dockerfile builds.
Dependency overrides and approved package build scripts are configured in
`pnpm-workspace.yaml`; pnpm 12 does not read the old `package.json.pnpm` settings.
Regenerate the lockfile with the pinned pnpm version before a frozen install.

### Dokploy

Select **Dockerfile** as the application's build type, with `Dockerfile` at the
repository root and the internal port set to **3000**. Keep this selection in the
saved Dokploy application settings so later deployments use the same runtime.

Provide the variables from [`.env.example`](.env.example) through Dokploy's
runtime Environment settings or an application-specific Docker Swarm secret.
For the secret-file approach, mount the secret read-only at
`/app/.env.production`, readable by UID 1001. Never put credentials into build
arguments or the source directory sent to the Docker builder.

Start with an application CPU limit of **2 CPUs** and a memory limit of **1 GiB**;
adjust them after measuring actual traffic. Keep application code read-only,
drop Linux capabilities, and enable `no-new-privileges` where the deployment
runtime supports it. Next.js image optimization needs a writable
`/app/.next/cache`; use a bounded tmpfs or a dedicated cache volume owned by UID 1001. A bounded `/tmp` tmpfs handles temporary files.

A direct Docker deployment with runtime environment injection looks like this:

```bash
docker build -t ridelink-techs-web:patched .
docker run -d --name ridelink-techs-web \
  --env-file /secure/path/ridelink.env \
  --read-only --cap-drop ALL --security-opt no-new-privileges \
  --cpus 2 --memory 1g \
  --tmpfs /tmp:rw,noexec,nosuid,size=16m \
  --tmpfs /app/.next/cache:rw,noexec,nosuid,size=128m,uid=1001,gid=1001,mode=0700 \
  -p 127.0.0.1:3000:3000 ridelink-techs-web:patched
```

Put a reverse proxy in front of port 3000. The image's writable layer contains no
application secrets; Docker still exposes injected environment values to users
with Docker administration access.

### Environment

The project keeps `.env.development` and `.env.production` tracked. Next.js reads
the matching mode file locally; `.env.<mode>.local` provides a personal override.
[`.env.example`](.env.example) documents the required variables.

Docker excludes all environment files from the build context, including
intermediate image layers. Supply the production file as a read-only runtime
mount at `/app/.env.production`, or provide its values through Dokploy Environment.

Next.js gives `process.env` precedence over environment files. Server-only
variables are read by the running process; restart or replace the application
tasks after changing them. The Turnstile site key is passed from a server
component to the form, so changing it requires a task restart rather than a
`NEXT_PUBLIC_` rebuild.

For local development only, Cloudflare's official dummy pair validates on
localhost:

```dotenv
TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

Production must use a real Turnstile key pair.

### Recovery after a compromised container

Keep the affected service stopped until the replacement has passed the
production dependency audit, typecheck, lint, content/i18n checks, build and HTTP
smoke checks. Build from reviewed source into a new image and replace the
container; do not reuse the compromised writable layer or restore its startup
files. Verify the running user, installed Next.js version, resource limits,
health check and CPU usage after deployment.

Rotate secrets readable by the old container, including the Supabase service
key, Turnstile secret and contact IP pepper. The Supabase project is shared:
inventory all consumers before retiring a legacy key. Creating a new
`sb_secret_...` key alone does not revoke an exposed legacy `service_role` JWT.
Follow [Supabase's leaked-key rotation procedure](https://supabase.com/docs/guides/security/rotate-leaked-api-keys),
including migration of affected `anon` consumers and retirement of the legacy
signing secret. A clean application container does not establish that the host
or other services are free of compromise; investigate their scope separately.

### The Supabase project is shared with VibeHolic

`qyqhoegexqmzdzrosztm` ("vibeholic-media") backs both products. The contact
table is therefore **dedicated** — `ridelink_contact_message`, never merged
into VibeHolic's `contact_lead`, which its admin dashboard reads through
`rpc/list_admin_leads`.

That sharing is also why the write path is an RPC. `service_role` carries
`BYPASSRLS`, so a key holding a plain `INSERT` grant on one table can read and
write **every** table in the project, VibeHolic's included. The dedicated contact table uses these grants:

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

These grants apply to this contact table and its RPC. A `service_role` key can
still access other resources in the shared Supabase project, so treat exposure
of that key as a project-wide incident.

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
9. [`supabase/migrations/20261012090000_ridelink_contact_delete.sql`](supabase/migrations/20261012090000_ridelink_contact_delete.sql)
   adds `ridelink_contact_delete`, which deletes one brief and only accepts an `admin` session. A
   deleted brief also stops counting toward the per-IP rate limit of the contact form, since that
   limit counts stored rows.

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

All three roles can read, move and annotate briefs; only `admin` can delete one (drawer, "Xoá brief").

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
5. Run `corepack pnpm dev` and the new product appears on `/products` immediately.

### When adding a page

1. Create `src/app/<route>/page.tsx` (cookie locale — no `force-dynamic` needed; next-intl handles it).
2. Add the page title + namespace to **both** `vi.json` and `en.json`.
3. Add it to `src/app/sitemap.ts`.
4. If the page uses interactive chrome (Sheet / Tabs / Accordion / Tooltip / Dialog / Carousel), import from the PascalCase primitives in `src/components/ui/` — `Sheet`, `Tabs`, `Accordion`, `Tooltip`, `Dialog`, `Carousel`. The lowercase shadcn-style paths are reserved out.

## License

Internal to RideLink Techs.
