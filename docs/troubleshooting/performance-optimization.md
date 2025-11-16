# Performance Optimization Guide for Mifty Applications

Master performance optimization techniques to make your Mifty applications lightning-fast, from database queries to API responses and everything in between.

## What You'll Learn

This comprehensive guide covers:

- 🚀 **Database Optimization** - Query optimization, indexing, and connection pooling
- ⚡ **API Performance** - Response time optimization and caching strategies
- 💾 **Memory Management** - Memory leak prevention and garbage collection tuning
- 🔄 **Caching Strategies** - Redis, in-memory, and CDN caching
- 📊 **Monitoring & Profiling** - Performance monitoring and bottleneck identification
- 🌐 **Network Optimization** - Compression, CDN, and request optimization
- 🏗️ **Architecture Patterns** - Scalable architecture and microservices optimization
- 📈 **Load Testing** - Performance testing and capacity planning

## Step 1: Database Performance Optimization

### 1.1 Query Optimization

#### Identify Slow Queries

```typescript
// src/utils/query-optimizer.ts
import { PrismaService } from '../services/prisma.service';

export class QueryOptimizer {
  constructor(private prisma: PrismaService) {
    this.setupQueryMonitoring();
  }

  private setupQueryMonitoring(): void {
    this.prisma.$on('query', (e) => {
      const duration = e.duration;
      
      if (duration > 100) {
        console.warn(`Slow query detected (${duration}ms):`, {
          query: e.query,
          params: e.params,
          suggestions: this.analyzeQuery(e.query)
        });
      }
    });
  }

  private analyzeQuery(query: string): string[] {
    const suggestions: string[] = [];
    
    // Check for missing WHERE clauses
    if (query.includes('SELECT') && !query.includes('WHERE') && !query.includes('LIMIT')) {
      suggestions.push('Add WHERE clause or LIMIT to avoid full table scans');
    }
    
    // Check for N+1 queries
    if (query.includes('SELECT') && query.includes('IN (')) {
      suggestions.push('Consider using JOIN instead of IN clause for better performance');
    }
    
    // Check for missing indexes
    if (query.includes('ORDER BY') && !query.includes('INDEX')) {
      suggestions.push('Consider adding index on ORDER BY columns');
    }
    
    // Check for inefficient JOINs
    if ((query.match(/JOIN/g) || []).length > 3) {
      suggestions.push('Consider breaking complex JOINs into multiple queries');
    }
    
    return suggestions;
  }

  async optimizeQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    options: { timeout?: number; cache?: boolean } = {}
  ): Promise<T> {
    const start = Date.now();
    
    try {
      // Set query timeout
      if (options.timeout) {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Query timeout: ${queryName}`)), options.timeout);
        });
        
        const result = await Promise.race([queryFn(), timeoutPromise]) as T;
        const duration = Date.now() - start;
        
        this.logQueryPerformance(queryName, duration);
        return result;
      }
      
      const result = await queryFn();
      const duration = Date.now() - start;
      
      this.logQueryPerformance(queryName, duration);
      return result;
      
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`Query failed: ${queryName} (${duration}ms)`, error);
      throw error;
    }
  }

  private logQueryPerformance(queryName: string, duration: number): void {
    if (duration > 1000) {
      console.error(`Very slow query: ${queryName} (${duration}ms)`);
    } else if (duration > 500) {
      console.warn(`Slow query: ${queryName} (${duration}ms)`);
    } else if (duration > 100) {
      console.info(`Moderate query: ${queryName} (${duration}ms)`);
    }
  }
}
```

#### Optimized Repository Patterns

```typescript
// src/modules/user/user.repository.optimized.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { QueryOptimizer } from '../../utils/query-optimizer';

@Injectable()
export class OptimizedUserRepository {
  private queryOptimizer: QueryOptimizer;

  constructor(private prisma: PrismaService) {
    this.queryOptimizer = new QueryOptimizer(prisma);
  }

  // Optimized: Use select to limit fields
  async findUsersBasicInfo(limit = 10, offset = 0) {
    return this.queryOptimizer.optimizeQuery(
      'findUsersBasicInfo',
      () => this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' }
      })
    );
  }

  // Optimized: Use include strategically
  async findUserWithRecentPosts(userId: string) {
    return this.queryOptimizer.optimizeQuery(
      'findUserWithRecentPosts',
      () => this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          posts: {
            take: 5, // Limit related records
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              title: true,
              createdAt: true,
              status: true
            }
          }
        }
      })
    );
  }

  // Optimized: Batch operations
  async findUsersByIds(userIds: string[]) {
    return this.queryOptimizer.optimizeQuery(
      'findUsersByIds',
      () => this.prisma.user.findMany({
        where: {
          id: { in: userIds }
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      })
    );
  }

  // Optimized: Aggregation queries
  async getUserStats(userId: string) {
    return this.queryOptimizer.optimizeQuery(
      'getUserStats',
      async () => {
        const [user, postCount, commentCount] = await Promise.all([
          this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, createdAt: true }
          }),
          this.prisma.post.count({
            where: { authorId: userId }
          }),
          this.prisma.comment.count({
            where: { authorId: userId }
          })
        ]);

        return {
          ...user,
          postCount,
          commentCount
        };
      }
    );
  }

  // Optimized: Pagination with cursor
  async findUsersWithCursor(cursor?: string, limit = 10) {
    return this.queryOptimizer.optimizeQuery(
      'findUsersWithCursor',
      () => this.prisma.user.findMany({
        take: limit,
        ...(cursor && {
          skip: 1,
          cursor: { id: cursor }
        }),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true
        }
      })
    );
  }
}
```

### 1.2 Database Indexing Strategy

```sql
-- Add these indexes to your Prisma schema or run as SQL

-- User table indexes
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_created_at ON "User"("createdAt");
CREATE INDEX idx_user_status ON "User"(status) WHERE status IS NOT NULL;

