# Service Layer Pattern

The Service Layer pattern in Mifty provides a clean separation between business logic and data access. Services act as an intermediary layer that orchestrates business operations, validates business rules, and coordinates between controllers and repositories.

## Pattern Overview

The Service Layer pattern provides:
- **Business Logic Encapsulation** - All business rules in one place
- **Transaction Management** - Coordinated database operations
- **Validation** - Business rule validation before data persistence
- **Error Handling** - Consistent error handling and transformation
- **Testability** - Easy to unit test business logic

## Architecture

```
Controller Layer
      ↓
Service Layer (Business Logic)
      ↓
Repository Layer (Data Access)
      ↓
Database
```

## Service Interface Contract

### IService Interface

```typescript
interface IService<T, TCreateInput, TUpdateInput> {
  findAll(options?: any): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: TCreateInput): Promise<T>;
  update(id: string, data: TUpdateInput): Promise<T | null>;
  search(searchTerm: string, fields: string[], include?: any): Promise<T[]>;
  findWithPagination(options: SearchOptions): Promise<PaginatedResult<T>>;
  findByIds(ids: string[]): Promise<T[]>;
  findFirst(where: any, include?: any): Promise<T | null>;
  findMany(options: SearchOptions): Promise<T[]>;
  delete(id: string): Promise<boolean>;
  count(options?: any): Promise<number>;
}
```

## Implementation Patterns

### Basic Service Implementation

```typescript
import { BaseService } from '@mifty/core/base';
import { UserRepository } from './user.repository';
import { User, CreateUserDto, UpdateUserDto } from './user.types';

export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  constructor(private userRepository: UserRepository) {
    super(userRepository);
  }

  // Inherit all base CRUD operations
  // Add custom business logic methods below
}
```

### Service with Business Logic

