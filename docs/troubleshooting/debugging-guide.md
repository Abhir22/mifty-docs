# Advanced Debugging Guide for Mifty Applications

Master debugging techniques for Mifty applications, from basic console debugging to advanced profiling and production monitoring.

## What You'll Learn

This comprehensive guide covers:

- 🐛 **Basic Debugging** - Console logging and breakpoint debugging
- 🔍 **Advanced Debugging** - VS Code debugging and remote debugging
- 📊 **Performance Profiling** - Memory leaks and CPU profiling
- 🚨 **Error Monitoring** - Production error tracking and alerting
- 🔧 **Database Debugging** - Query optimization and connection issues
- 🌐 **API Debugging** - Request/response debugging and network issues
- 🧪 **Test Debugging** - Debugging failing tests and test environments
- 📱 **Production Debugging** - Live debugging and monitoring techniques

## Step 1: Basic Debugging Techniques

### 1.1 Console Logging Best Practices

Mifty includes structured logging out of the box:

```typescript
// src/services/logger.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService extends Logger {
  
  // Debug level - development only
  debug(message: string, context?: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      super.debug(`${message} ${data ? JSON.stringify(data) : ''}`, context);
    }
  }

  // Info level - general information
  info(message: string, context?: string, data?: any) {
    super.log(`${message} ${data ? JSON.stringify(data) : ''}`, context);
  }

  // Warning level - potential issues
  warn(message: string, context?: string, data?: any) {
    super.warn(`${message} ${data ? JSON.stringify(data) : ''}`, context);
  }

  // Error level - actual errors
  error(message: string, trace?: string, context?: string, data?: any) {
    super.error(`${message} ${data ? JSON.stringify(data) : ''}`, trace, context);
  }

  // Performance logging
  performance(operation: string, duration: number, context?: string) {
    const level = duration > 1000 ? 'warn' : 'log';
    this[level](`Performance: ${operation} took ${duration}ms`, context);
  }
}
```

### 1.2 Using the Logger in Your Code

```typescript
// src/modules/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../services/logger.service';

@Injectable()
export class UserService {
  constructor(private logger: LoggerService) {}

  async create(userData: CreateUserDto) {
    this.logger.debug('Creating new user', 'UserService', { email: userData.email });
    
    try {
      const startTime = Date.now();
      
      // Check if user exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        this.logger.warn('Attempt to create user with existing email', 'UserService', { 
          email: userData.email 
        });
        throw new Error('User already exists');
      }

      // Create user
      const user = await this.userRepository.create(userData);
      
      const duration = Date.now() - startTime;
      this.logger.performance('User creation', duration, 'UserService');
      this.logger.info('User created successfully', 'UserService', { 
        userId: user.id, 
        email: user.email 
      });

      return user;

    } catch (error) {
      this.logger.error(
        'Failed to create user', 
        error.stack, 
        'UserService', 
        { email: userData.email, error: error.message }
      );
      throw error;
    }
  }
}
```

### 1.3 Environment-Based Logging

Configure different log levels for different environments:

```typescript
// src/config/logger.config.ts
export const loggerConfig = {
  development: {
    level: 'debug',
    format: 'pretty',
    timestamp: true
  },
  test: {
    level: 'error',
    format: 'json',
    timestamp: false
  },
  production: {
    level: 'info',
    format: 'json',
    timestamp: true,
    file: './logs/app.log'
  }
};
```

## Step 2: VS Code Debugging Setup

### 2.1 Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Mifty App",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/main.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development",
        "DATABASE_URL": "postgresql://postgres:password@localhost:5432/mifty_dev"
      },
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "env": {
        "NODE_ENV": "test"
      }
    },
    {
      "name": "Debug Current Test File",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache", "${relativeFile}"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Attach to Process",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "restart": true,
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "/app"
    }
  ]
}
```

### 2.2 Debug-Friendly npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "debug": "node --inspect-brk=0.0.0.0:9229 -r ts-node/register src/main.ts",
    "debug:test": "node --inspect-brk node_modules/.bin/jest --runInBand",
    "debug:watch": "nodemon --inspect=0.0.0.0:9229 -r ts-node/register src/main.ts"
  }
}
```

