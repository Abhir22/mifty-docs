# Error Handling Patterns

Mifty provides a comprehensive error handling system with structured exceptions, automatic error transformation, and consistent error responses. The framework uses a hierarchical exception system that provides detailed error information while maintaining security.

## Exception Hierarchy

### Base Exception

All exceptions inherit from `BaseException`:

```typescript
export class BaseException extends Error {
  public readonly timestamp: Date;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly details?: any,
    options: {
      isOperational?: boolean;
      cause?: Error;
      context?: Record<string, unknown>;
    } = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.isOperational = options.isOperational ?? true;
    this.context = options.context;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Chain error causes
    if (options.cause) {
      this.stack = `${this.stack}\nCaused by: ${options.cause.stack}`;
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      details: this.details,
      ...(this.context && { context: this.context }),
      ...(this.isOperational === false && { isOperational: this.isOperational })
    };
  }
}
```

### HTTP Exceptions

Standard HTTP error responses:

```typescript
// 400 Bad Request
export class BadRequestException extends BaseException {
  constructor(
    message = 'Bad Request',
    details?: any,
    options: { cause?: Error; context?: Record<string, unknown> } = {}
  ) {
    super(message, 400, details, options);
  }
}

// 401 Unauthorized
export class UnauthorizedException extends BaseException {
  constructor(
    message = 'Unauthorized',
    details?: any,
    options: { cause?: Error; context?: Record<string, unknown> } = {}
  ) {
    super(message, 401, details, options);
  }
}

// 403 Forbidden
export class ForbiddenException extends BaseException {
  constructor(
    message = 'Forbidden',
    details?: any,
    options: { cause?: Error; context?: Record<string, unknown> } = {}
  ) {
    super(message, 403, details, options);
  }
}

// 404 Not Found
export class NotFoundException extends BaseException {
  constructor(
    message = 'Not Found',
    details?: any,
    options: { cause?: Error; context?: Record<string, unknown> } = {}
  ) {
    super(message, 404, details, options);
  }
}

// 409 Conflict
export class ConflictException extends BaseException {
  constructor(
    message = 'Conflict',
    details?: any,
    options: { cause?: Error; context?: Record<string, unknown> } = {}
  ) {
    super(message, 409, details, options);
  }
}

// 500 Internal Server Error
export class InternalServerErrorException extends BaseException {
  constructor(
    message = 'Internal Server Error',
    details?: any,
    options: { cause?: Error; context?: Record<string, unknown> } = {}
  ) {
    super(message, 500, details, { ...options, isOperational: false });
  }
}
```

### Specialized Exceptions

#### Validation Exception

For input validation errors:

```typescript
export class ValidationException extends BadRequestException {
  constructor(
    public readonly errors: Record<string, string[]>,
    options: {
      cause?: Error;
      context?: Record<string, unknown>;
    } = {}
  ) {
    super('Validation Failed', { errors }, options);
  }
}

// Usage
throw new ValidationException({
  email: ['Email is required', 'Email must be valid'],
  age: ['Age must be at least 18']
});
```

#### Database Exception

For database operation errors:

```typescript
export class DatabaseException extends InternalServerErrorException {
  constructor(
    message = 'Database Operation Failed',
    details?: any,
    options: {
      cause?: Error;
      context?: Record<string, unknown>;
      isOperational?: boolean;
    } = {}
  ) {
    super(message, details, {
      ...options,
      isOperational: options.isOperational ?? true
    });
  }
}

// Usage
throw new DatabaseException('User creation failed', {
  operation: 'create',
  table: 'users',
  constraint: 'unique_email'
});
```

#### Business Exception

For business logic violations:

```typescript
export class BusinessException extends BadRequestException {
  constructor(
    message: string,
    details?: any,
    options: {
      cause?: Error;
      context?: Record<string, unknown>;
    } = {}
  ) {
    super(message, details, options);
  }
}

// Usage
throw new BusinessException('Cannot delete user with active orders', {
  userId: user.id,
  activeOrderCount: 3
});
```

## Error Handling Middleware

### Global Error Handler

