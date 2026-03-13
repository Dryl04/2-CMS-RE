import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  DomainSslStatus,
  DomainVerificationMethod,
  DomainVerificationStatus,
  Prisma,
  Site,
  SiteCanonicalStrategy,
  SiteDomain,
} from "@prisma/client";
import { randomBytes } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSiteDomainDto } from "./dto/create-site-domain.dto";
import { CreateSiteDto } from "./dto/create-site.dto";
import { UpdateSiteDomainDto } from "./dto/update-site-domain.dto";
import { UpdateSiteDto } from "./dto/update-site.dto";

const SITE_WITH_DOMAINS_INCLUDE = {
  domains: {
    orderBy: [
      { isCanonical: "desc" },
      { isPrimary: "desc" },
      { host: "asc" },
    ],
  },
} satisfies Prisma.SiteInclude;

export interface ResolvedSiteDomainContext {
  site: Site & { domains: SiteDomain[] };
  requestedDomain: SiteDomain;
  primaryDomain: SiteDomain | null;
  canonicalDomain: SiteDomain | null;
}

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

  findAllSites() {
    return this.prisma.site.findMany({
      include: {
        ...SITE_WITH_DOMAINS_INCLUDE,
        _count: {
          select: {
            pages: true,
            redirects: true,
            domains: true,
          },
        },
      },
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    });
  }

  async createSite(dto: CreateSiteDto) {
    return this.prisma.site.create({
      data: {
        name: dto.name,
        code: dto.code,
        defaultLocale: dto.defaultLocale ?? "fr",
        homepagePageKey: normalizeHomepagePageKey(dto.homepagePageKey) ?? "home",
        canonicalStrategy:
          dto.canonicalStrategy ?? SiteCanonicalStrategy.canonical_domain,
        isActive: dto.isActive ?? true,
      },
      include: {
        ...SITE_WITH_DOMAINS_INCLUDE,
        _count: {
          select: {
            pages: true,
            redirects: true,
            domains: true,
          },
        },
      },
    });
  }

  async updateSite(id: string, dto: UpdateSiteDto) {
    await this.ensureSiteExists(id);
    return this.prisma.site.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        defaultLocale: dto.defaultLocale,
        homepagePageKey:
          dto.homepagePageKey !== undefined
            ? normalizeHomepagePageKey(dto.homepagePageKey) ?? "home"
            : undefined,
        canonicalStrategy: dto.canonicalStrategy,
        isActive: dto.isActive,
      },
      include: {
        ...SITE_WITH_DOMAINS_INCLUDE,
        _count: {
          select: {
            pages: true,
            redirects: true,
            domains: true,
          },
        },
      },
    });
  }

  async removeSite(id: string) {
    const site = await this.prisma.site.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            pages: true,
            redirects: true,
          },
        },
      },
    });

    if (!site) {
      throw new NotFoundException(`Site ${id} not found`);
    }

    if (site._count.pages > 0 || site._count.redirects > 0) {
      throw new ConflictException(
        "Impossible de supprimer un site qui contient encore des pages ou des redirections.",
      );
    }

    return this.prisma.site.delete({ where: { id } });
  }

  findAllDomains() {
    return this.prisma.siteDomain.findMany({
      include: {
        site: true,
      },
      orderBy: [
        { isCanonical: "desc" },
        { isPrimary: "desc" },
        { host: "asc" },
      ],
    });
  }

  async createDomain(dto: CreateSiteDomainDto) {
    await this.ensureSiteExists(dto.siteId);

    return this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary) {
        await tx.siteDomain.updateMany({
          where: { siteId: dto.siteId },
          data: { isPrimary: false },
        });
      }

      if (dto.isCanonical) {
        await tx.siteDomain.updateMany({
          where: { siteId: dto.siteId },
          data: { isCanonical: false },
        });
      }

      return tx.siteDomain.create({
        data: {
          siteId: dto.siteId,
          host: normalizeHost(dto.host),
          scheme: normalizeScheme(dto.scheme),
          isPrimary: dto.isPrimary ?? false,
          isCanonical: dto.isCanonical ?? false,
          locale: normalizeOptionalText(dto.locale),
          isActive: dto.isActive ?? true,
          redirectToPrimary: dto.redirectToPrimary ?? false,
          businessOwner: normalizeOptionalText(dto.businessOwner),
          technicalOwner: normalizeOptionalText(dto.technicalOwner),
          registrar: normalizeOptionalText(dto.registrar),
          dnsProvider: normalizeOptionalText(dto.dnsProvider),
          dnsTarget: normalizeOptionalText(dto.dnsTarget),
          hostingTarget: normalizeOptionalText(dto.hostingTarget),
          verificationMethod:
            dto.verificationMethod ?? DomainVerificationMethod.manual,
          verificationStatus:
            dto.verificationStatus ?? DomainVerificationStatus.pending,
          verificationToken:
            normalizeOptionalText(dto.verificationToken) ??
            createVerificationToken(),
          verifiedAt: resolveVerifiedAt(dto.verificationStatus, dto.verifiedAt),
          sslStatus: dto.sslStatus ?? DomainSslStatus.pending,
          robotsTxtEnabled: dto.robotsTxtEnabled ?? true,
          sitemapEnabled: dto.sitemapEnabled ?? true,
          allowIndexing: dto.allowIndexing ?? true,
          notes: normalizeOptionalText(dto.notes),
          goLiveAt: parseOptionalDate(dto.goLiveAt),
        },
        include: {
          site: true,
        },
      });
    });
  }

  async updateDomain(id: string, dto: UpdateSiteDomainDto) {
    const existing = await this.prisma.siteDomain.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Site domain ${id} not found`);
    }

    const siteId = dto.siteId ?? existing.siteId;
    await this.ensureSiteExists(siteId);

    return this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary) {
        await tx.siteDomain.updateMany({
          where: { siteId },
          data: { isPrimary: false },
        });
      }

      if (dto.isCanonical) {
        await tx.siteDomain.updateMany({
          where: { siteId },
          data: { isCanonical: false },
        });
      }

      const nextVerificationStatus =
        dto.verificationStatus ?? existing.verificationStatus;

      return tx.siteDomain.update({
        where: { id },
        data: {
          siteId,
          host: dto.host ? normalizeHost(dto.host) : undefined,
          scheme: dto.scheme ? normalizeScheme(dto.scheme) : undefined,
          isPrimary: dto.isPrimary,
          isCanonical: dto.isCanonical,
          locale:
            dto.locale !== undefined ? normalizeOptionalText(dto.locale) : undefined,
          isActive: dto.isActive,
          redirectToPrimary: dto.redirectToPrimary,
          businessOwner:
            dto.businessOwner !== undefined
              ? normalizeOptionalText(dto.businessOwner)
              : undefined,
          technicalOwner:
            dto.technicalOwner !== undefined
              ? normalizeOptionalText(dto.technicalOwner)
              : undefined,
          registrar:
            dto.registrar !== undefined
              ? normalizeOptionalText(dto.registrar)
              : undefined,
          dnsProvider:
            dto.dnsProvider !== undefined
              ? normalizeOptionalText(dto.dnsProvider)
              : undefined,
          dnsTarget:
            dto.dnsTarget !== undefined
              ? normalizeOptionalText(dto.dnsTarget)
              : undefined,
          hostingTarget:
            dto.hostingTarget !== undefined
              ? normalizeOptionalText(dto.hostingTarget)
              : undefined,
          verificationMethod: dto.verificationMethod,
          verificationStatus: dto.verificationStatus,
          verificationToken:
            dto.verificationToken !== undefined
              ? normalizeOptionalText(dto.verificationToken)
              : undefined,
          verifiedAt:
            dto.verifiedAt !== undefined || dto.verificationStatus !== undefined
              ? resolveVerifiedAt(nextVerificationStatus, dto.verifiedAt)
              : undefined,
          sslStatus: dto.sslStatus,
          robotsTxtEnabled: dto.robotsTxtEnabled,
          sitemapEnabled: dto.sitemapEnabled,
          allowIndexing: dto.allowIndexing,
          notes:
            dto.notes !== undefined ? normalizeOptionalText(dto.notes) : undefined,
          goLiveAt:
            dto.goLiveAt !== undefined ? parseOptionalDate(dto.goLiveAt) : undefined,
        },
        include: {
          site: true,
        },
      });
    });
  }

  async removeDomain(id: string) {
    const domain = await this.prisma.siteDomain.findUnique({ where: { id } });
    if (!domain) {
      throw new NotFoundException(`Site domain ${id} not found`);
    }

    return this.prisma.siteDomain.delete({ where: { id } });
  }

  async resolveSiteIdByHost(host?: string | null) {
    const context = await this.resolveSiteDomainContext(host);
    return context?.site.id ?? null;
  }

  async resolveSiteDomainContext(host?: string | null) {
    const normalizedHost = normalizeHost(host);
    if (!normalizedHost) {
      return null;
    }

    const siteDomain = await this.prisma.siteDomain.findFirst({
      where: {
        host: normalizedHost,
        isActive: true,
        site: {
          isActive: true,
        },
      },
      include: {
        site: {
          include: SITE_WITH_DOMAINS_INCLUDE,
        },
      },
      orderBy: [{ isCanonical: "desc" }, { isPrimary: "desc" }],
    });

    if (!siteDomain) {
      return null;
    }

    const site = {
      ...siteDomain.site,
      domains: (siteDomain.site.domains || []).filter((domain) => domain.isActive),
    };
    const requestedDomain =
      site.domains.find((domain) => domain.id === siteDomain.id) ?? siteDomain;
    const canonicalDomain =
      site.domains.find((domain) => domain.isCanonical) ??
      site.domains.find((domain) => domain.isPrimary) ??
      requestedDomain;
    const primaryDomain =
      site.domains.find((domain) => domain.isPrimary) ?? canonicalDomain ?? null;

    return {
      site,
      requestedDomain,
      canonicalDomain,
      primaryDomain,
    } satisfies ResolvedSiteDomainContext;
  }

  shouldRedirectToPrimary(context: ResolvedSiteDomainContext) {
    return (
      context.requestedDomain.redirectToPrimary &&
      !!context.primaryDomain &&
      context.primaryDomain.host !== context.requestedDomain.host
    );
  }

  buildAbsoluteUrl(
    domain: Pick<SiteDomain, "scheme" | "host">,
    path = "/",
    search = "",
  ) {
    const normalizedPath = normalizePublicPath(path);
    const normalizedSearch = normalizeSearch(search);
    return `${domain.scheme}://${domain.host}${normalizedPath}${normalizedSearch}`;
  }

  buildCanonicalPageUrl(
    context: ResolvedSiteDomainContext,
    pageKey: string,
    explicitCanonicalUrl?: string | null,
  ) {
    const targetDomain =
      context.site.canonicalStrategy === SiteCanonicalStrategy.served_domain
        ? context.requestedDomain
        : (context.canonicalDomain ?? context.requestedDomain);

    const explicitPath = extractPathFromUrl(explicitCanonicalUrl);
    const path = explicitPath ?? normalizePublicPath(pageKey ? `/${pageKey}` : "/");
    return this.buildAbsoluteUrl(targetDomain, path);
  }

  buildPrimaryRedirectUrl(
    context: ResolvedSiteDomainContext,
    path: string,
    search = "",
  ) {
    if (!this.shouldRedirectToPrimary(context) || !context.primaryDomain) {
      return null;
    }

    return this.buildAbsoluteUrl(context.primaryDomain, path, search);
  }

  async ensureSiteExists(id: string) {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site) {
      throw new NotFoundException(`Site ${id} not found`);
    }
    return site;
  }
}

