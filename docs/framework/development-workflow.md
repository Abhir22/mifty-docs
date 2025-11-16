# Development Workflow

Best practices and workflows for developing applications with the Mifty framework, from project setup to production deployment.

## Project Setup

### Creating a New Project

Start a new Mifty project using the CLI:

```bash
# Install Mifty CLI globally
npm install -g @mifty/cli

# Create a new project
mifty new my-app
cd my-app

# Install dependencies
npm install
```

### Project Structure

A typical Mifty project follows this structure:

```
my-app/
├── src/
│   ├── controllers/          # API controllers
│   ├── services/            # Business logic services
│   ├── models/              # Database models
│   ├── middleware/          # Custom middleware
│   ├── routes/              # Route definitions
│   ├── utils/               # Utility functions
│   └── app.ts               # Application entry point
├── config/
│   ├── config.json          # Base configuration
│   ├── config.development.json
│   └── config.production.json
├── database/
│   ├── migrations/          # Database migrations
│   └── seeds/               # Database seeders
├── tests/                   # Test files
├── docs/                    # Project documentation
├── .env.example             # Environment variables template
├── package.json
└── tsconfig.json
```

## Development Commands

### Essential CLI Commands

```bash
# Start development server with hot reload
mifty dev

# Build the application
mifty build

# Start production server
mifty start

# Run tests
mifty test

# Generate new components
mifty generate controller UserController
mifty generate service AuthService
mifty generate model User

# Database operations
mifty db:migrate
mifty db:seed
mifty db:reset

# Code generation from database schema
mifty generate:from-db

# Visual database designer
mifty db:designer
```

### NPM Scripts

Common npm scripts for development:

```json
{
  "scripts": {
    "dev": "mifty dev",
    "build": "mifty build",
    "start": "mifty start",
    "test": "mifty test",
    "test:watch": "mifty test --watch",
    "test:coverage": "mifty test --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts",
    "db:migrate": "mifty db:migrate",
    "db:seed": "mifty db:seed",
    "db:reset": "mifty db:reset"
  }
}
```

## Hot Reload

### Development Server

Mifty's development server provides fast hot reload capabilities:

```bash
# Start with hot reload (default)
mifty dev

# Start with specific port
mifty dev --port 4000

# Start with debug mode
mifty dev --debug

# Start with specific environment
mifty dev --env staging
```

### Hot Reload Features

- **Automatic restart** on TypeScript file changes
- **Database schema sync** when models are updated
- **Route reloading** when controllers or routes change
- **Configuration reload** when config files are modified
- **Dependency injection refresh** for service updates

### Configuration

Configure hot reload behavior in your `config.json`:

```json
{
  "development": {
    "hotReload": {
      "enabled": true,
      "watchPaths": ["src/**/*.ts", "config/**/*.json"],
      "ignorePaths": ["node_modules", "dist", "logs"],
      "debounceMs": 300,
      "clearConsole": true
    }
  }
}
```

## Code Generation

### Visual Database Designer

Use Mifty's visual database designer for rapid development:

```bash
# Launch the visual designer
mifty db:designer

# Generate code from existing database
mifty generate:from-db --connection production

# Export schema to file
mifty db:export --format json
```

### Automatic Code Generation

Generate boilerplate code automatically:

```bash
# Generate a complete CRUD module
mifty generate module User --crud

# Generate controller with specific actions
mifty generate controller ProductController --actions create,read,update,delete

# Generate service with business logic template
mifty generate service PaymentService --template business

# Generate model with relationships
mifty generate model Order --relations User,Product
```

### Custom Templates

Create custom code generation templates:

```typescript
// templates/controller.template.ts
export const controllerTemplate = `
import { Controller, Get, Post, Body, Param } from '@mifty/core';
import { {{serviceName}} } from '../services/{{serviceName}}';

@Controller('{{routePath}}')
export class {{className}} {
  constructor(private {{serviceInstance}}: {{serviceName}}) {}

  @Get()
  async findAll() {
    return this.{{serviceInstance}}.findAll();
  }

  @Post()
  async create(@Body() data: any) {
    return this.{{serviceInstance}}.create(data);
  }
}
`;
```

## Testing Workflow

### Test Structure

Organize tests following Mifty conventions:

```
tests/
├── unit/
│   ├── controllers/
│   ├── services/
│   └── models/
├── integration/
│   ├── api/
│   └── database/
├── e2e/
│   └── scenarios/
└── fixtures/
    └── data/
```

### Running Tests

```bash
# Run all tests
mifty test

# Run specific test suite
mifty test --suite unit
mifty test --suite integration
mifty test --suite e2e

# Run tests with coverage
mifty test --coverage

# Run tests in watch mode
mifty test --watch

# Run tests for specific files
mifty test --files "**/*user*"
```

### Test Configuration

Configure testing in `config.test.json`:

```json
{
  "testing": {
    "framework": "jest",
    "testMatch": ["**/__tests__/**/*.ts", "**/*.test.ts"],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    },
    "setupFiles": ["<rootDir>/tests/setup.ts"],
    "testEnvironment": "node"
  }
}
```

## Database Workflow

### Migrations

Manage database schema changes with migrations:

```bash
# Create a new migration
mifty migration:create AddUserTable

# Run pending migrations
mifty db:migrate

# Rollback last migration
mifty db:migrate:rollback

# Reset database and run all migrations
mifty db:reset

# Check migration status
mifty db:migrate:status
```