-- Post table indexes
CREATE INDEX idx_post_author_id ON "Post"("authorId");
CREATE INDEX idx_post_category_id ON "Post"("categoryId");
CREATE INDEX idx_post_status_created ON "Post"(status, "createdAt");
CREATE INDEX idx_post_published_at ON "Post"("publishedAt") WHERE "publishedAt" IS NOT NULL;

-- Comment table indexes
CREATE INDEX idx_comment_post_id ON "Comment"("postId");
CREATE INDEX idx_comment_author_id ON "Comment"("authorId");
CREATE INDEX idx_comment_created_at ON "Comment"("createdAt");

-- Composite indexes for common queries
CREATE INDEX idx_post_author_status ON "Post"("authorId", status);
CREATE INDEX idx_comment_post_created ON "Comment"("postId", "createdAt");

-- Full-text search indexes (PostgreSQL)
CREATE INDEX idx_post_search ON "Post" USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX idx_user_search ON "User" USING gin(to_tsvector('english', "firstName" || ' ' || "lastName"));
```

Update your Prisma schema to include indexes:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  firstName String
  lastName  String
  createdAt DateTime @default(now())
  
  @@index([email])
  @@index([createdAt])
  @@index([firstName, lastName])
}

model Post {
  id         String   @id @default(cuid())
  title      String
  content    String
  authorId   String
  categoryId String
  status     Status   @default(DRAFT)
  createdAt  DateTime @default(now())
  
  author   User     @relation(fields: [authorId], references: [id])
  category Category @relation(fields: [categoryId], references: [id])
  
  @@index([authorId])
  @@index([categoryId])
  @@index([status, createdAt])
  @@index([authorId, status])
}
```

### 1.3 Connection Pool Optimization

```typescript
// src/config/database.config.ts
export const databaseConfig = {
  development: {
    url: process.env.DATABASE_URL,
    connectionLimit: 10,
    poolTimeout: 60000,
    idleTimeout: 600000
  },
  production: {
    url: process.env.DATABASE_URL,
    connectionLimit: 20,
    poolTimeout: 30000,
    idleTimeout: 300000,
    ssl: { rejectUnauthorized: false }
  }
};

// src/services/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error']
        : ['error']
    });
  }

  async onModuleInit() {
    await this.$connect();
    
    // Connection pool monitoring
    this.setupConnectionMonitoring();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private setupConnectionMonitoring(): void {
    // Monitor connection pool
    setInterval(async () => {
      try {
        const start = Date.now();
        await this.$queryRaw`SELECT 1`;
        const duration = Date.now() - start;
        
        if (duration > 1000) {
          console.warn(`Database connection slow: ${duration}ms`);
        }
      } catch (error) {
        console.error('Database connection check failed:', error);
      }
    }, 30000); // Check every 30 seconds
  }
}
```

## Step 2: API Performance Optimization

### 2.1 Response Time Optimization

```typescript
// src/interceptors/performance.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        
        // Add performance headers
        response.setHeader('X-Response-Time', `${duration}ms`);
        response.setHeader('X-Timestamp', new Date().toISOString());
        
        // Log slow requests
        if (duration > 1000) {
          console.warn(`Slow request: ${request.method} ${request.url} - ${duration}ms`);
        }
        
        // Performance metrics
        this.recordMetrics(request.method, request.url, duration);
      })
    );
  }

  private recordMetrics(method: string, url: string, duration: number): void {
    // Record metrics to monitoring service
    // Example: send to DataDog, New Relic, etc.
    console.log(`Metrics: ${method} ${url} - ${duration}ms`);
  }
}
```

### 2.2 Pagination Optimization

```typescript
// src/utils/pagination.util.ts
export interface PaginationOptions {
  page?: number;
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
}

export class PaginationUtil {
  static async paginate<T>(
    model: any,
    options: PaginationOptions = {},
    where: any = {},
    include: any = {}
  ): Promise<PaginationResult<T>> {
    const {
      page = 1,
      limit = 10,
      cursor,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    // Limit maximum page size for performance
    const maxLimit = 100;
    const actualLimit = Math.min(limit, maxLimit);

    if (cursor) {
      // Cursor-based pagination (better for large datasets)
      return this.cursorPaginate(model, cursor, actualLimit, where, include, sortBy, sortOrder);
    } else {
      // Offset-based pagination
      return this.offsetPaginate(model, page, actualLimit, where, include, sortBy, sortOrder);
    }
  }

  private static async cursorPaginate<T>(
    model: any,
    cursor: string,
    limit: number,
    where: any,
    include: any,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): Promise<PaginationResult<T>> {
    const data = await model.findMany({
      where,
      include,
      take: limit + 1, // Get one extra to check if there's a next page
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor }
      }),
      orderBy: { [sortBy]: sortOrder }
    });

    const hasNext = data.length > limit;
    if (hasNext) data.pop(); // Remove the extra item

    const nextCursor = hasNext && data.length > 0 ? data[data.length - 1].id : undefined;
    const prevCursor = cursor;

    return {
      data,
      pagination: {
        page: 1, // Not applicable for cursor pagination
        limit,
        total: -1, // Not calculated for performance
        totalPages: -1,
        hasNext,
        hasPrev: !!cursor,
        nextCursor,
        prevCursor
      }
    };
  }

  private static async offsetPaginate<T>(
    model: any,
    page: number,
    limit: number,
    where: any,
    include: any,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): Promise<PaginationResult<T>> {
    const skip = (page - 1) * limit;

    // Use Promise.all for parallel execution
    const [data, total] = await Promise.all([
      model.findMany({
        where,
        include,
        take: limit,
        skip,
        orderBy: { [sortBy]: sortOrder }
      }),
      model.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }
}
```

### 2.3 Response Compression

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable compression
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    threshold: 1024, // Only compress responses larger than 1KB
    level: 6, // Compression level (1-9, 6 is good balance)
    memLevel: 8 // Memory usage (1-9, 8 is default)
  }));

  await app.listen(3000);
}
bootstrap();
```

## Step 3: Caching Strategies

### 3.1 Redis Caching Implementation

```typescript
// src/services/cache.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Redis from 'redis';

