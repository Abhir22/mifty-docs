---
sidebar_position: 6
---

# Complete Testing Guide for Mifty Applications

Learn how to implement comprehensive testing strategies for your Mifty applications, including unit tests, integration tests, end-to-end tests, and performance testing.

## What You'll Learn

This guide covers:

- 🧪 **Unit Testing** - Testing individual components and services
- 🔗 **Integration Testing** - Testing API endpoints and database interactions
- 🌐 **End-to-End Testing** - Testing complete user workflows
- ⚡ **Performance Testing** - Load testing and performance optimization
- 🐛 **Debugging Techniques** - Advanced debugging strategies
- 📊 **Test Coverage** - Measuring and improving test coverage
- 🤖 **Automated Testing** - CI/CD integration and automated test runs
- 🛡️ **Security Testing** - Testing for vulnerabilities and security issues

## Prerequisites

- Completed [Blog API Tutorial](./blog-api.md) or equivalent Mifty project
- Basic understanding of testing concepts
- 30 minutes of your time

## Step 1: Understanding Mifty's Testing Setup

Mifty comes with a complete testing setup out of the box:

### 1.1 Testing Framework Stack

| Tool | Purpose | Configuration |
|------|---------|---------------|
| **Jest** | Test runner and assertion library | `jest.config.js` |
| **Supertest** | HTTP assertion library | Built-in with generated tests |
| **@types/jest** | TypeScript support for Jest | Included in devDependencies |
| **ts-jest** | TypeScript preprocessor | Configured automatically |

### 1.2 Generated Test Structure

When you run `npm run generate`, Mifty creates comprehensive tests:

```
src/
├── modules/
│   └── user/
│       ├── user.service.ts
│       ├── user.controller.ts
│       ├── user.repository.ts
│       └── user.test.ts          # Complete test suite
├── tests/
│   ├── setup.ts                  # Test setup and utilities
│   ├── fixtures/                 # Test data fixtures
│   └── helpers/                  # Test helper functions
└── jest.config.js                # Jest configuration
```

