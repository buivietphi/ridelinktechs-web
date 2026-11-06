import assert from 'node:assert/strict';
import test from 'node:test';
import { supabaseHeaders } from '../src/lib/supabase-headers';

const secretKey = 'sb_secret_test-only-placeholder';
const legacyKey = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.test-signature';

test('opaque secret keys authenticate through apikey without a bearer token', () => {
  assert.deepEqual(supabaseHeaders(secretKey), {
    apikey: secretKey,
    Accept: 'application/json',
  });
});

test('legacy JWT keys retain bearer authentication', () => {
  assert.deepEqual(supabaseHeaders(legacyKey), {
    apikey: legacyKey,
    Authorization: `Bearer ${legacyKey}`,
    Accept: 'application/json',
  });
});

test('request-specific headers are preserved without changing the input', () => {
  const extra = Object.freeze({
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  });

  assert.deepEqual(supabaseHeaders(secretKey, extra), {
    apikey: secretKey,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  });
  assert.deepEqual(extra, {
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  });
});

test('extra headers cannot attach bearer tokens to an opaque key or replace its apikey', () => {
  const extra = {
    authorization: 'Bearer user-token',
    Authorization: 'Bearer stale-token',
    APIKEY: 'ignored',
  };

  assert.deepEqual(supabaseHeaders(secretKey, extra), {
    apikey: secretKey,
    Accept: 'application/json',
  });
});

test('extra credentials cannot replace the selected legacy key', () => {
  assert.deepEqual(
    supabaseHeaders(legacyKey, { Authorization: 'Bearer stale-token', apikey: 'old' }),
    {
      apikey: legacyKey,
      Authorization: `Bearer ${legacyKey}`,
      Accept: 'application/json',
    },
  );
});
