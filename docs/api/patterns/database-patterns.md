# Database Patterns

Common database design patterns and best practices used in Mifty applications.

## Overview

This guide covers essential database patterns that help you build scalable and maintainable applications with Mifty.

## Repository Pattern

The Repository Pattern provides a uniform interface for accessing data, regardless of the underlying storage mechanism.

### Benefits

- **Separation of Concerns**: Isolates data access logic
- **Testability**: Easy to mock for unit testing
- **Flexibility**: Switch between different data sources
- **Consistency**: Uniform data access patterns

### Implementation

```typescript
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  create(user: CreateUserDto): Promise<User>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}

export class UserRepository extends BaseRepository<User> implements IUserRepository {
  // Implementation details
}
```

## Unit of Work Pattern

Manages transactions and ensures data consistency across multiple repository operations.

```typescript
export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private profileRepository: IProfileRepository,
    private unitOfWork: IUnitOfWork
  ) {}

  async createUserWithProfile(userData: CreateUserDto, profileData: CreateProfileDto) {
    return this.unitOfWork.transaction(async () => {
      const user = await this.userRepository.create(userData);
      const profile = await this.profileRepository.create({
        ...profileData,
        userId: user.id
      });
      return { user, profile };
    });
  }
}
```

## Query Object Pattern

Encapsulates complex queries in reusable objects.

```typescript
export class UserQueries {
  static activeUsersWithProfiles(): QueryBuilder {
    return QueryBuilder
      .select(['users.*', 'profiles.displayName'])
      .from('users')
      .join('profiles', 'users.id', 'profiles.userId')
      .where('users.isActive', true);
  }

  static usersByRole(role: string): QueryBuilder {
    return QueryBuilder
      .from('users')
      .where('role', role)
      .orderBy('createdAt', 'desc');
  }
}
```

## Data Mapper Pattern

Separates the in-memory objects from the database schema.

```typescript
export class UserMapper {
  static toDomain(raw: UserRow): User {
    return new User({
      id: raw.id,
      email: raw.email_address,
      name: raw.full_name,
      createdAt: new Date(raw.created_at)
    });
  }

  static toPersistence(user: User): UserRow {
    return {
      id: user.id,
      email_address: user.email,
      full_name: user.name,
      created_at: user.createdAt.toISOString()
    };
  }
}
```

## Connection Pool Pattern

Manages database connections efficiently.

```typescript
export class DatabaseConfig {
  static getPoolConfig(): PoolConfig {
    return {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200
    };
  }
}
```

## Migration Pattern

Manages database schema changes over time.

```typescript
export class CreateUsersTable extends Migration {
  async up(): Promise<void> {
    await this.schema.createTable('users', (table) => {
      table.uuid('id').primary();
      table.string('email').unique().notNullable();
      table.string('name').notNullable();
      table.boolean('isActive').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  async down(): Promise<void> {
    await this.schema.dropTable('users');
  }
}
```

## Best Practices

### 1. Use Transactions for Related Operations

```typescript
// Good
await db.transaction(async (trx) => {
  await userRepository.create(userData, trx);
  await profileRepository.create(profileData, trx);
});

// Avoid
await userRepository.create(userData);
await profileRepository.create(profileData); // Could fail leaving orphaned user
```

### 2. Implement Proper Error Handling

```typescript
export class UserRepository extends BaseRepository<User> {
  async findById(id: string): Promise<User | null> {
    try {
      const result = await this.query().where('id', id).first();
      return result ? this.mapToDomain(result) : null;
    } catch (error) {
      this.logger.error('Failed to find user by ID', { id, error });
      throw new RepositoryError('User lookup failed', error);
    }
  }
}
```

### 3. Use Connection Pooling

```typescript
const db = knex({
  client: 'postgresql',
  connection: process.env.DATABASE_URL,
  pool: {
    min: 2,
    max: 10
  }
});
```

### 4. Implement Proper Indexing

```sql
-- Index frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Composite indexes for complex queries
CREATE INDEX idx_users_active_role ON users(is_active, role) WHERE is_active = true;
```

## Related

- [Repository Pattern](./repository-pattern.md) - Detailed repository implementation
- [Error Handling](./error-handling.md) - Error handling strategies
- [BaseRepository](../core/base-repository.md) - Base repository class