import { NextResponse } from 'next/server';
import { getLatestBlogPost } from '@/lib/content';

// Cheap JSON endpoint; render per request so it always reflects the current
// blog.json on disk (no build needed after a publish).
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const latest = await getLatestBlogPost();

    if (!latest) {
      return NextResponse.json({ success: false, error: 'No posts found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      post: {
        slug: latest.slug,
        title: latest.title,
        excerpt: latest.excerpt,
        image: latest.image,
        tags: latest.tags,
      },
    });
  } catch (error) {
    console.error('Error fetching latest blog post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch latest blog post' },
      { status: 500 }
    );
  }
}
