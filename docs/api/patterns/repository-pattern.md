# Repository Pattern

The Repository pattern in Mifty provides a clean abstraction layer between your business logic and data access logic. It encapsulates the logic needed to access data sources, centralizing common data access functionality for better maintainability and decoupling.

## Pattern Overview

The Repository pattern provides:
- **Data Access Abstraction** - Hide database implementation details
- **Testability** - Easy to mock for unit testing
- **Consistency** - Standardized data access methods
- **Flexibility** - Easy to switch between different data sources
- **Query Optimization** - Centralized query logic

## Architecture

```
Service Layer
      ↓
Repository Interface (IRepository)
      ↓
Repository Implementation (BaseRepository)
      ↓
ORM (Prisma)
      ↓
Database
```

## Repository Interface Contract

### IRepository Interface

```typescript
interface IRepository<T, TCreateInput, TUpdateInput> {
  // Basic CRUD operations
  findAll(options?: any): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: TCreateInput): Promise<T>;
  update(id: string, data: TUpdateInput): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  
  // Query operations
  count(options?: any): Promise<number>;
  findFirst(where: any, include?: any): Promise<T | null>;
  findMany(options: SearchOptions): Promise<T[]>;
  findWithPagination(options: SearchOptions): Promise<PaginatedResult<T>>;
  
  // Search operations
  search(searchTerm: string, searchFields: string[], include?: any): Promise<T[]>;
  findByIds(ids: string[]): Promise<T[]>;
  exists(query: any): Promise<boolean>;
}
```

## Implementation Patterns

### Basic Repository Implementation

```typescript
import { BaseRepository } from '@mifty/core/base';
import { PrismaClient, User, Prisma } from '@prisma/client';

export type CreateUserDto = Prisma.UserCreateInput;
export type UpdateUserDto = Prisma.UserUpdateInput;

export class UserRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'user'); // 'user' matches the Prisma model name
  }

  // Inherit all base CRUD operations
  // Add custom query methods below
}
```

### Repository with Custom Methods

```typescript
import { Repository } from '@mifty/core/decorators';

@Repository()
export class UserRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'user');
  }

  // Custom query methods
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

  async findUsersByRole(role: string): Promise<User[]> {
    return this.model.findMany({
      where: { role },
      include: { profile: true }
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

  async findUsersByDateRange(startDate: Date, endDate: Date): Promise<User[]> {
    return this.model.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Bulk operations
  async bulkUpdateStatus(ids: string[], active: boolean): Promise<number> {
    const result = await this.model.updateMany({
      where: {
        id: { in: ids }
      },
      data: { active }
    });
    return result.count;
  }

  async bulkDelete(ids: string[]): Promise<number> {
    const result = await this.model.deleteMany({
      where: {
        id: { in: ids }
      }
    });
    return result.count;
  }

  // Aggregation methods
  async getUserCountByRole(): Promise<{ role: string; count: number }[]> {
    const result = await this.model.groupBy({
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

    return result.map(item => ({
      role: item.role,
      count: item._count.id
    }));
  }

  async getActiveUserCount(): Promise<number> {
    return this.model.count({
      where: { active: true }
    });
  }

  // Complex queries with relations
  async findUsersWithRecentActivity(days: number = 30): Promise<User[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.model.findMany({
      where: {
        OR: [
          { lastLoginAt: { gte: cutoffDate } },
          { updatedAt: { gte: cutoffDate } }
        ]
      },
      include: {
        profile: true,
        posts: {
          where: {
            createdAt: { gte: cutoffDate }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { lastLoginAt: 'desc' }
    });
  }
}
```

## Advanced Repository Patterns

### Repository with Raw SQL Queries

