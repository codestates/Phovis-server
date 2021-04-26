import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Tag } from './Tag';
import { Image } from './Image';

@Entity()
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  imgId!: number;

  @Column()
  description!: string;

  @Column()
  locationId!: number;

  @Column()
  userId!: number;

  @Column()
  tagId!: number;

  @OneToMany(() => Image, (image) => image.content)
  images!: Image[];

  @ManyToMany(() => Tag)
  @JoinTable()
  tags!: Tag[];
}
