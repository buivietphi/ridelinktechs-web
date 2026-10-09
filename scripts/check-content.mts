/**
 * Validates content modules against the rules in spec/001/data-model.md.
 * Run via `npm run check:content`.
 *
 * `products` now lives in `src/content/products.json` (single source of truth
 * so the user can add a product without touching TypeScript). The thin
 * loader at `src/content/products.ts` re-exports the typed array and is
 * imported here for convenience.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
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
  if (!p.kind?.vi || !p.kind?.en) {
    fail(`Product ${p.slug}: kind is required in both languages (shown in the header menu)`);
  } else if (p.kind.vi.length > 32 || p.kind.en.length > 32) {
    fail(`Product ${p.slug}: kind must stay under 32 characters`);
  }

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

  for (const mark of p.timeline) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mark.date)) {
      fail(`Product ${p.slug}: timeline date "${mark.date}" must be YYYY-MM`);
    }
  }

  for (const file of [p.image, ...(p.screens ?? [])]) {
    if (file && !existsSync(join(process.cwd(), 'public', file))) {
      fail(`Product ${p.slug}: missing image ${file}`);
    }
  }
  if (p.screenCaptions && p.screenCaptions.length !== (p.screens?.length ?? 0)) {
    fail(`Product ${p.slug}: screenCaptions must match screens one to one`);
  }
  if (!p.screenCaptions && p.screens?.length) {
    fail(`Product ${p.slug}: screens need screenCaptions`);
  }

  if (p.howItWorks && (p.howItWorks.length < 3 || p.howItWorks.length > 4)) {
    fail(`Product ${p.slug}: howItWorks must have 3-4 steps`);
  }
  if (p.faq && (p.faq.length < 2 || p.faq.length > 6)) {
    fail(`Product ${p.slug}: faq must have 2-6 entries`);
  }

  if (p.status !== 'shipped') {
    const labels = p.timeline.map((t) => t.label.en.toLowerCase());
    if (!labels.some((l) => l.includes('idea')))
      fail(`Product ${p.slug}: timeline must include an "Idea" mark`);
    if (!labels.some((l) => l.includes('dev')))
      fail(`Product ${p.slug}: timeline must include a "Dev start" mark`);
  }
}

if (products.filter((p) => p.featured).length > 1) fail('Only one product can be featured');
pass(`Checked ${products.length} products, ${seenSlugs.size} unique slugs`);

const dashes = (node: unknown, path: string): void => {
  if (typeof node === 'string') {
    if (/[—–]/.test(node)) fail(`${path}: contains an em or en dash`);
    return;
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) dashes(value, `${path}.${key}`);
  }
};
dashes(products, 'products');
dashes(about, 'about');

if (!company.name || company.name.length > 60) fail(`company.name invalid`);
if (!emailRe.test(company.email)) fail(`company.email invalid`);
if (!phoneDisplayRe.test(company.phoneDisplay)) fail(`company.phoneDisplay invalid`);
if (!phoneHrefRe.test(company.phoneHref)) fail(`company.phoneHref invalid`);
if (!company.address.vi || !company.address.en) fail(`company.address missing in one language`);
if (company.socials.length > 8) fail(`company.socials > 8 entries`);
pass('CompanyProfile valid');

const bothLangs = (node: unknown, path: string): void => {
  if (!node || typeof node !== 'object') return;
  const rec = node as Record<string, unknown>;
  if (typeof rec.vi === 'string' && typeof rec.en === 'string') {
    if (!rec.vi.trim() || !rec.en.trim()) fail(`${path}: empty in one language`);
    return;
  }
  for (const [key, value] of Object.entries(rec)) bothLangs(value, `${path}.${key}`);
};
bothLangs(about, 'about');
bothLangs(products, 'products');

const langs = ['vi', 'en'] as const;
const within = (text: string, min: number, max: number) => text.length >= min && text.length <= max;

if (about.hero.titleLines.length !== 2) fail('about.hero.titleLines must have 2 lines');
for (const line of about.hero.titleLines) {
  for (const lang of langs) {
    if (!within(line[lang], 1, 36)) fail(`about.hero.titleLines ${lang} out of 1-36 range`);
  }
}
for (const lang of langs) {
  if (!within(about.hero.lede[lang], 40, 160)) fail(`about.hero.lede.${lang} out of 40-160 range`);
  if (!within(about.statement[lang], 60, 240)) fail(`about.statement.${lang} out of 60-240 range`);
}
if (about.intro.paragraphs.length !== 2) fail('about.intro.paragraphs must have 2 entries');
for (const paragraph of about.intro.paragraphs) {
  for (const lang of langs) {
    if (!within(paragraph[lang], 80, 420))
      fail(`about.intro.paragraphs ${lang} out of 80-420 range`);
  }
}
for (const lang of langs) {
  if (!within(about.intro.mission[lang], 60, 260)) {
    fail(`about.intro.mission.${lang} out of 60-260 range`);
  }
}
if (about.practice.items.length !== 3) fail('about.practice.items must have 3 entries');
for (const item of about.practice.items) {
  for (const lang of langs) {
    if (!within(item.body[lang], 100, 480)) {
      fail(`about.practice ${item.id}.body.${lang} out of 100-480 range`);
    }
  }
  for (const image of [item.image, item.image2]) {
    if (image && !existsSync(join(process.cwd(), 'public', image))) {
      fail(`about.practice ${item.id}: missing image ${image}`);
    }
  }
}
if (about.story.eras.length < 3 || about.story.eras.length > 8) {
  fail('about.story.eras must be 3-8 entries');
}
for (const era of about.story.eras) {
  if (era.range && era.range.some((date) => !/^\d{4}-(0[1-9]|1[0-2])$/.test(date))) {
    fail(`about.story ${era.id}: range must be YYYY-MM`);
  }
  if (era.image && !existsSync(join(process.cwd(), 'public', era.image))) {
    fail(`about.story ${era.id}: missing image ${era.image}`);
  }
}
if (about.focusAreas.length < 3 || about.focusAreas.length > 6)
  fail('about.focusAreas must be 3-6 entries');
if (about.teamMembers.length > 12) fail('about.teamMembers > 12 entries');
pass('AboutContent valid');

if (errors > 0) {
  console.error(`\n${errors} content validation error(s).`);
  process.exit(1);
}
console.log('\nAll content valid.');
