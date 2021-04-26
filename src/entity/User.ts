import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Bookmark } from './Bookmark';
import { Like } from './Like';
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

  @OneToMany(() => Bookmark, (bookmark) => bookmark.user)
  bookmarks!: Bookmark[];

  @OneToMany(() => Follow, (follow) => follow.user)
  follows!: Follow[];

  @OneToMany(() => Like, (like) => like.user)
  likes!: Like[];

  @OneToMany(() => Imagecard, (imagecard) => imagecard.user)
  imagecards!: Imagecard[];
}
