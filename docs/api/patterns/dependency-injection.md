# Dependency Injection Pattern

Dependency Injection (DI) in Mifty provides a clean way to manage dependencies between classes, making your code more testable, maintainable, and flexible. The framework uses a container-based approach to automatically resolve and inject dependencies.

## Pattern Overview

Dependency Injection provides:
- **Loose Coupling** - Classes don't create their own dependencies
- **Testability** - Easy to mock dependencies for testing
- **Flexibility** - Easy to swap implementations
- **Single Responsibility** - Classes focus on their core logic
- **Configuration Management** - Centralized dependency configuration

## Architecture

```
DI Container
     ↓
Service Registration
     ↓
Dependency Resolution
     ↓
Automatic Injection
```

## DI Container Setup

### Module DI Configuration

Each module defines its dependencies in a `di.ts` file:

```typescript
// src/modules/user/di.ts
import { container } from 'tsyringe';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { PrismaClient } from '@prisma/client';

export function registerDependencies() {
  // Register repository
  container.register('UserRepository', {
    useFactory: (container) => {
      const prisma = container.resolve<PrismaClient>('PrismaClient');
      return new UserRepository(prisma);
    }
  });

  // Register service
  container.register('UserService', {
    useFactory: (container) => {
      const userRepository = container.resolve<UserRepository>('UserRepository');
      const emailService = container.resolve<EmailService>('EmailService');
      return new UserService(userRepository, emailService);
    }
  });

  // Register controller
  container.register('UserController', {
    useFactory: (container) => {
      const userService = container.resolve<UserService>('UserService');
      return new UserController(userService);
    }
  });
}
```

### Global Dependencies

Core dependencies are registered globally:

```typescript
// src/config/di.ts
import { container } from 'tsyringe';
import { PrismaClient } from '@prisma/client';
import { EmailService } from '../services/email.service';
import { AuditService } from '../services/audit.service';

export function registerGlobalDependencies() {
  // Database client
  container.register('PrismaClient', {
    useValue: new PrismaClient()
  });

  // Core services
  container.register('EmailService', {
    useClass: EmailService
  });

  container.register('AuditService', {
    useClass: AuditService
  });

  // Configuration
  container.register('AppConfig', {
    useValue: {
      port: process.env.PORT || 3000,
      database: {
        url: process.env.DATABASE_URL
      },
      email: {
        provider: process.env.EMAIL_PROVIDER || 'smtp',
        apiKey: process.env.EMAIL_API_KEY
      }
    }
  });
}
```

## Injection Patterns

### Constructor Injection

The most common pattern - dependencies injected through constructor:

```typescript
import { injectable, inject } from 'tsyringe';

@injectable()
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  constructor(
    @inject('UserRepository') private userRepository: UserRepository,
    @inject('EmailService') private emailService: EmailService,
    @inject('AuditService') private auditService: AuditService
  ) {
    super(userRepository);
  }

  async create(data: CreateUserDto): Promise<User> {
    // Validate business rules
    await this.validateUserCreation(data);
    
    // Create user
    const user = await super.create(data);
    
    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.name);
    
    // Create audit log
    await this.auditService.log({
      action: 'USER_CREATED',
      entityId: user.id,
      entityType: 'User'
    });
    
    return user;
  }
}
```

### Interface-Based Injection

Using interfaces for better abstraction:

```typescript
// Define interfaces
interface IEmailService {
  sendWelcomeEmail(email: string, name: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
}

interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDto): Promise<User>;
}

// Implementation
@injectable()
export class UserService {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('IEmailService') private emailService: IEmailService
  ) {}

  async registerUser(data: CreateUserDto): Promise<User> {
    // Check if email exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Create user
    const user = await this.userRepository.create(data);
    
    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.name);
    
    return user;
  }
}

// Register implementations
container.register<IUserRepository>('IUserRepository', {
  useClass: UserRepository
});

container.register<IEmailService>('IEmailService', {
  useClass: EmailService
});
```

### Factory Pattern with DI

Creating complex objects with dependencies:

```typescript
interface IUserServiceFactory {
  createUserService(config: UserServiceConfig): UserService;
}

@injectable()
export class UserServiceFactory implements IUserServiceFactory {
  constructor(
    @inject('UserRepository') private userRepository: UserRepository,
    @inject('EmailService') private emailService: EmailService
  ) {}

  createUserService(config: UserServiceConfig): UserService {
    return new UserService(
      this.userRepository,
      this.emailService,
      config
    );
  }
}

// Usage
@injectable()
export class UserController {
  constructor(
    @inject('IUserServiceFactory') private userServiceFactory: IUserServiceFactory
  ) {}

  async createUser(req: Request, res: Response) {
    const config = this.getUserServiceConfig(req);
    const userService = this.userServiceFactory.createUserService(config);
    
    const user = await userService.create(req.body);
    return SuccessResponse.create(user).send(res);
  }
}
```

