import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Content } from './Content';

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    nullable: true,
  })
  location!: string;

  @ManyToMany(() => Content, {
    cascade: ['insert', 'update'],
    nullable: true,
  })
  @JoinTable()
  content!: Content[];

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
