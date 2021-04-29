import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Imagecard } from './Imagcard';
import { Content } from './Content';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userName!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column()
  type!: string;

  @Column()
  imgUrl!: string;

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

  @OneToMany(() => Content, (content) => content.user, {
    cascade: ['insert', 'update'],
  })
  content!: Content[];

  @ManyToMany(() => User, (user) => user.following, {
    cascade: ['insert', 'update'],
  })
  @JoinTable({
    name: 'follow',
    joinColumn: {
      name: 'follower',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'following',
      referencedColumnName: 'id',
    },
  })
  follower!: User[];

  @ManyToMany(() => User, (user) => user.follower)
  following!: User[];

  @ManyToMany(() => Content, (content) => content.favourite, {
    cascade: ['insert', 'update'],
  })
  @JoinTable({
    name: 'favourite',
    joinColumn: {
      name: 'user',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'content',
      referencedColumnName: 'id',
    },
  })
  favourite!: Content[];

  @OneToMany(() => Imagecard, (imagecard) => imagecard.user)
  imagecards!: Imagecard[];

  @ManyToMany(() => Content, (content) => content.bookmark, {
    cascade: ['insert', 'update'],
  })
  @JoinTable({
    name: 'bookmark',
    joinColumn: {
      name: 'user',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'content',
      referencedColumnName: 'id',
    },
  })
  bookmark!: Content[];
}
