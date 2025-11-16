# Testing Framework

Comprehensive testing guide for Mifty applications with built-in testing tools and best practices.

## 🧪 Testing Philosophy

Mifty follows a test-driven development approach with:
- **Unit Tests** - Test individual components
- **Integration Tests** - Test module interactions  
- **End-to-End Tests** - Test complete workflows
- **API Tests** - Test REST endpoints

## 🚀 Quick Start

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test user.service.test.ts
```

### Generated Tests

Mifty automatically generates comprehensive tests for all your modules:

```bash
# Generate modules with tests
npm run generate

# Generated test files:
# src/modules/user/user.service.test.ts
# src/modules/user/user.controller.test.ts
# src/modules/user/user.repository.test.ts
```

## 📋 Test Structure

### Unit Tests

```typescript
// src/modules/user/user.service.test.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const expectedUser = { id: '1', ...userData };
      jest.spyOn(repository, 'create').mockResolvedValue(expectedUser);

      const result = await service.create(userData);

      expect(repository.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(expectedUser);
    });
  });
});
```

### Integration Tests

```typescript
// src/modules/user/user.integration.test.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('User Integration Tests', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.email).toBe('test@example.com');
          expect(res.body.id).toBeDefined();
        });
    });
  });
});
```

## 🔧 Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$|.*\\.test\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/*.test.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};
```

### Test Database Setup

```typescript
// src/test/setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST,
    },
  },
});

beforeAll(async () => {
  // Setup test database
  await prisma.$connect();
});

afterAll(async () => {
  // Cleanup test database
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean database before each test
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
    }
  }
});
```

## 🎯 Testing Best Practices

### Test Organization

```
src/
├── modules/
│   └── user/
│       ├── user.service.ts
│       ├── user.service.test.ts      # Unit tests
│       ├── user.controller.ts
│       ├── user.controller.test.ts   # Unit tests
│       └── user.integration.test.ts  # Integration tests
├── test/
│   ├── setup.ts                      # Test setup
│   ├── helpers/                      # Test utilities
│   └── fixtures/                     # Test data
└── e2e/
    └── user.e2e-spec.ts              # End-to-end tests
```

### Test Data Management

```typescript
// src/test/fixtures/user.fixture.ts
export const userFixture = {
  validUser: {
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
  },
  invalidUser: {
    email: 'invalid-email',
    firstName: '',
    lastName: 'Doe',
  },
};

// src/test/helpers/database.helper.ts
export class DatabaseHelper {
  static async createUser(data = userFixture.validUser) {
    return prisma.user.create({ data });
  }

  static async cleanUsers() {
    return prisma.user.deleteMany();
  }
}
```

## 🚨 Testing Strategies

### Test-Driven Development (TDD)

1. **Write Test First** - Define expected behavior
2. **Run Test** - Ensure it fails
3. **Write Code** - Implement functionality
4. **Run Test** - Ensure it passes
5. **Refactor** - Improve code quality

### Behavior-Driven Development (BDD)

```typescript
describe('User Registration', () => {
  describe('Given valid user data', () => {
    describe('When creating a user', () => {
      it('Then should return created user with ID', async () => {
        // Test implementation
      });
    });
  });

  describe('Given invalid email', () => {
    describe('When creating a user', () => {
      it('Then should throw validation error', async () => {
        // Test implementation
      });
    });
  });
});
```

## 📊 Test Coverage

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

### Coverage Targets

- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 90%+
- **Lines**: 90%+

## 🔍 Debugging Tests

### Debug Configuration

```json
// .vscode/launch.json
{
  "configurations": [
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Debug Commands

```bash
# Debug specific test
npm run test:debug user.service.test.ts

# Debug with breakpoints
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 🚀 Advanced Testing

### Mocking External Services

```typescript
// src/test/mocks/email.service.mock.ts
export const mockEmailService = {
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
  sendBulkEmail: jest.fn().mockResolvedValue({ success: true }),
};

// In your test
beforeEach(() => {
  jest.clearAllMocks();
});
```

### Testing Async Operations

```typescript
describe('Async Operations', () => {
  it('should handle async operations', async () => {
    const promise = service.asyncOperation();
    
    // Test pending state
    expect(service.isLoading).toBe(true);
    
    const result = await promise;
    
    // Test completed state
    expect(service.isLoading).toBe(false);
    expect(result).toBeDefined();
  });
});
```

## 📚 Resources

- **Jest Documentation** - [Official Jest Docs](https://jestjs.io/)
- **Testing Library** - [Testing Best Practices](https://testing-library.com/)
- **NestJS Testing** - [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)
- **Prisma Testing** - [Database Testing](https://www.prisma.io/docs/guides/testing)