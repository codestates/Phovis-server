import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Image } from './Image';
import { Content } from './Content';

@Entity()
export class Imagecard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  description!: string;

  @OneToOne(() => Image)
  @JoinColumn()
  image!: Image;

  @OneToOne(() => Content)
  @JoinColumn()
  content!: Content;
}
