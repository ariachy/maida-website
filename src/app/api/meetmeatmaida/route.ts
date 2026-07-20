import { CANONICAL_MEET_HOURS } from '@/lib/meet-hours';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLatestBlogPost } from '@/lib/content';

// Uses Prisma (already dynamic) and reads blog.json from disk; force-dynamic
// keeps the latest-post block current after a publish with no build.
export const dynamic = 'force-dynamic';

// Default settings - must match what the page expects
const DEFAULT_SETTINGS: Record<string, string> = {
  background_color: '#F5F0E8',
  background_gradient_from: '#F5F0E8',
  background_gradient_to: '#EDE8E0',
  use_gradient: 'false',
  footer_directions_text: 'Directions',
  footer_directions_text_pt: 'Direções',
  footer_directions_url: 'https://maps.google.com/?q=Rua+da+Boavista+66+1200-068+Lisboa',
  footer_contact_text: 'Contact',
  footer_contact_text_pt: 'Contacto',
  footer_contact_url: 'mailto:info@maida.pt',
  footer_hours: CANONICAL_MEET_HOURS,
  footer_address_text: 'Rua da Boavista 66, 1200-068, Lisboa',
  footer_address_url: 'https://maps.google.com/?q=Rua+da+Boavista+66+1200-068+Lisboa',
  wifi_network: 'Maida-Guest',
  wifi_password: 'MaidaGuest',
  tagline_1: 'Mediterranean Flavours. Lebanese Soul.',
  tagline_1_pt: 'Sabores Mediterrâneos. Alma Libanesa.',
  tagline_2: 'A place where flavors, music, and good company come together. Rooted in tradition, reimagined for today.',
  tagline_2_pt: 'Um lugar onde sabores, música e boa companhia se encontram. Enraizado na tradição, reinventado para hoje.',
  review_qr_image: '',
  review_url: 'https://g.page/r/maida/review',
};

// ===================
// GET /api/meetmeatmaida - Get all public page data
// ===================
export async function GET() {
  try {
    // Get all active sections with their active items
    const sections = await prisma.meetSection.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: 'asc',
      },
      include: {
        items: {
          where: {
            isActive: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    // Get all settings and merge with defaults
    const settingsRaw = await prisma.meetSettings.findMany();
    const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
    settingsRaw.forEach((s) => {
      settings[s.key] = s.value;
    });

    // Get latest blog post from blog.json on disk (via the server-only loader)
    let latestBlogPost = null;
    try {
      const latest = await getLatestBlogPost();
      if (latest) {
        latestBlogPost = {
          slug: latest.slug,
          title: latest.title,
          excerpt: latest.excerpt,
          image: latest.image,
          tags: latest.tags,
        };
      }
    } catch {
      // Blog data failed, continue without it
    }

    return NextResponse.json({
      success: true,
      sections,
      settings,
      latestBlogPost,
    });
  } catch (error) {
    console.error('Error fetching page data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch page data' },
      { status: 500 }
    );
  }
}