```typescript
import { ConflictException, NotFoundException } from '@mifty/core/exceptions';
import { ValidationException } from '@mifty/core/exceptions';

export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
    private auditService: AuditService
  ) {
    super(userRepository);
  }

  // Override create to add business logic
  async create(data: CreateUserDto): Promise<User> {
    // Business validation
    await this.validateUserCreation(data);
    
    // Transform data according to business rules
    const userData = this.prepareUserData(data);
    
    // Create user with audit trail
    const user = await super.create(userData);
    
    // Post-creation business logic
    await this.handleUserCreated(user);
    
    return user;
  }

  // Override update with business validation
  async update(id: string, data: UpdateUserDto): Promise<User> {
    const existingUser = await this.findById(id);
    
    // Business validation
    await this.validateUserUpdate(existingUser, data);
    
    // Apply business rules
    const updateData = this.prepareUpdateData(existingUser, data);
    
    const updatedUser = await super.update(id, updateData);
    
    // Post-update business logic
    await this.handleUserUpdated(existingUser, updatedUser);
    
    return updatedUser;
  }

  // Business logic methods
  private async validateUserCreation(data: CreateUserDto): Promise<void> {
    // Check email uniqueness
    const emailExists = await this.repository.exists({ email: data.email });
    if (emailExists) {
      throw new ConflictException('Email address already exists');
    }

    // Validate business rules
    if (data.age && data.age < 18) {
      throw new ValidationException({
        age: ['User must be at least 18 years old']
      });
    }

    // Check domain restrictions
    if (data.email.endsWith('@competitor.com')) {
      throw new ValidationException({
        email: ['Email domain not allowed']
      });
    }
  }

  private async validateUserUpdate(user: User, data: UpdateUserDto): Promise<void> {
    // Check email uniqueness if email is being changed
    if (data.email && data.email !== user.email) {
      const emailExists = await this.repository.exists({
        email: data.email,
        id: { not: user.id }
      });
      
      if (emailExists) {
        throw new ConflictException('Email address already exists');
      }
    }

    // Business rule: Cannot deactivate admin users
    if (data.active === false && user.role === 'admin') {
      throw new ValidationException({
        active: ['Cannot deactivate admin users']
      });
    }
  }

  private prepareUserData(data: CreateUserDto): CreateUserDto {
    return {
      ...data,
      email: data.email.toLowerCase().trim(),
      name: data.name.trim(),
      active: true,
      createdAt: new Date(),
      lastLoginAt: null
    };
  }

  private prepareUpdateData(existingUser: User, data: UpdateUserDto): UpdateUserDto {
    const updateData = { ...data };
    
    // Business rule: Update modified timestamp
    updateData.updatedAt = new Date();
    
    // Business rule: Normalize email
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();
    }
    
    return updateData;
  }

  private async handleUserCreated(user: User): Promise<void> {
    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.name);
    
    // Create audit log
    await this.auditService.log({
      action: 'USER_CREATED',
      entityId: user.id,
      entityType: 'User',
      details: { email: user.email, name: user.name }
    });
  }

  private async handleUserUpdated(oldUser: User, newUser: User): Promise<void> {
    // Detect significant changes
    const significantChanges = this.detectSignificantChanges(oldUser, newUser);
    
    if (significantChanges.length > 0) {
      // Send notification email
      await this.emailService.sendProfileUpdateNotification(
        newUser.email, 
        significantChanges
      );
      
      // Create audit log
      await this.auditService.log({
        action: 'USER_UPDATED',
        entityId: newUser.id,
        entityType: 'User',
        details: { changes: significantChanges }
      });
    }
  }

  // Custom business methods
  async activateUser(id: string): Promise<User> {
    const user = await this.findById(id);
    
    if (user.active) {
      throw new ConflictException('User is already active');
    }
    
    const activatedUser = await this.update(id, { 
      active: true,
      activatedAt: new Date()
    });
    
    await this.emailService.sendAccountActivatedEmail(user.email);
    
    return activatedUser;
  }

  async deactivateUser(id: string, reason?: string): Promise<User> {
    const user = await this.findById(id);
    
    // Business rule: Cannot deactivate admin users
    if (user.role === 'admin') {
      throw new ValidationException({
        role: ['Cannot deactivate admin users']
      });
    }
    
    const deactivatedUser = await this.update(id, { 
      active: false,
      deactivatedAt: new Date(),
      deactivationReason: reason
    });
    
    // Cleanup user sessions
    await this.sessionService.invalidateUserSessions(id);
    
    return deactivatedUser;
  }

  async changeUserRole(id: string, newRole: string, changedBy: string): Promise<User> {
    const user = await this.findById(id);
    
    // Business validation
    if (!this.isValidRoleTransition(user.role, newRole)) {
      throw new ValidationException({
        role: [`Cannot change role from ${user.role} to ${newRole}`]
      });
    }
    
    const updatedUser = await this.update(id, { role: newRole });
    
    // Audit role change
    await this.auditService.log({
      action: 'ROLE_CHANGED',
      entityId: id,
      entityType: 'User',
      performedBy: changedBy,
      details: { 
        oldRole: user.role, 
        newRole: newRole 
      }
    });
    
    return updatedUser;
  }

  private isValidRoleTransition(currentRole: string, newRole: string): boolean {
    const validTransitions = {
      'user': ['moderator'],
      'moderator': ['user', 'admin'],
      'admin': ['moderator'] // Admins can be demoted
    };
    
    return validTransitions[currentRole]?.includes(newRole) || false;
  }
}
```

## Advanced Service Patterns

### Transaction Management

```typescript
export class OrderService extends BaseService<Order, CreateOrderDto, UpdateOrderDto> {
  constructor(
    private orderRepository: OrderRepository,
    private inventoryService: InventoryService,
    private paymentService: PaymentService,
    private emailService: EmailService,
    private prisma: PrismaClient
  ) {
    super(orderRepository);
  }

  async createOrder(data: CreateOrderDto): Promise<Order> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Validate inventory
      await this.inventoryService.validateAvailability(data.items);
      
      // 2. Reserve inventory
      await this.inventoryService.reserveItems(data.items, tx);
      
      // 3. Create order
      const order = await this.orderRepository.create(data, tx);
      
      // 4. Process payment
      const payment = await this.paymentService.processPayment({
        orderId: order.id,
        amount: order.total,
        paymentMethod: data.paymentMethod
      }, tx);
      
      // 5. Update inventory
      if (payment.status === 'completed') {
        await this.inventoryService.commitReservation(data.items, tx);
      } else {
        await this.inventoryService.releaseReservation(data.items, tx);
        throw new PaymentException('Payment processing failed');
      }
      
      // 6. Send confirmation email
      await this.emailService.sendOrderConfirmation(order);
      
      return order;
    });
  }
}
```

