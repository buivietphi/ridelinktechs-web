/**
 * Verifies vi.json and en.json have the same key shape with no empty values.
 * Run via `npm run check:i18n`.
 */

import vi from '../src/i18n/vi.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };

let errors = 0;

function fail(msg: string): void {
  console.error(`✗ ${msg}`);
  errors++;
}

function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') {
      out[key] = v;
    } else if (v && typeof v === 'object') {
      Object.assign(out, flatten(v as Record<string, unknown>, key));
    }
  }
  return out;
}

const viFlat = flatten(vi as Record<string, unknown>);
const enFlat = flatten(en as Record<string, unknown>);

for (const key of Object.keys(viFlat)) {
  if (!(key in enFlat)) fail(`Key missing in en.json: ${key}`);
  if (!enFlat[key]) fail(`Empty value in en.json: ${key}`);
}
for (const key of Object.keys(enFlat)) {
  if (!(key in viFlat)) fail(`Key missing in vi.json: ${key}`);
  if (!viFlat[key]) fail(`Empty value in vi.json: ${key}`);
}

if (errors > 0) {
  console.error(`\n${errors} i18n parity error(s).`);
  process.exit(1);
}
console.log(
  `✓ i18n parity OK (${Object.keys(viFlat).length} keys in vi.json, ${Object.keys(enFlat).length} in en.json).`,
);
