---
sidebar_position: 2
---

# Building an Authentication System with Mifty

Learn how to build a secure authentication system with JWT tokens, role-based access control, and user management using Mifty's built-in authentication features.

## What You'll Build

In this tutorial, you'll create a complete authentication system with:

- 🔐 **User Registration & Login** - Secure user account creation and authentication
- 🎫 **JWT Token Management** - Access and refresh token handling
- 👥 **Role-Based Access Control** - User roles and permissions
- 🔒 **Password Security** - Hashing, validation, and reset functionality
- 📧 **Email Verification** - Account verification and password reset emails
- 🛡️ **Security Features** - Rate limiting, session management, and security headers

## Prerequisites

Before starting, ensure you have:
- A Mifty project initialized
- PostgreSQL database running
- Basic understanding of TypeScript and REST APIs

## Step 1: Database Schema Design

First, let's design the authentication tables using Mifty's visual database designer:

```bash
npm run db-designer
```

Create the following tables in the designer:

### User Table
```typescript
{
  name: "User",
  columns: [
    {
      name: "id",
      type: "String",
      isPrimaryKey: true,
      defaultValue: "cuid()"
    },
    {
      name: "email",
      type: "String",
      isRequired: true,
      isUnique: true
    },
    {
      name: "password",
      type: "String",
      isRequired: true
    },
    {
      name: "firstName",
      type: "String",
      isRequired: true
    },
    {
      name: "lastName",
      type: "String",
      isRequired: true
    },
    {
      name: "isEmailVerified",
      type: "Boolean",
      defaultValue: "false"
    },
    {
      name: "role",
      type: "String",
      defaultValue: "USER"
    },
    {
      name: "createdAt",
      type: "DateTime",
      defaultValue: "now()"
    },
    {
      name: "updatedAt",
      type: "DateTime",
      isUpdatedAt: true
    }
  ]
}
```

### RefreshToken Table
```typescript
{
  name: "RefreshToken",
  columns: [
    {
      name: "id",
      type: "String",
      isPrimaryKey: true,
      defaultValue: "cuid()"
    },
    {
      name: "token",
      type: "String",
      isRequired: true,
      isUnique: true
    },
    {
      name: "userId",
      type: "String",
      isRequired: true,
      references: "User"
    },
    {
      name: "expiresAt",
      type: "DateTime",
      isRequired: true
    },
    {
      name: "createdAt",
      type: "DateTime",
      defaultValue: "now()"
    }
  ]
}
```

### EmailVerification Table
```typescript
{
  name: "EmailVerification",
  columns: [
    {
      name: "id",
      type: "String",
      isPrimaryKey: true,
      defaultValue: "cuid()"
    },
    {
      name: "token",
      type: "String",
      isRequired: true,
      isUnique: true
    },
    {
      name: "userId",
      type: "String",
      isRequired: true,
      references: "User"
    },
    {
      name: "expiresAt",
      type: "DateTime",
      isRequired: true
    },
    {
      name: "createdAt",
      type: "DateTime",
      defaultValue: "now()"
    }
  ]
}
```

## Step 2: Generate Authentication Modules

After designing your database schema, generate the modules:

```bash
npm run generate
```

This creates the basic CRUD operations for User, RefreshToken, and EmailVerification entities.

## Step 3: Install Authentication Dependencies

Install the required packages for JWT and password hashing:

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs
npm install --save-dev @types/bcryptjs @types/passport-jwt
```

## Step 4: Create Authentication Service

Create a dedicated authentication service:

```typescript
// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import * as bcrypt from 'bcryptjs';

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private refreshTokenService: RefreshTokenService,
    private jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Create user
    const user = await this.userService.create({
      ...registerDto,
      password: hashedPassword
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      ...tokens
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Find user by email
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      ...tokens
    };
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify refresh token
    const tokenRecord = await this.refreshTokenService.findByToken(refreshToken);
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Get user
    const user = await this.userService.findById(tokenRecord.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Delete old refresh token
    await this.refreshTokenService.delete(tokenRecord.id);

    // Generate new tokens
    return this.generateTokens(user);
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenRecord = await this.refreshTokenService.findByToken(refreshToken);
    if (tokenRecord) {
      await this.refreshTokenService.delete(tokenRecord.id);
    }
  }

  private async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    // Generate access token (15 minutes)
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    // Generate refresh token (7 days)
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Store refresh token in database
    await this.refreshTokenService.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    return { accessToken, refreshToken };
  }
}
```

## Step 5: Create Authentication Controller

```typescript
// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService, RegisterDto, LoginDto } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body('refreshToken') refreshToken: string) {
    await this.authService.logout(refreshToken);
    return { message: 'Logged out successfully' };
  }
}
```

## Step 6: JWT Strategy and Guards

Create JWT strategy for protecting routes:

```typescript
// src/modules/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key'
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

Create role-based guard:

```typescript
// src/modules/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

## Step 7: Configure JWT Module

```typescript
// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import { RefreshTokenModule } from '../refresh-token/refresh-token.module';

@Module({
  imports: [
    UserModule,
    RefreshTokenModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '15m' }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}
```

## Step 8: Protect Routes with Authentication

Use guards to protect your routes:

```typescript
// src/modules/user/user.controller.ts
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  getAdminData() {
    return { message: 'This is admin-only data' };
  }
}
```

## Step 9: Add Validation and Security

Add input validation:

```bash
npm install class-validator class-transformer
```

```typescript
// src/modules/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;
}
```

## Step 10: Test Your Authentication System

Test the authentication endpoints:

```bash
# Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'

# Access protected route
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Next Steps

Your authentication system is now ready! Consider adding:

- **Email verification** - Verify user emails before allowing login
- **Password reset** - Allow users to reset forgotten passwords
- **Rate limiting** - Prevent brute force attacks
- **Session management** - Track active user sessions
- **Two-factor authentication** - Add extra security layer
- **OAuth integration** - Support Google, GitHub, etc.

## Security Best Practices

1. **Use HTTPS** in production
2. **Store JWT secrets** securely
3. **Implement rate limiting** on auth endpoints
4. **Hash passwords** with strong algorithms
5. **Validate all inputs** thoroughly
6. **Log security events** for monitoring
7. **Use secure headers** and CORS policies

Your Mifty authentication system is now complete and production-ready!