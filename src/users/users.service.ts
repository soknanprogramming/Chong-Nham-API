import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Used by the Auth strategy to find a user during login
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Used to retrieve a user profile, omitting the password for security
  async findById(id: string): Promise<Omit<User, 'password'> | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Expects the password to ALREADY be hashed by the AuthService
  async createUser(
    email: string,
    passwordHash: string,
  ): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          password: passwordHash,
        },
      });

      // Strip the password before returning the created user
      const { password, ...result } = user;
      return result;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A user with this email already exists.');
        }
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the user.',
      );
    }
  }
}
