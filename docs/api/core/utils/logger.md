# Logger Utility

The Logger utility provides structured logging capabilities using Winston with daily log rotation and environment-specific configuration.

## Overview

The Mifty framework includes a pre-configured Winston logger that provides:
- Daily log rotation with automatic archiving
- Environment-specific log levels and outputs
- Structured log formatting with timestamps
- Console output in development, file output in production
- Error stack trace logging

## Configuration

```typescript
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} ${level}: ${stack || message}`;
    })
  ),
  transports: [
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

// Add console transport in non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, stack }) => {
          return `${timestamp} ${level}: ${stack || message}`;
        })
      ),
    })
  );
}
```

## Log Levels

The logger supports standard Winston log levels:

- **error** (0) - Error messages and exceptions
- **warn** (1) - Warning messages
- **info** (2) - General information
- **http** (3) - HTTP request/response logging
- **verbose** (4) - Verbose information
- **debug** (5) - Debug information
- **silly** (6) - Very detailed debug information

## Usage

### Basic Logging

```typescript
import logger from '@mifty/core/utils/logger';

// Info level logging
logger.info('User created successfully', { userId: '123', email: 'user@example.com' });

// Warning level logging
logger.warn('Deprecated API endpoint used', { endpoint: '/api/v1/old-endpoint' });

// Error level logging
logger.error('Database connection failed', { error: error.message });

// Debug level logging
logger.debug('Processing user data', { userData: sanitizedData });
```

### Error Logging with Stack Traces

```typescript
try {
  await someAsyncOperation();
} catch (error) {
  logger.error('Operation failed', error);
  // This will automatically include the stack trace
}
```

### Structured Logging

```typescript
// Log with additional context
logger.info('User login attempt', {
  userId: user.id,
  email: user.email,
  ipAddress: req.ip,
  userAgent: req.get('User-Agent'),
  timestamp: new Date().toISOString()
});

// Log with metadata
logger.warn('Rate limit exceeded', {
  userId: user.id,
  endpoint: req.path,
  attempts: rateLimitInfo.attempts,
  resetTime: rateLimitInfo.resetTime
});
```

## Integration Examples

### Service Layer Logging

```typescript
import logger from '@mifty/core/utils/logger';

export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  async create(data: CreateUserDto): Promise<User> {
    logger.info('Creating new user', { email: data.email });
    
    try {
      const user = await super.create(data);
      logger.info('User created successfully', { 
        userId: user.id, 
        email: user.email 
      });
      return user;
    } catch (error) {
      logger.error('Failed to create user', { 
        email: data.email, 
        error: error.message 
      });
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    logger.info('Deleting user', { userId: id });
    
    try {
      const result = await super.delete(id);
      logger.info('User deleted successfully', { userId: id });
      return result;
    } catch (error) {
      logger.error('Failed to delete user', { 
        userId: id, 
        error: error.message 
      });
      throw error;
    }
  }
}
```

### Controller Logging

```typescript
import logger from '@mifty/core/utils/logger';

export class UserController extends BaseController<User, CreateUserDto, UpdateUserDto> {
  create = asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    logger.info('User creation request received', {
      email: req.body.email,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    try {
      const user = await this.service.create(req.body);
      const duration = Date.now() - startTime;
      
      logger.info('User creation completed', {
        userId: user.id,
        email: user.email,
        duration: `${duration}ms`
      });

      return SuccessResponse.create(user).send(res);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('User creation failed', {
        email: req.body.email,
        error: error.message,
        duration: `${duration}ms`
      });
      
      throw error;
    }
  });
}
```

### Middleware Integration

```typescript
import logger from '@mifty/core/utils/logger';

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  logger.http('Request received', {
    method: req.method,
    url: req.url,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.http('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};

// Error logging middleware
export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Request error', {
    method: req.method,
    url: req.url,
    error: error.message,
    stack: error.stack,
    ipAddress: req.ip
  });

  next(error);
};
```

### Database Operation Logging

```typescript
import logger from '@mifty/core/utils/logger';

export class UserRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  async create(data: CreateUserDto): Promise<User> {
    logger.debug('Database create operation', {
      model: 'User',
      operation: 'create',
      data: { email: data.email } // Log safe data only
    });