## Advanced DI Patterns

### Conditional Registration

Register different implementations based on environment:

```typescript
export function registerConditionalDependencies() {
  // Email service based on environment
  if (process.env.NODE_ENV === 'production') {
    container.register('IEmailService', {
      useClass: SendGridEmailService
    });
  } else if (process.env.NODE_ENV === 'development') {
    container.register('IEmailService', {
      useClass: ConsoleEmailService // Logs to console
    });
  } else {
    container.register('IEmailService', {
      useClass: MockEmailService // For testing
    });
  }

  // Storage service based on configuration
  const storageProvider = process.env.STORAGE_PROVIDER || 'local';
  
  switch (storageProvider) {
    case 's3':
      container.register('IStorageService', {
        useClass: S3StorageService
      });
      break;
    case 'cloudinary':
      container.register('IStorageService', {
        useClass: CloudinaryStorageService
      });
      break;
    default:
      container.register('IStorageService', {
        useClass: LocalStorageService
      });
  }
}
```

### Scoped Dependencies

Managing dependency lifecycles:

```typescript
import { Lifecycle } from 'tsyringe';

export function registerScopedDependencies() {
  // Singleton - single instance for entire application
  container.register('DatabaseConnection', {
    useClass: DatabaseConnection
  }, { lifecycle: Lifecycle.Singleton });

  // Transient - new instance every time (default)
  container.register('UserService', {
    useClass: UserService
  }, { lifecycle: Lifecycle.Transient });

  // Container scoped - single instance per container
  container.register('RequestContext', {
    useClass: RequestContext
  }, { lifecycle: Lifecycle.ContainerScoped });
}
```

### Decorator-Based Configuration

Using decorators for cleaner dependency management:

```typescript
import { autoInjectable, inject } from 'tsyringe';

@autoInjectable()
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  constructor(
    private userRepository?: UserRepository,
    private emailService?: EmailService,
    private auditService?: AuditService
  ) {
    super(userRepository!);
  }

  // Methods use injected dependencies automatically
}

// Alternative with explicit injection
@injectable()
export class OrderService {
  constructor(
    @inject('OrderRepository') private orderRepository: OrderRepository,
    @inject('PaymentService') private paymentService: PaymentService,
    @inject('InventoryService') private inventoryService: InventoryService,
    @inject('EmailService') private emailService: EmailService
  ) {}

  async processOrder(orderData: CreateOrderDto): Promise<Order> {
    // Use all injected services
    const order = await this.orderRepository.create(orderData);
    await this.paymentService.processPayment(order.id, orderData.paymentInfo);
    await this.inventoryService.reserveItems(orderData.items);
    await this.emailService.sendOrderConfirmation(order);
    
    return order;
  }
}
```

## Configuration-Based DI

### Environment-Specific Configuration

```typescript
interface AppConfig {
  database: {
    url: string;
    maxConnections: number;
  };
  email: {
    provider: 'sendgrid' | 'smtp' | 'console';
    apiKey?: string;
    smtpConfig?: {
      host: string;
      port: number;
      username: string;
      password: string;
    };
  };
  storage: {
    provider: 's3' | 'local' | 'cloudinary';
    config: any;
  };
}

export function registerConfigBasedDependencies(config: AppConfig) {
  // Register configuration
  container.register('AppConfig', { useValue: config });

  // Register database with configuration
  container.register('PrismaClient', {
    useFactory: () => new PrismaClient({
      datasources: {
        db: { url: config.database.url }
      }
    })
  });

  // Register email service based on config
  switch (config.email.provider) {
    case 'sendgrid':
      container.register('IEmailService', {
        useFactory: () => new SendGridEmailService(config.email.apiKey!)
      });
      break;
    case 'smtp':
      container.register('IEmailService', {
        useFactory: () => new SMTPEmailService(config.email.smtpConfig!)
      });
      break;
    case 'console':
      container.register('IEmailService', {
        useClass: ConsoleEmailService
      });
      break;
  }

  // Register storage service based on config
  container.register('IStorageService', {
    useFactory: () => createStorageService(config.storage)
  });
}

function createStorageService(storageConfig: AppConfig['storage']) {
  switch (storageConfig.provider) {
    case 's3':
      return new S3StorageService(storageConfig.config);
    case 'cloudinary':
      return new CloudinaryStorageService(storageConfig.config);
    case 'local':
      return new LocalStorageService(storageConfig.config);
    default:
      throw new Error(`Unknown storage provider: ${storageConfig.provider}`);
  }
}
```

## Testing with DI

### Unit Testing with Mocked Dependencies

