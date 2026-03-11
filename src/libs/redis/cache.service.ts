import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Получение данных из кэша по ключу
   * Возвращает null если ключ не найден или произошла ошибка
   * @param key - ключ кэша
   * @returns данные или null
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      return value ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Установка данных в кэш
   * @param key - ключ кэша
   * @param value - сохраняемые данные
   * @param ttl - время жизни в секундах (по умолчанию используется настройка Redis)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl ? ttl * 1000 : undefined);
    } catch {
      // Тут можно выводить логи чтобы вылавливать отваливания редиса
    }
  }

  /**
   * Удаление данных из кэша по ключу
   * @param key - ключ кэша
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch {
      // Тут можно выводить логи чтобы вылавливать отваливания редиса
    }
  }

  /**
   * Полная инвалидация всего кэша
   * Используется при создании/обновлении/удалении статей
   * Поддерживает различные методы очистки в зависимости от реализации хранилища
   */
  async invalidateAll(): Promise<void> {
    try {
      const store = (this.cacheManager as any).store;
      
      if (!store) {
        return;
      }

      // Пробуем flush (для Redis)
      if (typeof store.flush === 'function') {
        await store.flush();
        return;
      }

      // Пробуем reset
      if (typeof store.reset === 'function') {
        await store.reset();
        return;
      }

      // Перебором удаляем все ключи (для Redis без flush)
      if (typeof store.scan === 'function') {
        await this.clearCacheByScan(store);
        return;
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  /**
   * Очистка кэша через Redis SCAN
   * Используется как fallback метод для постепенного удаления ключей
   * Сканирует все ключи пачками по 100 штук
   */
  private async clearCacheByScan(store: any): Promise<void> {
    const keys: string[] = await new Promise((resolve, reject) => {
      const foundKeys: string[] = [];
      
      const scanCallback = (err: Error | null, result: any) => {
        if (err) return reject(err);
        
        const [nextCursor, keys] = result;
        foundKeys.push(...keys);
        
        if (nextCursor === '0') {
          return resolve(foundKeys);
        }
        
        store.scan(nextCursor, 'MATCH', '*', 'COUNT', '100', scanCallback);
      };
      
      store.scan('0', 'MATCH', '*', 'COUNT', '100', scanCallback);
    });

    // Последовательное удаление всех найденных ключей
    for (const key of keys) {
      await this.cacheManager.del(key);
    }
  }
}