### 1.3 Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test user.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create user"
```

## Step 2: Unit Testing Best Practices

### 2.1 Service Layer Testing

Here's an example of comprehensive service testing:

```typescript
// src/modules/user/user.test.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { CreateUserDto, UpdateUserDto } from './user.dto';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  // Mock repository
  const mockRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByEmail: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockRepository
        }
      ]
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      };

      const expectedUser = {
        id: 'user_123',
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRepository.create.mockResolvedValue(expectedUser);
      mockRepository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedUser);
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      };

      const existingUser = { id: 'existing_user', email: createUserDto.email };
      mockRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(
        'User with email existing@example.com already exists'
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      };

      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow('Database connection failed');
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = 'user_123';
      const expectedUser = {
        id: userId,
        email: 'test@example.com',
        username: 'testuser'
      };

      mockRepository.findById.mockResolvedValue(expectedUser);

      // Act
      const result = await service.findById(userId);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedUser);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const userId = 'nonexistent_user';
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(userId)).rejects.toThrow('User not found');
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = 'user_123';
      const updateDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const existingUser = {
        id: userId,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      };

      const updatedUser = { ...existingUser, ...updateDto };

      mockRepository.findById.mockResolvedValue(existingUser);
      mockRepository.update.mockResolvedValue(updatedUser);

      // Act
      const result = await service.update(userId, updateDto);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockRepository.update).toHaveBeenCalledWith(userId, updateDto);
      expect(result).toEqual(updatedUser);
    });
  });
});
```

### 2.2 Repository Layer Testing

```typescript
// src/modules/user/user.repository.test.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../services/prisma.service';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  let repository: UserRepository;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: mockPrisma
        }
      ]
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create user with correct data', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      };

      const expectedUser = { id: 'user_123', ...userData };
      mockPrisma.user.create.mockResolvedValue(expectedUser);

      // Act
      const result = await repository.create(userData);

      // Assert
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: userData
      });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findMany', () => {
    it('should apply filters correctly', async () => {
      // Arrange
      const filters = {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0
      };

      const expectedUsers = [
        { id: 'user_1', email: 'user1@example.com' },
        { id: 'user_2', email: 'user2@example.com' }
      ];

      mockPrisma.user.findMany.mockResolvedValue(expectedUsers);

      // Act
      const result = await repository.findMany(filters);

      // Assert
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(filters);
      expect(result).toEqual(expectedUsers);
    });
  });
});
```

## Step 3: Integration Testing

### 3.1 API Endpoint Testing

```typescript
// src/modules/user/user.integration.test.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../services/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('UserController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();

    // Create test user and get auth token
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      }
    });

    authToken = jwtService.sign({ sub: testUser.id, email: testUser.email });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: { contains: 'test' } }
    });
    await app.close();
  });

  describe('POST /api/v1/users', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        username: 'newuser',
        firstName: 'New',
        lastName: 'User'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        username: '',
        firstName: 'Test'
        // lastName missing
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('validation');
    });

    it('should return 401 without authentication', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      };

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(401);
    });
  });

  describe('GET /api/v1/users', () => {
    it('should return paginated users', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        totalPages: expect.any(Number)
      });
    });

    it('should filter users by search query', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users?search=test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.every(user => 
        user.email.includes('test') || 
        user.username.includes('test') ||
        user.firstName.includes('test') ||
        user.lastName.includes('test')
      )).toBe(true);
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('should update user successfully', async () => {
      // Create a user to update
      const user = await prisma.user.create({
        data: {
          email: 'update-test@example.com',
          username: 'updatetest',
          firstName: 'Update',
          lastName: 'Test'
        }
      });

      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: user.id,
        firstName: 'Updated',
        lastName: 'Name',
        email: user.email,
        username: user.username
      });
    });

    it('should return 404 for non-existent user', async () => {
      const updateData = { firstName: 'Updated' };

      await request(app.getHttpServer())
        .put('/api/v1/users/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });
  });
});
```

### 3.2 Database Integration Testing

```typescript
// src/tests/database.integration.test.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../services/prisma.service';
import { AppModule } from '../app.module';

describe('Database Integration', () => {
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('User-Post Relationships', () => {
    it('should create user with posts correctly', async () => {
      // Create user with posts in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: 'author@example.com',
            username: 'author',
            firstName: 'Author',
            lastName: 'User'
          }
        });

        const posts = await Promise.all([
          tx.post.create({
            data: {
              title: 'First Post',
              content: 'Content of first post',
              authorId: user.id
            }
          }),
          tx.post.create({
            data: {
              title: 'Second Post',
              content: 'Content of second post',
              authorId: user.id
            }
          })
        ]);

        return { user, posts };
      });

      // Verify relationships
      const userWithPosts = await prisma.user.findUnique({
        where: { id: result.user.id },
        include: { posts: true }
      });

      expect(userWithPosts.posts).toHaveLength(2);
      expect(userWithPosts.posts.every(post => post.authorId === result.user.id)).toBe(true);
    });

    it('should cascade delete posts when user is deleted', async () => {
      // Create user with posts
      const user = await prisma.user.create({
        data: {
          email: 'cascade-test@example.com',
          username: 'cascadetest',
          firstName: 'Cascade',
          lastName: 'Test',
          posts: {
            create: [
              { title: 'Post 1', content: 'Content 1' },
              { title: 'Post 2', content: 'Content 2' }
            ]
          }
        }
      });

      // Delete user
      await prisma.user.delete({ where: { id: user.id } });

      // Verify posts are also deleted
      const remainingPosts = await prisma.post.findMany({
        where: { authorId: user.id }
      });

      expect(remainingPosts).toHaveLength(0);
    });
  });

  describe('Database Constraints', () => {
    it('should enforce unique email constraint', async () => {
      const userData = {
        email: 'unique-test@example.com',
        username: 'uniquetest1',
        firstName: 'Unique',
        lastName: 'Test'
      };

      // Create first user
      await prisma.user.create({ data: userData });

      // Try to create second user with same email
      await expect(
        prisma.user.create({
          data: {
            ...userData,
            username: 'uniquetest2'
          }
        })
      ).rejects.toThrow();
    });

    it('should enforce foreign key constraints', async () => {
      // Try to create post with non-existent author
      await expect(
        prisma.post.create({
          data: {
            title: 'Orphan Post',
            content: 'This post has no author',
            authorId: 'nonexistent-user-id'
          }
        })
      ).rejects.toThrow();
    });
  });
});
```

## Step 4: End-to-End Testing

### 4.1 Complete User Journey Testing

```typescript
// src/tests/e2e/user-journey.e2e.test.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../services/prisma.service';

