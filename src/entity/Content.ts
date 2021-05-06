import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
} from 'typeorm';
import { Tag } from './Tag';
import { Image } from './Image';
import { ContentCard } from './Contentcard';
import { User } from './User';
import { Location } from './Location';

@Entity()
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    nullable: true,
  })
  title!: string;

  @Column({ length: 500, nullable: true })
  description!: string;

  @ManyToOne(() => User, (user) => user.content)
  user!: User;

  @ManyToMany(() => User, (user) => user.bookmark)
  bookmark!: User[];

  @ManyToMany(() => User, (user) => user.favourite)
  favourite!: User[];

  @OneToMany(() => ContentCard, (contentcard) => contentcard.content, {
    cascade: true,
  })
  contentCard!: ContentCard[];

  @OneToOne(() => Image, {
    cascade: ['insert', 'update'],
    nullable: true,
  })
  @JoinColumn()
  image!: Image;

  @ManyToMany(() => Tag, (tag) => tag.content, {
    nullable: true,
    cascade: ['insert', 'update'],
  })
  @JoinTable()
  tag!: Tag[];

  @ManyToMany(() => Location, (location) => location.content)
  location!: Location[];

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
