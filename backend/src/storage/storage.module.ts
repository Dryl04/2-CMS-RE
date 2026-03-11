import { Global, Module } from '@nestjs/common';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { R2StorageProvider } from './providers/r2-storage.provider';
import { StorageService } from './storage.service';

@Global()
@Module({
  providers: [StorageService, LocalStorageProvider, R2StorageProvider],
  exports: [StorageService],
})
export class StorageModule {}
