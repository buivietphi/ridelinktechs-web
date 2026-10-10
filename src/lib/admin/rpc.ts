import 'server-only';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export type RpcFailure =
  'unauthenticated' | 'password_change_required' | 'forbidden' | 'unavailable';

const RAISED = new Set<RpcFailure>(['unauthenticated', 'password_change_required', 'forbidden']);

export class RpcError extends Error {
  constructor(readonly code: RpcFailure) {
    super(code);
  }
}

export async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  if (!SUPABASE_URL || !KEY) throw new RpcError('unavailable');

  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    throw new RpcError('unavailable');
  }

  const text = await res.text();
  if (!res.ok) {
    let message = '';
    try {
      message = (JSON.parse(text) as { message?: string }).message ?? '';
    } catch {}
    if (RAISED.has(message as RpcFailure)) throw new RpcError(message as RpcFailure);
    console.error('[admin] rpc failed', name, res.status, text.slice(0, 300));
    throw new RpcError('unavailable');
  }
  return (text ? JSON.parse(text) : null) as T;
}
