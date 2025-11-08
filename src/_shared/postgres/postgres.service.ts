import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';

@Injectable()
export class PostgresService {
  constructor(private readonly sequelize: Sequelize) {}

  async query<T extends object>(
    sql: string,
    replacements?: Record<string, unknown>,
  ): Promise<T[]> {
    const rows = await this.sequelize.query<T>(sql, {
      type: QueryTypes.SELECT,
      replacements,
    });
    return rows;
  }
}