```typescript
import { Request, Response, NextFunction } from 'express';
import { BaseException, normalizeError } from '@mifty/core/exceptions';
import logger from '@mifty/core/utils/logger';

export function errorHandler() {
  return (error: unknown, req: Request, res: Response, next: NextFunction) => {
    // Normalize error to BaseException
    const normalizedError = normalizeError(error, {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    });

    // Log error
    logError(normalizedError, req);

    // Send response
    sendErrorResponse(normalizedError, res);
  };
}

function logError(error: BaseException, req: Request) {
  const logData = {
    error: error.name,
    message: error.message,
    statusCode: error.statusCode,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ipAddress: req.ip,
    timestamp: error.timestamp,
    ...(error.context && { context: error.context })
  };

  if (error.statusCode >= 500) {
    logger.error('Server error', logData);
  } else if (error.statusCode >= 400) {
    logger.warn('Client error', logData);
  }
}

function sendErrorResponse(error: BaseException, res: Response) {
  const response = {
    success: false,
    message: error.message,
    statusCode: error.statusCode,
    timestamp: error.timestamp.toISOString(),
    ...(error.details && { details: error.details })
  };

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production' && error.statusCode >= 500) {
    response.message = 'Internal Server Error';
    delete response.details;
  }

  res.status(error.statusCode).json(response);
}
```

### Async Error Handler

Wrapper for async route handlers:

```typescript
export function asyncHandler<T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<any>
) {
  return (req: T, res: U, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage
export class UserController {
  getUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.userService.findById(id);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return SuccessResponse.get(user).send(res);
  });
}
```

### Unhandled Exception Catcher

```typescript
export function catchUnhandledExceptions() {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', {
      error: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Graceful shutdown
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
    logger.error('Unhandled Rejection', {
      reason: String(reason),
      promise: promise.toString()
    });
    
    // Convert to exception and exit
    throw new Error(`Unhandled Rejection: ${reason}`);
  });
}
```

## Service Layer Error Handling

### Business Logic Validation

```typescript
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  async create(data: CreateUserDto): Promise<User> {
    try {
      // Validate business rules
      await this.validateUserCreation(data);
      
      // Create user
      const user = await super.create(data);
      
      // Post-creation logic
      await this.handleUserCreated(user);
      
      return user;
    } catch (error) {
      // Handle specific error types
      if (error instanceof ValidationException) {
        throw error; // Re-throw validation errors
      }
      
      if (error instanceof ConflictException) {
        throw error; // Re-throw business conflicts
      }
      
      // Transform unexpected errors
      throw new BusinessException('User creation failed', {
        originalError: error instanceof Error ? error.message : String(error)
      }, {
        cause: error instanceof Error ? error : undefined,
        context: { userData: this.sanitizeUserData(data) }
      });
    }
  }

  private async validateUserCreation(data: CreateUserDto): Promise<void> {
    const errors: Record<string, string[]> = {};

    // Email validation
    if (!data.email) {
      errors.email = ['Email is required'];
    } else if (!this.isValidEmail(data.email)) {
      errors.email = ['Email format is invalid'];
    } else if (await this.emailExists(data.email)) {
      errors.email = ['Email already exists'];
    }

    // Age validation
    if (data.dateOfBirth && !this.isValidAge(data.dateOfBirth)) {
      errors.dateOfBirth = ['User must be at least 18 years old'];
    }

    // Business rule validation
    if (data.role === 'admin' && !this.canCreateAdmin()) {
      errors.role = ['Insufficient permissions to create admin user'];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationException(errors, {
        context: { operation: 'user_creation' }
      });
    }
  }

  private async emailExists(email: string): Promise<boolean> {
    try {
      return await this.repository.exists({ email });
    } catch (error) {
      throw new DatabaseException('Failed to check email existence', {
        email: email
      }, {
        cause: error instanceof Error ? error : undefined
      });
    }
  }
}
```

### Repository Error Handling

The `@Repository()` decorator automatically handles database errors:

