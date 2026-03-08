import { DataTypes } from 'sequelize';
import type { MigrationContext, MigrationDefinition } from './migration.interface';

export const migration: MigrationDefinition = {
  name: '0002-add-users-audit-columns',
  up: async ({ queryInterface, transaction }: MigrationContext) => {
    const columns = await queryInterface.describeTable('users');

    if (!columns.created_at) {
      await queryInterface.addColumn(
        'users',
        'created_at',
        {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        { transaction },
      );
    }

    if (!columns.updated_at) {
      await queryInterface.addColumn(
        'users',
        'updated_at',
        {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        { transaction },
      );
    }

    if (!columns.deleted_at) {
      await queryInterface.addColumn(
        'users',
        'deleted_at',
        {
          type: DataTypes.DATE,
          allowNull: true,
        },
        { transaction },
      );
    }
  },
  down: async ({ queryInterface, transaction }: MigrationContext) => {
    const columns = await queryInterface.describeTable('users');

    if (columns.deleted_at) {
      await queryInterface.removeColumn('users', 'deleted_at', { transaction });
    }

    if (columns.updated_at) {
      await queryInterface.removeColumn('users', 'updated_at', { transaction });
    }

    if (columns.created_at) {
      await queryInterface.removeColumn('users', 'created_at', { transaction });
    }
  },
};
