import { Injectable, NotFoundException } from "@nestjs/common";
import { PageStatus, Prisma } from "@prisma/client";
import { JwtUser } from "../auth/auth.types";
import { PrismaService } from "../prisma/prisma.service";
import { SitesService } from "../sites/sites.service";
import { PublicRequestContext } from "../publishing/public-request.util";
import { CreatePageDto } from "./dto/create-page.dto";
import { ListPagesQueryDto } from "./dto/list-pages.query.dto";
import { UpdatePageDto } from "./dto/update-page.dto";

interface PublicPageResolution {
  kind: "page";
  page: Record<string, unknown>;
}

interface PublicRedirectResolution {
  kind: "redirect";
  redirectUrl: string;
  targetPath: string;
  statusCode: 301 | 308;
  reason: string;
}

type PublicRouteResolution = PublicPageResolution | PublicRedirectResolution;

@Injectable()
export class PagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sitesService: SitesService,
  ) {}

  async resolvePublicRoute(
    pageKey: string,
    context: PublicRequestContext,
  ): Promise<PublicRouteResolution> {
    const resolved = await this.sitesService.resolveSiteDomainContext(context.host);
    if (!resolved) {
      throw new NotFoundException(
        `No configured site matches host "${context.host ?? "unknown"}"`,
      );
    }

    const hostRedirectUrl = this.sitesService.buildPrimaryRedirectUrl(
      resolved,
      context.path,
      context.search,
    );
    if (hostRedirectUrl) {
      return {
        kind: "redirect",
        redirectUrl: hostRedirectUrl,
        targetPath: context.path,
        statusCode: 308,
        reason: "primary-domain",
      };
    }

    const normalizedPageKey = resolveRequestedPageKey(
      pageKey,
      resolved.site.homepagePageKey,
    );
    const page = await this.findPublishedPage(normalizedPageKey, resolved.site.id);
    if (page) {
      return {
        kind: "page",
        page: this.decoratePublicPage(page, resolved),
      };
    }

    const redirect = await this.prisma.seoRedirect.findFirst({
      where: {
        isActive: true,
        siteId: resolved.site.id,
        sourcePath: normalizedPageKey,
      },
      orderBy: { updatedAt: "desc" },
    });

    if (redirect?.targetPath) {
      const targetPath = normalizeRedirectPath(redirect.targetPath);
      return {
        kind: "redirect",
        redirectUrl: this.sitesService.buildAbsoluteUrl(
          resolved.requestedDomain,
          targetPath,
          context.search,
        ),
        targetPath,
        statusCode: 301,
        reason: redirect.reason ?? "page-redirect",
      };
    }

    throw new NotFoundException(
      `Published page not found for key "${normalizedPageKey}"`,
    );
  }

  async getPublicPage(pageKey: string, host?: string) {
    const resolved = await this.sitesService.resolveSiteDomainContext(host);
    if (!resolved) {
      throw new NotFoundException(
        `No configured site matches host "${host ?? "unknown"}"`,
      );
    }

    const page = await this.findPublishedPage(
      resolveRequestedPageKey(pageKey, resolved.site.homepagePageKey),
      resolved.site.id,
    );

    if (!page) {
      throw new NotFoundException(
        `Published page not found for key "${pageKey}"`,
      );
    }

    return this.decoratePublicPage(page, resolved);
  }

  async getPublicRedirects(host?: string) {
    const siteId = await this.sitesService.resolveSiteIdByHost(host);
    if (!siteId) {
      return [];
    }

    return this.prisma.seoRedirect.findMany({
      where: {
        isActive: true,
        siteId,
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        sourcePath: true,
        targetPath: true,
        reason: true,
        updatedAt: true,
      },
    });
  }

  async findAll(query: ListPagesQueryDto) {
    const where: Prisma.SeoMetadataWhereInput = {
      siteId: query.siteId,
      status: query.status,
      folder: query.folder,
    };

    if (query.search) {
      where.OR = [
        {
          pageKey: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          title: {
            contains: query.search,
            mode: "insensitive",
          },
        },
      ];
    }

    return this.prisma.seoMetadata.findMany({
      where,
      include: {
        site: {
          include: {
            domains: true,
          },
        },
        template: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async create(dto: CreatePageDto, user: JwtUser) {
    const data: Prisma.SeoMetadataUncheckedCreateInput = {
      siteId: dto.siteId,
      pageKey: dto.pageKey,
      title: dto.title,
      description: dto.description,
      keywords: dto.keywords ?? [],
      ogTitle: dto.ogTitle,
      ogDescription: dto.ogDescription,
      ogImage: dto.ogImage,
      canonicalUrl: dto.canonicalUrl,
      language: dto.language ?? "fr",
      status: dto.status ?? PageStatus.draft,
      content: dto.content,
      sectionsData: dto.sectionsData as Prisma.InputJsonValue | undefined,
      seoH1: dto.seoH1,
      seoH2: dto.seoH2,
      templateId: dto.templateId,
      daisyThemeSlug: dto.daisyThemeSlug,
      folder: dto.folder,
      userId: user.userId,
      createdBy: user.userId,
    };

    return this.prisma.seoMetadata.create({ data });
  }

  async update(id: string, dto: UpdatePageDto) {
    await this.ensureExists(id);

    const data: Prisma.SeoMetadataUncheckedUpdateInput = {
      siteId: dto.siteId,
      pageKey: dto.pageKey,
      title: dto.title,
      description: dto.description,
      keywords: dto.keywords,
      ogTitle: dto.ogTitle,
      ogDescription: dto.ogDescription,
      ogImage: dto.ogImage,
      canonicalUrl: dto.canonicalUrl,
      language: dto.language,
      status: dto.status,
      content: dto.content,
      sectionsData: dto.sectionsData as Prisma.InputJsonValue | undefined,
      seoH1: dto.seoH1,
      seoH2: dto.seoH2,
      templateId: dto.templateId,
      daisyThemeSlug: dto.daisyThemeSlug,
      folder: dto.folder,
    };

    return this.prisma.seoMetadata.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.seoMetadata.delete({ where: { id } });
  }

  private async findPublishedPage(pageKey: string, siteId: string) {
    return this.prisma.seoMetadata.findFirst({
      where: {
        pageKey,
        status: PageStatus.published,
        siteId,
      },
      include: {
        site: {
          include: {
            domains: true,
          },
        },
        template: true,
        pageContentSections: {
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });
  }

  private decoratePublicPage(
    page: NonNullable<Awaited<ReturnType<PagesService["findPublishedPage"]>>>,
    resolved: NonNullable<Awaited<ReturnType<SitesService["resolveSiteDomainContext"]>>>,
  ) {
    return {
      ...page,
      effectiveCanonicalUrl: this.sitesService.buildCanonicalPageUrl(
        resolved,
        page.pageKey,
        page.canonicalUrl,
      ),
      robotsDirective: resolved.requestedDomain.allowIndexing
        ? "index,follow"
        : "noindex,nofollow",
      resolvedDomain: {
        id: resolved.requestedDomain.id,
        host: resolved.requestedDomain.host,
        scheme: resolved.requestedDomain.scheme,
        isPrimary: resolved.requestedDomain.isPrimary,
        isCanonical: resolved.requestedDomain.isCanonical,
        redirectToPrimary: resolved.requestedDomain.redirectToPrimary,
        verificationStatus: resolved.requestedDomain.verificationStatus,
        sslStatus: resolved.requestedDomain.sslStatus,
        robotsTxtEnabled: resolved.requestedDomain.robotsTxtEnabled,
        sitemapEnabled: resolved.requestedDomain.sitemapEnabled,
        allowIndexing: resolved.requestedDomain.allowIndexing,
      },
      publicBaseUrl: this.sitesService.buildAbsoluteUrl(resolved.requestedDomain),
    };
  }

  private async ensureExists(id: string) {
    const page = await this.prisma.seoMetadata.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Page ${id} not found`);
    }
  }
}

function normalizePageKey(pageKey: string) {
  return pageKey
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .replace(/\/{2,}/g, "/");
}

function normalizeRedirectPath(targetPath: string) {
  const normalized = targetPath.trim().replace(/^\/+/, "");
  return normalized ? `/${normalized}` : "/";
}

function resolveRequestedPageKey(pageKey: string, homepagePageKey?: string | null) {
  const normalized = normalizePageKey(pageKey);
  if (normalized) {
    return normalized;
  }

  return normalizePageKey(homepagePageKey || "home");
}