describe('User Journey (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'e2e-test' } }
    });
    await app.close();
  });

  it('should complete full blog creation workflow', async () => {
    // Step 1: Register user
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'e2e-test@example.com',
        username: 'e2etest',
        firstName: 'E2E',
        lastName: 'Test',
        password: 'securepassword123'
      })
      .expect(201);

    expect(registerResponse.body).toHaveProperty('token');
    expect(registerResponse.body).toHaveProperty('user');

    const { token } = registerResponse.body;

    // Step 2: Create category
    const categoryResponse = await request(app.getHttpServer())
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'E2E Test Category',
        slug: 'e2e-test-category',
        description: 'Category for E2E testing'
      })
      .expect(201);

    const categoryId = categoryResponse.body.id;

    // Step 3: Create blog post
    const postResponse = await request(app.getHttpServer())
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'E2E Test Post',
        slug: 'e2e-test-post',
        content: 'This is a test post created during E2E testing',
        excerpt: 'E2E test post excerpt',
        categoryId,
        status: 'PUBLISHED'
      })
      .expect(201);

    const postId = postResponse.body.id;

    // Step 4: Add comment to post
    const commentResponse = await request(app.getHttpServer())
      .post('/api/v1/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'This is a test comment',
        postId
      })
      .expect(201);

    // Step 5: Verify complete post with relationships
    const fullPostResponse = await request(app.getHttpServer())
      .get(`/api/v1/posts/${postId}?include=author,category,comments`)
      .expect(200);

    expect(fullPostResponse.body).toMatchObject({
      id: postId,
      title: 'E2E Test Post',
      status: 'PUBLISHED',
      author: {
        username: 'e2etest'
      },
      category: {
        name: 'E2E Test Category'
      },
      comments: expect.arrayContaining([
        expect.objectContaining({
          content: 'This is a test comment'
        })
      ])
    });

    // Step 6: Update post
    await request(app.getHttpServer())
      .put(`/api/v1/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated E2E Test Post',
        content: 'Updated content for E2E testing'
      })
      .expect(200);

    // Step 7: Verify update
    const updatedPostResponse = await request(app.getHttpServer())
      .get(`/api/v1/posts/${postId}`)
      .expect(200);

    expect(updatedPostResponse.body.title).toBe('Updated E2E Test Post');

    // Step 8: Delete post
    await request(app.getHttpServer())
      .delete(`/api/v1/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // Step 9: Verify deletion
    await request(app.getHttpServer())
      .get(`/api/v1/posts/${postId}`)
      .expect(404);
  });
});
```

## Step 5: Performance Testing

### 5.1 Load Testing Setup

```bash
# Install performance testing tools
npm install --save-dev artillery
npm install --save-dev clinic
```

Create performance test configuration:

```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Load test"
    - duration: 60
      arrivalRate: 100
      name: "Stress test"
  defaults:
    headers:
      Authorization: 'Bearer {{ $processEnvironment.TEST_TOKEN }}'

scenarios:
  - name: "API Load Test"
    weight: 100
    flow:
      - get:
          url: "/api/v1/users"
      - post:
          url: "/api/v1/posts"
          json:
            title: "Load Test Post {{ $randomString() }}"
            content: "Content for load testing"
            categoryId: "{{ $processEnvironment.TEST_CATEGORY_ID }}"
      - get:
          url: "/api/v1/posts"
