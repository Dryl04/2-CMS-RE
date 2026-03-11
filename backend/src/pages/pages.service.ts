import { Injectable, NotFoundException } from "@nestjs/common";
import { PageStatus, Prisma } from "@prisma/client";
import { JwtUser } from "../auth/auth.types";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePageDto } from "./dto/create-page.dto";
import { ListPagesQueryDto } from "./dto/list-pages.query.dto";
import { UpdatePageDto } from "./dto/update-page.dto";

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicPage(pageKey: string) {
    const page = await this.prisma.seoMetadata.findFirst({
      where: {
        pageKey,
        status: PageStatus.published,
      },
      include: {
        template: true,
        pageContentSections: {
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });

    if (!page) {
      throw new NotFoundException(
        `Published page not found for key "${pageKey}"`,
      );
    }

    return page;
  }

  async getPublicRedirects() {
    return this.prisma.seoRedirect.findMany({
      where: { isActive: true },
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
        template: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async create(dto: CreatePageDto, user: JwtUser) {
    const data: Prisma.SeoMetadataUncheckedCreateInput = {
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

  private async ensureExists(id: string) {
    const page = await this.prisma.seoMetadata.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Page ${id} not found`);
    }
  }
}
