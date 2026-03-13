import { INestApplication, ValidationPipe } from "@nestjs/common";
import {
  DomainSslStatus,
  DomainVerificationMethod,
  DomainVerificationStatus,
  PageStatus,
  SiteCanonicalStrategy,
} from "@prisma/client";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

const siteId = "2cb0c22c-f28c-46fb-9981-d3a4183461f6";
const requestedDomainId = "90075f0d-e62e-4b61-a5ee-dc8f688f2a5e";
const primaryDomainId = "ab3db767-095f-468b-8c32-850d3369d90a";

const baseSite = {
  id: siteId,
  name: "ScaNetwork",
  code: "scanetwork",
  defaultLocale: "fr",
  homepagePageKey: "home",
  canonicalStrategy: SiteCanonicalStrategy.canonical_domain,
  isActive: true,
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
};

const primaryDomain = {
  id: primaryDomainId,
  siteId,
  host: "www.scanetwork.fr",
  scheme: "https",
  isPrimary: true,
  isCanonical: true,
  locale: "fr",
  isActive: true,
  redirectToPrimary: false,
  businessOwner: "Marketing",
  technicalOwner: "Infra",
  registrar: "OVH",
  dnsProvider: "Cloudflare",
  dnsTarget: "edge-prod.internal",
  hostingTarget: "reverse-proxy-prod",
  verificationMethod: DomainVerificationMethod.http_file,
  verificationStatus: DomainVerificationStatus.verified,
  verificationToken: "token-primary-123",
  verifiedAt: new Date("2024-01-10T00:00:00.000Z"),
  sslStatus: DomainSslStatus.active,
  robotsTxtEnabled: true,
  sitemapEnabled: true,
  allowIndexing: true,
  notes: null,
  goLiveAt: new Date("2024-01-15T00:00:00.000Z"),
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
};

const redirectingDomain = {
  ...primaryDomain,
  id: requestedDomainId,
  host: "scanetwork.fr",
  isPrimary: false,
  isCanonical: false,
  redirectToPrimary: true,
  verificationToken: "token-secondary-456",
};

describe("Pages public endpoints (e2e)", () => {
  let app: INestApplication;
  type PrismaMock = {
    site: {
      findUnique: jest.Mock;
    };
    siteDomain: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      updateMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    seoMetadata: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    seoRedirect: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const prismaMock: PrismaMock = {
    site: {
      findUnique: jest.fn(),
    },
    siteDomain: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    seoMetadata: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    seoRedirect: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(async (callback: (tx: PrismaMock) => unknown) =>
      callback(prismaMock),
    ),
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

  function mockResolvedHost(domain = primaryDomain) {
    prismaMock.siteDomain.findFirst.mockResolvedValue({
      ...domain,
      site: {
        ...baseSite,
        domains: [primaryDomain, redirectingDomain],
      },
    });
  }

  it("returns a published page without authentication", async () => {
    mockResolvedHost(primaryDomain);
    prismaMock.seoMetadata.findFirst.mockResolvedValue({
      id: "b7861499-57d6-44ed-a26a-f30f278590d0",
      siteId,
      pageKey: "landing/flora",
      title: "Flora",
      status: PageStatus.published,
      description: "Landing page",
      keywords: ["flora"],
      ogTitle: null,
      ogDescription: null,
      ogImage: null,
      canonicalUrl: null,
      language: "fr",
      content: null,
      sectionsData: { hero: { title: "Hello" } },
      seoH1: "Flora",
      seoH2: null,
      importedAt: null,
      createdBy: "8d6744d0-96a6-4ab1-bc83-39d1bb8f8e24",
      userId: "8d6744d0-96a6-4ab1-bc83-39d1bb8f8e24",
      templateId: null,
      daisyThemeSlug: "light",
      folder: "landing",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      template: null,
      pageContentSections: [],
      site: {
        ...baseSite,
        domains: [primaryDomain, redirectingDomain],
      },
    });

    await request(app.getHttpServer())
      .get("/api/pages/public/landing/flora")
      .set("X-Site-Host", "www.scanetwork.fr")
      .expect(200)
      .expect(({ body }) => {
        expect(body.pageKey).toBe("landing/flora");
        expect(body.status).toBe(PageStatus.published);
        expect(body.effectiveCanonicalUrl).toBe(
          "https://www.scanetwork.fr/landing/flora",
        );
        expect(body.robotsDirective).toBe("index,follow");
      });
  });

  it("resolves a domain redirect before loading the page", async () => {
    mockResolvedHost(redirectingDomain);

    await request(app.getHttpServer())
      .get("/api/pages/public-resolve/landing/flora")
      .set("X-Site-Host", "scanetwork.fr")
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          kind: "redirect",
          redirectUrl: "https://www.scanetwork.fr/api/pages/public-resolve/landing/flora",
          statusCode: 308,
          reason: "primary-domain",
        });
      });
  });

  it("returns active public redirects without authentication", async () => {
    mockResolvedHost(primaryDomain);
    prismaMock.seoRedirect.findMany.mockResolvedValue([
      {
        id: "bc7cab3f-784b-43cc-b0d4-2ee0df66be9a",
        sourcePath: "/old-flora",
        targetPath: "/flora",
        reason: "slug-update",
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      },
    ]);

    await request(app.getHttpServer())
      .get("/api/pages/public/redirects")
      .set("X-Site-Host", "www.scanetwork.fr")
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual([
          expect.objectContaining({
            sourcePath: "/old-flora",
            targetPath: "/flora",
          }),
        ]);
      });
  });

  it("serves a robots.txt scoped to the requested domain", async () => {
    mockResolvedHost(primaryDomain);

    await request(app.getHttpServer())
      .get("/robots.txt")
      .set("X-Site-Host", "www.scanetwork.fr")
      .expect(200)
      .expect("Content-Type", /text\/plain/)
      .expect(({ text }) => {
        expect(text).toContain("User-agent: *");
        expect(text).toContain("Allow: /");
        expect(text).toContain("Sitemap: https://www.scanetwork.fr/sitemap.xml");
      });
  });

  it("serves a sitemap.xml with the effective canonical URLs", async () => {
    mockResolvedHost(primaryDomain);
    prismaMock.seoMetadata.findMany.mockResolvedValue([
      {
        pageKey: "landing/flora",
        canonicalUrl: null,
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      },
      {
        pageKey: "services/seo",
        canonicalUrl: null,
        updatedAt: new Date("2024-01-02T00:00:00.000Z"),
      },
    ]);

    await request(app.getHttpServer())
      .get("/sitemap.xml")
      .set("X-Site-Host", "www.scanetwork.fr")
      .expect(200)
      .expect("Content-Type", /application\/xml/)
      .expect(({ text }) => {
        expect(text).toContain(
          "<loc>https://www.scanetwork.fr/landing/flora</loc>",
        );
        expect(text).toContain(
          "<loc>https://www.scanetwork.fr/services/seo</loc>",
        );
      });
  });

  it("exposes the HTTP verification file when configured", async () => {
    mockResolvedHost(primaryDomain);

    await request(app.getHttpServer())
      .get("/.well-known/cms-domain-verification.txt")
      .set("X-Site-Host", "www.scanetwork.fr")
      .expect(200)
      .expect("Content-Type", /text\/plain/)
      .expect("cms-domain-verification=token-primary-123\n");
  });

  it("still protects private page listing routes", async () => {
    await request(app.getHttpServer()).get("/api/pages").expect(401);
  });
});
