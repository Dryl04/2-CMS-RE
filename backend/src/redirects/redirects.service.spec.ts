import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RedirectsService } from './redirects.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RedirectsService', () => {
  let service: RedirectsService;
  let prisma: PrismaService;

  const mockRedirect = {
    id: 'redirect-1',
    sourcePath: '/old-page',
    targetPath: '/new-page',
    sourcePageId: null,
    targetPageId: null,
    reason: 'Page moved',
    isActive: true,
    createdBy: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    seoRedirect: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedirectsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RedirectsService>(RedirectsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all redirects ordered by updatedAt desc', async () => {
      mockPrismaService.seoRedirect.findMany.mockResolvedValue([mockRedirect]);

      const result = await service.findAll();

      expect(mockPrismaService.seoRedirect.findMany).toHaveBeenCalledWith({
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toEqual([mockRedirect]);
    });
  });

  describe('findOne', () => {
    it('should return a redirect by id', async () => {
      mockPrismaService.seoRedirect.findUnique.mockResolvedValue(mockRedirect);

      const result = await service.findOne('redirect-1');

      expect(mockPrismaService.seoRedirect.findUnique).toHaveBeenCalledWith({
        where: { id: 'redirect-1' },
      });
      expect(result).toEqual(mockRedirect);
    });

    it('should throw NotFoundException if redirect not found', async () => {
      mockPrismaService.seoRedirect.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a redirect with createdBy userId', async () => {
      const dto = {
        sourcePath: '/old',
        targetPath: '/new',
        reason: 'moved',
      };
      mockPrismaService.seoRedirect.create.mockResolvedValue({
        ...mockRedirect,
        ...dto,
      });

      const result = await service.create(dto as any, 'user-1');

      expect(mockPrismaService.seoRedirect.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          createdBy: 'user-1',
        },
      });
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update a redirect', async () => {
      const dto = { targetPath: '/updated-path' };
      mockPrismaService.seoRedirect.findUnique.mockResolvedValue(mockRedirect);
      mockPrismaService.seoRedirect.update.mockResolvedValue({
        ...mockRedirect,
        ...dto,
      });

      const result = await service.update('redirect-1', dto as any);

      expect(mockPrismaService.seoRedirect.findUnique).toHaveBeenCalledWith({
        where: { id: 'redirect-1' },
      });
      expect(mockPrismaService.seoRedirect.update).toHaveBeenCalledWith({
        where: { id: 'redirect-1' },
        data: dto,
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if redirect not found during update', async () => {
      mockPrismaService.seoRedirect.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { targetPath: '/x' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a redirect', async () => {
      mockPrismaService.seoRedirect.findUnique.mockResolvedValue(mockRedirect);
      mockPrismaService.seoRedirect.delete.mockResolvedValue(mockRedirect);

      const result = await service.delete('redirect-1');

      expect(mockPrismaService.seoRedirect.findUnique).toHaveBeenCalledWith({
        where: { id: 'redirect-1' },
      });
      expect(mockPrismaService.seoRedirect.delete).toHaveBeenCalledWith({
        where: { id: 'redirect-1' },
      });
      expect(result).toEqual(mockRedirect);
    });

    it('should throw NotFoundException if redirect not found during delete', async () => {
      mockPrismaService.seoRedirect.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