### Service Composition

```typescript
export class UserManagementService {
  constructor(
    private userService: UserService,
    private profileService: ProfileService,
    private notificationService: NotificationService,
    private auditService: AuditService
  ) {}

  async createCompleteUser(userData: CreateUserDto, profileData: CreateProfileDto): Promise<{
    user: User;
    profile: Profile;
  }> {
    // Create user first
    const user = await this.userService.create(userData);
    
    try {
      // Create profile
      const profile = await this.profileService.create({
        ...profileData,
        userId: user.id
      });
      
      // Set up default notifications
      await this.notificationService.createDefaultSettings(user.id);
      
      return { user, profile };
    } catch (error) {
      // Cleanup on failure
      await this.userService.delete(user.id);
      throw error;
    }
  }

  async deleteUserCompletely(userId: string): Promise<void> {
    // Check if user can be deleted
    const user = await this.userService.findById(userId);
    
    // Business rule: Cannot delete users with active orders
    const hasActiveOrders = await this.orderService.hasActiveOrders(userId);
    if (hasActiveOrders) {
      throw new ConflictException('Cannot delete user with active orders');
    }
    
    // Delete in correct order
    await this.notificationService.deleteUserSettings(userId);
    await this.profileService.deleteByUserId(userId);
    await this.auditService.anonymizeUserLogs(userId);
    await this.userService.delete(userId);
  }
}
```

### Event-Driven Services

```typescript
import { EventEmitter } from 'events';

export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  private eventEmitter = new EventEmitter();

  async create(data: CreateUserDto): Promise<User> {
    const user = await super.create(data);
    
    // Emit event for other services to handle
    this.eventEmitter.emit('user.created', { user, timestamp: new Date() });
    
    return user;
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const oldUser = await this.findById(id);
    const updatedUser = await super.update(id, data);
    
    // Emit event with before/after data
    this.eventEmitter.emit('user.updated', { 
      oldUser, 
      newUser: updatedUser, 
      timestamp: new Date() 
    });
    
    return updatedUser;
  }

  // Event subscription methods
  onUserCreated(callback: (event: { user: User; timestamp: Date }) => void) {
    this.eventEmitter.on('user.created', callback);
  }

  onUserUpdated(callback: (event: { oldUser: User; newUser: User; timestamp: Date }) => void) {
    this.eventEmitter.on('user.updated', callback);
  }
}

// Usage in other services
export class EmailService {
  constructor(private userService: UserService) {
    // Subscribe to user events
    this.userService.onUserCreated(this.handleUserCreated.bind(this));
    this.userService.onUserUpdated(this.handleUserUpdated.bind(this));
  }

  private async handleUserCreated(event: { user: User; timestamp: Date }) {
    await this.sendWelcomeEmail(event.user.email, event.user.name);
  }

  private async handleUserUpdated(event: { oldUser: User; newUser: User; timestamp: Date }) {
    if (event.oldUser.email !== event.newUser.email) {
      await this.sendEmailChangeNotification(event.oldUser.email, event.newUser.email);
    }
  }
}
```

## Error Handling in Services

### Business Exception Handling

```typescript
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  async create(data: CreateUserDto): Promise<User> {
    try {
      // Business validation
      await this.validateBusinessRules(data);
      
      // Create user
      const user = await super.create(data);
      
      // Post-creation logic
      await this.handlePostCreation(user);
      
      return user;
    } catch (error) {
      // Handle different error types
      if (error instanceof ValidationException) {
        // Re-throw validation errors as-is
        throw error;
      }
      
      if (error instanceof ConflictException) {
        // Re-throw business conflicts as-is
        throw error;
      }
      
      if (error instanceof DatabaseException) {
        // Transform database errors to business errors
        throw new BusinessException('Failed to create user account', {
          originalError: error.message
        });
      }
      
      // Handle unexpected errors
      throw new UnexpectedError('User creation failed unexpectedly', {
        originalError: error
      });
    }
  }

  private async validateBusinessRules(data: CreateUserDto): Promise<void> {
    const errors: Record<string, string[]> = {};

    // Email validation
    if (!this.isValidEmailDomain(data.email)) {
      errors.email = ['Email domain is not allowed'];
    }

    // Age validation
    if (data.dateOfBirth && !this.isValidAge(data.dateOfBirth)) {
      errors.dateOfBirth = ['User must be at least 18 years old'];
    }

    // Username validation
    if (await this.isUsernameTaken(data.username)) {
      errors.username = ['Username is already taken'];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationException(errors);
    }
  }
}
```

