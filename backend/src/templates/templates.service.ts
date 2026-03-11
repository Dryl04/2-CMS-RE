import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.pageTemplate.findMany({
      include: {
        templateSections: true,
        pageTheme: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  create(dto: CreateTemplateDto, user: JwtUser) {
    const data: Prisma.PageTemplateUncheckedCreateInput = {
      name: dto.name,
      description: dto.description,
      thumbnail: dto.thumbnail,
      sectionsData: dto.sectionsData as Prisma.InputJsonValue | undefined,
      seoH1: dto.seoH1,
      seoH2: dto.seoH2,
      daisyThemeSlug: dto.daisyThemeSlug,
      folder: dto.folder,
      isPublic: dto.isPublic ?? false,
      isSystem: dto.isSystem ?? false,
      pageThemeId: dto.pageThemeId,
      createdBy: user.userId,
    };

    return this.prisma.pageTemplate.create({ data });
  }

  async update(id: string, dto: UpdateTemplateDto) {
    await this.ensureExists(id);
    return this.prisma.pageTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        thumbnail: dto.thumbnail,
        sectionsData: dto.sectionsData as Prisma.InputJsonValue | undefined,
        seoH1: dto.seoH1,
        seoH2: dto.seoH2,
        daisyThemeSlug: dto.daisyThemeSlug,
        folder: dto.folder,
        isPublic: dto.isPublic,
        isSystem: dto.isSystem,
        pageThemeId: dto.pageThemeId,
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.pageTemplate.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const template = await this.prisma.pageTemplate.findUnique({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Template ${id} not found`);
    }
  }
}
