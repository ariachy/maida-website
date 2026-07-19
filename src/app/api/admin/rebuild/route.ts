import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { revalidateContent } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/rebuild
 *
 * REPURPOSED. This used to set a .maintenance flag, delete .next, and run
 * `npm run build` in a detached script — which cannot work on this shared host
 * (next build EAGAINs on worker spawn under the LVE memory ceiling).
 *
 * Content now reads JSON from disk at request time (see src/lib/content.ts), so
 * "making content live" no longer needs a build at all — it just needs the route
 * caches invalidated. This endpoint now does exactly that, instantly, with no
 * maintenance page. The admin's existing "Rebuild"/"Publish" button can keep
 * calling this same URL with no UI change.
 *
 * The content SAVE handler (the one that writes src/data/*.json) is unchanged and
 * keeps writing the files; this is the "publish" step that follows it.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await validateSession();
    if (!session.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Safety cleanup: if a previous (failed) build left the site stuck behind the
    // maintenance flag, clear it now so this button also un-sticks the site.
    try {
      const maintenanceFlag = path.join(process.cwd(), '.maintenance');
      if (existsSync(maintenanceFlag)) {
        await unlink(maintenanceFlag);
      }
    } catch {
      // non-fatal
    }

    // Optional body: { "type": "menu" | "blog" | "all" } — defaults to "all".
    let type: 'menu' | 'blog' | 'translations' | 'all' = 'all';
    try {
      const body = await request.json();
      if (body?.type === 'menu' || body?.type === 'blog' || body?.type === 'translations' || body?.type === 'all') {
        type = body.type;
      }
    } catch {
      // no body → revalidate everything
    }

    const revalidated = revalidateContent(type);

    return NextResponse.json({
      success: true,
      message: 'Published. Content is live — no build required.',
      type,
      revalidated,
    });
  } catch (error: any) {
    console.error('Publish (rebuild) error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to publish', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/rebuild
 * Status check. There is no long-running build anymore, so this just reports
 * whether the site is currently behind the maintenance flag (it normally is not).
 */
export async function GET() {
  try {
    const session = await validateSession();
    if (!session.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const maintenanceFlag = path.join(process.cwd(), '.maintenance');
    const inMaintenance = existsSync(maintenanceFlag);

    return NextResponse.json({
      success: true,
      // Kept for compatibility with any admin UI that polls this field; publishing
      // is now synchronous, so this is effectively always false.
      isRebuilding: inMaintenance,
      inMaintenance,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}
