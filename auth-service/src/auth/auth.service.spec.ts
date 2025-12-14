/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthService } from '../jwt/jwt-auth.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

jest.mock('bcrypt');

jest.mock('../prisma/prisma.service');
jest.mock('../jwt/jwt-auth.service');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtAuthService: JwtAuthService;

  const mockUser = {
    id: 'user-id-123',
    email: 'test@example.com',
    password: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserWithoutPassword = {
    id: 'user-id-123',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    } as any;

    const mockJwt = {
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: JwtAuthService,
          useValue: mockJwt,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtAuthService = module.get<JwtAuthService>(JwtAuthService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should register a new user successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (jwtAuthService.generateToken as jest.Mock).mockReturnValue(
        'access-token',
      );

      const result = await service.register(registerDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          password: 'hashed-password',
        },
      });
      expect(jwtAuthService.generateToken).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
      );
      expect(result).toEqual({
        accessToken: 'access-token',
        user: mockUserWithoutPassword,
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtAuthService.generateToken as jest.Mock).mockReturnValue(
        'access-token',
      );

      const result = await service.login(loginDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(jwtAuthService.generateToken).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
      );
      expect(result).toEqual({
        accessToken: 'access-token',
        user: mockUserWithoutPassword,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateToken', () => {
    const token = 'valid-jwt-token';

    it('should validate token and return user', async () => {
      const mockPayload = { sub: mockUser.id, email: mockUser.email };
      (jwtAuthService.verifyToken as jest.Mock).mockReturnValue(mockPayload);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.validateToken(token);

      expect(jwtAuthService.verifyToken).toHaveBeenCalledWith(token);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockPayload.sub },
      });
      expect(result).toEqual(mockUserWithoutPassword);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      (jwtAuthService.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.validateToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const mockPayload = { sub: mockUser.id, email: mockUser.email };
      (jwtAuthService.verifyToken as jest.Mock).mockReturnValue(mockPayload);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.validateToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
