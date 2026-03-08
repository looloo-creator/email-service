import { Test, TestingModule } from '@nestjs/testing';
import { MysqlService } from './mysql.service';
import { Sequelize } from 'sequelize-typescript';

describe('MysqlService', () => {
  let service: MysqlService;
  const queryMock = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MysqlService,
        {
          provide: Sequelize,
          useValue: { query: queryMock },
        },
      ],
    }).compile();

    service = module.get<MysqlService>(MysqlService);
    queryMock.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should run select query with replacements', async () => {
    queryMock.mockResolvedValue([{ id: 1 }]);

    const rows = await service.query('select * from users where id=:id', {
      id: 1,
    });

    expect(rows).toEqual([{ id: 1 }]);
    expect(queryMock).toHaveBeenCalled();
  });
});
