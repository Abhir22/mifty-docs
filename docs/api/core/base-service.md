# BaseService

The `BaseService` is an abstract class that provides a standardized service layer implementation with business logic validation and error handling. It acts as an intermediary between controllers and repositories.

## Class Definition

```typescript
abstract class BaseService<T, TCreateInput, TUpdateInput> {
  constructor(
    protected readonly repository: IRepository<T, TCreateInput, TUpdateInput>
  )

  async findAll(options?: any): Promise<T[]>
  async findById(id: string): Promise<T>
  async create(data: TCreateInput): Promise<T>
  async update(id: string, data: TUpdateInput): Promise<T>
  async delete(id: string): Promise<boolean>
  async count(options?: any): Promise<number>
  async findByIds(ids: string[]): Promise<T[]>
  async findFirst(where: any, include?: any): Promise<T>
  async findMany(options: any): Promise<T[]>
  async findWithPagination(options: any): Promise<PaginatedResult<T>>
  async search(searchTerm: string, searchFields: string[], include?: any): Promise<T[]>
  async exists(query: any): Promise<boolean>
}
```

## Constructor

### `constructor(repository: IRepository<T, TCreateInput, TUpdateInput>)`

Creates a new service instance with the provided repository.

**Parameters:**
- `repository: IRepository<T, TCreateInput, TUpdateInput>` - Repository instance for data access

**Example:**
```typescript
import { BaseService } from '@mifty/core/base';
import { UserRepository } from './user.repository';

export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  constructor(userRepository: UserRepository) {
    super(userRepository);
  }
}
```

## Methods

### `findAll(options?: any): Promise<T[]>`

Retrieves all records with optional filtering and inclusion options.

**Parameters:**
- `options?: any` - Query options (where, include, orderBy, etc.)

**Returns:** `Promise<T[]>`

**Example:**
```typescript
const users = await userService.findAll({
  where: { active: true },
  include: { profile: true },
  orderBy: { createdAt: 'desc' }
});
```

### `findById(id: string): Promise<T>`

Retrieves a single record by ID. Throws `NotFoundException` if not found.

**Parameters:**
- `id: string` - Record identifier

**Returns:** `Promise<T>`

**Throws:** `NotFoundException` if record doesn't exist

**Example:**
```typescript
try {
  const user = await userService.findById('123');
  console.log(user);
} catch (error) {
  // Handle NotFoundException
}
```

### `create(data: TCreateInput): Promise<T>`

Creates a new record with the provided data.

**Parameters:**
- `data: TCreateInput` - Data for creating the record

**Returns:** `Promise<T>`

**Example:**
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

### `update(id: string, data: TUpdateInput): Promise<T>`

Updates an existing record. Throws `NotFoundException` if record doesn't exist.

**Parameters:**
- `id: string` - Record identifier
- `data: TUpdateInput` - Update data

**Returns:** `Promise<T>`

**Throws:** `NotFoundException` if record doesn't exist

**Example:**
```typescript
const updatedUser = await userService.update('123', {
  name: 'Jane Doe',
  email: 'jane@example.com'
});
```

### `delete(id: string): Promise<boolean>`

Deletes a record by ID. Throws `NotFoundException` if record doesn't exist.

**Parameters:**
- `id: string` - Record identifier

**Returns:** `Promise<boolean>` - Always returns `true` on success

**Throws:** `NotFoundException` if record doesn't exist

**Example:**
```typescript
const deleted = await userService.delete('123');
console.log(deleted); // true
```

### `count(options?: any): Promise<number>`

Returns the count of records matching the provided criteria.

**Parameters:**
- `options?: any` - Query options (where clause, etc.)

**Returns:** `Promise<number>`

**Example:**
```typescript
const activeUserCount = await userService.count({
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
const users = await userService.findByIds(['123', '456', '789']);
```

### `findFirst(where: any, include?: any): Promise<T>`