```

### 5.2 Performance Test Implementation

```typescript
// src/tests/performance/api-performance.test.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { performance } from 'perf_hooks';

describe('API Performance Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Response Time Tests', () => {
    it('should respond to GET /api/v1/users within 200ms', async () => {
      const start = performance.now();
      
      await request(app.getHttpServer())
        .get('/api/v1/users')
        .expect(200);
      
      const end = performance.now();
      const responseTime = end - start;
      
      expect(responseTime).toBeLessThan(200);
    });

    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 50;
      const start = performance.now();
      
      const promises = Array(concurrentRequests).fill(null).map(() =>
        request(app.getHttpServer())
          .get('/api/v1/users')
          .expect(200)
      );
      
      await Promise.all(promises);
      
      const end = performance.now();
      const totalTime = end - start;
      const averageTime = totalTime / concurrentRequests;
      
      expect(averageTime).toBeLessThan(100);
      expect(totalTime).toBeLessThan(5000); // All requests within 5 seconds
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not have memory leaks during repeated requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Make 1000 requests
      for (let i = 0; i < 1000; i++) {
        await request(app.getHttpServer())
          .get('/api/v1/users')
          .expect(200);
      }
      
      // Force garbage collection
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });
});
```

### 5.3 Database Performance Testing

```typescript
// src/tests/performance/database-performance.test.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../services/prisma.service';
import { AppModule } from '../../app.module';
import { performance } from 'perf_hooks';

describe('Database Performance Tests', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('Query Performance', () => {
    it('should execute simple queries within 50ms', async () => {
      const start = performance.now();
      
      await prisma.user.findMany({ take: 10 });
      
      const end = performance.now();
      const queryTime = end - start;
      
      expect(queryTime).toBeLessThan(50);
    });

    it('should execute complex queries with joins within 200ms', async () => {
      const start = performance.now();
      
      await prisma.post.findMany({
        include: {
          author: true,
          category: true,
          comments: {
            include: { author: true }
          }
        },
        take: 10
      });
      
      const end = performance.now();
      const queryTime = end - start;
      
      expect(queryTime).toBeLessThan(200);
    });

    it('should handle batch operations efficiently', async () => {
      const start = performance.now();
      
      const batchData = Array(100).fill(null).map((_, i) => ({
        email: `batch-test-${i}@example.com`,
        username: `batchuser${i}`,
        firstName: 'Batch',
        lastName: `User${i}`
      }));
      
      await prisma.user.createMany({
        data: batchData,
        skipDuplicates: true
      });
      
      const end = performance.now();
      const batchTime = end - start;
      
      expect(batchTime).toBeLessThan(1000); // 1 second for 100 records
      
      // Cleanup
      await prisma.user.deleteMany({
        where: { email: { contains: 'batch-test' } }
      });
    });
  });
});
```

## Step 6: Test Coverage and Quality

### 6.1 Coverage Configuration

Update `jest.config.js` for comprehensive coverage:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.dto.ts',
    '!src/main.ts',
    '!src/tests/**/*'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts']
};
```

### 6.2 Test Quality Metrics

Create test quality checker:

```typescript
// src/tests/test-quality.test.ts
import * as fs from 'fs';
import * as path from 'path';

describe('Test Quality Metrics', () => {
  const srcDir = path.join(__dirname, '..');
  
  it('should have test files for all service files', () => {
    const serviceFiles = findFiles(srcDir, /\.service\.ts$/);
    const testFiles = findFiles(srcDir, /\.test\.ts$/);
    
    const missingTests = serviceFiles.filter(serviceFile => {
      const testFile = serviceFile.replace('.service.ts', '.test.ts');
      return !testFiles.includes(testFile);
    });
    
    expect(missingTests).toHaveLength(0);
  });

  it('should have test files for all controller files', () => {
    const controllerFiles = findFiles(srcDir, /\.controller\.ts$/);
    const testFiles = findFiles(srcDir, /\.test\.ts$/);
    
    const missingTests = controllerFiles.filter(controllerFile => {
      const testFile = controllerFile.replace('.controller.ts', '.test.ts');
      return !testFiles.includes(testFile);
    });
    
    expect(missingTests).toHaveLength(0);
  });

  function findFiles(dir: string, pattern: RegExp): string[] {
    const files: string[] = [];
    
    function traverse(currentDir: string) {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          traverse(fullPath);
        } else if (stat.isFile() && pattern.test(item)) {
          files.push(fullPath);
        }
      }
    }
    
    traverse(dir);
    return files;
  }
});
```

