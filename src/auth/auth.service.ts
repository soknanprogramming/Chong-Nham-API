// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { User } from '@prisma/client';

export interface AuthResponse {
  accessToken: string;
  user: Omit<User, 'password'>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Creates the user and strips the password before returning
    const user = await this.usersService.createUser(
      registerDto.email,
      hashedPassword,
    );

    return this.generateToken(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.prismaUserLookup(loginDto.email);

    if (!user) {
      // Best Practice: Use a generic error message for both wrong email and wrong password
      // to prevent email enumeration attacks.
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Strip password before generating token payload and response
    const { password, ...userWithoutPassword } = user;
    return this.generateToken(userWithoutPassword);
  }

  // Helper method to fetch the raw user (with password) just for login comparison
  private async prismaUserLookup(email: string): Promise<User | null> {
    // In a real scenario, this specific lookup might live in UsersService,
    // but it must return the password field strictly for bcrypt comparison.
    return this.usersService.findByEmail(email);
  }

  private generateToken(user: Omit<User, 'password'>): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role, // Strictly typed as Role.CUSTOMER or Role.ADMIN
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }
}
