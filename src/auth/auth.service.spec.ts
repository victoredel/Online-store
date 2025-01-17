import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { error } from 'console';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

jest.mock('../prisma/prisma.service');
jest.mock('@nestjs/jwt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
        JwtService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  let paramsError = {} as {
    code: string;
    meta: Record<string, unknown>;
    clientVersion: string;
    batchRequestIdx?: number;
  }
  paramsError.code = 'P2002';
  let Error = new PrismaClientKnownRequestError('Unique constraint failed', paramsError);

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const registerDto: RegisterDto = { email: 'test@email.com', password: 'test123' };
      const user = { id: '1', email: 'test@email.com' } as User;
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(user);

      const result = await service.register(registerDto);
      expect(result).toBe(user);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          hash: 'hashedPassword',
        },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto: RegisterDto = { email: 'existing@email.com', password: 'test123' };
      const user = { id: '1', email: 'existing@email.com' } as User;
      Error.meta = { target: ['email'] };
      jest.spyOn(prismaService.user, 'create').mockRejectedValue(Error);

      await expect(service.register(registerDto)).rejects.toThrow(new ConflictException('Email already exists'));
    });
  });

  describe('login', () => {
    it('should return JWT token if credentials are valid', async () => {
      const loginDto: LoginDto = { email: 'test@email.com', password: 'test123' , role: 'admin'};
      const user = { id: '1', email: 'test@email.com', hash: 'hashedPassword' } as User;
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue('test_token');

      const result = await service.login(loginDto);
      expect(result).toEqual({ accessToken: 'test_token' });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: loginDto.email } });
      expect(jwtService.sign).toHaveBeenCalledWith({ email: user.email, sub: user.id });
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const loginDto: LoginDto = { email: 'invalid@email.com', password: 'invalid' , role: 'admin'};
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });
  });
});
