import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleRepository } from '../../repositories/article/article.repository';
import { CacheService } from '../../redis/cache.service';

describe('ArticleService', () => {
  let service: ArticleService;
  let articleRepository: ArticleRepository;
  let cacheService: CacheService;

  const mockArticleRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByAuthorId: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    invalidateAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: ArticleRepository,
          useValue: mockArticleRepository,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
    articleRepository = module.get<ArticleRepository>(ArticleRepository);
    cacheService = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      title: 'Test Article',
      description: 'Test Description',
      content: 'Test Content',
      authorId: 'author-uuid',
    };

    const mockArticle = {
      id: 'article-uuid',
      ...createDto,
      published: false,
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully create an article', async () => {
      mockArticleRepository.create.mockResolvedValue(mockArticle);

      const result = await service.create(createDto);

      expect(articleRepository.create).toHaveBeenCalledWith(
        createDto.title,
        createDto.description,
        createDto.content,
        createDto.authorId,
      );
      expect(result).toEqual(mockArticle);
    });

    it('should invalidate all cache after creating', async () => {
      mockArticleRepository.create.mockResolvedValue(mockArticle);

      await service.create(createDto);

      expect(cacheService.invalidateAll).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const mockArticles = {
      data: [
        { id: '1', title: 'Article 1' },
        { id: '2', title: 'Article 2' },
      ],
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    it('should return cached articles if available', async () => {
      mockCacheService.get.mockResolvedValue(mockArticles);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(cacheService.get).toHaveBeenCalled();
      expect(articleRepository.findAll).not.toHaveBeenCalled();
      expect(result).toEqual(mockArticles);
    });

    it('should fetch from repository if not cached', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockArticleRepository.findAll.mockResolvedValue(mockArticles);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(cacheService.get).toHaveBeenCalled();
      expect(articleRepository.findAll).toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalled();
      expect(result).toEqual(mockArticles);
    });

    it('should cache results for 5 minutes', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockArticleRepository.findAll.mockResolvedValue(mockArticles);

      await service.findAll({ page: 1, limit: 10 });

      expect(cacheService.set).toHaveBeenCalledWith(expect.any(String), mockArticles, 300);
    });

    it('should generate different cache keys for different params', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockArticleRepository.findAll.mockResolvedValue(mockArticles);

      await service.findAll({ page: 1, limit: 10 });
      await service.findAll({ page: 2, limit: 10 });
      await service.findAll({ page: 1, limit: 20 });

      const cacheKeys = mockCacheService.set.mock.calls.map(call => call[0]);
      expect(cacheKeys[0]).not.toEqual(cacheKeys[1]);
      expect(cacheKeys[0]).not.toEqual(cacheKeys[2]);
    });
  });

  describe('findById', () => {
    const mockArticle = {
      id: 'article-uuid',
      title: 'Test Article',
      description: 'Test Description',
      content: 'Test Content',
      authorId: 'author-uuid',
      published: false,
    };

    it('should return cached article if available', async () => {
      mockCacheService.get.mockResolvedValue(mockArticle);

      const result = await service.findById(mockArticle.id);

      expect(cacheService.get).toHaveBeenCalledWith(`article:${mockArticle.id}`);
      expect(articleRepository.findById).not.toHaveBeenCalled();
      expect(result).toEqual(mockArticle);
    });

    it('should fetch from repository if not cached', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockArticleRepository.findById.mockResolvedValue(mockArticle);

      const result = await service.findById(mockArticle.id);

      expect(cacheService.get).toHaveBeenCalled();
      expect(articleRepository.findById).toHaveBeenCalledWith(mockArticle.id);
      expect(cacheService.set).toHaveBeenCalledWith(`article:${mockArticle.id}`, mockArticle, 300);
      expect(result).toEqual(mockArticle);
    });

    it('should throw NotFoundException if article not found', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockArticleRepository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findById('non-existent-id')).rejects.toThrow('Article with ID non-existent-id not found');
    });
  });

  describe('update', () => {
    const updateDto = {
      title: 'Updated Title',
      description: 'Updated Description',
      content: 'Updated Content',
      published: true,
    };

    const existingArticle = {
      id: 'article-uuid',
      title: 'Original Title',
      description: 'Original Description',
      content: 'Original Content',
      authorId: 'author-uuid',
      published: false,
      publishedAt: null,
    };

    const updatedArticle = {
      ...existingArticle,
      ...updateDto,
      publishedAt: new Date(),
    };

    beforeEach(() => {
      mockCacheService.get.mockResolvedValueOnce(null);
      mockArticleRepository.findById.mockResolvedValue(existingArticle);
    });

    it('should successfully update article if user is author', async () => {
      mockArticleRepository.update.mockResolvedValue(updatedArticle);

      const result = await service.update(existingArticle.id, updateDto, existingArticle.authorId);

      expect(articleRepository.update).toHaveBeenCalled();
      expect(result).toEqual(updatedArticle);
    });

    it('should invalidate cache after updating', async () => {
      mockArticleRepository.update.mockResolvedValue(updatedArticle);

      await service.update(existingArticle.id, updateDto, existingArticle.authorId);

      expect(cacheService.invalidateAll).toHaveBeenCalled();
      expect(cacheService.del).toHaveBeenCalledWith(`article:${existingArticle.id}`);
    });

    it('should throw ForbiddenException if user is not author', async () => {
      await expect(service.update(existingArticle.id, updateDto, 'different-user-id'))
        .rejects.toThrow(ForbiddenException);
      await expect(service.update(existingArticle.id, updateDto, 'different-user-id'))
        .rejects.toThrow('You can only update your own articles');
      expect(articleRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if article not found', async () => {
      mockArticleRepository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent-id', updateDto, 'user-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    const mockArticle = {
      id: 'article-uuid',
      title: 'Test Article',
      authorId: 'author-uuid',
    };

    beforeEach(() => {
      mockCacheService.get.mockResolvedValueOnce(null);
      mockArticleRepository.findById.mockResolvedValue(mockArticle);
    });

    it('should successfully delete article if user is author', async () => {
      mockArticleRepository.delete.mockResolvedValue(undefined);

      await service.delete(mockArticle.id, mockArticle.authorId);

      expect(articleRepository.delete).toHaveBeenCalledWith(mockArticle.id);
    });

    it('should invalidate cache after deleting', async () => {
      mockArticleRepository.delete.mockResolvedValue(undefined);

      await service.delete(mockArticle.id, mockArticle.authorId);

      expect(cacheService.invalidateAll).toHaveBeenCalled();
      expect(cacheService.del).toHaveBeenCalledWith(`article:${mockArticle.id}`);
    });

    it('should throw ForbiddenException if user is not author', async () => {
      await expect(service.delete(mockArticle.id, 'different-user-id'))
        .rejects.toThrow(ForbiddenException);
      await expect(service.delete(mockArticle.id, 'different-user-id'))
        .rejects.toThrow('You can only delete your own articles');
      expect(articleRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if article not found', async () => {
      mockArticleRepository.findById.mockResolvedValue(null);

      await expect(service.delete('non-existent-id', 'user-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findByAuthorId', () => {
    const mockArticles = [
      { id: '1', title: 'Article 1', authorId: 'author-uuid' },
      { id: '2', title: 'Article 2', authorId: 'author-uuid' },
    ];

    it('should return articles by author', async () => {
      mockArticleRepository.findByAuthorId.mockResolvedValue(mockArticles);

      const result = await service.findByAuthorId('author-uuid');

      expect(articleRepository.findByAuthorId).toHaveBeenCalledWith('author-uuid');
      expect(result).toEqual(mockArticles);
    });

    it('should return empty array if author has no articles', async () => {
      mockArticleRepository.findByAuthorId.mockResolvedValue([]);

      const result = await service.findByAuthorId('author-uuid');

      expect(result).toEqual([]);
    });
  });
});
