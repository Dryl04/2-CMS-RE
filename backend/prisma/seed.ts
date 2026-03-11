import { PrismaClient, ThemeSource } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.sectionType.createMany({
    data: [
      {
        name: 'hero',
        label: 'Hero',
        description: 'Section d\'accroche principale.',
        icon: 'layout-template',
        isSystem: true,
      },
      {
        name: 'features',
        label: 'Features',
        description: 'Bloc de mise en avant des bénéfices.',
        icon: 'sparkles',
        isSystem: true,
      },
      {
        name: 'faq',
        label: 'FAQ',
        description: 'Questions fréquemment posées.',
        icon: 'message-circle-question',
        isSystem: true,
      }
    ],
    skipDuplicates: true
  });

  await prisma.pageTheme.createMany({
    data: [
      {
        name: 'Editorial',
        description: 'Typographie sobre pour contenus riches.',
        css: {
          headingFont: 'Playfair Display',
          bodyFont: 'Inter'
        },
        isDefault: true
      },
      {
        name: 'Landing Bright',
        description: 'Palette plus vive pour landing pages.',
        css: {
          headingFont: 'Poppins',
          bodyFont: 'Inter'
        }
      }
    ],
    skipDuplicates: true
  });

  await prisma.fontsLibrary.createMany({
    data: [
      {
        fontName: 'Inter',
        fontFamily: 'Inter, sans-serif',
        fontWeights: ['400', '500', '600', '700'],
        isGoogleFont: true,
        isSystem: true
      },
      {
        fontName: 'Playfair Display',
        fontFamily: '"Playfair Display", serif',
        fontWeights: ['400', '700'],
        isGoogleFont: true,
        isSystem: true
      }
    ],
    skipDuplicates: true
  });

  await prisma.daisyuiTheme.createMany({
    data: [
      {
        name: 'Light',
        slug: 'light',
        source: ThemeSource.daisyui,
        tokens: {
          primary: '#570df8',
          secondary: '#f000b8',
          accent: '#37cdbe',
          neutral: '#3d4451',
          'base-100': '#ffffff'
        },
        isActive: true
      },
      {
        name: 'Business',
        slug: 'business',
        source: ThemeSource.daisyui,
        tokens: {
          primary: '#1C4E80',
          secondary: '#0091D5',
          accent: '#7DB9DE',
          neutral: '#202C39',
          'base-100': '#f7f9fb'
        },
        isActive: true
      }
    ],
    skipDuplicates: true
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
