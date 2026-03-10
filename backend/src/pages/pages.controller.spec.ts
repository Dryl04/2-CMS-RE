import { Test, TestingModule } from '@nestjs/testing';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';

describe('PagesController', () => {
  let controller: PagesController;
  let pagesService: PagesService;

  const mockPagesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findPublicByPageKey: jest.fn(),
    findPublicRedirect: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsertBulk: jest.fn(),
  };

  const mockPage = {
    id: 'page-1',
    pageKey: 'home',
    title: 'Home Page',
    status: 'published',
    userId: 'user-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagesController],
      providers: [{ provide: PagesService, useValue: mockPagesService }],
    }).compile();

    controller = module.get<PagesController>(PagesController);
    pagesService = module.get<PagesService>(PagesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call pagesService.findAll with query params', async () => {
      mockPagesService.findAll.mockResolvedValue([mockPage]);

      const result = await controller.findAll('published' as any, 'blog', 'user-1');

      expect(pagesService.findAll).toHaveBeenCalledWith({
        status: 'published',
        folder: 'blog',
        userId: 'user-1',
      });
      expect(result).toEqual([mockPage]);
    });

    it('should call pagesService.findAll without filters', async () => {
      mockPagesService.findAll.mockResolvedValue([mockPage]);

      const result = await controller.findAll(undefined, undefined, undefined);

      expect(pagesService.findAll).toHaveBeenCalledWith({
        status: undefined,
        folder: undefined,
        userId: undefined,
      });
      expect(result).toEqual([mockPage]);
    });
  });

  describe('findOne', () => {
    it('should call pagesService.findOne with id', async () => {
      mockPagesService.findOne.mockResolvedValue(mockPage);

      const result = await controller.findOne('page-1');

      expect(pagesService.findOne).toHaveBeenCalledWith('page-1');
      expect(result).toEqual(mockPage);
    });
  });

  describe('findPublicByPageKey', () => {
    it('should call pagesService.findPublicByPageKey', async () => {
      mockPagesService.findPublicByPageKey.mockResolvedValue(mockPage);

      const result = await controller.findPublicByPageKey('home');

      expect(pagesService.findPublicByPageKey).toHaveBeenCalledWith('home');
      expect(result).toEqual(mockPage);
    });
  });

  describe('findPublicRedirect', () => {
    it('should call pagesService.findPublicRedirect', async () => {
      const mockRedirect = { id: 'r-1', sourcePath: '/old', targetPath: '/new' };
      mockPagesService.findPublicRedirect.mockResolvedValue(mockRedirect);

      const result = await controller.findPublicRedirect('/old');

      expect(pagesService.findPublicRedirect).toHaveBeenCalledWith('/old');
      expect(result).toEqual(mockRedirect);
    });
  });

  describe('create', () => {
    it('should call pagesService.create with dto and userId', async () => {
      const createDto = { pageKey: 'about', title: 'About' };
      const req = { user: { userId: 'user-1', email: 'test@example.com', role: 'admin' } } as any;
      mockPagesService.create.mockResolvedValue({ ...mockPage, ...createDto });

      const result = await controller.create(createDto as any, req);

      expect(pagesService.create).toHaveBeenCalledWith(createDto, 'user-1');
      expect(result).toBeDefined();
    });
  });

  describe('upsertBulk', () => {
    it('should call pagesService.upsertBulk with items', async () => {
      const items = [{ pageKey: 'home', title: 'Home' }];
      mockPagesService.upsertBulk.mockResolvedValue(items);

      const result = await controller.upsertBulk(items);

      expect(pagesService.upsertBulk).toHaveBeenCalledWith(items);
      expect(result).toEqual(items);
    });
  });

  describe('update', () => {
    it('should call pagesService.update with id and dto', async () => {
      const updateDto = { title: 'Updated Title' };
      mockPagesService.update.mockResolvedValue({ ...mockPage, ...updateDto });

      const result = await controller.update('page-1', updateDto as any);

      expect(pagesService.update).toHaveBeenCalledWith('page-1', updateDto);
      expect(result).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should call pagesService.delete with id', async () => {
      mockPagesService.delete.mockResolvedValue(mockPage);

      const result = await controller.delete('page-1');

      expect(pagesService.delete).toHaveBeenCalledWith('page-1');
      expect(result).toEqual(mockPage);
    });
  });
});