```typescript
import { container } from 'tsyringe';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { EmailService } from './email.service';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockEmailService: jest.Mocked<EmailService>;

  beforeEach(() => {
    // Create mocks
    mockUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      exists: jest.fn()
    } as any;

    mockEmailService = {
      sendWelcomeEmail: jest.fn()
    } as any;

    // Create child container for testing
    const testContainer = container.createChildContainer();
    
    // Register mocks
    testContainer.register('UserRepository', { useValue: mockUserRepository });
    testContainer.register('EmailService', { useValue: mockEmailService });
    
    // Resolve service with mocked dependencies
    userService = testContainer.resolve(UserService);
  });

  it('should create user and send welcome email', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com'
    };

    const createdUser = { id: '1', ...userData };

    mockUserRepository.exists.mockResolvedValue(false);
    mockUserRepository.create.mockResolvedValue(createdUser);
    mockEmailService.sendWelcomeEmail.mockResolvedValue(undefined);

    const result = await userService.create(userData);

    expect(result).toEqual(createdUser);
    expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
      userData.email,
      userData.name
    );
  });
});
```

### Integration Testing with Real Dependencies

```typescript
import { setupTestContainer } from '../test/setup';

describe('UserService Integration', () => {
  let testContainer: DependencyContainer;
  let userService: UserService;

  beforeAll(async () => {
    testContainer = await setupTestContainer();
    userService = testContainer.resolve(UserService);
  });

  afterAll(async () => {
    await testContainer.dispose();
  });

  it('should create user with real dependencies', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com'
    };

    const user = await userService.create(userData);

    expect(user.id).toBeDefined();
    expect(user.email).toBe(userData.email);
    
    // Verify user exists in database
    const foundUser = await userService.findById(user.id);
    expect(foundUser).toBeTruthy();
  });
});
```

### Test Container Setup

```typescript
// test/setup.ts
import { container, DependencyContainer } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

export async function setupTestContainer(): Promise<DependencyContainer> {
  const testContainer = container.createChildContainer();
  
  // Setup test database
  const testPrisma = new PrismaClient({
    datasources: {
      db: { url: process.env.TEST_DATABASE_URL }
    }
  });
  
  testContainer.register('PrismaClient', { useValue: testPrisma });
  
  // Register test-specific services
  testContainer.register('EmailService', {
    useClass: MockEmailService
  });
  
  // Register all other dependencies
  await registerTestDependencies(testContainer);
  
  return testContainer;
}

async function registerTestDependencies(container: DependencyContainer) {
  // Register repositories
  container.register('UserRepository', {
    useFactory: (c) => new UserRepository(c.resolve('PrismaClient'))
  });
  
  // Register services
  container.register('UserService', {
    useFactory: (c) => new UserService(
      c.resolve('UserRepository'),
      c.resolve('EmailService')
    )
  });
}
```

## Best Practices

### 1. Use Interfaces for Abstraction

```typescript
// Good: Interface-based injection
interface IEmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

@injectable()
export class UserService {
  constructor(
    @inject('IEmailService') private emailService: IEmailService
  ) {}
}

// Avoid: Concrete class injection
@injectable()
export class UserService {
  constructor(
    @inject('SendGridEmailService') private emailService: SendGridEmailService
  ) {}
}
```

### 2. Register Dependencies at Module Level

```typescript
// Good: Module-specific registration
// src/modules/user/di.ts
export function registerUserDependencies() {
  container.register('UserRepository', { useClass: UserRepository });
  container.register('UserService', { useClass: UserService });
  container.register('UserController', { useClass: UserController });
}

// Avoid: Global registration of module-specific dependencies
```

### 3. Use Factory Pattern for Complex Dependencies

```typescript
// Good: Factory for complex setup
container.register('DatabaseConnection', {
  useFactory: () => {
    const config = container.resolve<AppConfig>('AppConfig');
    return new PrismaClient({
      datasources: { db: { url: config.database.url } },
      log: config.database.enableLogging ? ['query'] : []
    });
  }
});

// Avoid: Complex setup in constructor
```

### 4. Manage Dependency Lifecycles

```typescript
// Good: Appropriate lifecycles
container.register('DatabaseConnection', {
  useClass: PrismaClient
}, { lifecycle: Lifecycle.Singleton }); // Single instance

container.register('UserService', {
  useClass: UserService
}, { lifecycle: Lifecycle.Transient }); // New instance each time

// Avoid: Wrong lifecycle choices
```

### 5. Use Child Containers for Testing

```typescript
// Good: Isolated test containers
describe('UserService', () => {
  let testContainer: DependencyContainer;
  
  beforeEach(() => {
    testContainer = container.createChildContainer();
    // Register test-specific dependencies
  });
  
  afterEach(() => {
    testContainer.dispose();
  });
});

// Avoid: Modifying global container in tests
```

## Related

- [Service Layer Pattern](./service-layer-pattern.md) - Business logic with DI
- [Repository Pattern](./repository-pattern.md) - Data access with DI