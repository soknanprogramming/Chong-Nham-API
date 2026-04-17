// src/auth/interfaces/jwt-payload.interface.ts

// Assuming Role is imported from your Prisma generated types
import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string; // The standard JWT claim for the user's ID
  email: string;
  role: Role; // Strictly typed to CUSTOMER or ADMIN
}

export interface ValidatedUser {
  userId: string;
  email: string;
  role: Role;
}
