import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Bookmark } from './Bookmark';
import { Favourite } from './Like';
import { Follow } from './Follow';
import { Imagecard } from './Imgcard';

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

  @OneToMany(() => Bookmark, (bookmark) => bookmark.user)
  bookmark!: Bookmark[];

  @OneToMany(() => Follow, (follow) => follow.follower)
  follower!: Follow[];

  @OneToMany(() => Favourite, (favourite) => favourite.user)
  favourite!: Favourite[];

  @OneToMany(() => Follow, (follow) => follow.following)
  following!: Follow[];

  @OneToMany(() => Imagecard, (imagecard) => imagecard.userId)
  imagecards!: Imagecard[];
}
