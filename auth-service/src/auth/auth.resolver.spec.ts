/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    validateToken: jest.fn(),
  } as unknown as jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should register a new user', async () => {
      const expectedResult = {
        accessToken: 'jwt-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await resolver.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user', async () => {
      const expectedResult = {
        accessToken: 'jwt-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await resolver.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('validateToken', () => {
    it('should validate token and return user', async () => {
      const token = 'jwt-token';
      const expectedUser = {
        id: 'user-id',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockAuthService.validateToken.mockResolvedValue(expectedUser);

      const result = await resolver.validateToken(token);

      expect(authService.validateToken).toHaveBeenCalledWith(token);
      expect(result).toEqual(expectedUser);
    });
  });
});