### 2.3 Debugging Techniques

#### Setting Breakpoints

```typescript
// src/modules/user/user.service.ts
export class UserService {
  async findById(id: string) {
    // Set breakpoint here to inspect variables
    debugger; // This will trigger debugger when debugging
    
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      // Another good breakpoint location
      throw new Error('User not found');
    }
    
    return user;
  }
}
```

#### Conditional Breakpoints

```typescript
// Only break when specific condition is met
export class PostService {
  async create(postData: CreatePostDto) {
    const post = await this.postRepository.create(postData);
    
    // Conditional breakpoint: post.authorId === 'specific-user-id'
    return post;
  }
}
```

## Step 3: Performance Profiling

### 3.1 Memory Profiling

Create memory profiling utilities:

```typescript
// src/utils/memory-profiler.ts
export class MemoryProfiler {
  private snapshots: Map<string, NodeJS.MemoryUsage> = new Map();

  takeSnapshot(label: string): void {
    this.snapshots.set(label, process.memoryUsage());
    console.log(`Memory snapshot '${label}':`, this.formatMemory(process.memoryUsage()));
  }

  compareSnapshots(label1: string, label2: string): void {
    const snapshot1 = this.snapshots.get(label1);
    const snapshot2 = this.snapshots.get(label2);

    if (!snapshot1 || !snapshot2) {
      console.error('One or both snapshots not found');
      return;
    }

    const diff = {
      rss: snapshot2.rss - snapshot1.rss,
      heapTotal: snapshot2.heapTotal - snapshot1.heapTotal,
      heapUsed: snapshot2.heapUsed - snapshot1.heapUsed,
      external: snapshot2.external - snapshot1.external
    };

    console.log(`Memory diff between '${label1}' and '${label2}':`, this.formatMemory(diff));
  }

  private formatMemory(memory: NodeJS.MemoryUsage | any): string {
    return Object.entries(memory)
      .map(([key, value]) => `${key}: ${Math.round(value / 1024 / 1024 * 100) / 100} MB`)
      .join(', ');
  }

  // Detect potential memory leaks
  detectLeaks(): void {
    const usage = process.memoryUsage();
    const threshold = 500 * 1024 * 1024; // 500MB

    if (usage.heapUsed > threshold) {
      console.warn('Potential memory leak detected:', this.formatMemory(usage));
    }
  }
}

// Usage in your service
export class UserService {
  private memoryProfiler = new MemoryProfiler();

  async processLargeDataset(data: any[]) {
    this.memoryProfiler.takeSnapshot('start');
    
    // Process data
    const results = await Promise.all(
      data.map(item => this.processItem(item))
    );
    
    this.memoryProfiler.takeSnapshot('end');
    this.memoryProfiler.compareSnapshots('start', 'end');
    
    return results;
  }
}
```

### 3.2 CPU Profiling

```typescript
// src/utils/cpu-profiler.ts
export class CPUProfiler {
  private startTime: number;
  private startCPU: NodeJS.CpuUsage;

  start(): void {
    this.startTime = Date.now();
    this.startCPU = process.cpuUsage();
  }

  end(operation: string): void {
    const endTime = Date.now();
    const endCPU = process.cpuUsage(this.startCPU);
    
    const duration = endTime - this.startTime;
    const cpuPercent = (endCPU.user + endCPU.system) / 1000 / duration * 100;

    console.log(`CPU Profile for '${operation}':`);
    console.log(`  Duration: ${duration}ms`);
    console.log(`  CPU Usage: ${cpuPercent.toFixed(2)}%`);
    console.log(`  User CPU: ${endCPU.user / 1000}ms`);
    console.log(`  System CPU: ${endCPU.system / 1000}ms`);

    if (cpuPercent > 80) {
      console.warn(`High CPU usage detected for operation: ${operation}`);
    }
  }
}

// Usage
export class DataProcessingService {
  private cpuProfiler = new CPUProfiler();

  async processData(data: any[]) {
    this.cpuProfiler.start();
    
    // CPU-intensive operation
    const result = data.map(item => {
      // Complex processing
      return this.complexCalculation(item);
    });
    
    this.cpuProfiler.end('Data Processing');
    return result;
  }
}
```

