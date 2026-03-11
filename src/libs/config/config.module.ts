import { ConfigModule } from '@nestjs/config';

/**
 * Глобальный модуль конфигурации
 * Загружает переменные окружения из файла .env
 * @isGlobal: true - делает переменные окружения доступными во всём приложении
 * @envFilePath: '.env' - путь к файлу с переменными окружения
 */
export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
});
