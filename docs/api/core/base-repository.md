# BaseRepository

The `BaseRepository` is an abstract class that implements the repository pattern for data access operations. It provides a standardized interface for database operations using Prisma ORM.

## Class Definition

```typescript
abstract class BaseRepository<T, TCreateInput, TUpdateInput> implements IRepository<T, TCreateInput, TUpdateInput> {
  protected readonly prisma: PrismaClient;
  protected readonly modelName: string;
  private readonly _model: any;

  constructor(prisma: PrismaClient, modelName: string)
  protected get model(): any

  async findAll(options?: any): Promise<T[]>
  async findById(id: string): Promise<T | null>
  async create(data: TCreateInput): Promise<T>
  async update(id: string, data: TUpdateInput): Promise<T | null>
  async delete(id: string): Promise<boolean>
  async count(options?: any): Promise<number>
  async findByIds(ids: string[]): Promise<T[]>
  async findFirst(where: any, include?: any): Promise<T | null>
  async findMany(options: SearchOptions): Promise<T[]>
  async findWithPagination(options: SearchOptions): Promise<PaginatedResult<T>>
  async search(searchTerm: string, searchFields: string[], include?: any): Promise<T[]>
  async exists(query: any): Promise<boolean>
}
```

## Constructor

### `constructor(prisma: PrismaClient, modelName: string)`

Creates a new repository instance for the specified Prisma model.

**Parameters:**
- `prisma: PrismaClient` - Prisma client instance
- `modelName: string` - Name of the Prisma model (e.g., 'user', 'post')

**Example:**
```typescript
import { BaseRepository } from '@mifty/core/base';
import { PrismaClient } from '@prisma/client';

export class UserRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'user'); // 'user' matches the Prisma model name
  }
}
```

## Properties

### `model: any` (protected getter)

Provides access to the Prisma model for the repository.

**Returns:** Prisma model instance

**Example:**
```typescript
// Inside a repository method
const users = await this.model.findMany({
  where: { active: true }
});
```

## Methods

### `findAll(options?: any): Promise<T[]>`

Retrieves all records with optional query options.

**Parameters:**
- `options?: any` - Prisma query options (where, include, orderBy, etc.)

**Returns:** `Promise<T[]>`

**Example:**
```typescript
const users = await userRepository.findAll({
  where: { active: true },
  include: { profile: true },
  orderBy: { createdAt: 'desc' }
});
```

### `findById(id: string): Promise<T | null>`

Retrieves a single record by its unique identifier.

**Parameters:**
- `id: string` - Record identifier

**Returns:** `Promise<T | null>` - Record or null if not found

**Example:**
```typescript
const user = await userRepository.findById('clx1234567890');
if (user) {
  console.log(user.name);
}
```

### `create(data: TCreateInput): Promise<T>`

Creates a new record with the provided data.

**Parameters:**
- `data: TCreateInput` - Data for creating the record

**Returns:** `Promise<T>` - Created record

**Example:**
```typescript
const newUser = await userRepository.create({
  name: 'John Doe',
  email: 'john@example.com',
  profile: {
    create: {
      firstName: 'John',
      lastName: 'Doe'
    }
  }
});
```

### `update(id: string, data: TUpdateInput): Promise<T | null>`

Updates an existing record by ID.

**Parameters:**
- `id: string` - Record identifier
- `data: TUpdateInput` - Update data

**Returns:** `Promise<T | null>` - Updated record or null if not found

**Example:**
```typescript
const updatedUser = await userRepository.update('clx1234567890', {
  name: 'Jane Doe',
  profile: {
    update: {
      firstName: 'Jane'
    }
  }
});
```

### `delete(id: string): Promise<boolean>`

Deletes a record by ID.

**Parameters:**
- `id: string` - Record identifier

**Returns:** `Promise<boolean>` - Always returns true on successful deletion

**Throws:** Prisma error if record doesn't exist

**Example:**
```typescript
const deleted = await userRepository.delete('clx1234567890');
console.log(deleted); // true
```

### `count(options?: any): Promise<number>`

Returns the count of records matching the criteria.

**Parameters:**
- `options?: any` - Prisma count options (where clause)

**Returns:** `Promise<number>`

**Example:**
```typescript
const activeUserCount = await userRepository.count({
  where: { active: true }
});
```

### `findByIds(ids: string[]): Promise<T[]>`

Retrieves multiple records by their IDs.

**Parameters:**
- `ids: string[]` - Array of record identifiers

**Returns:** `Promise<T[]>`

**Example:**
```typescript
const users = await userRepository.findByIds([
  'clx1234567890',
  'clx0987654321',
  'clx1122334455'
]);
```

### `findFirst(where: any, include?: any): Promise<T | null>`

Finds the first record matching the criteria.

