import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { StorageProvider, StoredFile } from '../storage.types';

@Injectable()
export class R2StorageProvider implements StorageProvider {
  private client?: S3Client;

  constructor(private readonly configService: ConfigService) {}

  async saveFile(file: Express.Multer.File, folder?: string): Promise<StoredFile> {
    const bucket = this.getRequiredConfig('R2_BUCKET_NAME');
    const key = this.buildObjectKey(file.originalname, folder);

    await this.getClient().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      key,
      publicUrl: this.resolvePublicUrl(key),
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return;
    }

    await this.getClient().send(
      new DeleteObjectCommand({
        Bucket: this.getRequiredConfig('R2_BUCKET_NAME'),
        Key: filePath,
      }),
    );
  }

  resolvePublicUrl(filePath: string): string {
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }

    const publicUrl = this.getRequiredConfig('R2_PUBLIC_URL').replace(/\/$/, '');
    return `${publicUrl}/${filePath}`;
  }

  private getClient() {
    if (!this.client) {
      const accountId = this.getRequiredConfig('R2_ACCOUNT_ID');
      const accessKeyId = this.getRequiredConfig('R2_ACCESS_KEY_ID');
      const secretAccessKey = this.getRequiredConfig('R2_SECRET_ACCESS_KEY');

      this.client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }

    return this.client;
  }

  private buildObjectKey(originalName: string, folder?: string) {
    const extension = extname(originalName);
    const normalizedBase =
      originalName
        .replace(extension, '')
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'file';
    const normalizedFolder = (folder ?? '')
      .split('/')
      .map((segment) => segment.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, '-'))
      .filter(Boolean)
      .join('/');
    const fileName = `${randomUUID()}-${normalizedBase}${extension}`;
    return normalizedFolder ? `${normalizedFolder}/${fileName}` : fileName;
  }

  private getRequiredConfig(key: string) {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new ServiceUnavailableException(`Missing storage configuration value: ${key}`);
    }

    return value;
  }
}
