// Fix LILA-banned gradients in content data + repair dev server stack + verify.
export const meta = {
  name: 'ridelinks-fix-colors-and-dev',
  description:
    'Strip LILA-violating gradients from products.ts; drop dead --signal-green/--signal-yellow tokens; repair Fraunces mini-css-extract-plugin + NextIntlClientProvider errors so all 6 routes render; verify with fresh screenshots.',
  phases: [
    { title: 'Diagnose' },
    { title: 'Fix content + tokens' },
    { title: 'Fix dev server' },
    { title: 'Verify routes + screenshot' },
  ],
};

// PHASE 1: Diagnose
phase('Diagnose');
const diag = await agent(
  [
    'You are auditing a broken Next.js 15 (App Router, TS strict, Tailwind v4) project at /Users/phibui/ridelinks-techs-web.',
    '',
    'INVESTIGATE THESE KNOWN ISSUES from the dev server log:',
    '1. Fraunces next/font/google import in src/app/layout.tsx throws: "You forgot to add mini-css-extract-plugin plugin".',
    '2. src/app/not-found.tsx throws: "Cannot read properties of undefined (reading createFilename)" inside next-intl NextIntlClientProvider.',
    '3. Stale webpack cache .next/cache/webpack/server-development causing repeated ENOENT on rename.',
    '',
    'TASKS:',
    '1. Read /tmp/dev.log tail (last 100 lines) to see the live errors.',
    '2. Read /Users/phibui/ridelinks-techs-web/src/app/layout.tsx and note the Fraunces import wiring (subsets, weights, variable name).',
    '3. Read /Users/phibui/ridelinks-techs-web/src/app/not-found.tsx in full.',
    '4. Read /Users/phibui/ridelinks-techs-web/postcss.config.mjs (or .js) and next.config.ts.',
    '5. Read /Users/phibui/ridelinks-techs-web/src/i18n/config.ts and any request config that sets up next-intl.',
    '6. Grep src/app/_home/ for color hotspots: amber/signal/gradient/blue/purple/cyan/fuchsia.',
    '7. Read /Users/phibui/ridelinks-techs-web/src/app/_home/Hero.tsx to inspect actual color usage on Home.',
    '8. List: root cause of Fraunces mini-css-extract-plugin (likely PostCSS conflict; Next 15.5 + Fraunces + sharp/esbuild approval).',
    '9. List: root cause of NextIntlClientProvider createFilename in not-found.tsx (likely missing messages prop or server/client boundary).',
    '',
    'Return plain-text diagnosis: (a) root cause of each error, (b) proposed minimal fix, (c) suspect color hotspots in Home.',
  ].join('\n'),
);

// PHASE 2: Fix content + tokens
phase('Fix content + tokens');
const contentfix = await agent(
  [
    'PURGE LILA-violating dead data and drop dead alias tokens per HALLMARK stamp.',
    '',
    'DIAGNOSIS:',
    diag,
    '',
    'TASKS:',
    '',
    '1) /Users/phibui/ridelinks-techs-web/src/content/products.ts:',
    '   - Confirmed via grep that NO React component reads product.mock.gradient or product.mock.kind. The 5 mock.gradient strings are dead AI-cliche data.',
    '   - Delete the mock field from the Product type entirely (lines ~19-26 type def + all 5 mock entries on the 5 products).',
    '   - Drop ProductMockKind type export if no longer used.',
    '   - Verify after edit: grep -rn "mock.gradient|mock.kind" /Users/phibui/ridelinks-techs-web/src/ must be empty.',
    '',
    '2) /Users/phibui/ridelinks-techs-web/src/styles/tokens.css:',
    '   - Drop dead tokens --signal-green (light + .dark) and --signal-yellow (light + .dark) — they duplicate --ok and --hold with confusing names. The synthesis called for a single --signal accent only.',
    '   - Confirm nothing consumes them: grep -rn "signal-green|signal-yellow" /Users/phibui/ridelinks-techs-web/src/ must be empty after edit.',
    '',
    '3) /Users/phibui/ridelinks-techs-web/src/app/products/_product/ProductMock.tsx:',
    '   - The dot-grid backdrop (line ~62) uses backgroundImage: radial-gradient(circle, var(--ink-rule) 1px, transparent 1px) at 16px spacing. This is a TEXTURE pattern (1px dots), not a hero glow. Keep the texture; add a code comment naming the ceiling (1px texture, not a glow).',
    '',
    '4) After each edit, run: cd /Users/phibui/ridelinks-techs-web && npx tsc --noEmit to confirm types valid.',
    '5) Run: cd /Users/phibui/ridelinks-techs-web && npm run check:content to confirm products still pass content gate.',
    '',
    'Return: list of files touched, lines deleted (count), final grep proofs that no LILA-violating strings remain in products.ts and no signal-green/signal-yellow in tokens.',
  ].join('\n'),
);

