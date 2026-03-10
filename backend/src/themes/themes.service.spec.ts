import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ThemesService } from './themes.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ThemesService', () => {
  let service: ThemesService;
  let prisma: PrismaService;

  const mockPageTheme = {
    id: 'theme-1',
    name: 'Default Theme',
    description: 'Default theme description',
    css: { color: '#000' },
    isDefault: true,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDaisyTheme = {
    id: 'daisy-1',
    name: 'Light',
    slug: 'light',
    source: 'builtin',
    tokens: { primary: '#570df8' },
    fontConfig: null,
    isActive: true,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFont = {
    id: 'font-1',
    fontName: 'Roboto',
    fontFamily: 'Roboto, sans-serif',
    fontUrl: 'https://fonts.googleapis.com/css?family=Roboto',
    fontWeights: ['400', '700'],
    isGoogleFont: true,
    isSystem: false,
    importedBy: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    pageTheme: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    daisyuiTheme: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    fontsLibrary: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThemesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ThemesService>(ThemesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── Page Themes ──────────────────────────────────────────────

  describe('findAllPageThemes', () => {
    it('should return all page themes', async () => {
      mockPrismaService.pageTheme.findMany.mockResolvedValue([mockPageTheme]);

      const result = await service.findAllPageThemes();

      expect(mockPrismaService.pageTheme.findMany).toHaveBeenCalledWith({
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toEqual([mockPageTheme]);
    });
  });

  describe('findOnePageTheme', () => {
    it('should return a page theme by id', async () => {
      mockPrismaService.pageTheme.findUnique.mockResolvedValue(mockPageTheme);

      const result = await service.findOnePageTheme('theme-1');

      expect(mockPrismaService.pageTheme.findUnique).toHaveBeenCalledWith({
        where: { id: 'theme-1' },
      });
      expect(result).toEqual(mockPageTheme);
    });

    it('should throw NotFoundException if page theme not found', async () => {
      mockPrismaService.pageTheme.findUnique.mockResolvedValue(null);

      await expect(service.findOnePageTheme('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createPageTheme', () => {
    it('should create a page theme', async () => {
      const dto = { name: 'New Theme' };
      mockPrismaService.pageTheme.create.mockResolvedValue({
        ...mockPageTheme,
        ...dto,
      });

      const result = await service.createPageTheme(dto as any, 'user-1');

      expect(mockPrismaService.pageTheme.create).toHaveBeenCalledWith({
        data: { ...dto, userId: 'user-1' },
      });
      expect(result).toBeDefined();
    });
  });

  describe('updatePageTheme', () => {
    it('should update a page theme', async () => {
      const dto = { name: 'Updated Theme' };
      mockPrismaService.pageTheme.findUnique.mockResolvedValue(mockPageTheme);
      mockPrismaService.pageTheme.update.mockResolvedValue({
        ...mockPageTheme,
        ...dto,
      });

      const result = await service.updatePageTheme('theme-1', dto as any);

      expect(mockPrismaService.pageTheme.findUnique).toHaveBeenCalledWith({
        where: { id: 'theme-1' },
      });
      expect(mockPrismaService.pageTheme.update).toHaveBeenCalledWith({
        where: { id: 'theme-1' },
        data: dto,
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if page theme not found', async () => {
      mockPrismaService.pageTheme.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePageTheme('non-existent', { name: 'X' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePageTheme', () => {
    it('should delete a page theme', async () => {
      mockPrismaService.pageTheme.findUnique.mockResolvedValue(mockPageTheme);
      mockPrismaService.pageTheme.delete.mockResolvedValue(mockPageTheme);

      const result = await service.deletePageTheme('theme-1');

      expect(mockPrismaService.pageTheme.delete).toHaveBeenCalledWith({
        where: { id: 'theme-1' },
      });
      expect(result).toEqual(mockPageTheme);
    });

    it('should throw NotFoundException if page theme not found', async () => {
      mockPrismaService.pageTheme.findUnique.mockResolvedValue(null);

      await expect(service.deletePageTheme('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── DaisyUI Themes ──────────────────────────────────────────

  describe('findAllDaisyThemes', () => {
    it('should return all DaisyUI themes', async () => {
      mockPrismaService.daisyuiTheme.findMany.mockResolvedValue([
        mockDaisyTheme,
      ]);

      const result = await service.findAllDaisyThemes();

      expect(mockPrismaService.daisyuiTheme.findMany).toHaveBeenCalledWith({
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toEqual([mockDaisyTheme]);
    });
  });

  describe('findOneDaisyTheme', () => {
    it('should return a DaisyUI theme by id', async () => {
      mockPrismaService.daisyuiTheme.findUnique.mockResolvedValue(
        mockDaisyTheme,
      );

      const result = await service.findOneDaisyTheme('daisy-1');

      expect(mockPrismaService.daisyuiTheme.findUnique).toHaveBeenCalledWith({
        where: { id: 'daisy-1' },
      });
      expect(result).toEqual(mockDaisyTheme);
    });

    it('should throw NotFoundException if DaisyUI theme not found', async () => {
      mockPrismaService.daisyuiTheme.findUnique.mockResolvedValue(null);

      await expect(
        service.findOneDaisyTheme('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createDaisyTheme', () => {
    it('should create a DaisyUI theme', async () => {
      const dto = { name: 'Dark', slug: 'dark', tokens: { primary: '#000' } };
      mockPrismaService.daisyuiTheme.create.mockResolvedValue({
        ...mockDaisyTheme,
        ...dto,
      });

      const result = await service.createDaisyTheme(dto as any, 'user-1');

      expect(mockPrismaService.daisyuiTheme.create).toHaveBeenCalledWith({
        data: { ...dto, userId: 'user-1' },
      });
      expect(result).toBeDefined();
    });
  });

  describe('updateDaisyTheme', () => {
    it('should update a DaisyUI theme', async () => {
      const dto = { name: 'Updated Dark' };
      mockPrismaService.daisyuiTheme.findUnique.mockResolvedValue(
        mockDaisyTheme,
      );
      mockPrismaService.daisyuiTheme.update.mockResolvedValue({
        ...mockDaisyTheme,
        ...dto,
      });

      const result = await service.updateDaisyTheme('daisy-1', dto as any);

      expect(mockPrismaService.daisyuiTheme.update).toHaveBeenCalledWith({
        where: { id: 'daisy-1' },
        data: dto,
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if DaisyUI theme not found', async () => {
      mockPrismaService.daisyuiTheme.findUnique.mockResolvedValue(null);

      await expect(
        service.updateDaisyTheme('non-existent', { name: 'X' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteDaisyTheme', () => {
    it('should delete a DaisyUI theme', async () => {
      mockPrismaService.daisyuiTheme.findUnique.mockResolvedValue(
        mockDaisyTheme,
      );
      mockPrismaService.daisyuiTheme.delete.mockResolvedValue(mockDaisyTheme);

      const result = await service.deleteDaisyTheme('daisy-1');

      expect(mockPrismaService.daisyuiTheme.delete).toHaveBeenCalledWith({
        where: { id: 'daisy-1' },
      });
      expect(result).toEqual(mockDaisyTheme);
    });

    it('should throw NotFoundException if DaisyUI theme not found', async () => {
      mockPrismaService.daisyuiTheme.findUnique.mockResolvedValue(null);

      await expect(service.deleteDaisyTheme('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── Fonts Library ───────────────────────────────────────────

  describe('findAllFonts', () => {
    it('should return all fonts', async () => {
      mockPrismaService.fontsLibrary.findMany.mockResolvedValue([mockFont]);

      const result = await service.findAllFonts();

      expect(mockPrismaService.fontsLibrary.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockFont]);
    });
  });

  describe('createFont', () => {
    it('should create a font', async () => {
      const dto = {
        fontName: 'Open Sans',
        fontFamily: 'Open Sans, sans-serif',
        fontWeights: ['400', '600'],
      };
      mockPrismaService.fontsLibrary.create.mockResolvedValue({
        ...mockFont,
        ...dto,
      });

      const result = await service.createFont(dto as any, 'user-1');

      expect(mockPrismaService.fontsLibrary.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          fontWeights: ['400', '600'],
          importedBy: 'user-1',
        },
      });
      expect(result).toBeDefined();
    });

    it('should default fontWeights to empty array when not provided', async () => {
      const dto = {
        fontName: 'Open Sans',
        fontFamily: 'Open Sans, sans-serif',
      };
      mockPrismaService.fontsLibrary.create.mockResolvedValue({
        ...mockFont,
        ...dto,
        fontWeights: [],
      });

      await service.createFont(dto as any, 'user-1');

      expect(mockPrismaService.fontsLibrary.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          fontWeights: [],
          importedBy: 'user-1',
        },
      });
    });
  });

  describe('deleteFont', () => {
    it('should delete a font', async () => {
      mockPrismaService.fontsLibrary.findUnique.mockResolvedValue(mockFont);
      mockPrismaService.fontsLibrary.delete.mockResolvedValue(mockFont);

      const result = await service.deleteFont('font-1');

      expect(mockPrismaService.fontsLibrary.findUnique).toHaveBeenCalledWith({
        where: { id: 'font-1' },
      });
      expect(mockPrismaService.fontsLibrary.delete).toHaveBeenCalledWith({
        where: { id: 'font-1' },
      });
      expect(result).toEqual(mockFont);
    });

    it('should throw NotFoundException if font not found', async () => {
      mockPrismaService.fontsLibrary.findUnique.mockResolvedValue(null);

      await expect(service.deleteFont('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