### 3.3 Database Query Profiling

```typescript
// src/utils/query-profiler.ts
import { PrismaService } from '../services/prisma.service';

export class QueryProfiler {
  constructor(private prisma: PrismaService) {
    this.setupQueryLogging();
  }

  private setupQueryLogging(): void {
    // Enable Prisma query logging
    this.prisma.$on('query', (e) => {
      const duration = e.duration;
      const query = e.query;
      
      console.log(`Query: ${query}`);
      console.log(`Duration: ${duration}ms`);
      
      if (duration > 100) {
        console.warn(`Slow query detected (${duration}ms):`, query);
      }
    });
  }

  async profileQuery<T>(
    queryName: string, 
    queryFn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    
    try {
      const result = await queryFn();
      const duration = Date.now() - start;
      
      console.log(`Query '${queryName}' completed in ${duration}ms`);
      
      if (duration > 1000) {
        console.warn(`Very slow query: ${queryName} (${duration}ms)`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`Query '${queryName}' failed after ${duration}ms:`, error);
      throw error;
    }
  }
}

// Usage in repository
export class UserRepository {
  private queryProfiler = new QueryProfiler(this.prisma);

  async findUsersWithPosts() {
    return this.queryProfiler.profileQuery(
      'findUsersWithPosts',
      () => this.prisma.user.findMany({
        include: {
          posts: {
            include: {
              comments: true
            }
          }
        }
      })
    );
  }
}
```

## Step 4: Error Monitoring and Tracking

### 4.1 Global Error Handler

```typescript
// src/filters/global-exception.filter.ts
import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    // Log error with context
    this.logger.error(
      `HTTP ${status} Error`,
      exception instanceof Error ? exception.stack : undefined,
      'GlobalExceptionFilter',
      {
        method: request.method,
        url: request.url,
        userAgent: request.get('User-Agent'),
        ip: request.ip,
        body: request.body,
        params: request.params,
        query: request.query,
        headers: this.sanitizeHeaders(request.headers)
      }
    );

    // Send error response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof message === 'string' ? message : (message as any).message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined
      })
    });
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    delete sanitized.authorization;
    delete sanitized.cookie;
    return sanitized;
  }
}
```

### 4.2 Error Tracking Service

