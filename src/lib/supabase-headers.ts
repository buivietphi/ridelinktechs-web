/** Build server-side Supabase headers for legacy JWT and opaque secret API keys. */
export function supabaseHeaders(
  key: string,
  extra: Readonly<Record<string, string>> = {},
): Record<string, string> {
  const requestHeaders = Object.fromEntries(
    Object.entries(extra).filter(
      ([name]) => !['apikey', 'authorization'].includes(name.toLowerCase()),
    ),
  );

  return {
    apikey: key,
    ...(key.startsWith('sb_secret_') ? {} : { Authorization: `Bearer ${key}` }),
    Accept: 'application/json',
    ...requestHeaders,
  };
}
