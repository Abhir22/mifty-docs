# Project Structure & Configuration

This guide explains the complete project structure of a Mifty application and how to configure various aspects of your project.

## 📁 Project Structure Overview

When you create a new Mifty project with `mifty init`, you get a well-organized structure that follows enterprise patterns:

```
my-mifty-app/
├── 📁 src/                          # Source code directory
│   ├── 📁 core/                     # Framework core components
│   │   ├── 📁 base/                 # Base classes (Controller, Service, Repository)
│   │   ├── 📁 interfaces/           # TypeScript interfaces and contracts
│   │   ├── 📁 middlewares/          # Express middlewares
│   │   ├── 📁 exceptions/           # Custom exception classes
│   │   ├── 📁 decorators/           # Custom decorators
│   │   └── 📁 utils/                # Utility functions and helpers
│   ├── 📁 modules/                  # Business logic modules
│   │   └── 📁 user/                 # Example user module
│   │       ├── 📁 controllers/      # HTTP request handlers
│   │       ├── 📁 services/         # Business logic layer
│   │       ├── 📁 repositories/     # Data access layer
│   │       ├── 📁 dto/              # Data transfer objects
│   │       ├── 📁 routes/           # Route definitions
│   │       └── 📄 di.ts             # Dependency injection setup
│   ├── 📁 loaders/                  # Application initialization
│   │   ├── 📄 di.ts                 # Dependency injection loader
│   │   ├── 📄 express.ts            # Express app configuration
│   │   ├── 📄 routes.ts             # Route loader
│   │   ├── 📄 prisma.ts             # Database connection
│   │   └── 📄 swagger.ts            # API documentation
│   ├── 📁 config/                   # Configuration files
│   │   ├── 📄 services.config.ts    # Service orchestration
│   │   └── 📄 multer.config.ts      # File upload configuration
│   ├── 📁 prisma/                   # Database schema and migrations
│   │   ├── 📄 schema.prisma         # Prisma schema definition
│   │   └── 📁 migrations/           # Database migrations
│   ├── 📁 servers/                  # Server entry points
│   │   ├── 📄 user.server.ts        # Main API server
│   │   └── 📄 db-designer.server.ts # Database designer server
│   ├── 📁 scripts/                  # CLI scripts and generators
│   │   ├── 📁 generators/           # Code generation templates
│   │   ├── 📁 adapters/             # Adapter installation scripts
│   │   └── 📄 monitor.ts            # Error monitoring
│   ├── 📁 types/                    # TypeScript type definitions
│   │   ├── 📄 app-config.ts         # Application configuration types
│   │   └── 📁 express/              # Express type extensions
│   ├── 📁 tests/                    # Test files
│   │   ├── 📄 setup.ts              # Test configuration
│   │   └── 📁 integration/          # Integration tests
│   ├── 📄 app.ts                    # Main application class
│   └── 📄 db.design.ts              # Visual database design file
├── 📁 uploads/                      # File upload directory
├── 📄 .env                          # Environment variables
├── 📄 .env.example                  # Environment template
├── 📄 package.json                  # Dependencies and scripts
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 .eslintrc.js                  # ESLint configuration
├── 📄 .prettierrc.js                # Prettier configuration
├── 📄 jest.config.js                # Jest testing configuration
└── 📄 README.md                     # Project documentation
```

## ⚙️ Configuration Files

### 📄 Environment Configuration (`.env`)

The `.env` file contains all environment-specific settings:

```bash
# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# ============================================
# APPLICATION CONFIGURATION
# ============================================
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# ============================================
# JWT AUTHENTICATION
# ============================================
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=1d

# ============================================
# FILE UPLOAD CONFIGURATION
# ============================================
LOCAL_UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB in bytes

# ============================================
# EMAIL CONFIGURATION (Optional)
# ============================================
EMAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# ============================================
# REDIS CONFIGURATION (Optional)
# ============================================
REDIS_URL=redis://localhost:6379

# ============================================
# AWS CONFIGURATION (Optional)
# ============================================
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### 📄 TypeScript Configuration (`tsconfig.json`)

Optimized TypeScript configuration for Node.js development:

```json
{
  "compilerOptions": {
    "target": "ES2020",                    // Modern JavaScript features
    "module": "commonjs",                  // Node.js module system
    "outDir": "./dist",                    // Compiled output directory
    "rootDir": "./src",                    // Source code directory
    "strict": true,                        // Strict type checking
    "esModuleInterop": true,              // ES module compatibility
    "skipLibCheck": true,                 // Skip type checking of declaration files
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]                     // Path mapping for imports
    },
    "experimentalDecorators": true,        // Enable decorators
    "emitDecoratorMetadata": true,        // Metadata for dependency injection
    "types": ["jest", "node", "express"]
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 📄 Application Configuration (`src/types/app-config.ts`)

