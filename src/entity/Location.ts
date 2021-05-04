import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Content } from './Content';
import { Imagecard } from './Imagcard';

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    nullable: true,
  })
  location!: string;

  @Column({
    nullable: true,
  })
  lat!: number;

  @Column({
    nullable: true,
  })
  lng!: number;

  @ManyToMany(() => Content, {
    cascade: ['insert', 'update'],
    nullable: true,
  })
  @JoinTable()
  content!: Content[];

  @OneToMany(() => Imagecard, (imagecard) => imagecard.location)
  imagecard!: Imagecard[];

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
