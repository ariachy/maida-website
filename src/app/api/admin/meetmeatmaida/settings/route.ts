import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';

// Valid setting keys
const VALID_KEYS = [
  'background_color',
  'background_gradient_from',
  'background_gradient_to',
  'use_gradient',
  'footer_directions_text',
  'footer_directions_text_pt',
  'footer_directions_url',
  'footer_contact_text',
  'footer_contact_text_pt',
  'footer_contact_url',
  'footer_hours',
  'footer_address_text',
  'footer_address_url',
  'wifi_network',
  'wifi_password',
  'tagline_1',
  'tagline_1_pt',
  'tagline_2',
  'tagline_2_pt',
  'review_qr_image',
  'review_url',
];

// Default settings
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
  footer_hours: 'Wed – Mon: 12:00 – 23:00 · Fri – Sat: 12:00 – 01:00',
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
// GET /api/admin/meetmeatmaida/settings - Get all settings
// ===================
export async function GET() {
  try {
    const session = await validateSession();
    if (!session.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const settingsRaw = await prisma.meetSettings.findMany();
    
    // Merge with defaults
    const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
    settingsRaw.forEach((s) => {
      settings[s.key] = s.value;
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// ===================
// PUT /api/admin/meetmeatmaida/settings - Update settings
// ===================
export async function PUT(request: NextRequest) {
  try {
    const session = await validateSession();
    if (!session.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Settings object is required' },
        { status: 400 }
      );
    }

    // Validate and update each setting
    const updatedSettings: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(settings)) {
      if (!VALID_KEYS.includes(key)) {
        continue; // Skip invalid keys silently
      }

      const stringValue = String(value);

      // Upsert setting
      await prisma.meetSettings.upsert({
        where: { key },
        create: { key, value: stringValue },
        update: { value: stringValue },
      });

      updatedSettings[key] = stringValue;
    }

    // Fetch all settings to return
    const settingsRaw = await prisma.meetSettings.findMany();
    const allSettings: Record<string, string> = { ...DEFAULT_SETTINGS };
    settingsRaw.forEach((s) => {
      allSettings[s.key] = s.value;
    });

    return NextResponse.json({ success: true, settings: allSettings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// ===================
// POST /api/admin/meetmeatmaida/settings/reset - Reset to defaults
// ===================
export async function POST(request: NextRequest) {
  try {
    const session = await validateSession();
    if (!session.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'reset') {
      // Delete all settings (will use defaults)
      await prisma.meetSettings.deleteMany();
      
      return NextResponse.json({
        success: true,
        settings: DEFAULT_SETTINGS,
        message: 'Settings reset to defaults',
      });
    }

    if (action === 'init') {
      // Initialize with defaults if empty
      const existing = await prisma.meetSettings.count();
      if (existing === 0) {
        for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
          await prisma.meetSettings.create({
            data: { key, value },
          });
        }
      }
      
      const settingsRaw = await prisma.meetSettings.findMany();
      const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
      settingsRaw.forEach((s) => {
        settings[s.key] = s.value;
      });

      return NextResponse.json({ success: true, settings });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error with settings action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
