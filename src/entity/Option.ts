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

  @Column({
    nullable: true,
  })
  isFavourite!: boolean;

  @Column({
    nullable: true,
  })
  isBookmark!: boolean;

  @Column({
    nullable: true,
  })
  isFollow!: boolean;

  @Column({
    nullable: true,
  })
  isName!: boolean;

  @Column({
    nullable: true,
  })
  isEmail!: boolean;

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
