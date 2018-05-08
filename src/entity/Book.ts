import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm'

@Entity('books')
export class Book extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string

  @Column('varchar') title: string

  @Column('varchar') author: string

  @Column('timestamptz') createdAt: Date
}
