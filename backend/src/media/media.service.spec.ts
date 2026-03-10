import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MediaService } from './media.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

describe('MediaService', () => {
  let service: MediaService;
  let prisma: PrismaService;

  const mockMediaFile = {
    id: 'media-1',
    filename: '1234-abcd.jpg',
    originalFilename: 'photo.jpg',
    filePath: 'user-1/1234-abcd.jpg',
    fileSize: BigInt(1024),
    mimeType: 'image/jpeg',
    width: 800,
    height: 600,
    altText: 'A photo',
    uploadedBy: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    mediaFile: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all media files ordered by createdAt desc', async () => {
      mockPrismaService.mediaFile.findMany.mockResolvedValue([mockMediaFile]);

      const result = await service.findAll();

      expect(mockPrismaService.mediaFile.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockMediaFile]);
    });
  });

  describe('findOne', () => {
    it('should return a media file by id', async () => {
      mockPrismaService.mediaFile.findUnique.mockResolvedValue(mockMediaFile);

      const result = await service.findOne('media-1');

      expect(mockPrismaService.mediaFile.findUnique).toHaveBeenCalledWith({
        where: { id: 'media-1' },
      });
      expect(result).toEqual(mockMediaFile);
    });

    it('should throw NotFoundException if media file not found', async () => {
      mockPrismaService.mediaFile.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a media file record', async () => {
      const createData = {
        filename: '1234-abcd.jpg',
        originalFilename: 'photo.jpg',
        filePath: 'user-1/1234-abcd.jpg',
        fileSize: BigInt(1024),
        mimeType: 'image/jpeg',
        width: 800,
        height: 600,
        altText: 'A photo',
        uploadedBy: 'user-1',
      };
      mockPrismaService.mediaFile.create.mockResolvedValue(mockMediaFile);

      const result = await service.create(createData);

      expect(mockPrismaService.mediaFile.create).toHaveBeenCalledWith({
        data: createData,
      });
      expect(result).toEqual(mockMediaFile);
    });
  });

  describe('delete', () => {
    it('should delete a media file and remove from storage', async () => {
      mockPrismaService.mediaFile.findUnique.mockResolvedValue(mockMediaFile);
      mockPrismaService.mediaFile.delete.mockResolvedValue(mockMediaFile);
      const mockStorageService = {
        delete: jest.fn().mockResolvedValue(undefined),
      } as unknown as StorageService;

      const result = await service.delete('media-1', mockStorageService);

      expect(mockPrismaService.mediaFile.findUnique).toHaveBeenCalledWith({
        where: { id: 'media-1' },
      });
      expect(mockStorageService.delete).toHaveBeenCalledWith(
        mockMediaFile.filePath,
      );
      expect(mockPrismaService.mediaFile.delete).toHaveBeenCalledWith({
        where: { id: 'media-1' },
      });
      expect(result).toEqual(mockMediaFile);
    });

    it('should throw NotFoundException if media file not found during delete', async () => {
      mockPrismaService.mediaFile.findUnique.mockResolvedValue(null);
      const mockStorageService = {
        delete: jest.fn(),
      } as unknown as StorageService;

      await expect(
        service.delete('non-existent', mockStorageService),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
