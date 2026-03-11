import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from '../../repositories/user/user.repository';
import * as bcrypt from 'bcryptjs';

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;

  const mockUserRepository = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    existsByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
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
      id: 'uuid-123',
      email: registerDto.email,
      name: registerDto.name,
      password: 'hashed-password',
    };

    it('should successfully register a new user', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(userRepository.existsByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(userRepository.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(true);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow('Email already registered');
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should hash password before saving', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.create.mockResolvedValue(mockUser);

      await service.register(registerDto);

      const callArgs = mockUserRepository.create.mock.calls[0];
      expect(callArgs[1]).not.toBe(registerDto.password);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    let validUser: { id: string; email: string; name: string; password: string };

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      validUser = {
        id: 'uuid-123',
        email: loginDto.email,
        name: 'Test User',
        password: hashedPassword,
      };
    });

    it('should successfully login with valid credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(validUser);

      const result = await service.login(loginDto);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(result).toEqual({
        id: validUser.id,
        email: validUser.email,
        name: validUser.name,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const invalidPasswordUser = { ...validUser, password: 'wrong-hash' };
      mockUserRepository.findByEmail.mockResolvedValue(invalidPasswordUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getById', () => {
    const mockUser = {
      id: 'uuid-123',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed-password',
    };

    it('should return user if found', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.getById(mockUser.id);

      expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.getById('non-existent-id')).rejects.toThrow(UnauthorizedException);
      await expect(service.getById('non-existent-id')).rejects.toThrow('User not found');
    });
  });
});
