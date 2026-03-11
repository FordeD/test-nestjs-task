import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class InitialMigration implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid' },
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'password', type: 'varchar' },
          { name: 'name', type: 'varchar', default: "''" },
          { name: 'createdAt', type: 'timestamp', default: 'NOW()' },
          { name: 'updatedAt', type: 'timestamp', default: 'NOW()' },
        ],
      }),
      true,
    );

    // Articles table
    await queryRunner.createTable(
      new Table({
        name: 'articles',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid' },
          { name: 'title', type: 'varchar' },
          { name: 'description', type: 'text' },
          { name: 'content', type: 'text' },
          { name: 'published', type: 'boolean', default: false },
          { name: 'publishedAt', type: 'timestamp', isNullable: true },
          { name: 'authorId', type: 'uuid', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'NOW()' },
          { name: 'updatedAt', type: 'timestamp', default: 'NOW()' },
        ],
      }),
      true,
    );

    // Create index on articles
    await queryRunner.createIndex(
      'articles',
      new TableIndex({
        name: 'IDX_ARTICLES_PUBLISHED_PUBLISHEDAT',
        columnNames: ['published', 'publishedAt'],
      }),
    );

    // Foreign keys
    await queryRunner.createForeignKey(
      'articles',
      new TableForeignKey({
        columnNames: ['authorId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const articlesTable = await queryRunner.getTable('articles');
    const articlesFK = articlesTable?.foreignKeys.find((fk) => fk.columnNames.includes('authorId'));
    if (articlesFK && articlesFK.name) {
      await queryRunner.dropForeignKey('articles', articlesFK.name);
    }

    await queryRunner.dropTable('articles');
    await queryRunner.dropTable('users');
  }
}
