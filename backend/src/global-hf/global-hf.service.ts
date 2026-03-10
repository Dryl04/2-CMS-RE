import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGlobalHfDto } from './dto/create-global-hf.dto';
import { UpdateGlobalHfDto } from './dto/update-global-hf.dto';

@Injectable()
export class GlobalHfService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.globalHfSetting.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findActive() {
    return this.prisma.globalHfSetting.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const setting = await this.prisma.globalHfSetting.findUnique({
      where: { id },
    });

    if (!setting) {
      throw new NotFoundException(
        `Global HF setting with id "${id}" not found`,
      );
    }

    return setting;
  }

  async create(dto: CreateGlobalHfDto, userId: string) {
    return this.prisma.globalHfSetting.create({
      data: {
        ...dto,
        targetPageIds: dto.targetPageIds || [],
        createdBy: userId,
      },
    });
  }

  async update(id: string, dto: UpdateGlobalHfDto) {
    await this.findOne(id);

    return this.prisma.globalHfSetting.update({
      where: { id },
      data: dto,
    });
  }

  async activate(id: string) {
    // Deactivate all others first
    await this.prisma.globalHfSetting.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Activate the selected one
    return this.prisma.globalHfSetting.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.globalHfSetting.delete({ where: { id } });
  }
}
