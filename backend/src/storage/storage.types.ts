export interface StoredFile {
  key: string;
  publicUrl: string;
}

export interface StorageProvider {
  saveFile(file: Express.Multer.File, folder?: string): Promise<StoredFile>;
  deleteFile(filePath: string): Promise<void>;
  resolvePublicUrl(filePath: string): string;
}
