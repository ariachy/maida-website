import { NextRequest, NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/revalidate';

// This route must never be cached.
export const dynamic = 'force-dynamic';

/**
 * POST /api/revalidate
 * Headers: x-revalidate-secret: <REVALIDATE_SECRET>
 * Body (optional JSON): { "type": "menu" | "blog" | "all" }   // default: "all"
 *
 * Use this when content JSON is changed OUTSIDE the running app (cPanel/FTP
 * upload). When the admin app itself writes the JSON, prefer calling
 * revalidateContent() directly in the save handler instead of this endpoint.
 *
 * Example:
 *   curl -X POST https://maida.pt/api/revalidate \
 *        -H "x-revalidate-secret: $REVALIDATE_SECRET" \
 *        -H "content-type: application/json" \
 *        -d '{"type":"blog"}'
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret');

  if (!process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { success: false, error: 'REVALIDATE_SECRET is not configured on the server' },
      { status: 500 }
    );
  }

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let type: 'menu' | 'blog' | 'translations' | 'all' = 'all';
  try {
    const body = await req.json();
    if (body?.type === 'menu' || body?.type === 'blog' || body?.type === 'translations' || body?.type === 'all') {
      type = body.type;
    }
  } catch {
    // No / invalid body → revalidate everything.
  }

  const revalidated = revalidateContent(type);

  return NextResponse.json({
    success: true,
    type,
    revalidated,
    now: Date.now(),
  });
}
