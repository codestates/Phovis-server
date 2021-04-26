import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Content } from './Content';

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  uri!: string;

  @Column()
  message!: string;

  @Column()
  type?: string;

  @ManyToOne(() => Content, (content) => content.images)
  content!: Content;
}