```typescript
export class UserRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  // Raw SQL for complex analytics
  async getUserStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: { role: string; count: number }[];
  }> {
    const [stats, roleStats] = await Promise.all([
      this.prisma.$queryRaw<{ total: bigint; active: bigint; inactive: bigint }[]>`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN active = true THEN 1 END) as active,
          COUNT(CASE WHEN active = false THEN 1 END) as inactive
        FROM "User"
      `,
      this.prisma.$queryRaw<{ role: string; count: bigint }[]>`
        SELECT role, COUNT(*) as count
        FROM "User"
        GROUP BY role
        ORDER BY count DESC
      `
    ]);

    return {
      total: Number(stats[0].total),
      active: Number(stats[0].active),
      inactive: Number(stats[0].inactive),
      byRole: roleStats.map(item => ({
        role: item.role,
        count: Number(item.count)
      }))
    };
  }

  // Raw SQL for performance-critical queries
  async findUsersByComplexCriteria(criteria: {
    minAge?: number;
    maxAge?: number;
    roles?: string[];
    hasProfile?: boolean;
    registeredAfter?: Date;
  }): Promise<User[]> {
    const conditions: string[] = [];
    const params: any[] = [];

    if (criteria.minAge !== undefined) {
      conditions.push(`EXTRACT(YEAR FROM AGE(date_of_birth)) >= $${params.length + 1}`);
      params.push(criteria.minAge);
    }

    if (criteria.maxAge !== undefined) {
      conditions.push(`EXTRACT(YEAR FROM AGE(date_of_birth)) <= $${params.length + 1}`);
      params.push(criteria.maxAge);
    }

    if (criteria.roles && criteria.roles.length > 0) {
      conditions.push(`role = ANY($${params.length + 1})`);
      params.push(criteria.roles);
    }

    if (criteria.hasProfile !== undefined) {
      if (criteria.hasProfile) {
        conditions.push(`EXISTS (SELECT 1 FROM "Profile" WHERE "userId" = "User".id)`);
      } else {
        conditions.push(`NOT EXISTS (SELECT 1 FROM "Profile" WHERE "userId" = "User".id)`);
      }
    }

    if (criteria.registeredAfter) {
      conditions.push(`created_at >= $${params.length + 1}`);
      params.push(criteria.registeredAfter);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    return this.prisma.$queryRaw`
      SELECT * FROM "User" 
      ${whereClause}
      ORDER BY created_at DESC
    `;
  }
}
```

### Repository with Transaction Support

```typescript
export class UserRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  // Transaction-aware methods
  async createWithProfile(
    userData: CreateUserDto, 
    profileData: Prisma.ProfileCreateInput,
    tx?: Prisma.TransactionClient
  ): Promise<User> {
    const client = tx || this.prisma;
    
    return client.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: userData
      });

      await transaction.profile.create({
        data: {
          ...profileData,
          userId: user.id
        }
      });

      return transaction.user.findUnique({
        where: { id: user.id },
        include: { profile: true }
      }) as Promise<User>;
    });
  }

  async transferUserData(
    fromUserId: string, 
    toUserId: string,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    const client = tx || this.prisma;
    
    await client.$transaction(async (transaction) => {
      // Transfer posts
      await transaction.post.updateMany({
        where: { authorId: fromUserId },
        data: { authorId: toUserId }
      });

      // Transfer comments
      await transaction.comment.updateMany({
        where: { authorId: fromUserId },
        data: { authorId: toUserId }
      });

      // Delete old user
      await transaction.user.delete({
        where: { id: fromUserId }
      });
    });
  }

  // Batch operations with transactions
  async batchCreateUsers(usersData: CreateUserDto[]): Promise<User[]> {
    return this.prisma.$transaction(async (tx) => {
      const createdUsers: User[] = [];
      
      for (const userData of usersData) {
        const user = await tx.user.create({
          data: userData
        });
        createdUsers.push(user);
      }
      
      return createdUsers;
    });
  }
}
```

### Repository with Caching