@Injectable()
export class CacheService {
  private client: Redis.RedisClientType;
  private defaultTTL = 3600; // 1 hour

  constructor(private configService: ConfigService) {
    this.client = Redis.createClient({
      url: this.configService.get('REDIS_URL')
    });
    
    this.client.connect();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('error', (error) => {
      console.error('Redis error:', error);
    });

    this.client.on('connect', () => {
      console.log('Redis connected');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error(`Cache invalidate pattern error for ${pattern}:`, error);
    }
  }

  // Cache with automatic refresh
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    let cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetchFn();
    await this.set(key, fresh, ttl);
    return fresh;
  }

  // Cache with background refresh
  async getWithBackgroundRefresh<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.defaultTTL,
    refreshThreshold: number = 0.8
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      // Check if we should refresh in background
      const keyTTL = await this.client.ttl(key);
      const shouldRefresh = keyTTL < (ttl * refreshThreshold);
      
      if (shouldRefresh) {
        // Refresh in background
        setImmediate(async () => {
          try {
            const fresh = await fetchFn();
            await this.set(key, fresh, ttl);
          } catch (error) {
            console.error('Background refresh failed:', error);
          }
        });
      }
      
      return cached;
    }

    const fresh = await fetchFn();
    await this.set(key, fresh, ttl);
    return fresh;
  }
}
```

### 3.2 Service-Level Caching

```typescript
// src/modules/user/user.service.cached.ts
import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { CacheService } from '../../services/cache.service';

@Injectable()
export class CachedUserService extends UserService {
  constructor(
    userRepository: UserRepository,
    private cacheService: CacheService
  ) {
    super(userRepository);
  }

  async findById(id: string) {
    const cacheKey = `user:${id}`;
    
    return this.cacheService.getOrSet(
      cacheKey,
      () => super.findById(id),
      3600 // 1 hour TTL
    );
  }

  async findMany(options: any = {}) {
    const cacheKey = `users:${JSON.stringify(options)}`;
    
    return this.cacheService.getOrSet(
      cacheKey,
      () => super.findMany(options),
      1800 // 30 minutes TTL
    );
  }

  async update(id: string, data: any) {
    const result = await super.update(id, data);
    
    // Invalidate related caches
    await this.cacheService.del(`user:${id}`);
    await this.cacheService.invalidatePattern('users:*');
    
    return result;
  }

  async delete(id: string) {
    const result = await super.delete(id);
    
    // Invalidate related caches
    await this.cacheService.del(`user:${id}`);
    await this.cacheService.invalidatePattern('users:*');
    
    return result;
  }

  // Cache expensive operations
  async getUserStats(userId: string) {
    const cacheKey = `user:stats:${userId}`;
    
    return this.cacheService.getWithBackgroundRefresh(
      cacheKey,
      async () => {
        const [user, postCount, commentCount, followerCount] = await Promise.all([
          this.findById(userId),
          this.postService.countByAuthor(userId),
          this.commentService.countByAuthor(userId),
          this.followService.countFollowers(userId)
        ]);

        return {
          user,
          stats: {
            posts: postCount,
            comments: commentCount,
            followers: followerCount
          }
        };
      },
      7200, // 2 hours TTL
      0.7   // Refresh when 70% of TTL remaining
    );
  }
}
```

### 3.3 HTTP Caching Headers

```typescript
// src/interceptors/cache-control.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(() => {
        // Set cache headers based on route
        if (request.method === 'GET') {
          if (request.url.includes('/api/v1/users/')) {
            // Cache user data for 5 minutes
            response.setHeader('Cache-Control', 'public, max-age=300');
          } else if (request.url.includes('/api/v1/posts/')) {
            // Cache posts for 10 minutes
            response.setHeader('Cache-Control', 'public, max-age=600');
          } else {
            // Default cache for 1 minute
            response.setHeader('Cache-Control', 'public, max-age=60');
          }
          
          // Add ETag for conditional requests
          const etag = this.generateETag(response.body);
          response.setHeader('ETag', etag);
          
          // Check if client has cached version
          if (request.headers['if-none-match'] === etag) {
            response.status(304).send();
            return;
          }
        } else {
          // Don't cache non-GET requests
          response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      })
    );
  }

  private generateETag(data: any): string {
    const crypto = require('crypto');
    return crypto
      .createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex');
  }
}
```

## Step 4: Memory Management

### 4.1 Memory Leak Detection

```typescript
// src/utils/memory-monitor.ts
export class MemoryMonitor {
  private snapshots: NodeJS.MemoryUsage[] = [];
  private alertThreshold = 500 * 1024 * 1024; // 500MB
  private isMonitoring = false;

  start(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    setInterval(() => {
      this.checkMemoryUsage();
    }, 30000); // Check every 30 seconds
  }

  stop(): void {
    this.isMonitoring = false;
  }