```typescript
// src/services/error-tracking.service.ts
import { Injectable } from '@nestjs/common';

interface ErrorContext {
  userId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  method?: string;
  body?: any;
  params?: any;
  query?: any;
}

@Injectable()
export class ErrorTrackingService {
  private errors: Map<string, number> = new Map();
  private errorPatterns: Map<string, RegExp> = new Map();

  constructor() {
    this.setupErrorPatterns();
  }

  trackError(error: Error, context?: ErrorContext): void {
    const errorKey = this.generateErrorKey(error);
    const count = this.errors.get(errorKey) || 0;
    this.errors.set(errorKey, count + 1);

    // Check if this is a recurring error
    if (count > 5) {
      this.alertRecurringError(error, count, context);
    }

    // Check for known error patterns
    this.checkErrorPatterns(error, context);

    // Log structured error
    console.error('Error tracked:', {
      message: error.message,
      stack: error.stack,
      count: count + 1,
      context,
      timestamp: new Date().toISOString()
    });
  }

  private generateErrorKey(error: Error): string {
    // Create a unique key based on error message and stack trace
    const stackLines = error.stack?.split('\n').slice(0, 3).join('|') || '';
    return `${error.message}|${stackLines}`;
  }

  private setupErrorPatterns(): void {
    // Database connection errors
    this.errorPatterns.set('database', /connection|timeout|ECONNREFUSED/i);
    
    // Authentication errors
    this.errorPatterns.set('auth', /unauthorized|forbidden|token|jwt/i);
    
    // Validation errors
    this.errorPatterns.set('validation', /validation|invalid|required|format/i);
    
    // Rate limiting errors
    this.errorPatterns.set('rateLimit', /rate.?limit|too.?many.?requests/i);
  }

  private checkErrorPatterns(error: Error, context?: ErrorContext): void {
    for (const [category, pattern] of this.errorPatterns) {
      if (pattern.test(error.message)) {
        this.handleCategorizedError(category, error, context);
        break;
      }
    }
  }

  private handleCategorizedError(category: string, error: Error, context?: ErrorContext): void {
    switch (category) {
      case 'database':
        this.handleDatabaseError(error, context);
        break;
      case 'auth':
        this.handleAuthError(error, context);
        break;
      case 'validation':
        this.handleValidationError(error, context);
        break;
      case 'rateLimit':
        this.handleRateLimitError(error, context);
        break;
    }
  }

  private handleDatabaseError(error: Error, context?: ErrorContext): void {
    console.warn('Database error detected:', {
      error: error.message,
      context,
      suggestion: 'Check database connection and query performance'
    });
  }

  private handleAuthError(error: Error, context?: ErrorContext): void {
    console.warn('Authentication error detected:', {
      error: error.message,
      userId: context?.userId,
      ip: context?.ip,
      suggestion: 'Check JWT token validity and user permissions'
    });
  }

  private handleValidationError(error: Error, context?: ErrorContext): void {
    console.warn('Validation error detected:', {
      error: error.message,
      body: context?.body,
      suggestion: 'Check input validation rules and client-side validation'
    });
  }

  private handleRateLimitError(error: Error, context?: ErrorContext): void {
    console.warn('Rate limit error detected:', {
      error: error.message,
      ip: context?.ip,
      suggestion: 'Consider implementing exponential backoff or increasing rate limits'
    });
  }

  private alertRecurringError(error: Error, count: number, context?: ErrorContext): void {
    console.error('ALERT: Recurring error detected!', {
      error: error.message,
      occurrences: count,
      context,
      action: 'Immediate investigation required'
    });

    // In production, send to monitoring service (e.g., Sentry, DataDog)
    // this.sendToMonitoringService(error, count, context);
  }

  getErrorStats(): any {
    return {
      totalErrors: Array.from(this.errors.values()).reduce((sum, count) => sum + count, 0),
      uniqueErrors: this.errors.size,
      topErrors: Array.from(this.errors.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([error, count]) => ({ error, count }))
    };
  }
}
```

## Step 5: Database Debugging

### 5.1 Query Analysis

```typescript
// src/utils/database-debugger.ts
import { PrismaService } from '../services/prisma.service';

export class DatabaseDebugger {
  constructor(private prisma: PrismaService) {}

  async analyzeSlowQueries(): Promise<void> {
    // Enable query logging
    this.prisma.$on('query', (e) => {
      if (e.duration > 100) {
        console.log('Slow Query Analysis:');
        console.log(`Query: ${e.query}`);
        console.log(`Duration: ${e.duration}ms`);
        console.log(`Params: ${e.params}`);
        
        // Suggest optimizations
        this.suggestOptimizations(e.query, e.duration);
      }
    });
  }

  private suggestOptimizations(query: string, duration: number): void {
    const suggestions: string[] = [];

    if (query.includes('SELECT') && !query.includes('WHERE')) {
      suggestions.push('Consider adding WHERE clause to limit results');
    }

    if (query.includes('JOIN') && duration > 500) {
      suggestions.push('Consider adding indexes on JOIN columns');
    }

    if (query.includes('ORDER BY') && duration > 200) {
      suggestions.push('Consider adding index on ORDER BY column');
    }

    if (query.includes('COUNT(*)') && duration > 300) {
      suggestions.push('Consider using approximate count for large tables');
    }

    if (suggestions.length > 0) {
      console.log('Optimization suggestions:');
      suggestions.forEach(suggestion => console.log(`  - ${suggestion}`));
    }
  }

  async checkConnectionHealth(): Promise<void> {
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const duration = Date.now() - start;
      
      console.log(`Database connection health check: ${duration}ms`);
      
      if (duration > 1000) {
        console.warn('Database connection is slow');
      }
    } catch (error) {
      console.error('Database connection failed:', error);
    }
  }

  async analyzeTableSizes(): Promise<void> {
    try {
      const tables = await this.prisma.$queryRaw`
        SELECT 
          table_name,
          pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size,
          pg_total_relation_size(quote_ident(table_name)) as bytes
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;
      `;
      
      console.log('Table sizes:');
      console.table(tables);
    } catch (error) {
      console.error('Failed to analyze table sizes:', error);
    }
  }
}
```

