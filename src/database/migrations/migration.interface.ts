import { QueryInterface, Sequelize, Transaction } from 'sequelize';

export interface MigrationContext {
  queryInterface: QueryInterface;
  sequelize: Sequelize;
  transaction: Transaction;
}

export interface MigrationDefinition {
  name: string;
  up: (context: MigrationContext) => Promise<void>;
  down?: (context: MigrationContext) => Promise<void>;
}