// PHASE 3: Fix dev server
phase('Fix dev server');
const devfix = await agent(
  [
    'REPAIR the running dev server so all 6 routes return 200.',
    '',
    'CURRENT ERRORS:',
    '- Fraunces next/font/google throws mini-css-extract-plugin error.',
    '- next-intl NextIntlClientProvider throws "Cannot read properties of undefined (reading createFilename)" inside src/app/not-found.tsx.',
    '',
    'DIAGNOSIS:',
    diag,
    '',
    'CONTENTFIX RESULT:',
    contentfix,
    '',
    'TASKS:',
    '1. Read /tmp/dev.log tail to see precise errors.',
    '2. Kill stale .next/cache: rm -rf /Users/phibui/ridelinks-techs-web/.next/cache.',
    '',
    '3. For Fraunces mini-css-extract-plugin error:',
    '   - Read /Users/phibui/ridelinks-techs-web/postcss.config.mjs.',
    '   - Common fix: replace next/font/google Fraunces with a local @font-face import in globals.css so the .pull-quote class can resolve it via system fallback (serif). The .pull-quote is used exactly once on /about.',
    '   - Alternative: keep next/font/google but ensure no conflicting PostCSS pipeline.',
    '   - Verify Fraunces is still resolved: curl http://localhost:3001/about, grep response for any font-family reference.',
    '',
    '4. For NextIntlClientProvider not-found.tsx:',
    '   - Read /Users/phibui/ridelinks-techs-web/src/app/not-found.tsx.',
    '   - Fix: either remove NextIntlClientProvider from not-found.tsx (not-found is a server component, can use getTranslations directly), or pass the required messages prop.',
    '   - Check next-intl setup in src/i18n/ to understand the locale-loading pattern.',
    '',
    '5. After fixes, kill existing dev server and start fresh:',
    '   cd /Users/phibui/ridelinks-techs-web',
    '   pkill -f "next dev" 2>/dev/null || true',
    '   rm -rf .next/cache',
    '   nohup npm run dev > /tmp/dev-after-fix.log 2>&1 &',
    '   sleep 8',
    '',
    '6. Then verify with curl:',
    '   for path in / /products /products/ridelink-go /about /contact /not-found-test-fake-url; do',
    '     code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001${path})',
    '     echo "${path}: ${code}"',
    '   done',
    '   (Use whatever port pnpm/npm chose if 3001 is taken; check the boot log.)',
    '',
    '7. If any route still 500s, read /tmp/dev-after-fix.log tail, identify the remaining stack, fix, and retry.',
    '',
    'Return: proof of working dev — show each curl status code per route, grep of fresh dev log showing no Fraunces or NextIntlClientProvider errors.',
  ].join('\n'),
);

// PHASE 4: Verify routes + screenshot
phase('Verify routes + screenshot');
const verify = await agent(
  [
    'LIVE-SITE verification: screenshot every route to confirm no AI-purple/cyan/fuchsia gradient leaks, no broken layouts.',
    '',
    'WORKING DIR: /Users/phibui/ridelinks-techs-web',
    'DEV: http://localhost:3001 (or whatever port is live; verify with curl first)',
    '',
    'TASKS:',
    '1. Use chrome-devtools MCP (mcp__chrome-devtools__*):',
    '   For each route /, /products, /products/ridelink-go, /about, /contact and a 404 test (e.g. /this-page-does-not-exist):',
    '     - navigate_page type=url',
    '     - take_snapshot to confirm content loaded (no "Internal Server Error" text)',
    '     - take_screenshot 1440x900 saved as /Users/phibui/ridelinks-techs-web/_screenshots/after-fix-{route}.jpeg',
    '   If any page shows 500 or Internal Server Error, fail loud — report exact file:line of remaining stack.',
    '',
    '2. Eyeball each screenshot for:',
    '   - No purple/cyan/fuchsia large-surface bleed.',
    '   - Workshop amber only on active ticks / primary CTA / studio open / focus-visible.',
    '   - Hero, products, detail, about, contact all use warm cream over graphite, mono display.',
    '   - Pull-quote (Fraunces or fallback serif) appears once on /about if anywhere.',
    '   - No fake chrome, no fake screenshots, no logo walls.',
    '',
    '3. Run CI gates: cd /Users/phibui/ridelinks-techs-web && npx tsc --noEmit && npm run lint && npm run check:content && npm run check:i18n. All must pass.',
    '',
    '4. Re-read src/content/products.ts and src/styles/tokens.css to confirm:',
    '   - products.ts has NO mock field, NO gradient string, NO tailwind from-/via-/to- classes',
    '   - tokens.css has NO --signal-green, NO --signal-yellow',
    '   - ProductMock.tsx dot-grid radial-gradient is still a 1px texture pattern (acceptable)',
    '',
    'Return: verdict (SHIP / FIX-AND-RESHIP), list of screenshots saved, summary table (route | http | colors | notes).',
  ].join('\n'),
);

return { diag, contentfix, devfix, verify };
