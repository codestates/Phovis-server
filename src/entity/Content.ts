import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tag } from './Tag';
import { Image } from './Image';
import { ContentCard } from './Contentcard';
import { Bookmark } from './Bookmark';
import { Favourite } from './Like';

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

  @OneToMany(() => Bookmark, (bookmark) => bookmark.content)
  bookmark!: Bookmark[];

  @OneToMany(() => Favourite, (favourite) => favourite.content)
  favourite!: Favourite[];

  @OneToMany(() => ContentCard, (contentcard) => contentcard.content)
  contentCard!: ContentCard[];

  @OneToOne(() => Image)
  image!: Image;

  @ManyToMany(() => Tag)
  @JoinTable()
  tags!: Tag[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updatedAt!: Date;
}
