import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { R2StorageProvider } from './providers/r2-storage.provider';
import { StorageProvider } from './storage.types';

@Injectable()
export class StorageService {
  constructor(
    private readonly configService: ConfigService,
    private readonly localStorageProvider: LocalStorageProvider,
    private readonly r2StorageProvider: R2StorageProvider,
  ) {}

  async saveFile(file: Express.Multer.File, folder?: string) {
    return this.getProvider().saveFile(file, folder);
  }

  async deleteFile(filePath: string) {
    return this.getProvider().deleteFile(filePath);
  }

  resolvePublicUrl(filePath: string) {
    return this.getProvider().resolvePublicUrl(filePath);
  }

  private getProvider(): StorageProvider {
    return this.configService.get<string>('STORAGE_TYPE', 'local') === 'r2'
      ? this.r2StorageProvider
      : this.localStorageProvider;
  }
}
