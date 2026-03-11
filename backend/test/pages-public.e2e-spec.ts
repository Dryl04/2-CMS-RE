import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PageStatus } from '@prisma/client';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Pages public endpoints (e2e)', () => {
  let app: INestApplication;
  const prismaMock = {
    seoMetadata: {
      findFirst: jest.fn(),
    },
    seoRedirect: {
      findMany: jest.fn(),
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a published page without authentication', async () => {
    prismaMock.seoMetadata.findFirst.mockResolvedValue({
      id: 'b7861499-57d6-44ed-a26a-f30f278590d0',
      pageKey: 'landing/flora',
      title: 'Flora',
      status: PageStatus.published,
      description: 'Landing page',
      keywords: ['flora'],
      ogTitle: null,
      ogDescription: null,
      ogImage: null,
      canonicalUrl: null,
      language: 'fr',
      content: null,
      sectionsData: { hero: { title: 'Hello' } },
      seoH1: 'Flora',
      seoH2: null,
      importedAt: null,
      createdBy: '8d6744d0-96a6-4ab1-bc83-39d1bb8f8e24',
      userId: '8d6744d0-96a6-4ab1-bc83-39d1bb8f8e24',
      templateId: null,
      daisyThemeSlug: 'light',
      folder: 'landing',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      template: null,
      pageContentSections: [],
    });

    await request(app.getHttpServer())
      .get('/api/pages/public/landing/flora')
      .expect(200)
      .expect(({ body }) => {
        expect(body.pageKey).toBe('landing/flora');
        expect(body.status).toBe(PageStatus.published);
      });
  });

  it('returns active public redirects without authentication', async () => {
    prismaMock.seoRedirect.findMany.mockResolvedValue([
      {
        id: 'bc7cab3f-784b-43cc-b0d4-2ee0df66be9a',
        sourcePath: '/old-flora',
        targetPath: '/flora',
        reason: 'slug-update',
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      },
    ]);

    await request(app.getHttpServer())
      .get('/api/pages/public/redirects')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual([
          expect.objectContaining({
            sourcePath: '/old-flora',
            targetPath: '/flora',
          }),
        ]);
      });
  });

  it('still protects private page listing routes', async () => {
    await request(app.getHttpServer()).get('/api/pages').expect(401);
  });
});
