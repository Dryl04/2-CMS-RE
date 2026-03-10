import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.mediaFile.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const file = await this.prisma.mediaFile.findUnique({ where: { id } });

    if (!file) {
      throw new NotFoundException(`Media file with id "${id}" not found`);
    }

    return file;
  }

  async create(data: {
    filename: string;
    originalFilename: string;
    filePath: string;
    fileSize: bigint;
    mimeType: string;
    width?: number;
    height?: number;
    altText?: string;
    uploadedBy?: string;
  }) {
    return this.prisma.mediaFile.create({ data });
  }

  async delete(id: string, storageService: StorageService) {
    const file = await this.findOne(id);

    await storageService.delete(file.filePath);

    return this.prisma.mediaFile.delete({ where: { id } });
  }
}
