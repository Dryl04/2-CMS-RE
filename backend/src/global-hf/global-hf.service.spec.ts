import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GlobalHfService } from './global-hf.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GlobalHfService', () => {
  let service: GlobalHfService;
  let prisma: PrismaService;

  const mockSetting = {
    id: 'hf-1',
    label: 'Main Header/Footer',
    headerSection: { type: 'header', content: '<header>Hello</header>' },
    footerSection: { type: 'footer', content: '<footer>Bye</footer>' },
    applyOnImport: true,
    applyOnCreate: false,
    isActive: true,
    targetPageIds: ['page-1', 'page-2'],
    createdBy: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    globalHfSetting: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalHfService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<GlobalHfService>(GlobalHfService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all global HF settings ordered by updatedAt desc', async () => {
      mockPrismaService.globalHfSetting.findMany.mockResolvedValue([
        mockSetting,
      ]);

      const result = await service.findAll();

      expect(mockPrismaService.globalHfSetting.findMany).toHaveBeenCalledWith({
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toEqual([mockSetting]);
    });
  });

  describe('findActive', () => {
    it('should return only active global HF settings', async () => {
      mockPrismaService.globalHfSetting.findMany.mockResolvedValue([
        mockSetting,
      ]);

      const result = await service.findActive();

      expect(mockPrismaService.globalHfSetting.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toEqual([mockSetting]);
    });
  });

  describe('findOne', () => {
    it('should return a global HF setting by id', async () => {
      mockPrismaService.globalHfSetting.findUnique.mockResolvedValue(
        mockSetting,
      );

      const result = await service.findOne('hf-1');

      expect(mockPrismaService.globalHfSetting.findUnique).toHaveBeenCalledWith(
        { where: { id: 'hf-1' } },
      );
      expect(result).toEqual(mockSetting);
    });

    it('should throw NotFoundException if setting not found', async () => {
      mockPrismaService.globalHfSetting.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a global HF setting with targetPageIds and userId', async () => {
      const dto = {
        label: 'New Setting',
        headerSection: { type: 'header' },
        targetPageIds: ['page-3'],
      };
      mockPrismaService.globalHfSetting.create.mockResolvedValue({
        ...mockSetting,
        ...dto,
      });

      const result = await service.create(dto as any, 'user-1');

      expect(mockPrismaService.globalHfSetting.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          targetPageIds: ['page-3'],
          createdBy: 'user-1',
        },
      });
      expect(result).toBeDefined();
    });

    it('should default targetPageIds to empty array when not provided', async () => {
      const dto = {
        label: 'Minimal Setting',
      };
      mockPrismaService.globalHfSetting.create.mockResolvedValue({
        ...mockSetting,
        ...dto,
        targetPageIds: [],
      });

      await service.create(dto as any, 'user-1');

      expect(mockPrismaService.globalHfSetting.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          targetPageIds: [],
          createdBy: 'user-1',
        },
      });
    });
  });

  describe('update', () => {
    it('should update a global HF setting', async () => {
      const dto = { label: 'Updated Label' };
      mockPrismaService.globalHfSetting.findUnique.mockResolvedValue(
        mockSetting,
      );
      mockPrismaService.globalHfSetting.update.mockResolvedValue({
        ...mockSetting,
        ...dto,
      });

      const result = await service.update('hf-1', dto as any);

      expect(mockPrismaService.globalHfSetting.findUnique).toHaveBeenCalledWith(
        { where: { id: 'hf-1' } },
      );
      expect(mockPrismaService.globalHfSetting.update).toHaveBeenCalledWith({
        where: { id: 'hf-1' },
        data: dto,
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if setting not found during update', async () => {
      mockPrismaService.globalHfSetting.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { label: 'X' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
