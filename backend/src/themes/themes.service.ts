import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageThemeDto } from './dto/create-page-theme.dto';
import { UpdatePageThemeDto } from './dto/update-page-theme.dto';
import { CreateDaisyThemeDto } from './dto/create-daisy-theme.dto';
import { UpdateDaisyThemeDto } from './dto/update-daisy-theme.dto';
import { CreateFontDto } from './dto/create-font.dto';

@Injectable()
export class ThemesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Page Themes ──────────────────────────────────────────────

  async findAllPageThemes() {
    return this.prisma.pageTheme.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOnePageTheme(id: string) {
    const theme = await this.prisma.pageTheme.findUnique({ where: { id } });

    if (!theme) {
      throw new NotFoundException(`Page theme with id "${id}" not found`);
    }

    return theme;
  }

  async createPageTheme(dto: CreatePageThemeDto, userId: string) {
    return this.prisma.pageTheme.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async updatePageTheme(id: string, dto: UpdatePageThemeDto) {
    await this.findOnePageTheme(id);

    return this.prisma.pageTheme.update({
      where: { id },
      data: dto,
    });
  }

  async deletePageTheme(id: string) {
    await this.findOnePageTheme(id);

    return this.prisma.pageTheme.delete({ where: { id } });
  }

  async isCustomPageTheme(id: string) {
    const theme = await this.prisma.pageTheme.findUnique({
      where: { id },
      select: { userId: true },
    });
    return { is_custom: !!theme?.userId };
  }

  async migratePageThemes() {
    return { success: true, count: 0, message: 'No themes to migrate' };
  }

  // ── DaisyUI Themes ──────────────────────────────────────────

  async findActiveDaisyTheme() {
    return this.prisma.daisyuiTheme.findFirst({
      where: { isActive: true },
    });
  }

  async setActiveDaisyTheme(themeId: string) {
    await this.prisma.daisyuiTheme.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
    return this.prisma.daisyuiTheme.update({
      where: { id: themeId },
      data: { isActive: true },
    });
  }

  async getDaisyThemeUsage(slug: string) {
    const pageTemplates = await this.prisma.pageTemplate.count({
      where: { daisyThemeSlug: slug },
    });
    const seoPages = await this.prisma.seoMetadata.count({
      where: { daisyThemeSlug: slug },
    });
    return {
      pageThemes: seoPages,
      pageTemplates,
      totalUsages: seoPages + pageTemplates,
    };
  }

  async findAllDaisyThemes() {
    return this.prisma.daisyuiTheme.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOneDaisyTheme(id: string) {
    const theme = await this.prisma.daisyuiTheme.findUnique({ where: { id } });

    if (!theme) {
      throw new NotFoundException(`DaisyUI theme with id "${id}" not found`);
    }

    return theme;
  }

  async createDaisyTheme(dto: CreateDaisyThemeDto, userId: string) {
    return this.prisma.daisyuiTheme.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async updateDaisyTheme(id: string, dto: UpdateDaisyThemeDto) {
    await this.findOneDaisyTheme(id);

    return this.prisma.daisyuiTheme.update({
      where: { id },
      data: dto,
    });
  }

  async deleteDaisyTheme(id: string) {
    await this.findOneDaisyTheme(id);

    return this.prisma.daisyuiTheme.delete({ where: { id } });
  }

  // ── Fonts Library ───────────────────────────────────────────

  async findAllFonts() {
    return this.prisma.fontsLibrary.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createFont(dto: CreateFontDto, userId: string) {
    return this.prisma.fontsLibrary.create({
      data: {
        ...dto,
        fontWeights: dto.fontWeights || [],
        importedBy: userId,
      },
    });
  }

  async deleteFont(id: string) {
    const font = await this.prisma.fontsLibrary.findUnique({ where: { id } });

    if (!font) {
      throw new NotFoundException(`Font with id "${id}" not found`);
    }

    return this.prisma.fontsLibrary.delete({ where: { id } });
  }

  // ── Classic Themes (alias for DaisyUI system themes) ────────

  async findAllClassicThemes() {
    return this.prisma.daisyuiTheme.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createClassicTheme(data: any, userId: string) {
    return this.prisma.daisyuiTheme.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        tokens: data.tokens || {},
        fontConfig: data.font_config || data.fontConfig,
        userId,
      },
    });
  }

  async updateClassicTheme(id: string, data: any) {
    return this.prisma.daisyuiTheme.update({
      where: { id },
      data,
    });
  }

  async deleteClassicTheme(id: string) {
    return this.prisma.daisyuiTheme.delete({ where: { id } });
  }

  async initializeClassicThemes() {
    const count = await this.prisma.daisyuiTheme.count();
    if (count > 0) {
      return { message: 'Classic themes already initialized', count };
    }
    return { message: 'Use seed command to initialize themes', count: 0 };
  }

  async applyClassicTheme(pageId: string, themeId: string) {
    return this.prisma.seoMetadata.update({
      where: { id: pageId },
      data: { daisyThemeSlug: themeId },
    });
  }
}
