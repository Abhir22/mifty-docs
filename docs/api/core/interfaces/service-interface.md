# IService Interface

The `IService` interface defines the contract for service layer operations in the Mifty framework. It provides a standardized set of methods for business logic operations, acting as an intermediary between controllers and repositories.

## Interface Definition

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

## Type Parameters

- `T` - The entity type (e.g., `User`, `Post`)
- `TCreateInput` - The input type for creating new records
- `TUpdateInput` - The input type for updating existing records

## Methods

### `findAll(options?: any): Promise<T[]>`

Retrieves all records with optional filtering and inclusion options.

**Parameters:**
- `options?: any` - Query options (where, include, orderBy, etc.)

**Returns:** `Promise<T[]>` - Array of entities

**Usage:**
```typescript
interface UserService extends IService<User, CreateUserDto, UpdateUserDto> {}

// Implementation
const users = await userService.findAll({
  where: { active: true },
  include: { profile: true }
});
```

### `findById(id: string): Promise<T | null>`

Retrieves a single record by its unique identifier.

**Parameters:**
- `id: string` - Record identifier

**Returns:** `Promise<T | null>` - Entity or null if not found

**Usage:**
```typescript
const user = await userService.findById('clx1234567890');
if (user) {
  console.log(user.name);
}
```

### `create(data: TCreateInput): Promise<T>`

Creates a new record with business logic validation.

**Parameters:**
- `data: TCreateInput` - Data for creating the record

**Returns:** `Promise<T>` - Created entity

**Usage:**
```typescript
const newUser = await userService.create({
  name: 'John Doe',
  email: 'john@example.com',
  profile: {
    firstName: 'John',
    lastName: 'Doe'
  }
});
```

### `update(id: string, data: TUpdateInput): Promise<T | null>`

Updates an existing record with business logic validation.

**Parameters:**
- `id: string` - Record identifier
- `data: TUpdateInput` - Update data

**Returns:** `Promise<T | null>` - Updated entity or null if not found

**Usage:**
```typescript
const updatedUser = await userService.update('clx1234567890', {
  name: 'Jane Doe',
  email: 'jane@example.com'
});
```

### `search(searchTerm: string, fields: string[], include?: any): Promise<T[]>`

Performs text search across specified fields with business logic.

**Parameters:**
- `searchTerm: string` - Text to search for
- `fields: string[]` - Fields to search in
- `include?: any` - Related data to include

**Returns:** `Promise<T[]>` - Array of matching entities

**Usage:**
```typescript
const users = await userService.search(
  'john',
  ['name', 'email', 'profile.firstName'],
  { profile: true }
);
```

### `findWithPagination(options: SearchOptions): Promise<PaginatedResult<T>>`

Retrieves paginated results with business logic filtering.

**Parameters:**
- `options: SearchOptions` - Search and pagination options

**Returns:** `Promise<PaginatedResult<T>>` - Paginated result with metadata

**Usage:**
```typescript
const result = await userService.findWithPagination({
  page: 1,
  pageSize: 10,
  where: { active: true },
  include: { profile: true },
  orderBy: { createdAt: 'desc' }
});

console.log(result.data); // Array of users
console.log(result.total); // Total count
console.log(result.totalPages); // Total pages
```

### `findByIds(ids: string[]): Promise<T[]>`

Retrieves multiple records by their IDs.

**Parameters:**
- `ids: string[]` - Array of record identifiers

**Returns:** `Promise<T[]>` - Array of entities

**Usage:**
```typescript
const users = await userService.findByIds([
  'clx1234567890',
  'clx0987654321',
  'clx1122334455'
]);
```

### `findFirst(where: any, include?: any): Promise<T | null>`

Finds the first record matching the criteria with business logic.

**Parameters:**
- `where: any` - Query criteria
- `include?: any` - Related data to include

**Returns:** `Promise<T | null>` - First matching entity or null

**Usage:**
```typescript
const user = await userService.findFirst(
  { email: 'john@example.com' },
  { profile: true }
);
```

### `findMany(options: SearchOptions): Promise<T[]>`

Retrieves multiple records with advanced query options and business logic.

**Parameters:**
- `options: SearchOptions` - Search and pagination options

**Returns:** `Promise<T[]>` - Array of entities

**Usage:**
```typescript
const users = await userService.findMany({
  where: { active: true },
  include: { profile: true },
  orderBy: { createdAt: 'desc' },
  page: 1,
  pageSize: 10
});
```

### `delete(id: string): Promise<boolean>`

Deletes a record by ID with business logic validation.

**Parameters:**
- `id: string` - Record identifier

**Returns:** `Promise<boolean>` - Success status

**Usage:**
```typescript
const deleted = await userService.delete('clx1234567890');
console.log(deleted); // true
```

### `count(options?: any): Promise<number>`

Returns the count of records matching the criteria.

**Parameters:**
- `options?: any` - Query options (where clause)

**Returns:** `Promise<number>` - Count of matching records

**Usage:**
```typescript
const activeUserCount = await userService.count({
  where: { active: true }
});
```

## Implementation Example

