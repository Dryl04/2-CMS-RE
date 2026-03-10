import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Prisma, PageStatus } from '@prisma/client';

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: {
    status?: PageStatus;
    folder?: string;
    userId?: string;
    order?: string;
    limit?: number;
    select?: string;
  }) {
    const where: Prisma.SeoMetadataWhereInput = {};

    if (params?.status) where.status = params.status;
    if (params?.folder) where.folder = params.folder;
    if (params?.userId) where.userId = params.userId;

    const findManyArgs: Prisma.SeoMetadataFindManyArgs = {
      where,
      orderBy: { updatedAt: 'desc' },
    };

    if (params?.limit) findManyArgs.take = params.limit;

    if (params?.select) {
      const fields = params.select.split(',').map(f => f.trim());
      const selectObj: Record<string, boolean> = {};
      for (const field of fields) {
        // Convert snake_case to camelCase for Prisma
        const camelField = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        selectObj[camelField] = true;
      }
      // Always include id
      selectObj.id = true;
      findManyArgs.select = selectObj;
    }

    return this.prisma.seoMetadata.findMany(findManyArgs);
  }

  async findByPageKey(pageKey: string, status?: PageStatus) {
    const where: Prisma.SeoMetadataWhereInput = { pageKey };
    if (status) {
      where.status = status;
    }
    return this.prisma.seoMetadata.findFirst({ where });
  }

  async findPublicByPageKey(pageKey: string) {
    const page = await this.prisma.seoMetadata.findFirst({
      where: {
        pageKey,
        status: PageStatus.published,
      },
    });

    if (!page) {
      throw new NotFoundException(`Published page with key "${pageKey}" not found`);
    }

    return page;
  }

  async findPublicRedirect(sourcePath: string) {
    const redirect = await this.prisma.seoRedirect.findFirst({
      where: {
        sourcePath,
        isActive: true,
      },
    });

    if (!redirect) {
      throw new NotFoundException(`Active redirect for "${sourcePath}" not found`);
    }

    return redirect;
  }

  async findOne(id: string) {
    const page = await this.prisma.seoMetadata.findUnique({ where: { id } });

    if (!page) {
      throw new NotFoundException(`Page with id "${id}" not found`);
    }

    return page;
  }

  async create(dto: CreatePageDto, userId: string) {
    return this.prisma.seoMetadata.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async update(id: string, dto: UpdatePageDto) {
    await this.findOne(id);

    return this.prisma.seoMetadata.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    return this.prisma.seoMetadata.delete({ where: { id } });
  }

  async upsertBulk(items: any[]) {
    const results = [];

    for (const item of items) {
      const { pageKey, ...rest } = item;

      const result = await this.prisma.seoMetadata.upsert({
        where: { pageKey },
        update: rest,
        create: { pageKey, ...rest },
      });

      results.push(result);
    }

    return results;
  }
}