```typescript
import { Redis } from 'ioredis';

export class UserRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  constructor(
    prisma: PrismaClient,
    private redis: Redis
  ) {
    super(prisma, 'user');
  }

  async findById(id: string): Promise<User | null> {
    // Check cache first
    const cacheKey = `user:${id}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from database
    const user = await super.findById(id);
    
    if (user) {
      // Cache for 1 hour
      await this.redis.setex(cacheKey, 3600, JSON.stringify(user));
    }
    
    return user;
  }

  async update(id: string, data: UpdateUserDto): Promise<User | null> {
    const user = await super.update(id, data);
    
    if (user) {
      // Update cache
      const cacheKey = `user:${id}`;
      await this.redis.setex(cacheKey, 3600, JSON.stringify(user));
      
      // Invalidate related caches
      await this.invalidateUserCaches(id);
    }
    
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const result = await super.delete(id);
    
    if (result) {
      // Remove from cache
      await this.redis.del(`user:${id}`);
      await this.invalidateUserCaches(id);
    }
    
    return result;
  }

  private async invalidateUserCaches(userId: string): Promise<void> {
    // Invalidate related cache keys
    const patterns = [
      `user:${userId}:*`,
      `users:active:*`,
      `users:role:*`
    ];
    
    for (const pattern of patterns) {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    }
  }
}
```

## Repository Decorator

The `@Repository()` decorator provides automatic error handling and context tracking:

```typescript
import { Repository } from '@mifty/core/decorators';

@Repository()
export class UserRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'user');
  }

  // All methods automatically get:
  // - Error handling and transformation
  // - Request context tracking
  // - Performance monitoring
  // - Logging
}
```

**Decorator Features:**
- **Error Transformation** - Converts Prisma errors to DatabaseExceptions
- **Context Tracking** - Tracks method calls for debugging
- **Performance Monitoring** - Logs method execution times
- **Automatic Logging** - Logs database operations

## Query Optimization Patterns

### Selective Field Loading

```typescript
export class UserRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  async findUsersForListing(): Promise<Partial<User>[]> {
    return this.model.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        active: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findUserSummary(id: string): Promise<{
    id: string;
    name: string;
    email: string;
    postCount: number;
    commentCount: number;
  } | null> {
    return this.model.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            posts: true,
            comments: true
          }
        }
      }
    }).then(user => user ? {
      ...user,
      postCount: user._count.posts,
      commentCount: user._count.comments
    } : null);
  }
}
```

### Efficient Pagination

```typescript
export class UserRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  // Cursor-based pagination for large datasets
  async findUsersCursor(
    cursor?: string,
    limit: number = 20
  ): Promise<{
    users: User[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    const users = await this.model.findMany({
      take: limit + 1, // Take one extra to check if there are more
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1 // Skip the cursor
      }),
      orderBy: { createdAt: 'desc' },
      include: { profile: true }
    });

    const hasMore = users.length > limit;
    const resultUsers = hasMore ? users.slice(0, -1) : users;
    const nextCursor = hasMore ? users[users.length - 2].id : undefined;

    return {
      users: resultUsers,
      nextCursor,
      hasMore
    };
  }

  // Optimized count for pagination
  async findWithOptimizedPagination(options: SearchOptions): Promise<PaginatedResult<User>> {
    const { page = 1, pageSize = 10, where, include, orderBy } = options;
    
    // For large datasets, use approximate count for better performance
    const useApproximateCount = page > 100;
    
    const [data, total] = await Promise.all([
      this.findMany(options),
      useApproximateCount 
        ? this.getApproximateCount(where)
        : this.count({ where })
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  private async getApproximateCount(where?: any): Promise<number> {
    // Use database statistics for approximate count
    const result = await this.prisma.$queryRaw<{ estimate: number }[]>`
      SELECT reltuples::BIGINT AS estimate
      FROM pg_class
      WHERE relname = 'User'
    `;
    
    return result[0]?.estimate || 0;
  }
}
```

## Repository Testing Patterns

### Unit Testing Repositories

```typescript
import { UserRepository } from './user.repository';
import { PrismaClient } from '@prisma/client';

// Mock Prisma client
const mockPrisma = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  }
} as any;

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository(mockPrisma);
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const email = 'test@example.com';
      const expectedUser = { id: '1', email, name: 'Test User' };

      mockPrisma.user.findUnique.mockResolvedValue(expectedUser);

      const result = await userRepository.findByEmail(email);

      expect(result).toEqual(expectedUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: { profile: true }
      });
    });

    it('should return null for non-existent email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await userRepository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });
});
```

### Integration Testing

```typescript
import { UserRepository } from './user.repository';
import { setupTestDatabase, TestDatabase } from '../test/setup';

