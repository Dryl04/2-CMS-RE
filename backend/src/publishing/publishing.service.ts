import { Injectable, NotFoundException } from "@nestjs/common";
import { PageStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PublicRequestContext } from "./public-request.util";
import { SitesService } from "../sites/sites.service";

interface PublishingTextResult {
  type: "content";
  content: string;
}

interface PublishingRedirectResult {
  type: "redirect";
  redirectUrl: string;
}

type PublishingResult = PublishingTextResult | PublishingRedirectResult;

@Injectable()
export class PublishingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sitesService: SitesService,
  ) {}

  async getRobotsTxt(context: PublicRequestContext): Promise<PublishingResult> {
    const resolved = await this.sitesService.resolveSiteDomainContext(context.host);
    if (!resolved) {
      throw new NotFoundException("Aucun domaine public configuré pour ce host.");
    }

    const redirectUrl = this.sitesService.buildPrimaryRedirectUrl(
      resolved,
      context.path,
      context.search,
    );
    if (redirectUrl) {
      return { type: "redirect", redirectUrl };
    }

    const lines = ["User-agent: *"];
    if (!resolved.requestedDomain.robotsTxtEnabled || !resolved.requestedDomain.allowIndexing) {
      lines.push("Disallow: /");
    } else {
      lines.push("Allow: /");
    }

    if (resolved.requestedDomain.sitemapEnabled) {
      lines.push(
        `Sitemap: ${this.sitesService.buildAbsoluteUrl(resolved.requestedDomain, "/sitemap.xml")}`,
      );
    }

    return {
      type: "content",
      content: `${lines.join("\n")}\n`,
    };
  }

  async getSitemapXml(context: PublicRequestContext): Promise<PublishingResult> {
    const resolved = await this.sitesService.resolveSiteDomainContext(context.host);
    if (!resolved) {
      throw new NotFoundException("Aucun domaine public configuré pour ce host.");
    }

    const redirectUrl = this.sitesService.buildPrimaryRedirectUrl(
      resolved,
      context.path,
      context.search,
    );
    if (redirectUrl) {
      return { type: "redirect", redirectUrl };
    }

    if (!resolved.requestedDomain.sitemapEnabled) {
      throw new NotFoundException("Le sitemap est désactivé pour ce domaine.");
    }

    const pages = await this.prisma.seoMetadata.findMany({
      where: {
        siteId: resolved.site.id,
        status: PageStatus.published,
      },
      select: {
        pageKey: true,
        canonicalUrl: true,
        updatedAt: true,
      },
      orderBy: [{ updatedAt: "desc" }, { pageKey: "asc" }],
    });

    const urls = pages.map((page) => ({
      loc: this.sitesService.buildCanonicalPageUrl(
        resolved,
        page.pageKey,
        page.canonicalUrl,
      ),
      lastmod: page.updatedAt.toISOString(),
    }));

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map(
        (url) =>
          `  <url><loc>${escapeXml(url.loc)}</loc><lastmod>${escapeXml(url.lastmod)}</lastmod></url>`,
      ),
      "</urlset>",
      "",
    ].join("\n");

    return {
      type: "content",
      content: xml,
    };
  }

  async getVerificationFile(
    context: PublicRequestContext,
  ): Promise<PublishingTextResult> {
    const resolved = await this.sitesService.resolveSiteDomainContext(context.host);
    if (!resolved) {
      throw new NotFoundException("Aucun domaine public configuré pour ce host.");
    }

    const token = resolved.requestedDomain.verificationToken?.trim();
    if (
      !token ||
      resolved.requestedDomain.verificationMethod !== "http_file"
    ) {
      throw new NotFoundException(
        "Aucun fichier de vérification HTTP n'est configuré pour ce domaine.",
      );
    }

    return {
      type: "content",
      content: `cms-domain-verification=${token}\n`,
    };
  }
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
