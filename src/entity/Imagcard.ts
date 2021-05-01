import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Image } from './Image';
import { Location } from './Location';

@Entity()
export class Imagecard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  description?: string;

  @ManyToOne(() => User, (user) => user.imagecards)
  user!: User;

  @OneToOne(() => Image)
  @JoinColumn()
  image!: Image;

  @OneToOne(() => Location)
  @JoinColumn()
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
