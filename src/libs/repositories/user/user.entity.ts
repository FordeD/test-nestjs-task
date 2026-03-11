import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Article } from '../article/article.entity';

/**
 * Сущность User - модель пользователя в базе данных
 * Описывает структуру таблицы users и связи с другими таблицами
 */
@Entity('users')
export class User {
  // Первичный ключ - UUID, генерируется автоматически
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: '' })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Связь One-to-Many: один пользователь может иметь много статей
  // Lazy loading - статьи загружаются по требованию
  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];
}
