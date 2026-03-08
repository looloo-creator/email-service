import { DataTypes } from 'sequelize';
import type { MigrationContext, MigrationDefinition } from './migration.interface';

async function dropMssqlDefaultConstraint(
  context: MigrationContext,
  table: string,
  column: string,
): Promise<void> {
  await context.sequelize.query(
    `
    DECLARE @constraintName NVARCHAR(128);
    SELECT @constraintName = dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON c.default_object_id = dc.object_id
    JOIN sys.tables t ON t.object_id = c.object_id
    WHERE t.name = :table AND c.name = :column;

    IF @constraintName IS NOT NULL
    BEGIN
      EXEC('ALTER TABLE [' + :table + '] DROP CONSTRAINT [' + @constraintName + ']');
    END
    `,
    {
      replacements: { table, column },
      transaction: context.transaction,
    },
  );
}

async function setMssqlColumnComment(
  context: MigrationContext,
  table: string,
  column: string,
  comment: string,
): Promise<void> {
  await context.sequelize.query(
    `
    IF EXISTS (
      SELECT 1
      FROM sys.extended_properties ep
      JOIN sys.columns c ON ep.major_id = c.object_id AND ep.minor_id = c.column_id
      JOIN sys.tables t ON t.object_id = c.object_id
      WHERE ep.name = 'MS_Description' AND t.name = :table AND c.name = :column
    )
      EXEC sp_updateextendedproperty
        @name = N'MS_Description',
        @value = :comment,
        @level0type = N'Schema', @level0name = 'dbo',
        @level1type = N'Table',  @level1name = :table,
        @level2type = N'Column', @level2name = :column;
    ELSE
      EXEC sp_addextendedproperty
        @name = N'MS_Description',
        @value = :comment,
        @level0type = N'Schema', @level0name = 'dbo',
        @level1type = N'Table',  @level1name = :table,
        @level2type = N'Column', @level2name = :column;
    `,
    {
      replacements: { table, column, comment },
      transaction: context.transaction,
    },
  );
}

export const migration: MigrationDefinition = {
  name: '0003-enumize-users-state-columns',
  up: async (context: MigrationContext) => {
    const { queryInterface, sequelize, transaction } = context;
    const dialect = sequelize.getDialect();

    if (dialect === 'postgres') {
      await sequelize.query(
        `
        UPDATE users
        SET is_email_verified = CASE WHEN is_email_verified = TRUE THEN 1 ELSE 0 END
        WHERE is_email_verified IS NOT NULL
        `,
        { transaction },
      );

      await sequelize.query(
        `
        UPDATE users
        SET is_active = CASE WHEN is_active = TRUE THEN 1 ELSE 0 END
        WHERE is_active IS NOT NULL
        `,
        { transaction },
      );
    } else {
      await sequelize.query(
        `
        UPDATE users
        SET is_email_verified = CASE WHEN is_email_verified = 1 THEN 1 ELSE 0 END
        WHERE is_email_verified IS NOT NULL
        `,
        { transaction },
      );

      await sequelize.query(
        `
        UPDATE users
        SET is_active = CASE WHEN is_active = 1 THEN 1 ELSE 0 END
        WHERE is_active IS NOT NULL
        `,
        { transaction },
      );
    }

    await sequelize.query(
      `
      UPDATE users
      SET status = 1
      WHERE status IS NULL OR status NOT IN (1, 2, 3, 4)
      `,
      { transaction },
    );

    if (dialect === 'mssql') {
      await dropMssqlDefaultConstraint(context, 'users', 'is_email_verified');
      await dropMssqlDefaultConstraint(context, 'users', 'status');
      await dropMssqlDefaultConstraint(context, 'users', 'is_active');

      await queryInterface.changeColumn(
        'users',
        'is_email_verified',
        { type: DataTypes.INTEGER, allowNull: false },
        { transaction },
      );
      await queryInterface.changeColumn(
        'users',
        'status',
        { type: DataTypes.INTEGER, allowNull: false },
        { transaction },
      );
      await queryInterface.changeColumn(
        'users',
        'is_active',
        { type: DataTypes.INTEGER, allowNull: false },
        { transaction },
      );

      await sequelize.query(
        `
        ALTER TABLE [users] ADD CONSTRAINT [DF_users_is_email_verified] DEFAULT (0) FOR [is_email_verified];
        ALTER TABLE [users] ADD CONSTRAINT [DF_users_status] DEFAULT (1) FOR [status];
        ALTER TABLE [users] ADD CONSTRAINT [DF_users_is_active] DEFAULT (1) FOR [is_active];
        `,
        { transaction },
      );

      await setMssqlColumnComment(
        context,
        'users',
        'is_email_verified',
        '0-Not verified, 1-verified',
      );
      await setMssqlColumnComment(
        context,
        'users',
        'status',
        '1-Verification Pending, 2-Active, 3-Blocked, 4-Deactivated By User',
      );
      await setMssqlColumnComment(
        context,
        'users',
        'is_active',
        '0-Deleted, 1-Active',
      );
      return;
    }

    await queryInterface.changeColumn(
      'users',
      'is_email_verified',
      {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '0-Not verified, 1-verified',
      },
      { transaction },
    );
    await queryInterface.changeColumn(
      'users',
      'status',
      {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment:
          '1-Verification Pending, 2-Active, 3-Blocked, 4-Deactivated By User',
      },
      { transaction },
    );
    await queryInterface.changeColumn(
      'users',
      'is_active',
      {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '0-Deleted, 1-Active',
      },
      { transaction },
    );
  },
  down: async ({ queryInterface, sequelize, transaction }: MigrationContext) => {
    if (sequelize.getDialect() === 'mssql') {
      await sequelize.query(
        `
        IF OBJECT_ID('DF_users_is_email_verified', 'D') IS NOT NULL
          ALTER TABLE [users] DROP CONSTRAINT [DF_users_is_email_verified];
        IF OBJECT_ID('DF_users_status', 'D') IS NOT NULL
          ALTER TABLE [users] DROP CONSTRAINT [DF_users_status];
        IF OBJECT_ID('DF_users_is_active', 'D') IS NOT NULL
          ALTER TABLE [users] DROP CONSTRAINT [DF_users_is_active];
        `,
        { transaction },
      );
    }

    await queryInterface.changeColumn(
      'users',
      'is_email_verified',
      {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      { transaction },
    );

    await queryInterface.changeColumn(
      'users',
      'status',
      {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      { transaction },
    );

    await queryInterface.changeColumn(
      'users',
      'is_active',
      {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      { transaction },
    );
  },
};
