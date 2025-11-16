# IRepository Interface

The `IRepository` interface defines the contract for data access operations in the Mifty framework. It provides a standardized set of methods for CRUD operations, searching, and pagination.

## Interface Definition

```typescript
interface IRepository<T, TCreateInput, TUpdateInput> {
  findAll(options?: any): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: TCreateInput): Promise<T>;
  update(id: string, data: TUpdateInput): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(options?: any): Promise<number>;
  findFirst(where: any, include?: any): Promise<T | null>;
  findMany(options: SearchOptions): Promise<T[]>;
  findWithPagination(options: SearchOptions): Promise<PaginatedResult<T>>;
  search(searchTerm: string, searchFields: string[], include?: any): Promise<T[]>;
  findByIds(ids: string[]): Promise<T[]>;
  exists(query: any): Promise<boolean>;
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
interface UserRepository extends IRepository<User, CreateUserDto, UpdateUserDto> {}

// Implementation
const users = await userRepository.findAll({
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
const user = await userRepository.findById('clx1234567890');
```

### `create(data: TCreateInput): Promise<T>`

Creates a new record with the provided data.

**Parameters:**
- `data: TCreateInput` - Data for creating the record

**Returns:** `Promise<T>` - Created entity

**Usage:**
```typescript
const newUser = await userRepository.create({
  name: 'John Doe',
  email: 'john@example.com'
});
```

### `update(id: string, data: TUpdateInput): Promise<T | null>`

Updates an existing record by ID.

**Parameters:**
- `id: string` - Record identifier
- `data: TUpdateInput` - Update data

**Returns:** `Promise<T | null>` - Updated entity or null if not found

**Usage:**
```typescript
const updatedUser = await userRepository.update('clx1234567890', {
  name: 'Jane Doe'
});
```

### `delete(id: string): Promise<boolean>`

Deletes a record by ID.

**Parameters:**
- `id: string` - Record identifier

**Returns:** `Promise<boolean>` - Success status

**Usage:**
```typescript
const deleted = await userRepository.delete('clx1234567890');
```

### `count(options?: any): Promise<number>`

Returns the count of records matching the criteria.

**Parameters:**
- `options?: any` - Query options (where clause)

**Returns:** `Promise<number>` - Count of matching records

**Usage:**
```typescript
const activeUserCount = await userRepository.count({
  where: { active: true }
});
```

### `findFirst(where: any, include?: any): Promise<T | null>`

Finds the first record matching the criteria.

**Parameters:**
- `where: any` - Query criteria
- `include?: any` - Related data to include

**Returns:** `Promise<T | null>` - First matching entity or null

**Usage:**
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

**Returns:** `Promise<T[]>` - Array of entities

**Usage:**
```typescript
const users = await userRepository.findMany({
  where: { active: true },
  orderBy: { createdAt: 'desc' },
  page: 1,
  pageSize: 10
});
```

### `findWithPagination(options: SearchOptions): Promise<PaginatedResult<T>>`

Retrieves paginated results with metadata.

**Parameters:**
- `options: SearchOptions` - Search and pagination options

**Returns:** `Promise<PaginatedResult<T>>` - Paginated result with metadata

**Usage:**
```typescript
const result = await userRepository.findWithPagination({
  page: 1,
  pageSize: 10,
  where: { active: true }
});

console.log(result.data); // Array of users
console.log(result.total); // Total count
console.log(result.totalPages); // Total pages
```

### `search(searchTerm: string, searchFields: string[], include?: any): Promise<T[]>`

Performs text search across specified fields.

**Parameters:**
- `searchTerm: string` - Text to search for
- `searchFields: string[]` - Fields to search in
- `include?: any` - Related data to include

**Returns:** `Promise<T[]>` - Array of matching entities

**Usage:**
```typescript
const users = await userRepository.search(
  'john',
  ['name', 'email', 'profile.firstName'],
  { profile: true }
);
```

### `findByIds(ids: string[]): Promise<T[]>`

Retrieves multiple records by their IDs.

**Parameters:**
- `ids: string[]` - Array of record identifiers

**Returns:** `Promise<T[]>` - Array of entities

**Usage:**
```typescript
const users = await userRepository.findByIds([
  'clx1234567890',
  'clx0987654321'
]);
```

