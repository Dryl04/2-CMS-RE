import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ThemeSource } from '@prisma/client';
import { JwtUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDaisyThemeDto } from './dto/create-daisy-theme.dto';
import { CreateFontDto } from './dto/create-font.dto';
import { CreatePageThemeDto } from './dto/create-page-theme.dto';
import { UpdateDaisyThemeDto } from './dto/update-daisy-theme.dto';
import { UpdatePageThemeDto } from './dto/update-page-theme.dto';

@Injectable()
export class ThemesService {
  constructor(private readonly prisma: PrismaService) {}

  listPageThemes() {
    return this.prisma.pageTheme.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  createPageTheme(dto: CreatePageThemeDto, user: JwtUser) {
    return this.prisma.pageTheme.create({
      data: {
        name: dto.name,
        description: dto.description,
        css: dto.css as Prisma.InputJsonValue | undefined,
        isDefault: dto.isDefault ?? false,
        userId: user.userId,
      },
    });
  }

  async updatePageTheme(id: string, dto: UpdatePageThemeDto) {
    await this.ensurePageTheme(id);
    return this.prisma.pageTheme.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        css: dto.css as Prisma.InputJsonValue | undefined,
        isDefault: dto.isDefault,
      },
    });
  }

  async removePageTheme(id: string) {
    await this.ensurePageTheme(id);
    return this.prisma.pageTheme.delete({ where: { id } });
  }

  listDaisyThemes() {
    return this.prisma.daisyuiTheme.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  createDaisyTheme(dto: CreateDaisyThemeDto, user: JwtUser) {
    return this.prisma.daisyuiTheme.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        source: dto.source ?? ThemeSource.daisyui,
        tokens: dto.tokens as Prisma.InputJsonValue,
        fontConfig: dto.fontConfig as Prisma.InputJsonValue | undefined,
        isActive: dto.isActive ?? true,
        userId: user.userId,
      },
    });
  }

  async updateDaisyTheme(id: string, dto: UpdateDaisyThemeDto) {
    await this.ensureDaisyTheme(id);
    return this.prisma.daisyuiTheme.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        source: dto.source,
        tokens: dto.tokens as Prisma.InputJsonValue | undefined,
        fontConfig: dto.fontConfig as Prisma.InputJsonValue | undefined,
        isActive: dto.isActive,
      },
    });
  }

  async removeDaisyTheme(id: string) {
    await this.ensureDaisyTheme(id);
    return this.prisma.daisyuiTheme.delete({ where: { id } });
  }

  listFonts() {
    return this.prisma.fontsLibrary.findMany({ orderBy: { createdAt: 'desc' } });
  }

  createFont(dto: CreateFontDto, user: JwtUser) {
    return this.prisma.fontsLibrary.create({
      data: {
        fontName: dto.fontName,
        fontFamily: dto.fontFamily,
        fontUrl: dto.fontUrl,
        fontWeights: dto.fontWeights ?? [],
        isGoogleFont: dto.isGoogleFont ?? false,
        isSystem: dto.isSystem ?? false,
        importedBy: user.userId,
      },
    });
  }

  async removeFont(id: string) {
    const font = await this.prisma.fontsLibrary.findUnique({ where: { id } });
    if (!font) {
      throw new NotFoundException(`Font ${id} not found`);
    }

    return this.prisma.fontsLibrary.delete({ where: { id } });
  }

  private async ensurePageTheme(id: string) {
    const pageTheme = await this.prisma.pageTheme.findUnique({ where: { id } });
    if (!pageTheme) {
      throw new NotFoundException(`Page theme ${id} not found`);
    }
  }

  private async ensureDaisyTheme(id: string) {
    const daisyTheme = await this.prisma.daisyuiTheme.findUnique({ where: { id } });
    if (!daisyTheme) {
      throw new NotFoundException(`DaisyUI theme ${id} not found`);
    }
  }
}