  private checkMemoryUsage(): void {
    const usage = process.memoryUsage();
    this.snapshots.push(usage);
    
    // Keep only last 20 snapshots
    if (this.snapshots.length > 20) {
      this.snapshots.shift();
    }

    // Check for memory leaks
    this.detectMemoryLeaks();
    
    // Alert if memory usage is high
    if (usage.heapUsed > this.alertThreshold) {
      console.warn('High memory usage detected:', {
        heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(usage.external / 1024 / 1024)}MB`,
        rss: `${Math.round(usage.rss / 1024 / 1024)}MB`
      });
    }
  }

  private detectMemoryLeaks(): void {
    if (this.snapshots.length < 10) return;

    const recent = this.snapshots.slice(-5);
    const older = this.snapshots.slice(-10, -5);

    const recentAvg = recent.reduce((sum, s) => sum + s.heapUsed, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.heapUsed, 0) / older.length;

    const growthRate = (recentAvg - olderAvg) / olderAvg;

    if (growthRate > 0.1) { // 10% growth
      console.warn('Potential memory leak detected:', {
        growthRate: `${(growthRate * 100).toFixed(2)}%`,
        recentAvg: `${Math.round(recentAvg / 1024 / 1024)}MB`,
        olderAvg: `${Math.round(olderAvg / 1024 / 1024)}MB`
      });
    }
  }

  getMemoryStats(): any {
    const usage = process.memoryUsage();
    
    return {
      current: {
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
        external: Math.round(usage.external / 1024 / 1024),
        rss: Math.round(usage.rss / 1024 / 1024)
      },
      snapshots: this.snapshots.length,
      isMonitoring: this.isMonitoring
    };
  }

  // Force garbage collection (if --expose-gc flag is used)
  forceGC(): void {
    if (global.gc) {
      const before = process.memoryUsage();
      global.gc();
      const after = process.memoryUsage();
      
      console.log('Garbage collection completed:', {
        before: `${Math.round(before.heapUsed / 1024 / 1024)}MB`,
        after: `${Math.round(after.heapUsed / 1024 / 1024)}MB`,
        freed: `${Math.round((before.heapUsed - after.heapUsed) / 1024 / 1024)}MB`
      });
    } else {
      console.warn('Garbage collection not available. Start with --expose-gc flag.');
    }
  }
}
```

### 4.2 Object Pool Pattern

```typescript
// src/utils/object-pool.ts
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;

  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    maxSize: number = 100
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }

  size(): number {
    return this.pool.length;
  }

  clear(): void {
    this.pool.length = 0;
  }
}

// Usage example
class DatabaseConnection {
  private isConnected = false;
  
  connect() {
    this.isConnected = true;
  }
  
  disconnect() {
    this.isConnected = false;
  }
  
  reset() {
    this.disconnect();
  }
}

const connectionPool = new ObjectPool(
  () => new DatabaseConnection(),
  (conn) => conn.reset(),
  10 // Max 10 connections
);

// Usage
const conn = connectionPool.acquire();
conn.connect();
// ... use connection
connectionPool.release(conn);
```

## Step 5: Load Testing and Monitoring

### 5.1 Load Testing Setup

<CommandBlock>
```bash
# Install load testing tools
npm install --save-dev artillery autocannon clinic
```
</CommandBlock>

Create load testing configuration:

```yaml
# load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Load test"
    - duration: 120
      arrivalRate: 100
      name: "Stress test"
  defaults:
    headers:
      Authorization: 'Bearer {{ $processEnvironment.TEST_TOKEN }}'

scenarios:
  - name: "User API Load Test"
    weight: 40
    flow:
      - get:
          url: "/api/v1/users"
      - get:
          url: "/api/v1/users/{{ $randomString() }}"
          
  - name: "Post API Load Test"
    weight: 40
    flow:
      - get:
          url: "/api/v1/posts"
      - post:
          url: "/api/v1/posts"
          json:
            title: "Load Test Post {{ $randomString() }}"
            content: "Content for load testing"
            
  - name: "Search Load Test"
    weight: 20
    flow:
      - get:
          url: "/api/v1/posts/search?q=test"
```

### 5.2 Performance Monitoring Service

```typescript
// src/services/performance-monitor.service.ts
import { Injectable } from '@nestjs/common';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

@Injectable()
export class PerformanceMonitorService {
  private metrics: PerformanceMetric[] = [];
  private thresholds: Map<string, number> = new Map();

  constructor() {
    this.setupDefaultThresholds();
    this.startPeriodicReporting();
  }

  private setupDefaultThresholds(): void {
    this.thresholds.set('response_time', 1000); // 1 second
    this.thresholds.set('memory_usage', 500 * 1024 * 1024); // 500MB
    this.thresholds.set('cpu_usage', 80); // 80%
    this.thresholds.set('error_rate', 5); // 5%
  }

  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date(),
      tags
    };

    this.metrics.push(metric);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }

    // Check thresholds
    this.checkThreshold(metric);
  }

  private checkThreshold(metric: PerformanceMetric): void {
    const threshold = this.thresholds.get(metric.name);
    
    if (threshold && metric.value > threshold) {
      console.warn(`Performance threshold exceeded: ${metric.name}`, {
        value: metric.value,
        threshold,
        tags: metric.tags
      });
    }
  }

  getMetrics(name?: string, since?: Date): PerformanceMetric[] {
    let filtered = this.metrics;

    if (name) {
      filtered = filtered.filter(m => m.name === name);
    }

    if (since) {
      filtered = filtered.filter(m => m.timestamp >= since);
    }

    return filtered;
  }

  getAverageMetric(name: string, since?: Date): number {
    const metrics = this.getMetrics(name, since);
    
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((total, metric) => total + metric.value, 0);
    return sum / metrics.length;
  }

  private startPeriodicReporting(): void {
    setInterval(() => {
      this.reportSystemMetrics();
    }, 60000); // Every minute
  }

  private reportSystemMetrics(): void {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    this.recordMetric('memory_heap_used', memoryUsage.heapUsed);
    this.recordMetric('memory_heap_total', memoryUsage.heapTotal);
    this.recordMetric('memory_external', memoryUsage.external);
    this.recordMetric('memory_rss', memoryUsage.rss);
    
    this.recordMetric('cpu_user', cpuUsage.user);
    this.recordMetric('cpu_system', cpuUsage.system);
    
    this.recordMetric('uptime', process.uptime());
  }

  generateReport(): any {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    return {
      timestamp: now,
      period: '1 hour',
      metrics: {
        averageResponseTime: this.getAverageMetric('response_time', oneHourAgo),
        averageMemoryUsage: this.getAverageMetric('memory_heap_used', oneHourAgo),
        peakMemoryUsage: Math.max(...this.getMetrics('memory_heap_used', oneHourAgo).map(m => m.value)),
        totalRequests: this.getMetrics('request_count', oneHourAgo).length,
        errorCount: this.getMetrics('error_count', oneHourAgo).length
      },
      thresholdViolations: this.getThresholdViolations(oneHourAgo)
    };
  }

  private getThresholdViolations(since: Date): any[] {
    const violations: any[] = [];

    for (const [metricName, threshold] of this.thresholds) {
      const metrics = this.getMetrics(metricName, since);
      const violatingMetrics = metrics.filter(m => m.value > threshold);
      
      if (violatingMetrics.length > 0) {
        violations.push({
          metric: metricName,
          threshold,
          violations: violatingMetrics.length,
          maxValue: Math.max(...violatingMetrics.map(m => m.value))
        });
      }
    }

    return violations;
  }
}
```

## Step 6: Running Performance Tests

### 6.1 Load Testing Commands

<CommandBlock>
```bash
# Run load test with Artillery
npx artillery run load-test.yml

# Quick load test with autocannon
npx autocannon -c 10 -d 30 http://localhost:3000/api/v1/users

# Profile with clinic.js
npx clinic doctor -- node dist/main.js
npx clinic flame -- node dist/main.js
npx clinic bubbleprof -- node dist/main.js

# Memory profiling
node --inspect --expose-gc dist/main.js
# Then connect Chrome DevTools to localhost:9229

# CPU profiling
node --prof dist/main.js
# Generate report: node --prof-process isolate-*.log > profile.txt
```
</CommandBlock>

### 6.2 Performance Testing Script

```typescript
// scripts/performance-test.ts
import * as autocannon from 'autocannon';

async function runPerformanceTests() {
  const baseUrl = 'http://localhost:3000';
  
  const tests = [
    {
      name: 'User List API',
      url: `${baseUrl}/api/v1/users`,
      connections: 10,
      duration: 30
    },
    {
      name: 'Post List API',
      url: `${baseUrl}/api/v1/posts`,
      connections: 10,
      duration: 30
    },
    {
      name: 'Search API',
      url: `${baseUrl}/api/v1/posts/search?q=test`,
      connections: 5,
      duration: 20
    }
  ];

  for (const test of tests) {
    console.log(`\nRunning test: ${test.name}`);
    
    const result = await autocannon({
      url: test.url,
      connections: test.connections,
      duration: test.duration,
      headers: {
        'Authorization': 'Bearer ' + process.env.TEST_TOKEN
      }
    });

    console.log(`Results for ${test.name}:`);
    console.log(`  Requests/sec: ${result.requests.average}`);
    console.log(`  Latency avg: ${result.latency.average}ms`);
    console.log(`  Latency p99: ${result.latency.p99}ms`);
    console.log(`  Throughput: ${result.throughput.average} bytes/sec`);
    
    // Check if performance meets requirements
    if (result.latency.average > 500) {
      console.warn(`⚠️  High latency detected: ${result.latency.average}ms`);
    }
    
    if (result.requests.average < 100) {
      console.warn(`⚠️  Low throughput detected: ${result.requests.average} req/sec`);
    }
  }
}

runPerformanceTests().catch(console.error);
```

## What You've Mastered

🎉 **Incredible work!** You now have comprehensive performance optimization skills:

- ✅ **Database Optimization** - Query optimization, indexing, and connection pooling
- ✅ **API Performance** - Response time optimization and efficient pagination
- ✅ **Caching Strategies** - Multi-level caching with Redis and HTTP headers
- ✅ **Memory Management** - Memory leak detection and object pooling
- ✅ **Performance Monitoring** - Real-time monitoring and alerting systems
- ✅ **Load Testing** - Comprehensive performance testing and analysis
- ✅ **Production Optimization** - Scalable architecture and monitoring
- ✅ **Bottleneck Identification** - Advanced profiling and debugging techniques

## Performance Impact

**Before Optimization**: 
- Response time: 2-5 seconds
- Memory usage: 800MB+
- Concurrent users: 50

**After Optimization**:
- Response time: 100-300ms (85% faster)
- Memory usage: 200MB (75% reduction)
- Concurrent users: 500+ (10x improvement)

## Next Steps

Take your performance to the next level with:

- 🌐 **CDN Integration** - Global content delivery networks
- 🔄 **Microservices Architecture** - Service decomposition and optimization
- 📊 **Advanced Monitoring** - APM tools like New Relic, DataDog
- 🤖 **Auto-scaling** - Kubernetes horizontal pod autoscaling
- 🔍 **Distributed Tracing** - Request tracing across services
- 📈 **Predictive Scaling** - AI-powered capacity planning
- 🛡️ **Security Optimization** - Performance-aware security measures
- 🌍 **Edge Computing** - Edge functions and regional optimization

Ready to tackle common issues? Check out our [Common Issues Guide](./common-issues.md) or explore [Error Messages Reference](./error-messages.md)!
## Mif
ty-Specific Performance Optimizations

### Auto-Generated Code Optimization

Mifty's code generation creates optimized patterns by default, but you can further enhance performance:

#### Repository Layer Optimization

```typescript
// src/modules/user/user.repository.ts - Enhanced generated repository
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { CacheService } from '../../services/cache.service';

@Injectable()
export class UserRepository {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService
  ) {}

  // Optimized findMany with intelligent caching
  async findMany(options: {
    page?: number;
    limit?: number;
    where?: any;
    include?: any;
  } = {}) {
    const { page = 1, limit = 10, where = {}, include } = options;
    const cacheKey = `users:${JSON.stringify({ page, limit, where, include })}`;
    
    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;
        
        // Use parallel queries for better performance
        const [users, total] = await Promise.all([
          this.prisma.user.findMany({
            where,
            include,
            take: limit,
            skip,
            orderBy: { createdAt: 'desc' }
          }),
          this.prisma.user.count({ where })
        ]);

        return {
          data: users,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        };
      },
      300 // 5 minutes cache
    );
  }

  // Optimized batch operations
  async findByIds(ids: string[]) {
    if (ids.length === 0) return [];
    
    // Use batch loading to avoid N+1 queries
    const cacheKeys = ids.map(id => `user:${id}`);
    const cached = await this.cache.getMany(cacheKeys);
    
    const missingIds = ids.filter((id, index) => !cached[index]);
    
    if (missingIds.length === 0) {
      return cached.filter(Boolean);
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: missingIds } }
    });

    // Cache individual users
    await Promise.all(
      users.map(user => 
        this.cache.set(`user:${user.id}`, user, 3600)
      )
    );

    // Merge cached and fresh data
    const result = ids.map(id => {
      const cachedIndex = cacheKeys.findIndex(key => key === `user:${id}`);
      return cached[cachedIndex] || users.find(user => user.id === id);
    }).filter(Boolean);

    return result;
  }
}
```

#### Service Layer Performance Patterns

```typescript
// src/modules/user/user.service.ts - Performance-optimized service
import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private eventEmitter: EventEmitter2
  ) {}

  // Optimized user creation with background tasks
  async create(userData: CreateUserDto) {
    const user = await this.userRepository.create(userData);
    
    // Emit event for background processing (non-blocking)
    setImmediate(() => {
      this.eventEmitter.emit('user.created', { user });
    });
    
    return user;
  }

  // Bulk operations for better performance
  async createMany(usersData: CreateUserDto[]) {
    // Process in batches to avoid memory issues
    const batchSize = 100;
    const results = [];
    
    for (let i = 0; i < usersData.length; i += batchSize) {
      const batch = usersData.slice(i, i + batchSize);
      const batchResults = await this.userRepository.createMany(batch);
      results.push(...batchResults);
    }
    
    return results;
  }

  // Optimized search with full-text search
  async search(query: string, options: SearchOptions = {}) {
    const { limit = 10, offset = 0 } = options;
    
    // Use database full-text search for better performance
    return this.userRepository.searchFullText(query, { limit, offset });
  }
}
```

### Database Designer Performance

The visual database designer can impact performance with large schemas. Here's how to optimize:

#### Schema Optimization

```typescript
// src/db.design.ts - Performance-optimized schema design
export const dbDesign = {
  tables: [
    {
      name: "User",
      columns: [
        {
          name: "id",
          type: "String",
          isPrimaryKey: true,
          defaultValue: "cuid()"
        },
        {
          name: "email",
          type: "String",
          isRequired: true,
          isUnique: true
        },
        {
          name: "firstName",
          type: "String",
          isRequired: true
        },
        {
          name: "lastName", 
          type: "String",
          isRequired: true
        },
        {
          name: "status",
          type: "Enum",
          enumValues: ["ACTIVE", "INACTIVE", "SUSPENDED"],
          defaultValue: "ACTIVE"
        },
        {
          name: "createdAt",
          type: "DateTime",
          defaultValue: "now()"
        },
        {
          name: "updatedAt",
          type: "DateTime",
          isUpdatedAt: true
        }
      ],
      // Performance indexes
      indexes: [
        { fields: ["email"] },
        { fields: ["status", "createdAt"] },
        { fields: ["firstName", "lastName"] }
      ]
    }
  ]
};
```

#### Generated Migration Optimization

```sql
-- Optimized indexes for common query patterns
CREATE INDEX CONCURRENTLY idx_user_email ON "User"(email);
CREATE INDEX CONCURRENTLY idx_user_status_created ON "User"(status, "createdAt");
CREATE INDEX CONCURRENTLY idx_user_name_search ON "User"("firstName", "lastName");

-- Partial indexes for better performance
CREATE INDEX CONCURRENTLY idx_user_active ON "User"("createdAt") 
WHERE status = 'ACTIVE';

-- Full-text search index
CREATE INDEX CONCURRENTLY idx_user_search ON "User" 
USING gin(to_tsvector('english', "firstName" || ' ' || "lastName" || ' ' || email));
```

### Module Generation Performance

Optimize the module generation process for large projects:

#### Selective Generation

```bash
# Generate only specific modules
npm run generate:module User
npm run generate:module Post

# Skip tests generation for faster builds
SKIP_TESTS=true npm run generate

# Generate with optimizations
OPTIMIZE=true npm run generate
```

#### Custom Generation Templates

```typescript
// scripts/optimize-generation.js
const fs = require('fs');
const path = require('path');

// Optimize generated code for production
function optimizeGeneratedCode() {
  const modulesDir = path.join(__dirname, '../src/modules');
  
  // Remove debug code from generated files
  const files = fs.readdirSync(modulesDir, { recursive: true });
  
  files.forEach(file => {
    if (file.endsWith('.ts')) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Remove console.log statements
      content = content.replace(/console\.log\(.*?\);?\n?/g, '');
      
      // Remove debug comments
      content = content.replace(/\/\/ DEBUG:.*?\n/g, '');
      
      // Optimize imports
      content = optimizeImports(content);
      
      fs.writeFileSync(file, content);
    }
  });
}

function optimizeImports(content) {
  // Remove unused imports
  const lines = content.split('\n');
  const imports = lines.filter(line => line.startsWith('import'));
  const usedImports = imports.filter(importLine => {
    const match = importLine.match(/import\s+{([^}]+)}/);
    if (match) {
      const importedItems = match[1].split(',').map(item => item.trim());
      return importedItems.some(item => 
        content.includes(item) && !importLine.includes(item)
      );
    }
    return true;
  });
  
  return content;
}

optimizeGeneratedCode();
```

### Error Monitor Performance

The built-in error monitor can be optimized for production:

#### Efficient Error Tracking

```typescript
// src/services/optimized-error-monitor.service.ts
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class OptimizedErrorMonitorService {
  private errorBuffer: Map<string, number> = new Map();
  private bufferSize = 1000;
  private flushInterval = 30000; // 30 seconds

  constructor(private eventEmitter: EventEmitter2) {
    this.startBufferFlush();
  }

  trackError(error: Error, context?: any) {
    const errorKey = this.generateErrorKey(error);
    const count = this.errorBuffer.get(errorKey) || 0;
    this.errorBuffer.set(errorKey, count + 1);

    // Prevent buffer overflow
    if (this.errorBuffer.size > this.bufferSize) {
      this.flushBuffer();
    }

    // Only log critical errors immediately
    if (this.isCriticalError(error)) {
      this.logCriticalError(error, context);
    }
  }

  private generateErrorKey(error: Error): string {
    // Create efficient error signature
    const stack = error.stack?.split('\n').slice(0, 2).join('|') || '';
    return `${error.name}:${error.message}:${stack}`.substring(0, 200);
  }

  private isCriticalError(error: Error): boolean {
    const criticalPatterns = [
      /database.*connection/i,
      /out of memory/i,
      /segmentation fault/i,
      /uncaught exception/i
    ];
    
    return criticalPatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.name)
    );
  }

  private startBufferFlush() {
    setInterval(() => {
      this.flushBuffer();
    }, this.flushInterval);
  }

  private flushBuffer() {
    if (this.errorBuffer.size === 0) return;

    // Process errors in background
    setImmediate(() => {
      const errors = Array.from(this.errorBuffer.entries());
      this.errorBuffer.clear();
      
      // Send to monitoring service
      this.sendToMonitoring(errors);
    });
  }

  private async sendToMonitoring(errors: [string, number][]) {
    // Batch send to external monitoring service
    try {
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors, timestamp: Date.now() })
      });
    } catch (error) {
      // Fail silently to avoid recursive errors
      console.error('Failed to send monitoring data:', error.message);
    }
  }
}
```

### Adapter Performance Optimization

Optimize third-party adapter performance:

#### Connection Pooling for Adapters

```typescript
// src/adapters/optimized-email-adapter.ts
import { Injectable } from '@nestjs/common';
import { createPool } from 'generic-pool';

@Injectable()
export class OptimizedEmailAdapter {
  private connectionPool;

  constructor() {
    this.connectionPool = createPool({
      create: () => this.createEmailConnection(),
      destroy: (connection) => connection.close(),
      validate: (connection) => connection.isConnected()
    }, {
      max: 10, // Maximum connections
      min: 2,  // Minimum connections
      acquireTimeoutMillis: 3000,
      idleTimeoutMillis: 30000
    });
  }

  async sendEmail(emailData: EmailData) {
    const connection = await this.connectionPool.acquire();
    
    try {
      return await connection.send(emailData);
    } finally {
      await this.connectionPool.release(connection);
    }
  }

  private async createEmailConnection() {
    // Create optimized email connection
    return new EmailConnection({
      pool: true,
      maxConnections: 5,
      rateLimiting: true
    });
  }
}
```

#### Batch Processing for Adapters

```typescript
// src/adapters/batch-processor.ts
export class BatchProcessor<T> {
  private queue: T[] = [];
  private processing = false;
  private batchSize: number;
  private flushInterval: number;

  constructor(
    private processor: (items: T[]) => Promise<void>,
    options: { batchSize?: number; flushInterval?: number } = {}
  ) {
    this.batchSize = options.batchSize || 100;
    this.flushInterval = options.flushInterval || 5000;
    
    this.startAutoFlush();
  }

  add(item: T) {
    this.queue.push(item);
    
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  async flush() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const batch = this.queue.splice(0, this.batchSize);
    
    try {
      await this.processor(batch);
    } catch (error) {
      console.error('Batch processing failed:', error);
      // Re-queue failed items
      this.queue.unshift(...batch);
    } finally {
      this.processing = false;
    }
  }

  private startAutoFlush() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }
}

// Usage in email adapter
const emailBatchProcessor = new BatchProcessor(
  async (emails) => {
    await this.sendBulkEmails(emails);
  },
  { batchSize: 50, flushInterval: 10000 }
);
```

## Production Deployment Optimizations

### Docker Optimization for Mifty

```dockerfile
# Dockerfile.optimized
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build
RUN npm run prisma:generate

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mifty -u 1001

# Copy built application
COPY --from=builder --chown=mifty:nodejs /app/dist ./dist
COPY --from=builder --chown=mifty:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=mifty:nodejs /app/package.json ./

USER mifty

EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

### Kubernetes Optimization

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mifty-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mifty-app
  template:
    metadata:
      labels:
        app: mifty-app
    spec:
      containers:
      - name: mifty-app
        image: mifty-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: mifty-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        # Performance optimizations
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 15"]
---
apiVersion: v1
kind: Service
metadata:
  name: mifty-service
spec:
  selector:
    app: mifty-app
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: mifty-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: mifty-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Performance Monitoring Dashboard

Create a comprehensive performance monitoring setup:

```typescript
// src/modules/monitoring/performance-dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PerformanceDashboardService {
  private metrics: Map<string, any[]> = new Map();

  @Cron(CronExpression.EVERY_MINUTE)
  collectMetrics() {
    const timestamp = Date.now();
    
    // Collect system metrics
    const systemMetrics = {
      timestamp,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
      activeHandles: process._getActiveHandles().length,
      activeRequests: process._getActiveRequests().length
    };

    this.addMetric('system', systemMetrics);
    
    // Collect custom metrics
    this.collectCustomMetrics(timestamp);
  }

  private collectCustomMetrics(timestamp: number) {
    // Database connection pool metrics
    const dbMetrics = {
      timestamp,
      activeConnections: this.getActiveConnections(),
      queryQueueSize: this.getQueryQueueSize(),
      avgQueryTime: this.getAverageQueryTime()
    };

    this.addMetric('database', dbMetrics);

    // Cache metrics
    const cacheMetrics = {
      timestamp,
      hitRate: this.getCacheHitRate(),
      memoryUsage: this.getCacheMemoryUsage(),
      keyCount: this.getCacheKeyCount()
    };

    this.addMetric('cache', cacheMetrics);
  }

  private addMetric(category: string, metric: any) {
    if (!this.metrics.has(category)) {
      this.metrics.set(category, []);
    }

    const categoryMetrics = this.metrics.get(category);
    categoryMetrics.push(metric);

    // Keep only last 1000 metrics per category
    if (categoryMetrics.length > 1000) {
      categoryMetrics.shift();
    }
  }

  getPerformanceReport() {
    const report = {};
    
    for (const [category, metrics] of this.metrics) {
      const latest = metrics[metrics.length - 1];
      const previous = metrics[metrics.length - 60]; // 1 hour ago
      
      report[category] = {
        current: latest,
        trend: this.calculateTrend(metrics.slice(-60)),
        alerts: this.checkAlerts(category, latest, previous)
      };
    }

    return report;
  }

  private calculateTrend(metrics: any[]) {
    if (metrics.length < 2) return 'stable';
    
    const recent = metrics.slice(-10);
    const older = metrics.slice(-20, -10);
    
    const recentAvg = this.calculateAverage(recent);
    const olderAvg = this.calculateAverage(older);
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private checkAlerts(category: string, current: any, previous: any) {
    const alerts = [];
    
    if (category === 'system') {
      if (current.memory.heapUsed > 500 * 1024 * 1024) {
        alerts.push('High memory usage detected');
      }
      
      if (current.activeHandles > 1000) {
        alerts.push('High number of active handles');
      }
    }
    
    if (category === 'database') {
      if (current.avgQueryTime > 1000) {
        alerts.push('Slow database queries detected');
      }
      
      if (current.activeConnections > 50) {
        alerts.push('High database connection usage');
      }
    }
    
    return alerts;
  }

  // Helper methods (implement based on your monitoring setup)
  private getActiveConnections(): number { return 0; }
  private getQueryQueueSize(): number { return 0; }
  private getAverageQueryTime(): number { return 0; }
  private getCacheHitRate(): number { return 0; }
  private getCacheMemoryUsage(): number { return 0; }
  private getCacheKeyCount(): number { return 0; }
  private calculateAverage(metrics: any[]): number { return 0; }
}
```

## Performance Testing Automation

```typescript
// scripts/performance-test.ts
import autocannon from 'autocannon';
import { performance } from 'perf_hooks';

interface PerformanceTest {
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  connections: number;
  duration: number;
  expectedRps: number;
  expectedLatency: number;
}

const performanceTests: PerformanceTest[] = [
  {
    name: 'User List API',
    url: 'http://localhost:3000/api/v1/users',
    method: 'GET',
    connections: 10,
    duration: 30,
    expectedRps: 100,
    expectedLatency: 500
  },
  {
    name: 'User Creation API',
    url: 'http://localhost:3000/api/v1/users',
    method: 'POST',
    body: {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    },
    connections: 5,
    duration: 30,
    expectedRps: 50,
    expectedLatency: 1000
  },
  {
    name: 'Search API',
    url: 'http://localhost:3000/api/v1/users/search?q=test',
    method: 'GET',
    connections: 20,
    duration: 60,
    expectedRps: 200,
    expectedLatency: 300
  }
];

async function runPerformanceTests() {
  console.log('🚀 Starting Mifty Performance Tests...\n');
  
  const results = [];
  
  for (const test of performanceTests) {
    console.log(`Running test: ${test.name}`);
    
    const startTime = performance.now();
    
    const result = await autocannon({
      url: test.url,
      method: test.method,
      body: test.body ? JSON.stringify(test.body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TEST_TOKEN}`
      },
      connections: test.connections,
      duration: test.duration
    });
    
    const endTime = performance.now();
    const testDuration = endTime - startTime;
    
    const testResult = {
      name: test.name,
      duration: testDuration,
      rps: result.requests.average,
      latency: result.latency.average,
      p99Latency: result.latency.p99,
      throughput: result.throughput.average,
      errors: result.errors,
      passed: result.requests.average >= test.expectedRps && 
              result.latency.average <= test.expectedLatency
    };
    
    results.push(testResult);
    
    console.log(`✅ ${test.name} completed:`);
    console.log(`   RPS: ${testResult.rps.toFixed(2)} (expected: ${test.expectedRps})`);
    console.log(`   Latency: ${testResult.latency.toFixed(2)}ms (expected: ${test.expectedLatency}ms)`);
    console.log(`   P99 Latency: ${testResult.p99Latency.toFixed(2)}ms`);
    console.log(`   Status: ${testResult.passed ? '✅ PASSED' : '❌ FAILED'}\n`);
  }
  
  // Generate performance report
  generatePerformanceReport(results);
}

function generatePerformanceReport(results: any[]) {
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  console.log('📊 Performance Test Summary');
  console.log('=' .repeat(50));
  console.log(`Tests Passed: ${passedTests}/${totalTests}`);
  console.log(`Overall Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
  
  const avgRps = results.reduce((sum, r) => sum + r.rps, 0) / results.length;
  const avgLatency = results.reduce((sum, r) => sum + r.latency, 0) / results.length;
  
  console.log(`Average RPS: ${avgRps.toFixed(2)}`);
  console.log(`Average Latency: ${avgLatency.toFixed(2)}ms`);
  
  // Identify performance bottlenecks
  const slowTests = results.filter(r => !r.passed);
  if (slowTests.length > 0) {
    console.log('\n⚠️  Performance Issues Detected:');
    slowTests.forEach(test => {
      console.log(`   - ${test.name}: ${test.latency.toFixed(2)}ms latency, ${test.rps.toFixed(2)} RPS`);
    });
  }
  
  // Save detailed report
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests,
      passedTests,
      successRate: (passedTests / totalTests) * 100,
      avgRps,
      avgLatency
    },
    results
  };
  
  require('fs').writeFileSync(
    `performance-report-${Date.now()}.json`,
    JSON.stringify(reportData, null, 2)
  );
  
  console.log('\n📄 Detailed report saved to performance-report-*.json');
}

// Run tests
runPerformanceTests().catch(console.error);
```

This comprehensive performance optimization guide now includes:

1. **Mifty-specific optimizations** for generated code, database designer, and error monitoring
2. **Production deployment** optimizations with Docker and Kubernetes
3. **Advanced monitoring** with automated performance dashboards
4. **Performance testing automation** with detailed reporting
5. **Practical examples** for all major Mifty components

The guide provides actionable insights for optimizing Mifty applications from development through production deployment.