### 5.2 Connection Pool Monitoring

```typescript
// src/utils/connection-monitor.ts
export class ConnectionMonitor {
  private connectionCount = 0;
  private maxConnections = 0;
  private connectionHistory: number[] = [];

  trackConnection(): void {
    this.connectionCount++;
    this.maxConnections = Math.max(this.maxConnections, this.connectionCount);
    this.connectionHistory.push(Date.now());
    
    // Keep only last 100 connections
    if (this.connectionHistory.length > 100) {
      this.connectionHistory.shift();
    }
  }

  releaseConnection(): void {
    this.connectionCount = Math.max(0, this.connectionCount - 1);
  }

  getStats(): any {
    const now = Date.now();
    const recentConnections = this.connectionHistory.filter(
      time => now - time < 60000 // Last minute
    ).length;

    return {
      currentConnections: this.connectionCount,
      maxConnections: this.maxConnections,
      connectionsLastMinute: recentConnections,
      averageConnectionsPerMinute: this.connectionHistory.length > 0 
        ? (this.connectionHistory.length / ((now - this.connectionHistory[0]) / 60000))
        : 0
    };
  }

  checkForLeaks(): void {
    const stats = this.getStats();
    
    if (stats.currentConnections > 50) {
      console.warn('Potential connection leak detected:', stats);
    }
    
    if (stats.connectionsLastMinute > 100) {
      console.warn('High connection rate detected:', stats);
    }
  }
}
```

## Step 6: API Debugging

### 6.1 Request/Response Interceptor

```typescript
// src/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, query, params, headers } = request;
    
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    // Log request
    this.logger.log(`[${requestId}] ${method} ${url}`, {
      body: this.sanitizeBody(body),
      query,
      params,
      userAgent: headers['user-agent'],
      ip: request.ip
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `[${requestId}] ${method} ${url} - ${response.statusCode} - ${duration}ms`,
            {
              responseSize: JSON.stringify(data).length,
              duration
            }
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `[${requestId}] ${method} ${url} - ERROR - ${duration}ms`,
            error.stack,
            {
              error: error.message,
              duration
            }
          );
        }
      })
    );
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sanitized = { ...body };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}
```

### 6.2 API Health Monitoring