## Service Testing Patterns

### Unit Testing Services

```typescript
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { EmailService } from './email.service';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockEmailService: jest.Mocked<EmailService>;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      exists: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as any;

    mockEmailService = {
      sendWelcomeEmail: jest.fn(),
      sendProfileUpdateNotification: jest.fn()
    } as any;

    userService = new UserService(mockUserRepository, mockEmailService);
  });

  describe('create', () => {
    it('should create user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      };

      const createdUser = { id: '1', ...userData, active: true };

      mockUserRepository.exists.mockResolvedValue(false);
      mockUserRepository.create.mockResolvedValue(createdUser);
      mockEmailService.sendWelcomeEmail.mockResolvedValue(undefined);

      const result = await userService.create(userData);

      expect(result).toEqual(createdUser);
      expect(mockUserRepository.exists).toHaveBeenCalledWith({ email: userData.email });
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(userData.email, userData.name);
    });

    it('should throw ConflictException for duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      };

      mockUserRepository.exists.mockResolvedValue(true);

      await expect(userService.create(userData)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationException for underage user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 16
      };

      mockUserRepository.exists.mockResolvedValue(false);

      await expect(userService.create(userData)).rejects.toThrow(ValidationException);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });
});
```

### Integration Testing

```typescript
describe('UserService Integration', () => {
  let userService: UserService;
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await setupTestDatabase();
    userService = new UserService(
      new UserRepository(testDb.prisma),
      new EmailService()
    );
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  beforeEach(async () => {
    await testDb.reset();
  });

  it('should create user and send welcome email', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25
    };

    const user = await userService.create(userData);

    expect(user.id).toBeDefined();
    expect(user.email).toBe(userData.email.toLowerCase());
    expect(user.active).toBe(true);

    // Verify user exists in database
    const dbUser = await testDb.prisma.user.findUnique({
      where: { id: user.id }
    });
    expect(dbUser).toBeTruthy();
  });
});
```

## Best Practices

### 1. Single Responsibility
Each service should have a single, well-defined responsibility:

```typescript
// Good: Focused responsibility
export class UserService {
  // Only user-related business logic
}

export class EmailService {
  // Only email-related operations
}

// Avoid: Mixed responsibilities
export class UserEmailService {
  // Mixing user management and email operations
}
```

### 2. Dependency Injection
Use dependency injection for testability and flexibility:

```typescript
// Good: Dependencies injected
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
    private auditService: AuditService
  ) {}
}

// Avoid: Hard-coded dependencies
export class UserService {
  private userRepository = new UserRepository();
  private emailService = new EmailService();
}
```

### 3. Error Handling
Handle errors appropriately at the service layer:

```typescript
// Good: Proper error handling
async create(data: CreateUserDto): Promise<User> {
  try {
    await this.validateBusinessRules(data);
    return await this.repository.create(data);
  } catch (error) {
    if (error instanceof ValidationException) {
      throw error; // Re-throw business errors
    }
    throw new BusinessException('User creation failed');
  }
}

// Avoid: Letting all errors bubble up
async create(data: CreateUserDto): Promise<User> {
  return this.repository.create(data); // No error handling
}
```

### 4. Transaction Management
Use transactions for operations that affect multiple entities:

```typescript
// Good: Transactional operations
async createUserWithProfile(userData: CreateUserDto, profileData: CreateProfileDto): Promise<User> {
  return this.prisma.$transaction(async (tx) => {
    const user = await this.userRepository.create(userData, tx);
    await this.profileRepository.create({ ...profileData, userId: user.id }, tx);
    return user;
  });
}
```

## Related

- [Repository Pattern](./repository-pattern.md) - Data access layer
- [BaseService](../core/base-service.md) - Base service implementation
- [IService Interface](../core/interfaces/service-interface.md) - Service contract
- [Dependency Injection](./dependency-injection.md) - DI patterns
- [Error Handling](./error-handling.md) - Exception management