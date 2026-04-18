# Chong Nham API - Gemini Context

This file provides essential context for Gemini to understand the Chong Nham API project, its architecture, and development conventions.

## Project Overview

**Chong Nham API** is a robust, scalable backend for an e-commerce and management system, specifically designed for a coffee shop/restaurant environment. It is built using the **NestJS** framework and follows a modular architecture.

### Key Technologies
- **Framework:** NestJS (Node.js)
- **Language:** TypeScript
- **Database & ORM:** PostgreSQL with Prisma
- **Authentication:** JWT (JSON Web Tokens) using Passport.js
- **API Documentation:** Swagger (OpenAPI)
- **Validation:** class-validator with global ValidationPipe
- **Security:** bcrypt for password hashing, Role-Based Access Control (RBAC)

## Architecture

The project is organized into feature-based modules:
- **`AuthModule`:** Handles user registration, login, and JWT strategy.
- **`UsersModule`:** Manages user data and profiles.
- **`PrismaModule`:** Provides a global `PrismaService` for database interactions.
- **`Common` (Implicit):** Shared decorators (e.g., `@Roles`, `@CurrentUser`) and guards (e.g., `RolesGuard`).

### Data Model (Prisma)
- **`User`:** Represents customers and staff (Roles: `CUSTOMER`, `ADMIN`).
- **`Product`:** Menu items (Categories: `COFFEE`, `FOOD`, `DESSERT`).
- **`Order` & `OrderItem`:** Tracks transactions and their statuses (`PENDING`, `PREPARING`, `COMPLETED`, `CANCELLED`).

## Building and Running

### Prerequisites
- Node.js (v24 or higher recommended)
- `pnpm` (Package Manager)
- PostgreSQL instance

### Setup
```bash
# Install dependencies
pnpm install

# Setup environment variables (Create .env based on existing configuration)
# Ensure DATABASE_URL and JWT_SECRET are set.

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

### Development
```bash
# Start in watch mode
pnpm run start:dev

# API Documentation (Swagger)
# Accessible at: http://localhost:3000/api
```

### Testing
```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## Development Conventions

### Coding Standards
- **Strict Typing:** Always use TypeScript interfaces or DTOs for requests and responses.
- **Validation:** Use `class-validator` decorators in DTOs. Global validation is enabled in `src/main.ts`.
- **Security:** Never return raw passwords in API responses. Use `select` in Prisma or manual stripping.

### Authentication & Authorization
- **JWT:** Protect routes using `@UseGuards(JwtAuthGuard)`.
- **RBAC:** Use the `@Roles(Role.ADMIN)` decorator in combination with `RolesGuard` to restrict access.
- **Current User:** Use the custom `@CurrentUser()` decorator to access the authenticated user object in controllers.

### API Documentation
- Use `@ApiTags()`, `@ApiOperation()`, and `@ApiResponse()` decorators from `@nestjs/swagger` to document endpoints.
- Authentication in Swagger is configured with Bearer JWT.

## Key Files
- `prisma/schema.prisma`: The source of truth for the database schema.
- `src/main.ts`: Application entry point and global configuration.
- `src/app.module.ts`: Root module orchestrating all feature modules.
- `src/auth/guards/roles.guard.ts`: Implementation of Role-Based Access Control.
- `src/auth/strategies/jwt.strategy.ts`: JWT authentication logic.