Finds the first record matching the criteria. Throws `NotFoundException` if no match found.

**Parameters:**
- `where: any` - Query criteria (required)
- `include?: any` - Related data to include

**Returns:** `Promise<T>`

**Throws:** 
- `ValidationException` if where clause is missing
- `NotFoundException` if no matching record found

**Example:**
```typescript
const user = await userService.findFirst(
  { email: 'john@example.com' },
  { profile: true }
);
```

### `findMany(options: any): Promise<T[]>`

Retrieves multiple records with query options.

**Parameters:**
- `options: any` - Query options (where, include, orderBy, pagination, etc.)

**Returns:** `Promise<T[]>`

**Example:**
```typescript
const users = await userService.findMany({
  where: { active: true },
  include: { profile: true },
  orderBy: { createdAt: 'desc' },
  take: 10
});
```

### `findWithPagination(options: any): Promise<PaginatedResult<T>>`

Retrieves paginated results with metadata.

**Parameters:**
- `options: any` - Query options including pagination parameters

**Returns:** `Promise<PaginatedResult<T>>`

**Example:**
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

### `search(searchTerm: string, searchFields: string[], include?: any): Promise<T[]>`

Performs text search across specified fields.

**Parameters:**
- `searchTerm: string` - Text to search for
- `searchFields: string[]` - Fields to search in
- `include?: any` - Related data to include

**Returns:** `Promise<T[]>`

**Throws:** `ValidationException` if parameters are invalid

**Example:**
```typescript
const users = await userService.search(
  'john',
  ['name', 'email', 'profile.firstName'],
  { profile: true }
);
```

### `exists(query: any): Promise<boolean>`

Checks if a record exists matching the query criteria.

**Parameters:**
- `query: any` - Query criteria

**Returns:** `Promise<boolean>`

**Throws:** `ValidationException` if query is invalid

**Example:**
```typescript
const emailExists = await userService.exists({
  email: 'john@example.com'
});
```

## Implementation Example

```typescript
import { BaseService } from '@mifty/core/base';
import { UserRepository } from './user.repository';
import { User, CreateUserDto, UpdateUserDto } from './user.types';
import { ConflictException } from '@mifty/core/exceptions';

export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  constructor(private userRepository: UserRepository) {
    super(userRepository);
  }

  // Override create to add business logic
  async create(data: CreateUserDto): Promise<User> {
    // Check if email already exists
    const emailExists = await this.exists({ email: data.email });
    if (emailExists) {
      throw new ConflictException('Email already exists');
    }

    // Add additional business logic
    const userData = {
      ...data,
      active: true,
      createdAt: new Date()
    };

    return super.create(userData);
  }

  // Add custom business methods
  async activateUser(id: string): Promise<User> {
    return this.update(id, { active: true });
  }

  async deactivateUser(id: string): Promise<User> {
    return this.update(id, { active: false });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.findMany({
      where: { active: true },
      include: { profile: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async searchActiveUsers(searchTerm: string): Promise<User[]> {
    const users = await this.search(
      searchTerm,
      ['name', 'email', 'profile.firstName', 'profile.lastName'],
      { profile: true }
    );
    
    // Filter to only active users
    return users.filter(user => user.active);
  }
}
```

## Error Handling

The BaseService automatically handles and throws appropriate exceptions:

- **NotFoundException** - When records are not found
- **ValidationException** - When input validation fails
- **ConflictException** - When business rules are violated (custom implementation)

## Best Practices

1. **Override methods** to add business logic validation
2. **Add custom methods** for specific business operations
3. **Use transactions** for complex operations involving multiple entities
4. **Validate business rules** before calling repository methods
5. **Handle errors gracefully** and provide meaningful error messages

## Related

- [BaseRepository](./base-repository.md)
- [IService Interface](./interfaces/service-interface.md)
- [IRepository Interface](./interfaces/repository-interface.md)
- [PaginatedResult](./interfaces/paginated-result-interface.md)