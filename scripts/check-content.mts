/**
 * Validates content modules against the rules in spec/001/data-model.md.
 * Run via `npm run check:content`.
 *
 * `products` now lives in `src/content/products.json` (single source of truth
 * so the user can add a product without touching TypeScript). The thin
 * loader at `src/content/products.ts` re-exports the typed array and is
 * imported here for convenience.
 */

import { products } from '../src/content/products.ts';
import { company } from '../src/content/company.ts';
import { about } from '../src/content/about.ts';

let errors = 0;

function fail(msg: string): void {
  console.error(`✗ ${msg}`);
  errors++;
}

function pass(msg: string): void {
  console.log(`✓ ${msg}`);
}

const slugRe = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneDisplayRe = /^0\d{9,10}$/;
const phoneHrefRe = /^\+84\d{9,10}$/;

const seenSlugs = new Set<string>();
for (const p of products) {
  if (seenSlugs.has(p.slug)) fail(`Duplicate product slug: ${p.slug}`);
  seenSlugs.add(p.slug);
  if (!slugRe.test(p.slug)) fail(`Product ${p.slug}: invalid slug`);

  if (!p.name.vi || !p.name.en) fail(`Product ${p.slug}: name must be non-empty in both languages`);

  if (p.tagline.vi.length > 80) fail(`Product ${p.slug}: tagline.vi > 80 chars`);
  if (p.tagline.en.length > 80) fail(`Product ${p.slug}: tagline.en > 80 chars`);

  if (p.description.vi.length < 50 || p.description.vi.length > 600) {
    fail(`Product ${p.slug}: description.vi out of 50-600 range`);
  }
  if (p.description.en.length < 50 || p.description.en.length > 600) {
    fail(`Product ${p.slug}: description.en out of 50-600 range`);
  }

  if (p.category === 'prod' && p.clientName) {
    fail(`Product ${p.slug}: in-house product must not have clientName`);
  }
  if (p.category === 'outsource' && p.status === 'in-development') {
    fail(`Product ${p.slug}: outsource products cannot be in-development`);
  }

  if (p.status !== 'shipped') {
    const labels = p.timeline.map((t) => t.label.en.toLowerCase());
    if (!labels.some((l) => l.includes('idea')))
      fail(`Product ${p.slug}: timeline must include an "Idea" mark`);
    if (!labels.some((l) => l.includes('dev')))
      fail(`Product ${p.slug}: timeline must include a "Dev start" mark`);
  }
}

pass(`Checked ${products.length} products, ${seenSlugs.size} unique slugs`);

if (!company.name || company.name.length > 60) fail(`company.name invalid`);
if (!emailRe.test(company.email)) fail(`company.email invalid`);
if (!phoneDisplayRe.test(company.phoneDisplay)) fail(`company.phoneDisplay invalid`);
if (!phoneHrefRe.test(company.phoneHref)) fail(`company.phoneHref invalid`);
if (!company.address.vi || !company.address.en) fail(`company.address missing in one language`);
if (company.socials.length > 8) fail(`company.socials > 8 entries`);
pass('CompanyProfile valid');

if (
  !about.heroTitle.vi ||
  !about.heroTitle.en ||
  about.heroTitle.vi.length > 80 ||
  about.heroTitle.en.length > 80
)
  fail('about.heroTitle invalid');
if (about.story.vi.length < 200 || about.story.vi.length > 1500)
  fail('about.story.vi out of 200-1500 range');
if (about.story.en.length < 200 || about.story.en.length > 1500)
  fail('about.story.en out of 200-1500 range');
if (about.mission.vi.length < 50 || about.mission.vi.length > 300)
  fail('about.mission.vi out of 50-300 range');
if (about.mission.en.length < 50 || about.mission.en.length > 300)
  fail('about.mission.en out of 50-300 range');
if (about.focusAreas.length < 3 || about.focusAreas.length > 6)
  fail('about.focusAreas must be 3-6 entries');
if (about.teamMembers.length > 12) fail('about.teamMembers > 12 entries');
pass('AboutContent valid');

if (errors > 0) {
  console.error(`\n${errors} content validation error(s).`);
  process.exit(1);
}
console.log('\nAll content valid.');
