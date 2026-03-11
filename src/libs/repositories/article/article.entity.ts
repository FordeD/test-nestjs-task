import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../user/user.entity';

/**
 * Сущность Article - модель статьи в базе данных
 * Описывает структуру таблицы articles и связи с другими таблицами
 */
@Entity('articles')
// Индекс для оптимизации поиска по статусу и дате публикации
@Index(['published', 'publishedAt'])
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('text')
  content: string;

  @Column({ default: false })
  published: boolean;

  @Column({ nullable: true })
  publishedAt: Date;

  @Column({ nullable: true })
  authorId: string;

  // Связь Many-to-One: одна статья принадлежит одному пользователю
  // onDelete: 'CASCADE' - при удалении пользователя удаляются все его статьи
  @ManyToOne(() => User, (user) => user.articles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
