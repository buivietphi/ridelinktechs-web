export const meta = {
  name: 'pivot-eight-research',
  description: 'Diagnose why seven pivots were rejected and ground a genuinely new direction in real references',
  phases: [
    { title: 'Research', detail: 'references, post-mortem, asset reality' },
    { title: 'Proposals', detail: 'three directions from different structural families' },
    { title: 'Judge', detail: 'three personas score and pick' },
  ],
};

const CONTEXT = [
  '# PROJECT - ridelinks-techs-web',
  'Next.js 15 App Router, TypeScript strict, Tailwind v4, GSAP 3.13 + ScrollTrigger,',
  'Lenis, next-intl (bilingual vi/en), next-themes, Phosphor icons, shadcn primitives.',
  '',
  '## The business',
  'RideLink Techs is a small software studio in Da Nang, Vietnam, founded 2026.',
  'It ships its own products and takes selected client work.',
  '',
  '1. Ridelink Go - ride-hailing, real-time matching. Flutter. IN DEVELOPMENT.',
  '2. GlossLink Beautiful - salon and spa booking, iOS + Android. IN UX DESIGN.',
  '3. Pawly - pet care, profiles, vaccine reminders, weight, appointments. IDEA STAGE.',
  '4. Motorbike Rescue - 24/7 roadside assist. IN DEVELOPMENT.',
  '5. VibeHolic - a WEB project delivered to a marketing-industry client, live at',
  '   https://vibeholic.media/ - a talent-representation and brand-collab agency.',
  '   DELIVERED. The client name and project scope are NDA-protected. The project',
  '   name VibeHolic is public.',
  '',
  'Real product UI screenshots now exist for GlossLink, Pawly and VibeHolic.',
  'Ridelink Go does not build (private package ft_patch_package plus a',
  'realm / retrofit_generator version conflict) so only its brand mark is available.',
  'Motorbike Rescue has no UI at all - it is a Spring Boot backend.',
  '',
  '## Brand, locked, derived from the logo file',
  'The logo is a blue-to-violet gradient mark with cyan circuit-line details.',
  'Extracted from public/logo/logo-dark.png by sampling the pixels:',
  '  #00249C 8.9 percent deep blue anchor',
  '  #8430B4 6.0 percent violet',
  '  #3C24A8 4.3 percent blue-violet',
  '  #9C30B4 3.0 percent magenta',
  '  #0090D8 1.9 percent cyan',
  'Centre pixel #0B2B9E.',
  '',
  '## What the owner said, verbatim, in order',
  '- "sao cang thiet ke no cang xau" - the more I design, the uglier it gets',
  '- "phong cach thiet ke nay cung qua xau" - this style is too ugly',
  '- "UI qua tho so khong co animiton, hieu ung" - too crude, no animation or effects',
  '- "UI nhin qua thoi cung khong dep" - looks too hard and rigid, not beautiful',
  '- "sua lai toan bo" - fix everything',
  '- "Ve xuong la cai gi, Ve chung toi" - prefers the plain label over the idiomatic one',
  '- "khi o che do toi thi dung sai nhieu button mau" - in dark mode do not use many coloured buttons',
  '- "dung font BE" - use Be Vietnam Pro for its Vietnamese quality',
  '- "logo la nong cot cua web nen cho no to len xiu" - the logo is the backbone, make it bigger',
  '- "khong comment code" - no code comments',
  '',
  '## The seven rejected directions, in order',
  '1. Newsroom - dark #0a0a0c, Newsreader serif, orange-red, editorial columns',
  '2. Stripe-Bento - cold white #FAFAFA, Geist, indigo #0A2540, bento mosaic',
  '3. Atelier Editorial - bone #F4F0E6, Spectral serif, oxblood #7A2E2A, broadsheet',
  '4. Typographic index - light #EDEDF2, Be Vietnam Pro, sticky rail catalogue',
  '5. Monsoon Dispatch - dark #0A0B1A, brand gradient canvas, pinned horizontal rail',
  '6. Split Studio - light sage, rounded cards, diptych, big logo',
  '7. Workbench - dark #0C0E14, device frames around real product UI',
  '',
  '## Hard constraints that survive every direction',
  '- Never fabricate metrics, testimonials, logos or client names. Every number and',
  '  status comes from src/content/products.json.',
  '- Bilingual parity enforced: every key in vi.json mirrored in en.json.',
  '- Every font must ship a real Vietnamese subset AND pass Next 15.5.4 build gate.',
  '  Be Vietnam Pro is confirmed. Never request a variable axis a family lacks.',
  '- The VibeHolic client name must never be rendered.',
  '- prefers-reduced-motion honoured; JS returns before building any tween.',
  '- No code comments anywhere.',
  '- No rendered browser chrome - no fake URL pill, no fake traffic-light dots.',
].join('\n');