Type-safe application configuration:

```typescript
export interface AppConfig {
  modules: ModuleConfig[];     // Which modules to load
  server: ServerConfig;        // Server configuration
}

export interface ModuleConfig {
  name: string;               // Module name (e.g., 'user', 'product')
  enabled: boolean;           // Enable/disable module
  routesPrefix?: string;      // API route prefix (e.g., '/api/v1/user')
  includeRoutes?: string[];   // Specific routes to include
  excludeRoutes?: string[];   // Specific routes to exclude
}

export interface ServerConfig {
  port: number;               // Server port
  enableCors?: boolean;       // Enable CORS middleware
  enableHelmet?: boolean;     // Enable security headers
  enableCompression?: boolean; // Enable gzip compression
  enableLogging?: boolean;    // Enable request logging
}
```

### 📄 Services Configuration (`src/config/services.config.ts`)

Configure which services run in different environments:

```typescript
export const SERVICES_CONFIG = {
  // Development mode (npm run dev)
  dev: [
    {
      name: 'API',
      script: 'ts-node-dev --respawn src/servers/user.server.ts',
      port: 3000,
      description: 'Main API Server'
    },
    {
      name: 'Monitor',
      script: 'node bin/monitor.js --auto-fix',
      description: 'Error Monitor with Auto-fix'
    }
  ],
  
  // Production mode (npm run start)
  start: [
    {
      name: 'API',
      script: 'node dist/servers/user.server.js',
      port: 3000,
      description: 'Main API Server'
    }
  ],
  
  // Full development mode (npm run dev:full)
  full: [
    {
      name: 'API',
      script: 'ts-node-dev --respawn src/servers/user.server.ts',
      port: 3000,
      description: 'Main API Server'
    },
    {
      name: 'DB-Designer',
      script: 'node bin/db-designer.js',
      port: 3001,
      description: 'Database Designer UI'
    },
    {
      name: 'Monitor',
      script: 'node bin/monitor.js --auto-fix',
      description: 'Error Monitor with Auto-fix'
    },
    {
      name: 'Prisma',
      script: 'prisma studio',
      port: 5555,
      description: 'Prisma Studio Database Viewer'
    }
  ]
};
```

## 🗄️ Database Configuration

### 📄 Prisma Schema (`src/prisma/schema.prisma`)

