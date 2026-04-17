// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AuthService, AuthResponse } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from './decorators/current-user.decorator';
import type { ValidatedUser } from './interfaces/jwt-payload.interface';
import { User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Authentication') // Group all these endpoints under "Authentication" in Swagger
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' }) // Add a summary for this endpoint in Swagger
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 409, description: 'User already exists.' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in and receive a JWT token' })
  @ApiResponse({ status: 200, description: 'Successfully logged in.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @HttpCode(HttpStatus.OK) // POST defaults to 201 Created, but login is just 200 OK
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @ApiBearerAuth('JWT-auth') // Tells Swagger this route requires the padlock token
  @ApiOperation({ summary: 'Get current user profile (Requires JWT)' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Token missing or invalid.',
  })
  @UseGuards(AuthGuard('jwt')) // Protect this route with JWT authentication
  async getProfile(
    @CurrentUser() user: ValidatedUser,
  ): Promise<Omit<User, 'password'>> {
    const fullProfile = await this.usersService.findById(user.userId);

    if (!fullProfile) {
      throw new NotFoundException('User profile not found in the database.');
    }

    return fullProfile;
  }
}
