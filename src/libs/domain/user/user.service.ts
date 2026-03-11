import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../../repositories/user/user.repository';

export interface RegisterUserDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async register(dto: RegisterUserDto) {
    const exists = await this.userRepository.existsByEmail(dto.email);
    if (exists) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create(dto.email, hashedPassword, dto.name);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async login(dto: LoginUserDto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async getById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
