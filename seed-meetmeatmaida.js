const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding Meet Me at Maída data...\n');

  // Clear existing data
  await prisma.meetItem.deleteMany();
  await prisma.meetSection.deleteMany();
  console.log('✓ Cleared existing sections and items');

  // Section 1: Main Links (no header)
  const mainLinks = await prisma.meetSection.create({
    data: {
      title: '',
      titlePt: '',
      order: 0,
      isActive: true,
    },
  });
  console.log('✓ Created section: Main Links');

  // Item 1: View our Menu
  await prisma.meetItem.create({
    data: {
      sectionId: mainLinks.id,
      type: 'button',
      title: 'View our Menu',
      titlePt: 'Ver o nosso Menu',
      url: '/menu',
      icon: '',
      color: 'olive',
      order: 0,
      isActive: true,
    },
  });
  console.log('  + View our Menu');

  // Item 2: Book a Table
  await prisma.meetItem.create({
    data: {
      sectionId: mainLinks.id,
      type: 'button',
      title: 'Book a Table',
      titlePt: 'Reservar Mesa',
      url: 'https://umai.rest/maida',
      icon: '',
      color: 'terracotta',
      order: 1,
      isActive: true,
    },
  });
  console.log('  + Book a Table');

  // Item 3: Follow us on Instagram
  await prisma.meetItem.create({
    data: {
      sectionId: mainLinks.id,
      type: 'button',
      title: 'Follow us on Instagram',
      titlePt: 'Segue-nos no Instagram',
      url: 'https://www.instagram.com/maida.pt/',
      icon: '',
      color: 'outline',
      order: 2,
      isActive: true,
    },
  });
  console.log('  + Follow us on Instagram');

  // Section 2: WiFi (no header)
  const wifiSection = await prisma.meetSection.create({
    data: {
      title: '',
      titlePt: '',
      order: 1,
      isActive: true,
    },
  });
  console.log('✓ Created section: WiFi');

  // Item: Connect to Wi-Fi
  await prisma.meetItem.create({
    data: {
      sectionId: wifiSection.id,
      type: 'wifi',
      title: 'Connect to Wi-Fi',
      titlePt: 'Ligar ao Wi-Fi',
      color: 'cream',
      order: 0,
      isActive: true,
    },
  });
  console.log('  + Connect to Wi-Fi');

  // Section 3: Blog
  const blogSection = await prisma.meetSection.create({
    data: {
      title: 'FROM OUR BLOG',
      titlePt: 'DO NOSSO BLOG',
      order: 2,
      isActive: true,
    },
  });
  console.log('✓ Created section: From Our Blog');

  // Item: Blog auto-pull
  await prisma.meetItem.create({
    data: {
      sectionId: blogSection.id,
      type: 'blog',
      title: 'Latest Blog Post',
      titlePt: 'Último Post do Blog',
      color: 'terracotta',
      order: 0,
      isActive: true,
    },
  });
  console.log('  + Blog (auto-pull latest)');

  // Section 4: Reviews (no header)
  const reviewSection = await prisma.meetSection.create({
    data: {
      title: '',
      titlePt: '',
      order: 3,
      isActive: true,
    },
  });
  console.log('✓ Created section: Reviews');

  // Item: Google Review
  await prisma.meetItem.create({
    data: {
      sectionId: reviewSection.id,
      type: 'review',
      title: 'Leave a Google Review',
      titlePt: 'Deixe uma Avaliação no Google',
      url: 'https://g.page/r/CekajMhTuxkxEBM/review',
      color: 'olive',
      order: 0,
      isActive: true,
      metadata: JSON.stringify({ qrImage: '' }),
    },
  });
  console.log('  + Leave a Google Review');

  console.log('\n✅ Seeding complete! Restart dev server and visit /meetmeatmaida');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