## Step 7: Automated Testing in CI/CD

### 7.1 GitHub Actions Configuration

Create `.github/workflows/test.yml`:

```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Setup test database
      run: |
        npm run prisma:migrate:deploy
        npm run prisma:generate
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

    - name: Run unit tests
      run: npm run test:coverage
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

    - name: Run E2E tests
      run: npm run test:e2e
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  performance:
    runs-on: ubuntu-latest
    needs: test

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build application
      run: npm run build

    - name: Start application
      run: npm start &
      env:
        NODE_ENV: test

    - name: Wait for application
      run: sleep 10

    - name: Run performance tests
      run: npm run test:performance

    - name: Generate performance report
      run: npm run test:performance:report
```

### 7.2 Test Scripts in package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "jest --testPathPattern=e2e",
    "test:performance": "artillery run artillery-config.yml",
    "test:performance:report": "artillery run artillery-config.yml --output performance-report.json",
    "test:all": "npm run test:coverage && npm run test:integration && npm run test:e2e"
  }
}
```

## Step 8: Running and Analyzing Tests

### 8.1 Running Different Test Types

```bash
# Run all tests with coverage
npm run test:coverage

# Run specific test file
npm test user.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create"

# Run tests in watch mode
npm run test:watch

# Run integration tests only
npm run test:integration

# Run E2E tests only
npm run test:e2e

# Run performance tests
npm run test:performance
```

### 8.2 Analyzing Test Results

```bash
# Generate detailed coverage report
npm run test:coverage

# Open coverage report in browser
open coverage/lcov-report/index.html

# Run tests with verbose output
npm test -- --verbose

# Run tests and generate JUnit report
npm test -- --reporters=default --reporters=jest-junit
```

## What You've Learned

🎉 **Excellent work!** You now have comprehensive testing knowledge:

- ✅ **Unit Testing** - Testing individual components with mocks and stubs
- ✅ **Integration Testing** - Testing API endpoints and database interactions
- ✅ **End-to-End Testing** - Testing complete user workflows
- ✅ **Performance Testing** - Load testing and performance optimization
- ✅ **Test Coverage** - Measuring and improving code coverage
- ✅ **Quality Metrics** - Ensuring test completeness and quality
- ✅ **CI/CD Integration** - Automated testing in deployment pipelines
- ✅ **Best Practices** - Following testing best practices and patterns

## Testing Metrics

**Manual Testing Time**: ~40 hours per feature
**With Automated Tests**: ~2 hours setup, continuous validation
**Time Saved**: 38+ hours per feature (95% faster feedback)

## Next Steps

Enhance your testing strategy with:

- 🤖 **AI-Powered Testing** - Automated test generation and maintenance
- 🔍 **Visual Testing** - Screenshot and UI regression testing
- 🛡️ **Security Testing** - Automated vulnerability scanning
- 📊 **Mutation Testing** - Testing the quality of your tests
- 🌐 **Cross-browser Testing** - Multi-browser compatibility testing
- 📱 **Mobile Testing** - Mobile app and responsive testing
- 🔄 **Contract Testing** - API contract validation
- 📈 **Monitoring Integration** - Production monitoring and alerting

Ready to debug like a pro? Check out our [Advanced Debugging Guide](../troubleshooting/debugging-guide.md) or explore [Performance Optimization](../troubleshooting/performance-optimization.md)!