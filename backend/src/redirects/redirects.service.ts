import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRedirectDto } from './dto/create-redirect.dto';
import { UpdateRedirectDto } from './dto/update-redirect.dto';

@Injectable()
export class RedirectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.seoRedirect.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findBySourcePath(sourcePath: string) {
    return this.prisma.seoRedirect.findFirst({
      where: { sourcePath },
    });
  }

  async findOne(id: string) {
    const redirect = await this.prisma.seoRedirect.findUnique({
      where: { id },
    });

    if (!redirect) {
      throw new NotFoundException(`Redirect with id "${id}" not found`);
    }

    return redirect;
  }

  async create(dto: CreateRedirectDto, userId: string) {
    return this.prisma.seoRedirect.create({
      data: {
        ...dto,
        createdBy: userId,
      },
    });
  }

  async update(id: string, dto: UpdateRedirectDto) {
    await this.findOne(id);

    return this.prisma.seoRedirect.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    return this.prisma.seoRedirect.delete({ where: { id } });
  }
}
