import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGlobalHfDto } from './dto/create-global-hf.dto';
import { UpdateGlobalHfDto } from './dto/update-global-hf.dto';

@Injectable()
export class GlobalHfService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.globalHfSetting.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  create(dto: CreateGlobalHfDto, user: JwtUser) {
    return this.prisma.globalHfSetting.create({
      data: {
        label: dto.label,
        headerSection: dto.headerSection as Prisma.InputJsonValue | undefined,
        footerSection: dto.footerSection as Prisma.InputJsonValue | undefined,
        applyOnImport: dto.applyOnImport ?? false,
        applyOnCreate: dto.applyOnCreate ?? false,
        isActive: dto.isActive ?? false,
        targetPageIds: dto.targetPageIds ?? [],
        createdBy: user.userId,
      },
    });
  }

  async update(id: string, dto: UpdateGlobalHfDto) {
    await this.ensureExists(id);
    return this.prisma.globalHfSetting.update({
      where: { id },
      data: {
        label: dto.label,
        headerSection: dto.headerSection as Prisma.InputJsonValue | undefined,
        footerSection: dto.footerSection as Prisma.InputJsonValue | undefined,
        applyOnImport: dto.applyOnImport,
        applyOnCreate: dto.applyOnCreate,
        isActive: dto.isActive,
        targetPageIds: dto.targetPageIds,
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.globalHfSetting.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const setting = await this.prisma.globalHfSetting.findUnique({ where: { id } });
    if (!setting) {
      throw new NotFoundException(`Global header/footer setting ${id} not found`);
    }
  }
}
