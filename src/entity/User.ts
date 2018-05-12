import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeInsert
} from 'typeorm'
import * as bcrypt from 'bcryptjs'
@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string

  @Column('varchar') firstName: string

  @Column('varchar') lastName: string

  @Column('varchar', { length: 255 })
  email: string

  @Column('text') password: string

  @Column('timestamptz') registeredAt: Date

  @Column('boolean', { default: false })
  confirmed: boolean

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10)
  }
}
