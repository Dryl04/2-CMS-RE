import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { StorageService } from '../storage/storage.service';
import { Request } from 'express';

@Controller('api/media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  findAll() {
    return this.mediaService.findAll();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: string; email: string; role: string };

    const { filePath, publicUrl } = await this.storageService.upload(
      file,
      user.userId,
    );

    const record = await this.mediaService.create({
      filename: file.originalname,
      originalFilename: file.originalname,
      filePath,
      fileSize: BigInt(file.size),
      mimeType: file.mimetype,
      uploadedBy: user.userId,
    });

    return { ...record, publicUrl };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.mediaService.delete(id, this.storageService);
  }
}
