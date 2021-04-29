import {
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm';
import { Content } from './Content';

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    nullable: true,
  })
  uri!: string;

  @Column({
    nullable: true,
  })
  type?: string;

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
