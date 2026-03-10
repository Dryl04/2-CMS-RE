import { Injectable, Logger } from '@nestjs/common';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { R2StorageProvider } from './providers/r2-storage.provider';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly provider: LocalStorageProvider | R2StorageProvider;

  constructor() {
    const storageType = process.env.STORAGE_TYPE || 'local';

    if (storageType === 'r2') {
      this.provider = new R2StorageProvider();
      this.logger.log('Using R2 storage provider');
    } else {
      this.provider = new LocalStorageProvider();
      this.logger.log('Using local storage provider');
    }
  }

  async upload(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ filePath: string; publicUrl: string }> {
    return this.provider.upload(file, userId);
  }

  async delete(filePath: string): Promise<void> {
    return this.provider.delete(filePath);
  }

  getPublicUrl(filePath: string): string {
    return this.provider.getPublicUrl(filePath);
  }
}
