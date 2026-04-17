// src/auth/dto/auth.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  readonly email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  readonly password!: string;
}

export class LoginDto {
  @IsEmail()
  readonly email!: string;

  @IsString()
  readonly password!: string;
}