**Parameters:**
- `where: any` - Query criteria
- `include?: any` - Related data to include

**Returns:** `Promise<T | null>`

**Example:**
```typescript
const user = await userRepository.findFirst(
  { email: 'john@example.com' },
  { profile: true }
);
```

### `findMany(options: SearchOptions): Promise<T[]>`

Retrieves multiple records with advanced query options.

**Parameters:**
- `options: SearchOptions` - Search and pagination options

**Returns:** `Promise<T[]>`

**Example:**
```typescript
const users = await userRepository.findMany({
  where: { active: true },
  include: { profile: true },
  orderBy: { createdAt: 'desc' },
  page: 1,
  pageSize: 10
});
```

### `findWithPagination(options: SearchOptions): Promise<PaginatedResult<T>>`

Retrieves paginated results with metadata.

**Parameters:**
- `options: SearchOptions` - Search and pagination options

**Returns:** `Promise<PaginatedResult<T>>`

**Example:**
```typescript
const result = await userRepository.findWithPagination({
  page: 1,
  pageSize: 10,
  where: { active: true },
  include: { profile: true },
  orderBy: { createdAt: 'desc' }
});

console.log(result.data); // Array of users
console.log(result.total); // Total count
console.log(result.totalPages); // Total pages
console.log(result.page); // Current page
console.log(result.pageSize); // Page size
```

### `search(searchTerm: string, searchFields: string[], include?: any): Promise<T[]>`

Performs case-insensitive text search across specified fields.

**Parameters:**
- `searchTerm: string` - Text to search for
- `searchFields: string[]` - Fields to search in (supports nested fields with dot notation)
- `include?: any` - Related data to include

**Returns:** `Promise<T[]>` - Limited to 50 results

**Example:**
```typescript
const users = await userRepository.search(
  'john',
  ['name', 'email', 'profile.firstName', 'profile.lastName'],
  { profile: true }
);
```

**Nested Field Search:**
```typescript
// Search in related model fields using dot notation
const users = await userRepository.search(
  'developer',
  ['profile.jobTitle', 'profile.bio'],
  { profile: true }
);
```

### `exists(query: any): Promise<boolean>`

Checks if a record exists matching the query criteria.

**Parameters:**
- `query: any` - Query criteria

**Returns:** `Promise<boolean>`

**Example:**
```typescript
const emailExists = await userRepository.exists({
  email: 'john@example.com'
});

const activeUserExists = await userRepository.exists({
  id: 'clx1234567890',
  active: true
});
```

## Implementation Example

```typescript
import { BaseRepository } from '@mifty/core/base';
import { PrismaClient, User, Prisma } from '@prisma/client';

export type CreateUserDto = Prisma.UserCreateInput;
export type UpdateUserDto = Prisma.UserUpdateInput;

export class UserRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'user');
  }

  // Add custom repository methods
  async findByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({
      where: { email },
      include: { profile: true }
    });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.model.findMany({
      where: { active: true },
      include: { profile: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findUsersWithProfiles(): Promise<User[]> {
    return this.model.findMany({
      where: {
        profile: {
          isNot: null
        }
      },
      include: { profile: true }
    });
  }

  async bulkUpdateStatus(ids: string[], active: boolean): Promise<number> {
    const result = await this.model.updateMany({
      where: {
        id: { in: ids }
      },
      data: { active }
    });
    return result.count;
  }
}
```

## Advanced Usage

### Custom Queries

```typescript
export class UserRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  // Raw SQL queries
  async getUserStats(): Promise<any> {
    return this.prisma.$queryRaw`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN active = true THEN 1 END) as active,
        COUNT(CASE WHEN active = false THEN 1 END) as inactive
      FROM "User"
    `;
  }

  // Complex aggregations
  async getUsersByRole(): Promise<any> {
    return this.model.groupBy({
      by: ['role'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });
  }
}
```

### Transactions

```typescript
export class UserRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  async createUserWithProfile(userData: CreateUserDto): Promise<User> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: userData
      });

      // Additional operations within transaction
      await tx.auditLog.create({
        data: {
          action: 'USER_CREATED',
          userId: user.id,
          timestamp: new Date()
        }
      });

      return user;
    });
  }
}
```

## Best Practices

1. **Use type-safe DTOs** with Prisma generated types
2. **Add custom methods** for specific query patterns
3. **Use transactions** for operations affecting multiple tables
4. **Implement proper error handling** for database constraints
5. **Use includes wisely** to avoid N+1 query problems
6. **Add indexes** for frequently searched fields

## Related

- [IRepository Interface](./interfaces/repository-interface.md)
- [BaseService](./base-service.md)
- [SearchOptions](./interfaces/search-options-interface.md)
- [PaginatedResult](./interfaces/paginated-result-interface.md)