describe('UserRepository Integration', () => {
  let userRepository: UserRepository;
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await setupTestDatabase();
    userRepository = new UserRepository(testDb.prisma);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  beforeEach(async () => {
    await testDb.reset();
  });

  describe('findActiveUsers', () => {
    it('should return only active users', async () => {
      // Create test data
      await testDb.prisma.user.createMany({
        data: [
          { name: 'Active User 1', email: 'active1@test.com', active: true },
          { name: 'Active User 2', email: 'active2@test.com', active: true },
          { name: 'Inactive User', email: 'inactive@test.com', active: false }
        ]
      });

      const activeUsers = await userRepository.findActiveUsers();

      expect(activeUsers).toHaveLength(2);
      expect(activeUsers.every(user => user.active)).toBe(true);
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should update multiple users status', async () => {
      // Create test users
      const users = await testDb.prisma.user.createMany({
        data: [
          { name: 'User 1', email: 'user1@test.com', active: true },
          { name: 'User 2', email: 'user2@test.com', active: true }
        ]
      });

      const userIds = users.map(u => u.id);
      const updatedCount = await userRepository.bulkUpdateStatus(userIds, false);

      expect(updatedCount).toBe(2);

      // Verify updates
      const updatedUsers = await testDb.prisma.user.findMany({
        where: { id: { in: userIds } }
      });
      expect(updatedUsers.every(user => !user.active)).toBe(true);
    });
  });
});
```

## Best Practices

### 1. Single Responsibility
Each repository should handle one entity type:

```typescript
// Good: Single entity focus
export class UserRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  // Only user-related data access
}

export class PostRepository extends BaseRepository<Post, CreatePostDto, UpdatePostDto> {
  // Only post-related data access
}

// Avoid: Mixed responsibilities
export class UserPostRepository {
  // Mixing user and post operations
}
```

### 2. Query Optimization
Use selective loading and proper indexing:

```typescript
// Good: Selective field loading
async findUsersForDropdown(): Promise<{ id: string; name: string }[]> {
  return this.model.findMany({
    select: { id: true, name: true },
    where: { active: true },
    orderBy: { name: 'asc' }
  });
}

// Avoid: Loading unnecessary data
async findUsersForDropdown(): Promise<User[]> {
  return this.model.findMany({
    include: { profile: true, posts: true } // Unnecessary data
  });
}
```

### 3. Error Handling
Use the Repository decorator for consistent error handling:

```typescript
// Good: Use decorator
@Repository()
export class UserRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  // Automatic error handling
}

// Manual error handling when needed
async customMethod(): Promise<User[]> {
  try {
    return await this.model.findMany();
  } catch (error) {
    throw new DatabaseException('Custom operation failed', { error });
  }
}
```

### 4. Type Safety
Use proper TypeScript types:

```typescript
// Good: Proper typing
export class UserRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  async findByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({ where: { email } });
  }
}

// Avoid: Loose typing
async findByEmail(email: any): Promise<any> {
  return this.model.findUnique({ where: { email } });
}
```

## Related

- [Service Layer Pattern](./service-layer-pattern.md) - Business logic layer
- [BaseRepository](../core/base-repository.md) - Base repository implementation
- [IRepository Interface](../core/interfaces/repository-interface.md) - Repository contract
- [Repository Decorator](../core/decorators/repository-decorator.md) - Error handling decorator
- [Database Patterns](./database-patterns.md) - Database design patterns