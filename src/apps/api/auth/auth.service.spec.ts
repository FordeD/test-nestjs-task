import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../../../libs/domain/user';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    register: jest.fn(),
    login: jest.fn(),
    getById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const mockUser = {
      id: 'user-uuid',
      email: registerDto.email,
      name: registerDto.name,
    };

    const mockTokens = {
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    };

    it('should register user and return tokens', async () => {
      mockUserService.register.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      const result = await service.register(registerDto);

      expect(userService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockTokens);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 'user-uuid',
      email: loginDto.email,
      name: 'Test User',
    };

    const mockTokens = {
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    };

    it('should login user and return tokens', async () => {
      mockUserService.login.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      const result = await service.login(loginDto);

      expect(userService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockTokens);
    });
  });

  describe('refreshTokens', () => {
    const mockRefreshToken = 'valid-refresh-token';
    const mockPayload = {
      sub: 'user-uuid',
      email: 'test@example.com',
    };

    const mockUser = {
      id: 'user-uuid',
      email: 'test@example.com',
      name: 'Test User',
    };

    const mockTokens = {
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
    };

    it('should return new tokens if refresh token is valid', async () => {
      mockJwtService.verify.mockReturnValue(mockPayload);
      mockUserService.getById.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce('new-access-token').mockReturnValueOnce('new-refresh-token');

      const result = await service.refreshTokens(mockRefreshToken);

      expect(jwtService.verify).toHaveBeenCalledWith(mockRefreshToken, {
        secret: expect.stringContaining('refresh'),
      });
      expect(userService.getById).toHaveBeenCalledWith(mockPayload.sub);
      expect(result).toEqual(mockTokens);
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshTokens(mockRefreshToken))
        .rejects.toThrow(UnauthorizedException);
      await expect(service.refreshTokens(mockRefreshToken))
        .rejects.toThrow('Invalid refresh token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockJwtService.verify.mockReturnValue(mockPayload);
      mockUserService.getById.mockRejectedValue(new UnauthorizedException('User not found'));

      await expect(service.refreshTokens(mockRefreshToken))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    const mockUser = {
      id: 'user-uuid',
      email: 'test@example.com',
      name: 'Test User',
    };

    it('should return user if found', async () => {
      mockUserService.getById.mockResolvedValue(mockUser);

      const result = await service.validateUser(mockUser.id);

      expect(userService.getById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserService.getById.mockRejectedValue(new UnauthorizedException('User not found'));

      await expect(service.validateUser('non-existent-id'))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});
