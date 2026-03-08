import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { MailService } from 'src/_shared/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/sequelize';
import { User } from 'src/app/entities/user.model';

describe('AuthService', () => {
  let service: AuthService;
  const sendMock = jest.fn();
  const findOneMock = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: MailService,
          useValue: { send: sendMock },
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'EMAIL_VERIFICATION_URL'
                ? 'https://app.test/verify'
                : undefined,
          },
        },
        {
          provide: getModelToken(User),
          useValue: { findOne: findOneMock },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    sendMock.mockReset();
    findOneMock.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return generic success when user does not exist', async () => {
    findOneMock.mockResolvedValue(null);

    const response = await service.sendVerification({
      email: 'missing@example.com',
    });

    expect(response.status).toBe(true);
    expect(sendMock).not.toHaveBeenCalled();
    expect(response.message).toContain('If the account exists');
  });

  it('should send verification email when user is eligible', async () => {
    findOneMock.mockResolvedValue({
      username: 'john',
      email_token: 'abc-token',
      is_email_verified: false,
    });

    await service.sendVerification({ email: 'john@example.com' });

    expect(sendMock).toHaveBeenCalledTimes(1);
    const [payload] = sendMock.mock.calls[0] as [
      {
        to: string;
        template: string;
        context: { username: string; verifyUrl: string };
      },
    ];
    expect(payload.to).toBe('john@example.com');
    expect(payload.template).toBe(
      'app/modules/auth/templates/verification.hbs',
    );
    expect(payload.context.username).toBe('john');
    expect(payload.context.verifyUrl).toBe(
      'https://app.test/verify?token=abc-token',
    );
  });
});
