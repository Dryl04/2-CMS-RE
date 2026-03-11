import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MediaFile } from '@prisma/client';
import { JwtUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UploadMediaDto } from './dto/upload-media.dto';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findAll() {
    const mediaFiles = await this.prisma.mediaFile.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return mediaFiles.map((mediaFile) => this.serialize(mediaFile));
  }

  async upload(file: Express.Multer.File | undefined, dto: UploadMediaDto, user: JwtUser) {
    if (!file) {
      throw new BadRequestException('A file upload is required');
    }

    const storedFile = await this.storageService.saveFile(file, dto.folder);
    const mediaFile = await this.prisma.mediaFile.create({
      data: {
        filename: storedFile.key.split('/').pop() ?? storedFile.key,
        originalFilename: file.originalname,
        filePath: storedFile.key,
        fileSize: BigInt(file.size),
        mimeType: file.mimetype,
        altText: dto.altText,
        uploadedBy: user.userId,
      },
    });

    return {
      ...this.serialize(mediaFile),
      publicUrl: storedFile.publicUrl,
    };
  }

  async remove(id: string) {
    const mediaFile = await this.prisma.mediaFile.findUnique({
      where: { id },
    });

    if (!mediaFile) {
      throw new NotFoundException(`Media file ${id} not found`);
    }

    await this.storageService.deleteFile(mediaFile.filePath);
    await this.prisma.mediaFile.delete({ where: { id } });

    return { success: true };
  }

  private serialize(mediaFile: MediaFile) {
    return {
      id: mediaFile.id,
      filename: mediaFile.filename,
      originalFilename: mediaFile.originalFilename,
      filePath: mediaFile.filePath,
      fileSize: mediaFile.fileSize.toString(),
      mimeType: mediaFile.mimeType,
      width: mediaFile.width,
      height: mediaFile.height,
      altText: mediaFile.altText,
      uploadedBy: mediaFile.uploadedBy,
      createdAt: mediaFile.createdAt,
      publicUrl: this.storageService.resolvePublicUrl(mediaFile.filePath),
    };
  }
}