### `exists(query: any): Promise<boolean>`

Checks if a record exists matching the query criteria.

**Parameters:**
- `query: any` - Query criteria

**Returns:** `Promise<boolean>` - Existence status

**Usage:**
```typescript
const emailExists = await userRepository.exists({
  email: 'john@example.com'
});
```

## Implementation Example

```typescript
import { IRepository } from '@mifty/core/interfaces';
import { PrismaClient, User, Prisma } from '@prisma/client';

export type CreateUserDto = Prisma.UserCreateInput;
export type UpdateUserDto = Prisma.UserUpdateInput;

export class UserRepository implements IRepository<User, CreateUserDto, UpdateUserDto> {
  constructor(private prisma: PrismaClient) {}

  async findAll(options?: any): Promise<User[]> {
    return this.prisma.user.findMany(options);
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: CreateUserDto): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: UpdateUserDto): Promise<User | null> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.user.delete({ where: { id } });
    return true;
  }

  async count(options?: any): Promise<number> {
    return this.prisma.user.count(options);
  }

  async findFirst(where: any, include?: any): Promise<User | null> {
    const options: any = { where };
    if (include) options.include = include;
    return this.prisma.user.findFirst(options);
  }

  async findMany(options: SearchOptions): Promise<User[]> {
    const queryOptions: any = {};
    if (options.where) queryOptions.where = options.where;
    if (options.include) queryOptions.include = options.include;
    if (options.orderBy) queryOptions.orderBy = options.orderBy;
    
    if (options.page && options.pageSize) {
      queryOptions.skip = (options.page - 1) * options.pageSize;
      queryOptions.take = options.pageSize;
    }

    return this.prisma.user.findMany(queryOptions);
  }

  async findWithPagination(options: SearchOptions): Promise<PaginatedResult<User>> {
    const { page = 1, pageSize = 10, where, include, orderBy } = options;
    const skip = (page - 1) * pageSize;
    
    const queryOptions: any = { skip, take: pageSize };
    if (where) queryOptions.where = where;
    if (include) queryOptions.include = include;
    if (orderBy) queryOptions.orderBy = orderBy;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany(queryOptions),
      this.prisma.user.count({ where })
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  async search(searchTerm: string, searchFields: string[], include?: any): Promise<User[]> {
    const orConditions = searchFields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive' as const
      }
    }));

    const options: any = {
      where: { OR: orConditions },
      take: 50
    };

    if (include) options.include = include;
    return this.prisma.user.findMany(options);
  }

  async findByIds(ids: string[]): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { id: { in: ids } }
    });
  }

  async exists(query: any): Promise<boolean> {
    const result = await this.prisma.user.findFirst({
      where: query,
      select: { id: true }
    });
    return !!result;
  }
}
```

## Best Practices

### 1. Type Safety
Always use proper TypeScript types for your entities and DTOs:

```typescript
// Good
interface UserRepository extends IRepository<User, CreateUserDto, UpdateUserDto> {}

// Avoid
interface UserRepository extends IRepository<any, any, any> {}
```

### 2. Error Handling
Implement proper error handling in your repository methods:

```typescript
async findById(id: string): Promise<User | null> {
  try {
    return await this.prisma.user.findUnique({ where: { id } });
  } catch (error) {
    // Log error and handle appropriately
    throw new DatabaseException('Failed to find user', error);
  }
}
```

### 3. Query Optimization
Use selective field inclusion to optimize queries:

```typescript
async findAll(options?: any): Promise<User[]> {
  return this.prisma.user.findMany({
    ...options,
    select: {
      id: true,
      name: true,
      email: true,
      // Only include necessary fields
    }
  });
}
```

### 4. Consistent Return Types
Always return consistent types as defined in the interface:

```typescript
// Good - returns T | null as specified
async findById(id: string): Promise<User | null> {
  return this.prisma.user.findUnique({ where: { id } });
}

// Avoid - throwing errors instead of returning null
async findById(id: string): Promise<User> {
  const user = await this.prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');
  return user;
}
```

## Related

- [BaseRepository](../base-repository.md) - Default implementation
- [IService Interface](./service-interface.md) - Service layer interface
- [SearchOptions](./search-options-interface.md) - Query options interface
- [PaginatedResult](./paginated-result-interface.md) - Pagination result interface