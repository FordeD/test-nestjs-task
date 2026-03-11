import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: any;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    store: {
      flush: jest.fn().mockResolvedValue(undefined),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return cached value if exists', async () => {
      const mockValue = { id: '1', title: 'Test' };
      mockCacheManager.get.mockResolvedValue(mockValue);

      const result = await service.get('test-key');

      expect(cacheManager.get).toHaveBeenCalledWith('test-key');
      expect(result).toEqual(mockValue);
    });

    it('should return null if key does not exist', async () => {
      mockCacheManager.get.mockResolvedValue(undefined);

      const result = await service.get('non-existent-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value with default TTL', async () => {
      const value = { id: '1', title: 'Test' };
      mockCacheManager.set.mockResolvedValue(value);

      await service.set('test-key', value);

      expect(cacheManager.set).toHaveBeenCalledWith('test-key', value, undefined);
    });

    it('should set value with custom TTL (converted to ms)', async () => {
      const value = { id: '1', title: 'Test' };
      mockCacheManager.set.mockResolvedValue(value);

      await service.set('test-key', value, 300);

      expect(cacheManager.set).toHaveBeenCalledWith('test-key', value, 300000);
    });
  });

  describe('del', () => {
    it('should delete key from cache', async () => {
      mockCacheManager.del.mockResolvedValue(undefined);

      await service.del('test-key');

      expect(cacheManager.del).toHaveBeenCalledWith('test-key');
    });
  });

  describe('invalidateAll', () => {
    it('should call flush on store if available', async () => {
      await service.invalidateAll();

      expect(mockCacheManager.store.flush).toHaveBeenCalled();
    });

    it('should handle missing store gracefully', async () => {
      const originalStore = mockCacheManager.store;
      (mockCacheManager as any).store = undefined;

      await service.invalidateAll();

      expect(mockCacheManager.store).toBeUndefined();
      
      // Restore
      mockCacheManager.store = originalStore;
    });

    it('should handle errors gracefully', async () => {
      mockCacheManager.store.flush.mockRejectedValue(new Error('Flush failed'));

      // Should not throw
      await expect(service.invalidateAll()).resolves.not.toThrow();
    });
  });
});