    try {
      const result = await super.create(data);
      
      logger.debug('Database create completed', {
        model: 'User',
        operation: 'create',
        resultId: result.id
      });
      
      return result;
    } catch (error) {
      logger.error('Database create failed', {
        model: 'User',
        operation: 'create',
        error: error.message
      });
      throw error;
    }
  }

  async findWithPagination(options: SearchOptions): Promise<PaginatedResult<User>> {
    logger.debug('Database pagination query', {
      model: 'User',
      operation: 'findWithPagination',
      page: options.page,
      pageSize: options.pageSize
    });

    const startTime = Date.now();
    const result = await super.findWithPagination(options);
    const duration = Date.now() - startTime;

    logger.debug('Database pagination completed', {
      model: 'User',
      operation: 'findWithPagination',
      resultCount: result.data.length,
      totalCount: result.total,
      duration: `${duration}ms`
    });

    return result;
  }
}
```

## Performance Monitoring

```typescript
import logger from '@mifty/core/utils/logger';

// Performance monitoring decorator
export function logPerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const startTime = Date.now();
    const className = target.constructor.name;
    
    logger.debug('Method execution started', {
      class: className,
      method: propertyName
    });

    try {
      const result = await method.apply(this, args);
      const duration = Date.now() - startTime;
      
      logger.debug('Method execution completed', {
        class: className,
        method: propertyName,
        duration: `${duration}ms`
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('Method execution failed', {
        class: className,
        method: propertyName,
        duration: `${duration}ms`,
        error: error.message
      });
      
      throw error;
    }
  };
}

// Usage
export class UserService {
  @logPerformance
  async findWithPagination(options: SearchOptions): Promise<PaginatedResult<User>> {
    return this.repository.findWithPagination(options);
  }
}
```

## Log File Management

### File Structure

```
logs/
├── application-2024-01-01.log
├── application-2024-01-02.log
├── application-2024-01-03.log.gz  # Compressed older files
└── application-2024-01-04.log.gz
```

### Configuration Options

```typescript
new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',  // Log file pattern
  datePattern: 'YYYY-MM-DD',               // Date format for rotation
  zippedArchive: true,                     // Compress old files
  maxSize: '20m',                          // Max file size before rotation
  maxFiles: '14d',                         // Keep logs for 14 days
})
```

## Environment-Specific Configuration

### Development Environment

```typescript
if (process.env.NODE_ENV === 'development') {
  logger.level = 'debug';
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}
```

### Production Environment

```typescript
if (process.env.NODE_ENV === 'production') {
  logger.level = 'info';
  // Only file logging, no console output
  // Logs are automatically rotated and compressed
}
```

### Testing Environment

```typescript
if (process.env.NODE_ENV === 'test') {
  logger.level = 'error';
  // Minimal logging during tests
}
```

## Security Considerations

### Sanitizing Sensitive Data

```typescript
// Good: Log safe data only
logger.info('User login', {
  userId: user.id,
  email: user.email,
  // Don't log password or tokens
});

// Avoid: Logging sensitive information
logger.info('User data', user); // May contain password hash
```

### Data Sanitization Helper

```typescript
function sanitizeForLogging(data: any): any {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

// Usage
logger.info('Request data', sanitizeForLogging(req.body));
```

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// Good: Use appropriate levels
logger.error('Database connection failed');  // Errors
logger.warn('Deprecated API used');          // Warnings
logger.info('User created');                 // Important events
logger.debug('Processing step 1');           // Debug information

// Avoid: Wrong log levels
logger.error('User created');  // Not an error
logger.info('Debug variable value');  // Should be debug level
```

### 2. Include Relevant Context

```typescript
// Good: Include context
logger.info('Order processed', {
  orderId: order.id,
  userId: order.userId,
  amount: order.total,
  paymentMethod: order.paymentMethod
});

// Avoid: Minimal context
logger.info('Order processed');
```

### 3. Structure Log Messages

```typescript
// Good: Consistent structure
logger.info('User action completed', {
  action: 'profile_update',
  userId: user.id,
  changes: ['email', 'name'],
  duration: '150ms'
});

// Avoid: Unstructured messages
logger.info(`User ${user.id} updated email and name in 150ms`);
```

### 4. Performance Considerations

```typescript
// Good: Conditional debug logging
if (logger.isDebugEnabled()) {
  logger.debug('Complex calculation result', expensiveCalculation());
}

// Avoid: Always calculating expensive data
logger.debug('Complex calculation result', expensiveCalculation());
```

## Related

- [API Response](./api-response.md) - Response formatting