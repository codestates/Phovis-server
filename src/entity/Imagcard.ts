import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './User';
import { Image } from './Image';
import { Location } from './Location';
import { Tag } from './Tag';

@Entity()
export class Imagecard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    nullable: true,
  })
  description?: string;

  @ManyToOne(() => User, (user) => user.imagecards)
  user!: User;

  @OneToOne(() => Image)
  @JoinColumn()
  image!: Image;

  @ManyToMany(() => Tag, (tag) => tag.imagecard, {
    cascade: ['insert', 'update'],
  })
  @JoinTable()
  tag!: Tag[];

  @ManyToOne(() => Location, (location) => location.imagecard)
  location!: Location;

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
