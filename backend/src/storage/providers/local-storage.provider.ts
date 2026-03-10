import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class LocalStorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly uploadsDir: string;
  private readonly publicPath: string;

  constructor() {
    this.uploadsDir = process.env.UPLOADS_DIR || './uploads';
    this.publicPath = process.env.UPLOADS_PUBLIC_PATH || '/uploads';
  }

  async upload(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ filePath: string; publicUrl: string }> {
    const userDir = path.join(this.uploadsDir, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const filename = `${timestamp}-${random}${ext}`;

    const absolutePath = path.join(userDir, filename);
    fs.writeFileSync(absolutePath, file.buffer);

    const filePath = path.join(userId, filename);
    const publicUrl = this.getPublicUrl(filePath);

    this.logger.log(`File uploaded locally: ${filePath}`);
    return { filePath, publicUrl };
  }

  async delete(filePath: string): Promise<void> {
    const absolutePath = path.join(this.uploadsDir, filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      this.logger.log(`File deleted locally: ${filePath}`);
    }
  }

  getPublicUrl(filePath: string): string {
    return `${this.publicPath}/${filePath}`;
  }
}
