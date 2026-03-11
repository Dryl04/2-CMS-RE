import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { StorageProvider, StoredFile } from '../storage.types';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  constructor(private readonly configService: ConfigService) {}

  async saveFile(file: Express.Multer.File, folder?: string): Promise<StoredFile> {
    const uploadsDir = this.getUploadsDir();
    const normalizedFolder = this.normalizeFolder(folder);
    const targetDir = normalizedFolder ? resolve(uploadsDir, normalizedFolder) : uploadsDir;
    await mkdir(targetDir, { recursive: true });

    const extension = extname(file.originalname);
    const baseName =
      file.originalname
        .replace(extension, '')
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'file';
    const fileName = `${randomUUID()}-${baseName}${extension}`;
    const relativePath = normalizedFolder ? `${normalizedFolder}/${fileName}` : fileName;
    const destination = resolve(uploadsDir, relativePath);

    await writeFile(destination, file.buffer);

    return {
      key: relativePath,
      publicUrl: this.resolvePublicUrl(relativePath),
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return;
    }

    const uploadsDir = this.getUploadsDir();
    const target = resolve(uploadsDir, filePath);

    if (!target.startsWith(uploadsDir)) {
      return;
    }

    await rm(target, { force: true });
  }

  resolvePublicUrl(filePath: string): string {
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }

    const publicPath = this.configService.get<string>('UPLOADS_PUBLIC_PATH', '/uploads').replace(/\/$/, '');
    return `${publicPath}/${filePath.replace(/^\//, '')}`;
  }

  private getUploadsDir() {
    const configured = this.configService.get<string>('UPLOADS_DIR', './uploads');
    return configured.startsWith('/') ? configured : resolve(process.cwd(), configured);
  }

  private normalizeFolder(folder?: string) {
    if (!folder) {
      return '';
    }

    return folder
      .split('/')
      .map((segment) => segment.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, '-'))
      .filter(Boolean)
      .join('/');
  }
}
