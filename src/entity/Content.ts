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

  @ManyToMany(() => User)
  bookmark!: User[];

  @ManyToMany(() => User)
  favourite!: User[];

  @OneToMany(() => ContentCard, (contentcard) => contentcard.content)
  contentCard!: ContentCard[];

  @OneToOne(() => Image, {
    cascade: ['insert', 'update'],
    nullable: true,
  })
  @JoinColumn()
  image!: Image;

  @ManyToMany(() => Tag, {
    cascade: ['insert', 'update'],
    nullable: true,
  })
  @JoinTable()
  tag?: Tag[];

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