### Seeds

Populate database with test data:

```bash
# Create a new seeder
mifty seed:create UserSeeder

# Run all seeders
mifty db:seed

# Run specific seeder
mifty db:seed --class UserSeeder

# Reset and seed database
mifty db:reset --seed
```

### Schema Synchronization

Keep models and database in sync:

```typescript
// Enable auto-sync in development
{
  "database": {
    "synchronize": true, // Only in development
    "dropSchema": false,
    "migrationsRun": true
  }
}
```

## Debugging

### Debug Configuration

Set up debugging in your development environment:

```bash
# Start with Node.js debugger
mifty dev --debug

# Start with specific debug port
mifty dev --debug --debug-port 9229

# Enable verbose logging
mifty dev --verbose
```

### VS Code Debug Configuration

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Mifty App",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/@mifty/cli/bin/mifty",
      "args": ["dev", "--debug"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

### Logging and Monitoring

Configure comprehensive logging:

```typescript
import { Logger } from '@mifty/core';

export class UserService {
  private logger = new Logger(UserService.name);

  async createUser(userData: any) {
    this.logger.debug('Creating user with data:', userData);
    
    try {
      const user = await this.userRepository.create(userData);
      this.logger.log('User created successfully:', user.id);
      return user;
    } catch (error) {
      this.logger.error('Failed to create user:', error);
      throw error;
    }
  }
}
```
## Envi
ronment Management

### Environment Configuration

Manage different environments effectively:

```bash
# Development environment
NODE_ENV=development mifty dev

# Staging environment
NODE_ENV=staging mifty start

# Production environment
NODE_ENV=production mifty start
```

### Environment Variables

Use environment-specific variables:

```bash
# .env.development
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_NAME=mifty_dev
LOG_LEVEL=debug

# .env.production
NODE_ENV=production
PORT=8080
DB_HOST=prod-db.example.com
DB_NAME=mifty_prod
LOG_LEVEL=error
```

### Docker Development

Use Docker for consistent development environments:

```dockerfile
# Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: mifty_dev
      POSTGRES_USER: dev_user
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## Code Quality

### Linting and Formatting

Maintain code quality with automated tools:

```bash
# Install development dependencies
npm install --save-dev eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code
npm run format
```

### Pre-commit Hooks

Set up pre-commit hooks with Husky:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test"
    }
  },
  "lint-staged": {
    "src/**/*.{ts,js}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

### Code Review Checklist

- [ ] Code follows TypeScript and Mifty conventions
- [ ] All tests pass and coverage meets requirements
- [ ] No console.log statements in production code
- [ ] Error handling is implemented properly
- [ ] Database queries are optimized
- [ ] Security best practices are followed
- [ ] Documentation is updated if needed

## Performance Optimization

### Development Performance

Optimize development workflow performance:

```json
{
  "development": {
    "performance": {
      "enableSourceMaps": true,
      "enableTypeChecking": true,
      "enableHotReload": true,
      "watchOptions": {
        "ignored": ["node_modules", "dist", "coverage"],
        "aggregateTimeout": 300
      }
    }
  }
}
```

### Build Optimization

Configure build optimizations:

```bash
# Build with optimizations
mifty build --optimize

# Build with source maps
mifty build --source-maps

# Build for specific environment
mifty build --env production

# Analyze bundle size
mifty build --analyze
```

## Deployment Workflow

### Build Process

Prepare application for deployment:

```bash
# Clean previous builds
mifty clean

# Install production dependencies
npm ci --only=production

# Build application
mifty build

# Run production tests
mifty test --env production
```

### CI/CD Pipeline

Example GitHub Actions workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Your deployment script here
          npm run deploy:production
```

### Health Checks

Implement health check endpoints:

```typescript
import { Controller, Get } from '@mifty/core';

@Controller('health')
export class HealthController {
  @Get()
  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version
    };
  }

  @Get('ready')
  async readiness() {
    // Check database connectivity, external services, etc.
    return {
      status: 'ready',
      checks: {
        database: 'connected',
        redis: 'connected'
      }
    };
  }
}
```

## Best Practices

### Development Guidelines

1. **Follow naming conventions**: Use PascalCase for classes, camelCase for variables and functions
2. **Write descriptive commit messages**: Use conventional commit format
3. **Keep functions small**: Single responsibility principle
4. **Use TypeScript features**: Leverage types, interfaces, and decorators
5. **Handle errors gracefully**: Implement proper error handling and logging
6. **Write tests first**: Follow TDD when possible
7. **Document your code**: Use JSDoc comments for complex functions

### Project Organization

- Keep related files together in feature-based folders
- Use barrel exports (index.ts) for clean imports
- Separate business logic from framework code
- Use dependency injection for better testability
- Keep configuration external and environment-specific

### Security Practices

- Never commit sensitive data to version control
- Use environment variables for secrets
- Validate all input data
- Implement proper authentication and authorization
- Keep dependencies updated
- Use HTTPS in production
- Implement rate limiting and request validation

### Performance Guidelines

- Use database indexes appropriately
- Implement caching strategies
- Optimize database queries
- Use connection pooling
- Monitor application performance
- Profile and optimize bottlenecks
- Use CDN for static assets