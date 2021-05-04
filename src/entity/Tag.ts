import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Content } from './Content';
import { Imagecard } from './Imagcard';
import { Location } from './Location';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  tagName?: string;

  @ManyToMany(() => Location, {
    cascade: ['insert'],
  })
  @JoinTable()
  location!: Location[];

  @ManyToMany(() => Imagecard, (imagecard) => imagecard.tag, {
    cascade: ['insert'],
  })
  imagecard!: Imagecard[];

  @ManyToMany(() => Content, (content) => content.tag)
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
