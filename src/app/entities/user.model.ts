import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'users', // set exact table name if needed
  timestamps: false, // since your original model had timestamps: false
  freezeTableName: false, // allows pluralization by Sequelize
})
export class User extends Model<User> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  username: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  password: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  is_email_verified: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  email_verified_at: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email_token: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  refresh_token: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  status: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  last_login: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  is_active: boolean;
}
