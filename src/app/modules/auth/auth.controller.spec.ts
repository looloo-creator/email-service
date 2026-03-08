import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const sendVerificationMock = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: { sendVerification: sendVerificationMock },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    sendVerificationMock.mockReset();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate to auth service', async () => {
    sendVerificationMock.mockResolvedValue({ status: true });
    const payload = { email: 'john@example.com' };

    await controller.sendVerification(payload);

    expect(sendVerificationMock).toHaveBeenCalledWith(payload);
  });
});