```typescript
import { Repository } from '@mifty/core/decorators';

@Repository()
export class UserRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'user');
  }

  // All methods automatically get error handling
  async findByEmail(email: string): Promise<User | null> {
    // Prisma errors are automatically caught and transformed
    return this.model.findUnique({
      where: { email },
      include: { profile: true }
    });
  }

  // Manual error handling when needed
  async complexOperation(): Promise<void> {
    try {
      await this.model.deleteMany({
        where: { active: false }
      });
    } catch (error) {
      throw new DatabaseException('Failed to delete inactive users', {
        operation: 'bulk_delete',
        table: 'users'
      }, {
        cause: error instanceof Error ? error : undefined
      });
    }
  }
}
```

## Controller Error Handling

### Validation with Error Handling

```typescript
export class UserController extends BaseController<User, CreateUserDto, UpdateUserDto> {
  create = asyncHandler(async (req: Request, res: Response) => {
    try {
      // Validate request body
      const createDto = await this.validateCreateDto(req.body);
      
      // Create user
      const user = await this.service.create(createDto);
      
      // Transform response
      const responseData = BaseResponse.mapOne(user, this.responseClass);
      
      return SuccessResponse.create(responseData).send(res);
    } catch (error) {
      // Let error middleware handle it
      throw error;
    }
  });

  private async validateCreateDto(body: any): Promise<CreateUserDto> {
    try {
      return await ValidationUtil.validate(body, this.createSchema);
    } catch (error) {
      if (error instanceof ValidationException) {
        throw error;
      }
      
      throw new BadRequestException('Invalid request data', {
        originalError: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // Custom error handling for specific endpoints
  uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!req.file) {
      throw new BadRequestException('Avatar file is required');
    }

    try {
      const user = await this.service.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Upload file
      const avatarUrl = await this.storageService.uploadFile(req.file);
      
      // Update user
      const updatedUser = await this.service.update(id, { avatarUrl });
      
      return SuccessResponse.update(updatedUser).send(res);
    } catch (error) {
      // Handle storage errors
      if (error instanceof StorageException) {
        throw new BadRequestException('Failed to upload avatar', {
          reason: error.message
        });
      }
      
      throw error;
    }
  });
}
```

## Error Context and Debugging

### Request Context Tracking

```typescript
import { AsyncLocalStorage } from 'async_hooks';

interface RequestContext {
  requestId: string;
  userId?: string;
  method: string;
  url: string;
  userAgent?: string;
  ipAddress?: string;
  startTime: Date;
}

const requestContext = new AsyncLocalStorage<RequestContext>();

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction) {
  const context: RequestContext = {
    requestId: generateRequestId(),
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ipAddress: req.ip,
    startTime: new Date()
  };

  requestContext.run(context, () => {
    next();
  });
}

export function getRequestContext(): RequestContext | undefined {
  return requestContext.getStore();
}

// Usage in error handling
export function createContextualError(error: Error, additionalContext?: Record<string, unknown>): BaseException {
  const context = getRequestContext();
  
  return normalizeError(error, {
    ...context,
    ...additionalContext
  });
}
```

### Error Reporting and Monitoring

```typescript
interface ErrorReporter {
  reportError(error: BaseException, context?: Record<string, unknown>): Promise<void>;
}

export class SentryErrorReporter implements ErrorReporter {
  async reportError(error: BaseException, context?: Record<string, unknown>): Promise<void> {
    if (!error.isOperational) {
      // Only report unexpected errors to Sentry
      Sentry.captureException(error, {
        tags: {
          statusCode: error.statusCode,
          errorType: error.name
        },
        extra: {
          ...error.context,
          ...context
        }
      });
    }
  }
}

export class LoggerErrorReporter implements ErrorReporter {
  async reportError(error: BaseException, context?: Record<string, unknown>): Promise<void> {
    const logData = {
      error: error.name,
      message: error.message,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      ...error.context,
      ...context
    };

    if (error.statusCode >= 500) {
      logger.error('Application error', logData);
    } else {
      logger.warn('Client error', logData);
    }
  }
}

// Enhanced error handler with reporting
export function errorHandler(reporters: ErrorReporter[] = []) {
  return async (error: unknown, req: Request, res: Response, next: NextFunction) => {
    const normalizedError = normalizeError(error, {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    });

    // Report error to all reporters
    await Promise.all(
      reporters.map(reporter => 
        reporter.reportError(normalizedError, getRequestContext())
      )
    );

    sendErrorResponse(normalizedError, res);
  };
}
```