phase('Research')

const [refs, postmortem, assets] = await parallel([
  () =>
    agent(
      CONTEXT +
        '\n\n# YOUR TASK - reference hunting\n\n' +
        'WebSearch and WebFetch. Find and study twelve to sixteen real sites that are NOT what the seven rejected attempts became. Hunt for studios that ship their own product AND take client work, and for sites using real product UI as primary content.\n\n' +
        'For EACH site report: URL, what the hero actually is, the section rhythm in DOM order, the real type pairing if the page loads one, the colour anchor, the nav and footer archetype, and one thing that is genuinely hard to copy.\n\n' +
        'Then answer with evidence:\n' +
        '1. What structures have NOT appeared in the seven rejected attempts?\n' +
        '2. Which of these would a Vietnamese studio owner call "dep va xin", and what specifically makes them read that way rather than clean-but-generic?\n' +
        '3. What are the strongest small-studio visual languages in 2026 beyond the obvious dark-SaaS and warm-editorial defaults?',
      { label: 'references' },
    ),

  () =>
    agent(
      CONTEXT +
        '\n\n# YOUR TASK - post-mortem, working from the actual code\n\n' +
        'Read the repo at /Users/phibui/ridelinks-techs-web. Glob and Read src/app/page.tsx, src/app/products/page.tsx, src/app/about/page.tsx, src/app/contact/page.tsx, src/components/layout/*, src/app/globals.css, src/styles/tokens.css, design.md, and several images in .screenshots/.\n\n' +
        'Seven directions shipped and all seven were rejected. Do not soften it. Diagnose the SHARED cause, not seven separate opinions.\n\n' +
        'Answer specifically:\n' +
        '1. What is structurally common to all seven that could read as crude and rigid?\n' +
        '2. The owner said it gets worse each time. What blind spot produces that trajectory?\n' +
        '3. Every direction so far is a vertical stack of sections with content inside. Is that the problem? What structural alternative has the owner never been shown?\n' +
        '4. Read the Vietnamese copy in src/i18n/vi.json. Where is it weak, generic, or written for the layout rather than the reader?\n' +
        '5. What would a designer who watched this process do differently? Cite files and lines.',
      { label: 'postmortem' },
    ),

  () =>
    agent(
      CONTEXT +
        '\n\n# YOUR TASK - the asset reality\n\n' +
        'Look at the real product interfaces. Read the images in /Users/phibui/ridelinks-techs-web/.raw/ and /Users/phibui/ridelinks-techs-web/public/products/ - gl-mobile.png, pw-mobile.png, vh-hero.png, rl-icon.png - and several site screenshots in .screenshots/.\n\n' +
        'Answer:\n' +
        '1. These five products have wildly different visual languages: VibeHolic dark with orange-red gradient, GlossLink light blue, Pawly warm cream and orange, RideLink Go blue-violet circuits, Motorbike none. How should one site present five unrelated-looking products without making them look like different companies, and without pretending they share a palette they do not share?\n' +
        '2. Three are mobile apps, one is a desktop website. What layout consequence does that mix have?\n' +
        '3. What is the most honest, most confident way to present a product whose UI you can show versus one whose UI you cannot?',
      { label: 'assets' },
    ),
])

const evidence =
  '=== REFERENCES ===\n' +
  JSON.stringify(refs).slice(0, 22000) +
  '\n\n=== POST-MORTEM ===\n' +
  JSON.stringify(postmortem).slice(0, 16000) +
  '\n\n=== ASSET REALITY ===\n' +
  JSON.stringify(assets).slice(0, 12000)

