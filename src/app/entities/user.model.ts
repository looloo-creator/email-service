import { Table, Column, Model, DataType } from 'sequelize-typescript';

export enum EmailVerificationStatus {
  NotVerified = 0,
  Verified = 1,
}

export enum UserStatus {
  VerificationPending = 1,
  Active = 2,
  Blocked = 3,
  DeactivatedByUser = 4,
}

export enum UserActiveState {
  Deleted = 0,
  Active = 1,
}

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
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: EmailVerificationStatus.NotVerified,
    comment: '0-Not verified, 1-verified',
  })
  is_email_verified: EmailVerificationStatus;

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
    allowNull: false,
    defaultValue: UserStatus.VerificationPending,
    comment: '1-Verification Pending, 2-Active, 3-Blocked, 4-Deactivated By User',
  })
  status: UserStatus;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  last_login: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: UserActiveState.Active,
    comment: '0-Deleted, 1-Active',
  })
  is_active: UserActiveState;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  created_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  updated_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  deleted_at: Date | null;
}
