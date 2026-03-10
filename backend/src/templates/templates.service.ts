import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: { folder?: string; ids?: string[] }) {
    const where: Prisma.PageTemplateWhereInput = {};

    if (params?.folder) {
      where.folder = params.folder;
    }
    if (params?.ids && params.ids.length > 0) {
      where.id = { in: params.ids };
    }

    return this.prisma.pageTemplate.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.pageTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Template with id "${id}" not found`);
    }

    return template;
  }

  async create(dto: CreateTemplateDto, userId: string) {
    return this.prisma.pageTemplate.create({
      data: {
        ...dto,
        createdBy: userId,
      },
    });
  }

  async update(id: string, dto: UpdateTemplateDto) {
    await this.findOne(id);

    return this.prisma.pageTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async count() {
    const count = await this.prisma.pageTemplate.count();
    return { count };
  }

  async delete(id: string) {
    await this.findOne(id);

    return this.prisma.pageTemplate.delete({ where: { id } });
  }
}
