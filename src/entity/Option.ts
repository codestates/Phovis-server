import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class Option {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User, (user) => user.Option)
  @JoinColumn()
  user!: User;

  @Column()
  isFavourite: boolean = false;

  @Column()
  isBookmark: boolean = false;

  @Column()
  isFollow: boolean = false;

  @Column()
  isEmail: boolean = false;

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
