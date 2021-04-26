import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Image } from './Image';
import { Location } from './Location';

@Entity()
export class Imagecard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  description!: string;

  @ManyToOne(() => User, (user) => user.imagecards)
  user!: User;

  @OneToOne(() => Image)
  @JoinColumn()
  image!: Image;

  @OneToOne(() => Location)
  @JoinColumn()
  location!: Location;
}
