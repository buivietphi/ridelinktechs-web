// Workflow: redesign-ridelinks
// Full UI redesign + real copy + lead-gen, following hallmark + design-taste-frontend,
// fan-out 3 proposals, judge, implement winner.
//
// Hard locks (passed via args.constraints):
//   - viberholic_never_slug: card label = "/ OUTSOURCE" only; slug never in visible text
//   - no_fabrication: no fake metrics/testimonials/logos/press quotes/screenshots
//   - bilingual_parity: every key in vi.json mirrored in en.json, no EN fallback leaks
//
// Stack pinned: Next.js 15 App Router · TS strict · Tailwind v4 · GSAP 3.13 +
// ScrollTrigger + @gsap/react · Lenis · next-intl (cookie "locale") · next-themes
// (class strategy) · Phosphor React icons.

export const meta = {
  name: 'redesign-ridelinks',
  description:
    'Full UI redesign + real copy + lead-gen, following hallmark + design-taste-frontend, fan-out 3 proposals, judge, implement winner.',
  phases: [
    { title: 'Pre-flight + locks' },
    { title: 'Proposal fan-out (3 directions)' },
    { title: 'Judge panel + winner synthesis' },
    { title: 'Token system + globals' },
    { title: 'Motion kit + chrome' },
    { title: 'Page-level rebuild' },
    { title: 'Copy pass (real, lead-gen)' },
    { title: 'Verify (slop test, build, screenshots)' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 1 — Pre-flight + hard locks
// ─────────────────────────────────────────────────────────────────────────────
phase('Pre-flight + locks');
log('Scanning repo state, locking constraints, reading content/products.ts for product data.');

const preflight = await agent(
  `
You are auditing a Next.js 15 (App Router, TypeScript strict, Tailwind v4) studio site at /Users/phibui/ridelinks-techs-web.

Tasks:
1. Read package.json and list exact deps + versions.
2. Read src/content/products.ts (or similar) and dump all 5 products: slug, status, timeline entries, headline, overview, target, problem.
3. Read src/i18n/vi.json and en.json — list ALL keys + first 30 chars of VI value.
4. Read src/app/_home/, src/app/products/, src/app/about/, src/app/contact/, src/app/not-found.tsx — list the existing page-level components and what they render (one line each).
5. Read src/components/motion/ (Reveal.tsx, Marquee.tsx, Magnetic.tsx, Curtain.tsx) — summarize each one's animation contract (what GSAP does, duration, easing).
6. Read src/styles/tokens.css — list every CSS custom property name (do not paste values).
7. List every file under src/ that imports gsap, @gsap/react, scrolltrigger, lenis, framer-motion, motion.

Return: a structured inventory as plain text. No file rewrites.
`,
  { label: 'Pre-flight' },
);

const locks = args.constraints || {};

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2 — Proposal fan-out: 3 design directions, written, no code
// ─────────────────────────────────────────────────────────────────────────────
phase('Proposal fan-out (3 directions)');

const directions = [
  {
    key: 'A_editorial_specimen',
    lens: 'editorial-museum: warm-neutral paper, high-contrast serif display, ink-blue single accent, workbench macrostructure with chapter numbering, slow 700ms reveals.',
  },
  {
    key: 'B_modern_minimal_signal',
    lens: 'modern-minimal: zinc/slate greys + single electric-cyan accent + grotesk sans display, asymmetric grid with signal-rail, restrained motion, magazine-cadence typography, strong lead-gen CTAs.',
  },
  {
    key: 'C_industrial_workshop',
    lens: 'industrial-workshop: monospace-driven UI, fine hairline rules, numbered tick markers, build-log rhythm, signal-green accent on warm-paper canvas, brutalist-light.',
  },
];

const proposals = await parallel(
  directions.map(
    (d) => () =>
      agent(
        `
You are a senior design lead. Write a CONCRETE design proposal for the homepage + product detail + about + contact + 404 pages of RideLink Techs, a tiny independent software studio in Da Nang building 4 mobile products (Ridelink Go ride-hailing, GlossLink Beautiful salon booking, Pawly pet care, Motorbike Rescue) and 1 outsourced web project (client name NDA'd, label as "/ OUTSOURCE").

You MUST take the design lens: ${d.lens}.

Audience: B2B prospects (marketing managers, founders in VN, agencies needing outsource partners). One action per page.
Genre per hallmark: pick the most fitting (editorial / modern-minimal / atmospheric / playful) — be honest.
Tone: pick an extreme — editorial · brutalist · soft · utilitarian · luxury · playful · technical · austere.

Hard locks: ${JSON.stringify(locks)}

Deliver a Markdown proposal with these sections:
1. ONE-LINE READ
2. PRE-FLIGHT FINDINGS (cite file:line)
3. MACROSTRUCTURE + NAV + FOOTER + reason
4. THEME (catalog or custom + 3 axis values: paper-band / display-style / accent-hue)
5. COLOR TOKENS (proposed names)
6. TYPE TOKENS (proposed names)
7. PAGE MACRO RHYTHM for [home, product list, product detail, about, contact, 404]
8. HERO ENRICHMENT
9. MOTION KIT (4-6 primitives, ≤3 per page rule)
10. LEAD-GEN STRATEGY per page
11. DIVERSIFICATION axes
12. PRE-EMIT CRITIQUE: P/H/E/S/R/V 1-5
13. SLOP RISK MAP (3-5 gates + mitigation)

No code. ~700 words. Use real product names.

PRE-FLIGHT INVENTORY:
${preflight}
`,
        { label: `Proposal ${d.key}`, phase: 'Proposal fan-out (3 directions)' },
      ),
  ),
);

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 3 — Judge panel: 3 judges + synthesis
// ─────────────────────────────────────────────────────────────────────────────
phase('Judge panel + winner synthesis');

const judges = await parallel([
  () =>
    agent(
      `
Score these 3 proposals on a strict rubric. Be a tough customer.

A: ${proposals[0]}
B: ${proposals[1]}
C: ${proposals[2]}

Score 1-10 each axis:
- Anti-slop
- Structural variety
- Mobile + a11y floor
- Lead-gen strength
- Content honesty (locks respected)
- Execution feasibility (1 sprint, single senior)

Return scores per proposal per axis, totals, WINNER letter, 3 concrete edits to push the winner score up by 2+.
`,
      { label: 'Judge 1: Art Director', phase: 'Judge panel + winner synthesis' },
    ),
  () =>
    agent(
      `
Re-read the 3 proposals with BUYER lens (marketing manager at 30-person VN company looking for outsource partner).

A: ${proposals[0]}
B: ${proposals[1]}
C: ${proposals[2]}

Score 1-10:
- Trust signal
- Clarity (understand "in-house + selective outsource" in <10s)
- Effort to engage
- Mobile readability
- Differentiation from VN agency slop
- Action clarity per page

Same shape. WINNER may differ from Judge 1.
`,
      { label: 'Judge 2: Buyer Lens', phase: 'Judge panel + winner synthesis' },
    ),
  () =>
    agent(
      `
Read the 3 proposals with HALLMARK slop-test + design-taste-frontend LILA + premium-consumer palette ban + serif discipline lens.

A: ${proposals[0]}
B: ${proposals[1]}
C: ${proposals[2]}

For each, name 5-8 specific slop-test gates it will likely FAIL. Does it violate LILA? Warm-paper+brass+espresso trap? Fraunces/Instrument Serif default? Hand-rolled fake chrome? Pick WINNER as lowest slop risk while still distinctive.
`,
      { label: 'Judge 3: Slop Czar', phase: 'Judge panel + winner synthesis' },
    ),
]);

const synthesis = await agent(
  `
Three judges scored 3 design proposals. Synthesize.

JUDGE 1: ${judges[0]}
JUDGE 2: ${judges[1]}
JUDGE 3: ${judges[2]}

A: ${proposals[0]}
B: ${proposals[1]}
C: ${proposals[2]}

Deliver:
1. Chosen proposal letter + 1-sentence reason
2. LOCKED design contract: macrostructure, theme + 3 axis values, nav archetype, footer archetype, tone word, accent strategy, motion primitives (max 6), hero enrichment, page-by-page rhythm, lead-gen pattern per page
3. CSS token names we will create
4. Hallmark pre-emit critique stamp we'll write on tokens.css
5. Motion kit (which primitives we keep vs rewrite, max 3 new)
6. COPY SLOTS per page
7. Verification plan: 58-gate slop test, typecheck, lint, build, 4 mobile widths, screenshots VI/EN × light/dark × 4 pages = 16

No code. Implementation brief.
`,
  { label: 'Synthesis', phase: 'Judge panel + winner synthesis' },
);

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 4 — Token system + globals
// ─────────────────────────────────────────────────────────────────────────────
phase('Token system + globals');

const tokens = await agent(
  `
Implement the LOCKED design contract.

SYNTHESIS: ${synthesis}
PRE-FLIGHT: ${preflight}
LOCKS: ${JSON.stringify(locks)}

OVERWRITE:
- /Users/phibui/ridelinks-techs-web/src/styles/tokens.css
- /Users/phibui/ridelinks-techs-web/src/app/globals.css (keep @tailwind directives)
- Tailwind v4 config (likely @theme inline block)

DO NOT TOUCH:
- src/content/products.ts
- src/i18n/*.json
- next.config.ts
- src/app/layout.tsx (font wiring stays until Page Rebuild phase)

Tasks:
1. Read all 3 target files first.
2. Find the v4 config.
3. Overwrite tokens.css with LOCKED palette (OKLCH), types, scale, radius, motion (durations + 3 named easings), rules, paper+ink+accent in :root and .dark. Add Hallmark pre-emit critique stamp at top.
4. Overwrite globals.css keeping @tailwind + @import "tailwindcss" + @plugin lines; below them new base rules.
5. Edit tailwind config / @theme inline to map new tokens.

Return: summary of new tokens, diffs written, any font conflict with Vietnamese subset.
`,
  { label: 'Tokens + globals', phase: 'Token system + globals' },
);

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 5 — Motion kit
// ─────────────────────────────────────────────────────────────────────────────
phase('Motion kit + chrome');

const motion = await agent(
  `
Rewrite motion kit to match LOCKED design contract.

SYNTHESIS: ${synthesis}

CURRENT FILES:
- src/components/motion/Reveal.tsx (6 fx variants)
- src/components/motion/Marquee.tsx
- src/components/motion/Magnetic.tsx
- src/components/motion/Curtain.tsx
- src/components/motion/ScrollReveal.tsx (re-export)

CONSTRAINTS:
- Keep GSAP 3.13 + ScrollTrigger + @gsap/react + Lenis stack.
- ≤3 motion primitives used per page (hard rule).
- All animations respect prefers-reduced-motion.
- Animate transform + opacity ONLY.
- 3 named easings from tokens.css.

Tasks:
1. Read each motion file first.
2. Decide which primitive maps to the locked motion kit.
3. Rewrite to use ONLY locked easings + durations (no inline magic numbers). useGSAP() + scope. contextSafe for pointer handlers. Revert on unmount.
4. If locked contract needs NEW primitive (counter, marquee variant, path-draw), add it as a 5th file.
5. Verify: typed exports, prop interfaces, tokens for colors/easings.

Return: list of files modified, public API, 1-line usage note.
`,
  { label: 'Motion kit', phase: 'Motion kit + chrome' },
);

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 6 — Page-level rebuild
// ─────────────────────────────────────────────────────────────────────────────
phase('Page-level rebuild');

const pages = await agent(
  `
Rebuild every page to match LOCKED design contract + motion + tokens.

SYNTHESIS: ${synthesis}
TOKENS: ${tokens}
MOTION: ${motion}
PRODUCT DATA: ${preflight}
LOCKS: ${JSON.stringify(locks)}

REWRITE:
- src/app/layout.tsx (font wiring + theme provider)
- src/app/page.tsx
- src/app/_home/Hero.tsx
- src/app/_home/ProductsChapter.tsx
- src/app/_home/AboutTeaser.tsx
- src/app/_home/ContactSection.tsx
- src/app/products/page.tsx
- src/app/products/[slug]/page.tsx
- src/app/products/_product/ProductMock.tsx
- src/app/about/page.tsx
- src/app/contact/page.tsx
- src/app/contact/ContactForm.tsx
- src/app/not-found.tsx
- src/components/layout/Header.tsx
- src/components/layout/MobileNav.tsx
- src/components/layout/Footer.tsx
- src/components/ui/Button.tsx
- src/components/ui/Chip.tsx
- src/components/ui/MetaRow.tsx
- src/components/ui/StatusBadge.tsx
- src/components/ui/TimelineTag.tsx

DO NOT TOUCH:
- src/content/products.ts
- src/i18n/*.json (Copy Pass will rewrite)
- next.config.ts

Tasks:
1. Read each file before editing.
2. Per page render section rhythm from LOCKED contract. Use LOCKED macrostructure. ≤3 motion primitives per page.
3. Use ONLY token vars — no inline hex/oklch.
4. Eight-state discipline on buttons + inputs.
5. Mobile-first at 320/375/414/768. 2-line button wrap guard.
6. Lead-gen: every page CTA path, ≤2 clicks to footer + contact form + email + phone.
7. NO fabricated metrics, testimonials, logos, press, screenshots. Placeholder strategy: status dot + grid mock for products.
8. Vibeholic card label = "/ OUTSOURCE" only.
9. Bilingual: every visible string uses t('...').

Return: list of files touched + 1-line each.
`,
  { label: 'Pages', phase: 'Page-level rebuild' },
);

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 7 — Copy pass: real, lead-gen, bilingual parity
// ─────────────────────────────────────────────────────────────────────────────
phase('Copy pass (real, lead-gen)');

const copy = await agent(
  `
You are a senior Vietnamese + English copywriter. Write actual marketing copy.

CONTEXT:
- Studio: RideLink Techs · Da Nang · independent · 5-person
- 4 in-house: Ridelink Go (ride-hailing), GlossLink Beautiful (salon booking), Pawly (pet care social), Motorbike Rescue (motorbike roadside)
- 1 outsource: /products/vibeholic — NDA, label "/ OUTSOURCE"
- Contact: support@ridelinktechs.com, +84 967 329 308, 14 Tan Thai 1, Son Tra Ward, Da Nang
- Reply: 1 working day. Hours: Mon-Sat 09:00-19:00 UTC+7
- Hard ban: NO invented numbers, NO fake testimonials, NO fake press quotes.

Tasks:
1. Read src/i18n/vi.json + en.json. List every existing key.
2. Rewrite BOTH files with:
   - Real, specific copy. No AI slop. Plain verbs.
   - Hero hook + action. ≤7 words / ≤50 chars if possible.
   - CTAs verb-led, 1-2 words.
   - Bilingual parity: every VI key has EN counterpart, same order.
   - Add 5-10 new keys if design contract needs (CTA micros, subtitles, form labels, errors, status names).
3. Each file valid JSON; passes npm run check:i18n parity.
4. Top-of-file comment listing keys.

Return: confirmation both files rewritten, parity-checked, any new keys added.
`,
  { label: 'Copy', phase: 'Copy pass (real, lead-gen)' },
);

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 8 — Verify
// ─────────────────────────────────────────────────────────────────────────────
phase('Verify (slop test, build, screenshots)');

const verify = await agent(
  `
Final QA. Verify the redesigned site.

WORKING DIR: /Users/phibui/ridelinks-techs-web

CHECKS (in order):
1. npm run typecheck — clean.
2. npm run lint — clean.
3. npm run format:check; if not clean, run npm run format and re-run.
4. npm run check:content — pass.
5. npm run check:i18n — pass (49+ keys each).
6. npm run build — succeed; capture route table.
7. Start dev: npm run dev in background (note port 3000 or 3001).
8. Run hallmark 58-gate slop test against live pages:
   - Open http://localhost:3000/ (or 3001), scroll, count: italic-in-headings, fake chrome, premium-warm-paper+brass, AI purple/blue gradient, two-line buttons, mobile scroll-jump, fake testimonials, fabricated metrics.
   - /products, /products/ridelink-go, /about, /contact, /not-found.
   - Toggle /vi and /en. Toggle dark mode.
   - Screenshot viewport (1440×900) AND mobile (375×812) using chrome-devtools MCP if available, else puppeteer.
9. Save to /Users/phibui/ridelinks-techs-web/_screenshots/ as <page>-<locale>-<theme>.jpeg.
10. Write /Users/phibui/ridelinks-techs-web/_screenshots/SLOP-TEST-RESULT.md with PASS/FAIL per gate + 1-line evidence.

HARD CONSTRAINTS:
- viberholic slug NEVER visible in any screenshot.
- No English fallback in VI screenshots.
- No fabricated numbers.
- Buttons fit one line at 320/375/414/768 px.

Return: summary table (check | result | evidence), FAIL gates with file:line + fix, screenshot paths, verdict SHIP / FIX-AND-RESHIP.
`,
  { label: 'Verify', phase: 'Verify (slop test, build, screenshots)' },
);

return { synthesis, tokens, motion, pages, copy, verify };
