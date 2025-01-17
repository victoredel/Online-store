import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';

// Mock AuthService with Jest
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call AuthService.register with correct parameters', async () => {
      const registerDto: RegisterDto = { email: 'test@email.com', password: 'test123' };
      await controller.register(registerDto);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should return the result of AuthService.register', async () => {
      const registerDto: RegisterDto = { email: 'test@email.com', password: 'test123' };
      const result = { id: '1', email: 'test@email.com' };
      mockAuthService.register.mockResolvedValue(result);

      expect(await controller.register(registerDto)).toBe(result);
    });
  });

  describe('login', () => {
    it('should call AuthService.login with correct parameters', async () => {
      const loginDto: LoginDto = { email: 'test@email.com', password: 'test123' };
      await controller.login(loginDto);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should return the result of AuthService.login', async () => {
      const loginDto: LoginDto = { email: 'test@email.com', password: 'test123' };
      const result = { accessToken: 'test_token' };
      mockAuthService.login.mockResolvedValue(result);

      expect(await controller.login(loginDto)).toBe(result);
    });
  });
});