## Testing Error Handling

### Unit Testing Exceptions

```typescript
describe('UserService Error Handling', () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = {
      exists: jest.fn(),
      create: jest.fn()
    } as any;
    
    userService = new UserService(mockRepository);
  });

  describe('create', () => {
    it('should throw ValidationException for invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email'
      };

      await expect(userService.create(userData))
        .rejects
        .toThrow(ValidationException);
    });

    it('should throw ConflictException for duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockRepository.exists.mockResolvedValue(true);

      await expect(userService.create(userData))
        .rejects
        .toThrow(ConflictException);
    });

    it('should throw DatabaseException on repository error', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockRepository.exists.mockResolvedValue(false);
      mockRepository.create.mockRejectedValue(new Error('Database connection failed'));

      await expect(userService.create(userData))
        .rejects
        .toThrow(BusinessException);
    });
  });
});
```

### Integration Testing Error Scenarios

```typescript
describe('User API Error Handling', () => {
  let app: Application;

  beforeAll(async () => {
    app = await createTestApp();
  });

  describe('POST /users', () => {
    it('should return 400 for validation errors', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          name: '', // Invalid: empty name
          email: 'invalid-email' // Invalid: bad email format
        });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Validation Failed',
        statusCode: 400,
        details: {
          errors: {
            name: expect.arrayContaining(['Name is required']),
            email: expect.arrayContaining(['Email format is invalid'])
          }
        }
      });
    });

    it('should return 409 for duplicate email', async () => {
      // Create user first
      await request(app)
        .post('/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com'
        });

      // Try to create duplicate
      const response = await request(app)
        .post('/users')
        .send({
          name: 'Jane Doe',
          email: 'john@example.com' // Duplicate email
        });

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Email already exists',
        statusCode: 409
      });
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/users/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'User not found',
        statusCode: 404
      });
    });
  });
});
```

## Best Practices

### 1. Use Appropriate Exception Types

```typescript
// Good: Specific exception types
if (user.age < 18) {
  throw new ValidationException({
    age: ['User must be at least 18 years old']
  });
}

if (await this.emailExists(email)) {
  throw new ConflictException('Email already exists');
}

// Avoid: Generic exceptions
throw new Error('Something went wrong');
```

### 2. Provide Meaningful Error Messages

```typescript
// Good: Descriptive messages
throw new ValidationException({
  password: [
    'Password must be at least 8 characters long',
    'Password must contain at least one uppercase letter',
    'Password must contain at least one number'
  ]
});

// Avoid: Vague messages
throw new ValidationException({
  password: ['Invalid password']
});
```

### 3. Include Relevant Context

```typescript
// Good: Include context
throw new DatabaseException('Failed to create user', {
  operation: 'create',
  table: 'users',
  email: userData.email
}, {
  cause: originalError,
  context: { userId: currentUser.id }
});

// Avoid: No context
throw new DatabaseException('Database error');
```

### 4. Handle Errors at Appropriate Levels

```typescript
// Good: Handle at service level
export class UserService {
  async create(data: CreateUserDto): Promise<User> {
    try {
      return await this.repository.create(data);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }
      }
      throw new BusinessException('User creation failed');
    }
  }
}

// Avoid: Handling at controller level
export class UserController {
  async create(req: Request, res: Response) {
    try {
      const user = await this.service.create(req.body);
      return SuccessResponse.create(user).send(res);
    } catch (error) {
      // Don't handle business logic errors here
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
    }
  }
}
```

### 5. Don't Expose Sensitive Information

```typescript
// Good: Safe error messages
if (process.env.NODE_ENV === 'production' && error.statusCode >= 500) {
  response.message = 'Internal Server Error';
  delete response.details;
}

// Avoid: Exposing internal details
throw new DatabaseException('Connection failed to postgres://user:password@localhost:5432/db');
```

## Related

- [Logger](../core/utils/logger.md) - Error logging
- [API Response](../core/utils/api-response.md) - Response formatting
- [Repository Decorator](../core/decorators/repository-decorator.md) - Automatic error handling