function normalizeHost(host?: string | null) {
  if (!host) {
    return "";
  }

  const normalized = host.trim().toLowerCase();
  if (!normalized) {
    return "";
  }

  const withoutProtocol = normalized.replace(/^https?:\/\//, "");
  const withoutPath = withoutProtocol.split("/")[0];
  return withoutPath.replace(/:\d+$/, "");
}

function normalizeScheme(value?: string | null) {
  if (!value) {
    return "https";
  }

  const normalized = value.trim().toLowerCase();
  if (normalized !== "http" && normalized !== "https") {
    throw new BadRequestException("Le protocole doit être http ou https.");
  }

  return normalized;
}

function normalizeOptionalText(value?: string | null) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

function parseOptionalDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException("Date invalide.");
  }

  return parsed;
}

function createVerificationToken() {
  return randomBytes(18).toString("hex");
}

function resolveVerifiedAt(
  status?: DomainVerificationStatus,
  verifiedAt?: string | null,
) {
  if (verifiedAt !== undefined) {
    return parseOptionalDate(verifiedAt);
  }

  if (status === DomainVerificationStatus.verified) {
    return new Date();
  }

  if (
    status === DomainVerificationStatus.pending ||
    status === DomainVerificationStatus.failed
  ) {
    return null;
  }

  return undefined;
}

function normalizePublicPath(path?: string | null) {
  const normalized = (path || "/").trim();
  if (!normalized || normalized === "/") {
    return "/";
  }

  const withLeadingSlash = normalized.startsWith("/")
    ? normalized
    : `/${normalized}`;
  return withLeadingSlash.replace(/\/{2,}/g, "/");
}

function normalizeSearch(search?: string | null) {
  if (!search) {
    return "";
  }

  return search.startsWith("?") ? search : `?${search}`;
}

function extractPathFromUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value);
    return normalizePublicPath(`${parsed.pathname}${parsed.search}`);
  } catch {
    return null;
  }
}

function normalizeHomepagePageKey(value?: string | null) {
  if (!value) {
    return null;
  }

  return value.trim().replace(/^\/+/, "").replace(/\/+$/, "") || "home";
}