phase('Proposals')

const ANGLES = [
  {
    key: 'spatial',
    brief:
      'A SPATIAL direction. The page is a place with depth and layers rather than a stack of sections. Parallax planes, a persistent frame, content composed in a layered space, scroll that moves a camera rather than a document. The product UI is a plane floating in that space, not a card in a column.',
  },
  {
    key: 'atlas',
    brief:
      'An ATLAS direction. The catalogue IS the design: a dense, confident visual index where all five products are visible at once and comparing them is the pleasure. Reference register: design-system documentation sites, component galleries, annual reports, type specimen books. Every product gets equal real estate, statuses legible at a glance, the page reads as one artefact rather than five sections.',
  },
  {
    key: 'workroom',
    brief:
      'A WORKROOM direction. Warm, human, textured, deliberately not austere and not enterprise-dark. The studio as a room you visit: work on the walls, products on a bench, the person implied. Reference register: independent studios, print and ceramics workshops, considered editorial with a domestic register. Confident typography, real photography, generous but never empty space, and a colour world drawn from the products themselves.',
  },
]

const proposals = await pipeline(
  ANGLES,
  (a) => () =>
    agent(
      CONTEXT +
        '\n\n' +
        evidence +
        '\n\n# YOUR TASK - propose the ' +
        a.key +
        ' direction in full\n\n' +
        a.brief +
        '\n\nProduce a complete, buildable direction spec:\n' +
        '- The one-line design read.\n' +
        '- Palette: exact hex for ground, surface, sunk, ink, ink-soft, border, accent, accent-deep, plus status colours. It must sit in the brand blue-to-violet family and must not reuse any of the seven rejected grounds: #F4F0E6, #FAFAFA, #0A0B1A, #EDEDF2, #0C0E14. State the accent surface budget and exactly where it may appear.\n' +
        '- Type: display and body faces. Be Vietnam Pro must be there (owner requirement) - state precisely what role it plays and what weight and tracking carry the display register. If you need a second family, name one that ships a Vietnamese subset and has no variable-axis lie.\n' +
        '- Layout: an ASCII wireframe of the 1440px homepage, then the section rhythm in DOM order for /products, /products/[slug], /about, /contact.\n' +
        '- How the five real product interfaces are presented, including the two with no UI.\n' +
        '- Motion: the specific GSAP choreography in timeline terms this character requires. What animates and why.\n' +
        '- Nav and footer archetypes, named.\n' +
        '- The three strongest reasons this is categorically different from the seven rejects.\n\n' +
        'Be concrete enough that an engineer could build it without asking a question.',
      { label: 'proposal-' + a.key },
    ),
)

phase('Judge')

const PERSONAS = [
  'You are the OWNER. You have rejected seven designs for the same studio. Be blunt. Judge only on: will this look dep va xin, and is it obviously not another version of what I already refused?',
  'You are a senior brand designer who watched seven failed internal redesigns and read the post-mortem. Judge only on: structural distinctiveness from the seven rejects, honesty about the assets, and whether palette and type are a considered choice rather than a default.',
  'You are a design engineer who has to build this in a day. Judge only on: buildability with the existing stack, whether Vietnamese renders correctly, whether the motion is real rather than claimed, and whether five mismatched product UIs can actually be presented this way.',
]

const judges = await parallel(
  PERSONAS.map((persona, i) => () =>
    agent(
      CONTEXT +
        '\n\n' +
        evidence +
        '\n\n=== THREE PROPOSALS ===\n' +
        proposals
          .map((p) => '\n---- ' + p.label + ' ----\n' + p.report)
          .join('\n') +
        '\n\n# YOUR TASK - score, then pick\n\n' +
        persona +
        '\n\nScore each proposal 1-5 on: distinctiveness from the seven rejects, visual quality, honesty about the assets, buildability. Give a table, then name ONE winner and the three specific things it must get right. If all three are weak, say so plainly and name what is missing rather than picking the least bad.',
      { label: 'judge-' + (i + 1) },
    ),
  ),
)

return { refs, postmortem, assets, proposals, judges }
