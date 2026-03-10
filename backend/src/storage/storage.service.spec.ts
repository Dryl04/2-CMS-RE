import { StorageService } from './storage.service';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { R2StorageProvider } from './providers/r2-storage.provider';

jest.mock('./providers/local-storage.provider');
jest.mock('./providers/r2-storage.provider');

describe('StorageService', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should use local storage provider by default', () => {
      delete process.env.STORAGE_TYPE;

      const service = new StorageService();

      expect(LocalStorageProvider).toHaveBeenCalled();
      expect(service).toBeDefined();
    });

    it('should use local storage provider when STORAGE_TYPE=local', () => {
      process.env.STORAGE_TYPE = 'local';

      const service = new StorageService();

      expect(LocalStorageProvider).toHaveBeenCalled();
    });

    it('should use R2 storage provider when STORAGE_TYPE=r2', () => {
      process.env.STORAGE_TYPE = 'r2';

      const service = new StorageService();

      expect(R2StorageProvider).toHaveBeenCalled();
    });
  });

  describe('with local provider', () => {
    let service: StorageService;
    let mockUpload: jest.Mock;
    let mockDelete: jest.Mock;
    let mockGetPublicUrl: jest.Mock;

    beforeEach(() => {
      delete process.env.STORAGE_TYPE;

      mockUpload = jest.fn().mockResolvedValue({
        filePath: 'user-1/file.jpg',
        publicUrl: '/uploads/user-1/file.jpg',
      });
      mockDelete = jest.fn().mockResolvedValue(undefined);
      mockGetPublicUrl = jest.fn().mockReturnValue('/uploads/user-1/file.jpg');

      (LocalStorageProvider as jest.Mock).mockImplementation(() => ({
        upload: mockUpload,
        delete: mockDelete,
        getPublicUrl: mockGetPublicUrl,
      }));

      service = new StorageService();
    });

    describe('upload', () => {
      it('should delegate to local provider', async () => {
        const mockFile = {
          originalname: 'test.jpg',
          buffer: Buffer.from('file-content'),
          mimetype: 'image/jpeg',
        } as Express.Multer.File;

        const result = await service.upload(mockFile, 'user-1');

        expect(mockUpload).toHaveBeenCalledWith(mockFile, 'user-1');
        expect(result).toEqual({
          filePath: 'user-1/file.jpg',
          publicUrl: '/uploads/user-1/file.jpg',
        });
      });
    });

    describe('delete', () => {
      it('should delegate to local provider', async () => {
        await service.delete('user-1/file.jpg');

        expect(mockDelete).toHaveBeenCalledWith('user-1/file.jpg');
      });
    });

    describe('getPublicUrl', () => {
      it('should delegate to local provider', () => {
        const result = service.getPublicUrl('user-1/file.jpg');

        expect(mockGetPublicUrl).toHaveBeenCalledWith('user-1/file.jpg');
        expect(result).toBe('/uploads/user-1/file.jpg');
      });
    });
  });
});
