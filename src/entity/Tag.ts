import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinTable,
} from 'typeorm';
import { Location } from './Location';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  tagName!: string;

  @OneToOne(() => Location)
  @JoinTable()
  location!: Location;
}