```typescript
import { IService } from '@mifty/core/interfaces';
import { UserRepository } from './user.repository';
import { User, CreateUserDto, UpdateUserDto } from './user.types';
import { ConflictException, NotFoundException } from '@mifty/core/exceptions';

export class UserService implements IService<User, CreateUserDto, UpdateUserDto> {
  constructor(private userRepository: UserRepository) {}

  async findAll(options?: any): Promise<User[]> {
    return this.userRepository.findAll(options);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async create(data: CreateUserDto): Promise<User> {
    // Business logic validation
    const emailExists = await this.userRepository.exists({ 
      email: data.email 
    });
    
    if (emailExists) {
      throw new ConflictException('Email already exists');
    }

    // Additional business logic
    const userData = {
      ...data,
      active: true,
      createdAt: new Date()
    };

    return this.userRepository.create(userData);
  }

  async update(id: string, data: UpdateUserDto): Promise<User | null> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      return null;
    }

    // Business logic validation
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.userRepository.exists({ 
        email: data.email,
        id: { not: id }
      });
      
      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    return this.userRepository.update(id, data);
  }

  async search(searchTerm: string, fields: string[], include?: any): Promise<User[]> {
    // Business logic: only search active users
    const results = await this.userRepository.search(searchTerm, fields, include);
    return results.filter(user => user.active);
  }

  async findWithPagination(options: SearchOptions): Promise<PaginatedResult<User>> {
    return this.userRepository.findWithPagination(options);
  }

  async findByIds(ids: string[]): Promise<User[]> {
    return this.userRepository.findByIds(ids);
  }

  async findFirst(where: any, include?: any): Promise<User | null> {
    return this.userRepository.findFirst(where, include);
  }

  async findMany(options: SearchOptions): Promise<User[]> {
    return this.userRepository.findMany(options);
  }

  async delete(id: string): Promise<boolean> {
    // Business logic: check if user can be deleted
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check for dependencies
    const hasOrders = await this.orderRepository.exists({ userId: id });
    if (hasOrders) {
      throw new ConflictException('Cannot delete user with existing orders');
    }

    return this.userRepository.delete(id);
  }

  async count(options?: any): Promise<number> {
    return this.userRepository.count(options);
  }

  // Custom business methods
  async activateUser(id: string): Promise<User | null> {
    return this.update(id, { active: true });
  }

  async deactivateUser(id: string): Promise<User | null> {
    return this.update(id, { active: false });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.findMany({
      where: { active: true },
      include: { profile: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}
```

## Business Logic Patterns

### 1. Validation Before Operations

```typescript
async create(data: CreateUserDto): Promise<User> {
  // Validate business rules
  if (data.age < 18) {
    throw new ValidationException('User must be at least 18 years old');
  }

  // Check for duplicates
  const emailExists = await this.repository.exists({ email: data.email });
  if (emailExists) {
    throw new ConflictException('Email already exists');
  }

  return this.repository.create(data);
}
```

### 2. Data Transformation

```typescript
async create(data: CreateUserDto): Promise<User> {
  // Transform data according to business rules
  const userData = {
    ...data,
    email: data.email.toLowerCase(),
    name: data.name.trim(),
    active: true,
    createdAt: new Date()
  };

  return this.repository.create(userData);
}
```

### 3. Authorization Checks

```typescript
async update(id: string, data: UpdateUserDto, currentUserId: string): Promise<User | null> {
  const user = await this.repository.findById(id);
  if (!user) {
    return null;
  }

  // Business rule: users can only update their own profile
  if (user.id !== currentUserId && !this.isAdmin(currentUserId)) {
    throw new ForbiddenException('Cannot update another user\'s profile');
  }

  return this.repository.update(id, data);
}
```

### 4. Cascading Operations

```typescript
async delete(id: string): Promise<boolean> {
  // Business logic: handle cascading deletes
  const user = await this.repository.findById(id);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Delete related data
  await this.profileService.deleteByUserId(id);
  await this.notificationService.deleteByUserId(id);

  return this.repository.delete(id);
}
```

## Error Handling

Services should handle business logic errors appropriately:

```typescript
import { 
  NotFoundException, 
  ConflictException, 
  ValidationException,
  ForbiddenException 
} from '@mifty/core/exceptions';

async create(data: CreateUserDto): Promise<User> {
  try {
    // Business validation
    if (!this.isValidEmail(data.email)) {
      throw new ValidationException('Invalid email format');
    }

    const emailExists = await this.repository.exists({ email: data.email });
    if (emailExists) {
      throw new ConflictException('Email already exists');
    }

    return await this.repository.create(data);
  } catch (error) {
    if (error instanceof ValidationException || 
        error instanceof ConflictException) {
      throw error; // Re-throw business logic errors
    }
    
    // Handle unexpected errors
    throw new Error('Failed to create user');
  }
}
```

## Best Practices

### 1. Separation of Concerns
Keep business logic in services, not repositories:

```typescript
// Good - business logic in service
async create(data: CreateUserDto): Promise<User> {
  const emailExists = await this.repository.exists({ email: data.email });
  if (emailExists) {
    throw new ConflictException('Email already exists');
  }
  return this.repository.create(data);
}

// Avoid - business logic in repository
async create(data: CreateUserDto): Promise<User> {
  return this.repository.create(data); // No validation
}
```

### 2. Consistent Error Handling
Use appropriate exception types for different scenarios:

```typescript
// Not found scenarios
if (!user) {
  throw new NotFoundException('User not found');
}

// Business rule violations
if (emailExists) {
  throw new ConflictException('Email already exists');
}

// Input validation errors
if (!isValidEmail(email)) {
  throw new ValidationException('Invalid email format');
}
```

### 3. Transaction Management
Handle complex operations with transactions:

```typescript
async createUserWithProfile(userData: CreateUserDto, profileData: CreateProfileDto): Promise<User> {
  return this.prisma.$transaction(async (tx) => {
    const user = await this.repository.create(userData);
    await this.profileService.create({ ...profileData, userId: user.id });
    return user;
  });
}
```

## Related

- [BaseService](../base-service.md) - Default implementation
- [IRepository Interface](./repository-interface.md) - Repository layer interface
- [SearchOptions](./search-options-interface.md) - Query options interface
- [PaginatedResult](./paginated-result-interface.md) - Pagination result interface