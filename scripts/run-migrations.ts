import { AppDataSource } from '../src/libs/config/data-source.config';

AppDataSource.initialize()
  .then(async () => {
    console.log('Data Source initialized');
    
    // Показать статус миграций
    const executedMigrations = await AppDataSource.query('SELECT * FROM "migrations" ORDER BY "id" DESC');
    console.log('Executed migrations:', executedMigrations);
    
    // Запустить миграции
    const migrations = await AppDataSource.runMigrations();
    console.log('Migrations completed:', migrations);
    
    await AppDataSource.destroy();
    process.exit(0);
  })
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  });