```typescript
// src/modules/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  async getHealth() {
    return this.healthService.getHealthStatus();
  }

  @Get('detailed')
  async getDetailedHealth() {
    return this.healthService.getDetailedHealthStatus();
  }
}

// src/modules/health/health.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async getHealthStatus() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkMemory(),
      this.checkDisk()
    ]);

    const status = checks.every(check => check.status === 'fulfilled') ? 'healthy' : 'unhealthy';

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    };
  }

  async getDetailedHealthStatus() {
    const [database, memory, disk, performance] = await Promise.allSettled([
      this.checkDatabase(),
      this.checkMemory(),
      this.checkDisk(),
      this.checkPerformance()
    ]);

    return {
      status: 'detailed',
      timestamp: new Date().toISOString(),
      checks: {
        database: this.getCheckResult(database),
        memory: this.getCheckResult(memory),
        disk: this.getCheckResult(disk),
        performance: this.getCheckResult(performance)
      }
    };
  }

  private async checkDatabase(): Promise<any> {
    const start = Date.now();
    await this.prisma.$queryRaw`SELECT 1`;
    const duration = Date.now() - start;

    return {
      status: duration < 1000 ? 'healthy' : 'slow',
      responseTime: `${duration}ms`,
      message: duration < 1000 ? 'Database is responsive' : 'Database is slow'
    };
  }

  private checkMemory(): any {
    const usage = process.memoryUsage();
    const totalMB = usage.heapTotal / 1024 / 1024;
    const usedMB = usage.heapUsed / 1024 / 1024;
    const usagePercent = (usedMB / totalMB) * 100;

    return {
      status: usagePercent < 80 ? 'healthy' : 'warning',
      usage: `${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB`,
      percentage: `${usagePercent.toFixed(2)}%`,
      message: usagePercent < 80 ? 'Memory usage is normal' : 'High memory usage detected'
    };
  }

  private checkDisk(): any {
    // Simplified disk check - in production, use actual disk monitoring
    return {
      status: 'healthy',
      message: 'Disk space is adequate'
    };
  }

  private async checkPerformance(): Promise<any> {
    const start = process.hrtime.bigint();
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds

    return {
      status: duration < 50 ? 'healthy' : 'slow',
      responseTime: `${duration.toFixed(2)}ms`,
      message: duration < 50 ? 'Performance is good' : 'Performance is degraded'
    };
  }

  private getCheckResult(result: PromiseSettledResult<any>): any {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        status: 'error',
        message: result.reason.message || 'Check failed'
      };
    }
  }
}
```

## Step 7: Production Debugging

### 7.1 Remote Debugging Setup

For production debugging (use with caution):

```typescript
// src/utils/remote-debugger.ts
export class RemoteDebugger {
  private isEnabled = false;
  private debugSessions: Map<string, any> = new Map();

  enable(secret: string): void {
    if (process.env.DEBUG_SECRET === secret) {
      this.isEnabled = true;
      console.log('Remote debugging enabled');
    }
  }

  disable(): void {
    this.isEnabled = false;
    this.debugSessions.clear();
    console.log('Remote debugging disabled');
  }

  createSession(userId: string): string {
    if (!this.isEnabled) return null;

    const sessionId = Math.random().toString(36).substr(2, 9);
    this.debugSessions.set(sessionId, {
      userId,
      createdAt: new Date(),
      logs: []
    });

    return sessionId;
  }

  log(sessionId: string, message: string, data?: any): void {
    if (!this.isEnabled) return;

    const session = this.debugSessions.get(sessionId);
    if (session) {
      session.logs.push({
        timestamp: new Date(),
        message,
        data
      });

      // Keep only last 100 logs
      if (session.logs.length > 100) {
        session.logs.shift();
      }
    }
  }

  getSession(sessionId: string): any {
    return this.debugSessions.get(sessionId);
  }
}
```

### 7.2 Production Monitoring

```typescript
// src/services/monitoring.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class MonitoringService {
  private metrics: Map<string, number> = new Map();
  private alerts: any[] = [];

  recordMetric(name: string, value: number): void {
    this.metrics.set(name, value);
    this.checkThresholds(name, value);
  }

  incrementCounter(name: string): void {
    const current = this.metrics.get(name) || 0;
    this.metrics.set(name, current + 1);
  }

  recordTiming(name: string, duration: number): void {
    this.recordMetric(`${name}_duration`, duration);
    
    if (duration > 1000) {
      this.createAlert('performance', `Slow operation: ${name} took ${duration}ms`);
    }
  }

  private checkThresholds(name: string, value: number): void {
    const thresholds = {
      'memory_usage': 500 * 1024 * 1024, // 500MB
      'cpu_usage': 80, // 80%
      'error_rate': 10, // 10 errors per minute
      'response_time': 1000 // 1 second
    };

    const threshold = thresholds[name];
    if (threshold && value > threshold) {
      this.createAlert('threshold', `${name} exceeded threshold: ${value} > ${threshold}`);
    }
  }

  private createAlert(type: string, message: string): void {
    const alert = {
      type,
      message,
      timestamp: new Date(),
      severity: this.calculateSeverity(type, message)
    };

    this.alerts.push(alert);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts.shift();
    }

    console.warn('ALERT:', alert);
    
    // In production, send to monitoring service
    // this.sendToMonitoringService(alert);
  }

  private calculateSeverity(type: string, message: string): string {
    if (message.includes('memory') || message.includes('cpu')) {
      return 'high';
    }
    if (message.includes('slow') || message.includes('error')) {
      return 'medium';
    }
    return 'low';
  }

  getMetrics(): any {
    return Object.fromEntries(this.metrics);
  }

  getAlerts(): any[] {
    return this.alerts;
  }
}
```

## Step 8: Debugging Commands and Tools

### 8.1 Debug Commands

Add these npm scripts to `package.json`:

```json
{
  "scripts": {
    "debug": "node --inspect-brk=0.0.0.0:9229 -r ts-node/register src/main.ts",
    "debug:test": "node --inspect-brk node_modules/.bin/jest --runInBand",
    "debug:memory": "node --inspect --expose-gc -r ts-node/register src/main.ts",
    "debug:cpu": "node --prof -r ts-node/register src/main.ts",
    "debug:heap": "node --inspect --max-old-space-size=4096 -r ts-node/register src/main.ts",
    "analyze:bundle": "webpack-bundle-analyzer dist/stats.json",
    "profile:memory": "clinic doctor -- node dist/main.js",
    "profile:cpu": "clinic flame -- node dist/main.js"
  }
}
```

### 8.2 Debugging Utilities

<CommandBlock>
```bash
# Start application in debug mode
npm run debug

# Debug specific test
npm run debug:test -- user.test.ts

# Profile memory usage
npm run profile:memory

# Profile CPU usage
npm run profile:cpu

# Analyze heap dump
node --inspect --expose-gc dist/main.js
# Then in Chrome DevTools: Memory tab > Take heap snapshot

# Monitor in real-time
npm run dev -- --inspect=9229
# Connect Chrome DevTools to localhost:9229
```
</CommandBlock>

## What You've Mastered

🎉 **Outstanding work!** You now have advanced debugging skills:

- ✅ **Structured Logging** - Comprehensive logging strategies and best practices
- ✅ **IDE Debugging** - VS Code debugging setup and breakpoint techniques
- ✅ **Performance Profiling** - Memory, CPU, and database performance analysis
- ✅ **Error Monitoring** - Production error tracking and alerting systems
- ✅ **Database Debugging** - Query optimization and connection monitoring
- ✅ **API Debugging** - Request/response logging and health monitoring
- ✅ **Production Debugging** - Safe production debugging and monitoring
- ✅ **Automated Monitoring** - Continuous monitoring and alerting systems

## Debugging Efficiency

**Manual Debugging Time**: ~8 hours per complex issue
**With Advanced Tools**: ~1 hour per issue
**Time Saved**: 7 hours per issue (87% faster resolution)

## Next Steps

Enhance your debugging arsenal with:

- 🔍 **Distributed Tracing** - Track requests across microservices
- 📊 **APM Integration** - Application Performance Monitoring tools
- 🤖 **AI-Powered Debugging** - Automated error analysis and suggestions
- 🔄 **Chaos Engineering** - Proactive failure testing and debugging
- 📱 **Mobile Debugging** - Debug mobile app integrations
- 🌐 **Browser Debugging** - Client-side debugging and network analysis
- 🛡️ **Security Debugging** - Debug security vulnerabilities and attacks
- 📈 **Predictive Monitoring** - Predict and prevent issues before they occur

Ready to optimize performance? Check out our [Performance Optimization Guide](./performance-optimization.md) or explore [Common Issues Solutions](./common-issues.md)!