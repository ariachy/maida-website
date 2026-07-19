// scripts/seed-review-platforms.ts
// Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-review-platforms.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding review platforms...\n');

  // Google Reviews - Primary
  const google = await prisma.reviewPlatform.upsert({
    where: { id: 'google' },
    update: {},
    create: {
      id: 'google',
      name: 'Google',
      url: 'https://search.google.com/local/writereview?placeid=ChIJeaI0uTIzGQ0R6ZrIPLUbGQM',
      icon: 'google',
      isActive: true,
      isPrimary: true,
      order: 1,
    },
  });
  console.log('✅ Google Reviews:', google.url);

  // TripAdvisor
  const tripadvisor = await prisma.reviewPlatform.upsert({
    where: { id: 'tripadvisor' },
    update: {},
    create: {
      id: 'tripadvisor',
      name: 'TripAdvisor',
      url: 'https://www.tripadvisor.com/Restaurant_Review-g189158-d33362729-Reviews-Maida-Lisbon_Lisbon_District_Central_Portugal.html',
      icon: 'tripadvisor',
      isActive: true,
      isPrimary: false,
      order: 2,
    },
  });
  console.log('✅ TripAdvisor:', tripadvisor.url);

  // TheFork - Inactive placeholder (enable when ready)
  const thefork = await prisma.reviewPlatform.upsert({
    where: { id: 'thefork' },
    update: {},
    create: {
      id: 'thefork',
      name: 'TheFork',
      url: '', // Add URL when available
      icon: 'thefork',
      isActive: false, // Disabled until URL is added
      isPrimary: false,
      order: 3,
    },
  });
  console.log('⏸️  TheFork: (inactive - add URL in admin panel)');

  console.log('\n✨ Review platforms seeded successfully!');
  console.log('\nYou can manage these in the admin panel at /admin/reviews/settings');
}

main()
  .catch((e) => {
    console.error('Error seeding platforms:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
