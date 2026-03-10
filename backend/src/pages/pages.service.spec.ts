import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PagesService', () => {
  let service: PagesService;
  let prisma: PrismaService;

  const mockPage = {
    id: 'page-1',
    pageKey: 'home',
    title: 'Home Page',
    description: 'Home page description',
    keywords: ['home'],
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    canonicalUrl: null,
    language: 'en',
    status: 'published',
    content: '<p>Hello</p>',
    sectionsData: null,
    seoH1: null,
    seoH2: null,
    templateId: null,
    daisyThemeSlug: null,
    folder: null,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    seoMetadata: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
    },
    seoRedirect: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PagesService>(PagesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of pages', async () => {
      const pages = [mockPage];
      mockPrismaService.seoMetadata.findMany.mockResolvedValue(pages);

      const result = await service.findAll();

      expect(mockPrismaService.seoMetadata.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toEqual(pages);
    });

    it('should filter by status', async () => {
      mockPrismaService.seoMetadata.findMany.mockResolvedValue([mockPage]);

      await service.findAll({ status: 'published' as any });

      expect(mockPrismaService.seoMetadata.findMany).toHaveBeenCalledWith({
        where: { status: 'published' },
        orderBy: { updatedAt: 'desc' },
      });
    });

    it('should filter by folder', async () => {
      mockPrismaService.seoMetadata.findMany.mockResolvedValue([]);

      await service.findAll({ folder: 'blog' });

      expect(mockPrismaService.seoMetadata.findMany).toHaveBeenCalledWith({
        where: { folder: 'blog' },
        orderBy: { updatedAt: 'desc' },
      });
    });

    it('should filter by userId', async () => {
      mockPrismaService.seoMetadata.findMany.mockResolvedValue([]);

      await service.findAll({ userId: 'user-1' });

      expect(mockPrismaService.seoMetadata.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { updatedAt: 'desc' },
      });
    });

    it('should apply multiple filters simultaneously', async () => {
      mockPrismaService.seoMetadata.findMany.mockResolvedValue([]);

      await service.findAll({ status: 'published' as any, folder: 'blog' });

      expect(mockPrismaService.seoMetadata.findMany).toHaveBeenCalledWith({
        where: { status: 'published', folder: 'blog' },
        orderBy: { updatedAt: 'desc' },
      });
    });
  });

  describe('findPublicByPageKey', () => {
    it('should return published page by pageKey', async () => {
      mockPrismaService.seoMetadata.findFirst.mockResolvedValue(mockPage);

      const result = await service.findPublicByPageKey('home');

      expect(mockPrismaService.seoMetadata.findFirst).toHaveBeenCalledWith({
        where: {
          pageKey: 'home',
          status: 'published',
        },
      });
      expect(result).toEqual(mockPage);
    });

    it('should throw NotFoundException if published page not found', async () => {
      mockPrismaService.seoMetadata.findFirst.mockResolvedValue(null);

      await expect(service.findPublicByPageKey('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a page by id', async () => {
      mockPrismaService.seoMetadata.findUnique.mockResolvedValue(mockPage);

      const result = await service.findOne('page-1');

      expect(mockPrismaService.seoMetadata.findUnique).toHaveBeenCalledWith({
        where: { id: 'page-1' },
      });
      expect(result).toEqual(mockPage);
    });

    it('should throw NotFoundException if page not found', async () => {
      mockPrismaService.seoMetadata.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create page with userId', async () => {
      const createDto = {
        pageKey: 'about',
        title: 'About Page',
      };
      const createdPage = { ...mockPage, ...createDto, userId: 'user-1' };
      mockPrismaService.seoMetadata.create.mockResolvedValue(createdPage);

      const result = await service.create(createDto as any, 'user-1');

      expect(mockPrismaService.seoMetadata.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          userId: 'user-1',
        },
      });
      expect(result).toEqual(createdPage);
    });
  });

  describe('update', () => {
    it('should update page', async () => {
      const updateDto = { title: 'Updated Title' };
      mockPrismaService.seoMetadata.findUnique.mockResolvedValue(mockPage);
      const updatedPage = { ...mockPage, ...updateDto };
      mockPrismaService.seoMetadata.update.mockResolvedValue(updatedPage);

      const result = await service.update('page-1', updateDto as any);

      expect(mockPrismaService.seoMetadata.findUnique).toHaveBeenCalledWith({
        where: { id: 'page-1' },
      });
      expect(mockPrismaService.seoMetadata.update).toHaveBeenCalledWith({
        where: { id: 'page-1' },
        data: updateDto,
      });
      expect(result).toEqual(updatedPage);
    });

    it('should throw NotFoundException if page not found during update', async () => {
      mockPrismaService.seoMetadata.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { title: 'Updated' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete page', async () => {
      mockPrismaService.seoMetadata.findUnique.mockResolvedValue(mockPage);
      mockPrismaService.seoMetadata.delete.mockResolvedValue(mockPage);

      const result = await service.delete('page-1');

      expect(mockPrismaService.seoMetadata.findUnique).toHaveBeenCalledWith({
        where: { id: 'page-1' },
      });
      expect(mockPrismaService.seoMetadata.delete).toHaveBeenCalledWith({
        where: { id: 'page-1' },
      });
      expect(result).toEqual(mockPage);
    });

    it('should throw NotFoundException if page not found during delete', async () => {
      mockPrismaService.seoMetadata.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findPublicRedirect', () => {
    it('should return active redirect', async () => {
      const mockRedirect = {
        id: 'redirect-1',
        sourcePath: '/old',
        targetPath: '/new',
        isActive: true,
      };
      mockPrismaService.seoRedirect.findFirst.mockResolvedValue(mockRedirect);

      const result = await service.findPublicRedirect('/old');

      expect(mockPrismaService.seoRedirect.findFirst).toHaveBeenCalledWith({
        where: { sourcePath: '/old', isActive: true },
      });
      expect(result).toEqual(mockRedirect);
    });

    it('should throw NotFoundException if redirect not found', async () => {
      mockPrismaService.seoRedirect.findFirst.mockResolvedValue(null);

      await expect(
        service.findPublicRedirect('/non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('upsertBulk', () => {
    it('should upsert multiple items', async () => {
      const items = [
        { pageKey: 'home', title: 'Home' },
        { pageKey: 'about', title: 'About' },
      ];
      mockPrismaService.seoMetadata.upsert
        .mockResolvedValueOnce({ ...mockPage, pageKey: 'home', title: 'Home' })
        .mockResolvedValueOnce({
          ...mockPage,
          pageKey: 'about',
          title: 'About',
        });

      const result = await service.upsertBulk(items);

      expect(mockPrismaService.seoMetadata.upsert).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.seoMetadata.upsert).toHaveBeenCalledWith({
        where: { pageKey: 'home' },
        update: { title: 'Home' },
        create: { pageKey: 'home', title: 'Home' },
      });
      expect(result).toHaveLength(2);
    });
  });
});