The Prisma schema defines your database structure:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // or "mysql", "sqlite", "sqlserver", "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("users")
}
```

### 📄 Visual Database Design (`src/db.design.ts`)

Alternative to Prisma schema - visual database design:

```typescript
export const dbDesign = {
  User: {
    columns: {
      id: { type: 'String', primary: true, randomUUID: true, nullable: false },
      email: { type: 'String', maxLength: 255, unique: true, nullable: false },
      name: { type: 'String', maxLength: 100, nullable: true },
      createdAt: { type: 'DateTime', default: 'now()' },
      updatedAt: { type: 'DateTime', default: 'now()' }
    },
    indexes: [
      { fields: ['email'], name: 'idx_user_email' }
    ]
  }
};
```

## 🏗️ Module Structure

Each business module follows a consistent structure:

```
src/modules/user/
├── 📁 controllers/
│   └── 📄 user.controller.ts        # HTTP request handlers
├── 📁 services/
│   └── 📄 user.service.ts           # Business logic
├── 📁 repositories/
│   └── 📄 user.repository.ts        # Data access
├── 📁 dto/
│   ├── 📄 create-user.dto.ts        # Input validation schemas
│   ├── 📄 update-user.dto.ts
│   └── 📄 user-response.dto.ts      # Response formatting
├── 📁 routes/
│   └── 📄 user.routes.ts            # Route definitions
└── 📄 di.ts                         # Dependency injection setup
```

### Example Module Configuration

```typescript
// src/servers/user.server.ts
const config: AppConfig = {
  modules: [
    { 
      name: 'user', 
      enabled: true, 
      routesPrefix: '/api/v1/user' 
    },
    { 
      name: 'product', 
      enabled: true, 
      routesPrefix: '/api/v1/product',
      includeRoutes: ['product', 'category']  // Only load specific routes
    }
  ],
  server: {
    port: parseInt(process.env.PORT || '3000'),
    enableCors: true,
    enableHelmet: true,
    enableCompression: true,
    enableLogging: true
  }
};
```

## 🔧 Development Configuration

### 📄 ESLint Configuration (`.eslintrc.js`)

Code quality and style enforcement:

```javascript
module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  rules: {
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    'no-console': 'error'
  }
};
```

### 📄 Prettier Configuration (`.prettierrc.js`)

Code formatting rules:

```javascript
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
};
```

### 📄 Jest Configuration (`package.json`)

Testing configuration:

```json
{
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "roots": ["<rootDir>/src"],
    "transform": {
      "^.+\\.tsx?$": "ts-jest"
    },
    "moduleNameMapping": {
      "^@/(.*)$": "<rootDir>/src/$1"
    },
    "setupFilesAfterEnv": ["<rootDir>/src/tests/setup.ts"],
    "coveragePathIgnorePatterns": [
      "/node_modules/",
      "/tests/",
      "/dist/"
    ]
  }
}
```

## 📦 Package.json Scripts

Essential npm scripts for development and deployment:

```json
{
  "scripts": {
    // Development
    "dev": "ts-node src/scripts/start-services.ts dev",
    "dev:full": "ts-node src/scripts/start-services.ts full",
    "dev:server": "ts-node-dev --respawn src/servers/user.server.ts",
    
    // Production
    "build": "rimraf dist && tsc && tsc-alias",
    "start": "ts-node src/scripts/start-services.ts start",
    
    // Database
    "prisma:generate": "prisma generate --schema=./src/prisma/schema.prisma",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:push": "prisma db push --schema=./src/prisma/schema.prisma",
    "prisma:reset": "prisma migrate reset --schema=./src/prisma/schema.prisma",
    
    // Code Generation
    "generate": "node bin/generate.js",
    "generate:module": "node bin/generate.js generate-module",
    
    // Tools
    "db-designer": "DB_DESIGNER_PORT=3001 node bin/db-designer.js",
    "monitor": "node bin/monitor.js",
    "adapter": "node bin/adapter.js",
    
    // Testing
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:integration": "jest tests/integration",
    
    // Code Quality
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

## 🌍 Environment Management

### Development Environment

```bash
# .env.development
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/mifty_dev"
LOG_LEVEL=debug
```

### Production Environment

```bash
# .env.production
NODE_ENV=production
PORT=8080
DATABASE_URL="postgresql://user:pass@prod-db:5432/myapp"
LOG_LEVEL=error
JWT_SECRET=super-secure-production-secret
```

### Testing Environment

```bash
# .env.test
NODE_ENV=test
DATABASE_URL="postgresql://postgres:password@localhost:5432/mifty_test"
LOG_LEVEL=silent
```

## 🔒 Security Configuration

### Environment Variables Security

- **Never commit** `.env` files to version control
- Use **strong, unique secrets** for production
- **Rotate secrets** regularly
- Use **environment-specific** configurations

### Recommended Security Settings

```bash
# Strong JWT secret (32+ characters)
JWT_SECRET=your-super-secure-jwt-secret-key-with-32-plus-characters

# Secure database connections
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# File upload limits
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx
```

## 📊 Monitoring Configuration

### Error Monitoring

The built-in monitor can be configured:

```bash
# Start with auto-fix enabled
npm run monitor -- --auto-fix

# Monitor specific types
npm run monitor -- --mode imports
npm run monitor -- --mode errors
```

### Logging Configuration

```typescript
// src/core/utils/logger.ts
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

## 🚀 Deployment Configuration

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY src/prisma ./src/prisma

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

This comprehensive configuration setup ensures your Mifty application is properly structured, secure, and ready for both development and production environments.