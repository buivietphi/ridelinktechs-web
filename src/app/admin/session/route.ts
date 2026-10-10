import { NextResponse } from 'next/server';
import { getSessionState } from '@/lib/admin/session';

const NO_STORE = { 'Cache-Control': 'no-store' };

export async function GET() {
  const state = await getSessionState().catch(() => null);
  if (!state) return NextResponse.json(null, { status: 503, headers: NO_STORE });
  if (!state.session) {
    return NextResponse.json({ ended: state.ended }, { status: 401, headers: NO_STORE });
  }
  return NextResponse.json({ role: state.session.role }, { headers: NO_STORE });
}
