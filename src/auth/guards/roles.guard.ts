// src/auth/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import type { RequestWithUser } from '../decorators/current-user.decorator'; // The strict type you created!

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Get the required roles for this specific route
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(), // Method-level roles
      context.getClass(), // Controller-level roles
    ]);

    // 2. If no roles are required, the route is open to any authenticated user
    if (!requiredRoles) {
      return true;
    }

    // 3. Extract the tightly typed user object from the request
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // 4. Defensive check: Did the JwtGuard run? Is there a user?
    if (!user) {
      throw new ForbiddenException(
        'User context is missing. Ensure JwtAuthGuard is used.',
      );
    }

    // 5. Check if the user's role matches the required roles
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to perform this action.',
      );
    }

    return true;
  }
}
