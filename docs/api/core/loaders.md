# Application Loaders

The Mifty framework uses a loader pattern to initialize different aspects of the application in the correct order. Loaders handle dependency injection, Express configuration, database connections, and route loading.

## Overview

Loaders are responsible for:
- Setting up dependency injection containers
- Configuring Express middleware and settings
- Establishing database connections
- Loading and registering application routes
- Initializing Swagger documentation

## Loader Modules

### Dependency Injection Loader (`di.ts`)

Handles the loading and registration of dependency injection containers for enabled modules.

```typescript
export const loadDI = async (modulesToLoad: string[]): Promise<void>
```

**Parameters:**
- `modulesToLoad: string[]` - Array of module names to load DI for

**Process:**
1. Iterates through each enabled module
2. Looks for `di.ts` or `di.js` files in module directories
3. Imports and executes `registerDependencies()` function if available
4. Logs success or failure for each module

**Example:**
```typescript
// In a module's di.ts file
import { container } from 'tsyringe';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

export function registerDependencies() {
  container.register('UserRepository', { useClass: UserRepository });
  container.register('UserService', { useClass: UserService });
}

// Usage in app initialization
await loadDI(['user', 'auth', 'product']);
```

**Module Structure:**
```
src/modules/user/
├── di.ts                 # Dependency registration
├── user.service.ts
├── user.repository.ts
├── user.controller.ts
└── user.routes.ts
```

### Express Loader (`express.ts`)

Configures Express application with middleware and security settings.

```typescript
export const loadExpressApp = async (app: Application, config: ServerConfig): Promise<void>
```

**Parameters:**
- `app: Application` - Express application instance
- `config: ServerConfig` - Server configuration object

**Configuration Options:**
```typescript
interface ServerConfig {
  port: number;
  enableCors?: boolean;        // Default: true
  enableHelmet?: boolean;      // Default: true
  enableCompression?: boolean; // Default: true
  enableLogging?: boolean;     // Default: true
}
```

**Middleware Setup:**
1. **CORS** - Cross-origin resource sharing (if enabled)
2. **Helmet** - Security headers (if enabled)
3. **Compression** - Response compression (if enabled)
4. **Body Parsing** - JSON and URL-encoded data parsing
5. **Static Files** - Serves uploads directory
6. **Logging** - HTTP request logging with Morgan (if enabled)

**Example:**
```typescript
const config: ServerConfig = {
  port: 3000,
  enableCors: true,
  enableHelmet: true,
  enableCompression: true,
  enableLogging: process.env.NODE_ENV !== 'test'
};

await loadExpressApp(app, config);
```

**Static File Serving:**
```typescript
// Automatically serves files from uploads directory
// Files accessible at: http://localhost:3000/uploads/filename.jpg
const uploadsDir = path.resolve(process.env.LOCAL_UPLOAD_DIR || './uploads');
app.use('/uploads', express.static(uploadsDir));
```

### Prisma Loader (`prisma.ts`)

Establishes database connection using Prisma ORM.

```typescript
export const connectPrisma = async (): Promise<void>
```

**Process:**
1. Initializes Prisma client
2. Establishes database connection
3. Handles connection errors gracefully
4. Logs connection status

**Example:**
```typescript
// Database connection
await connectPrisma();
console.log('Database connected successfully');
```

**Environment Configuration:**
```env
# Database connection string
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# Or for SQLite (alternative)
DATABASE_URL="file:./dev.db"
```

### Route Loader (`routes.ts`)

Dynamically loads and registers routes for enabled modules.

```typescript
export const loadRoutes = async (app: Application, enabledModules: ModuleConfig[]): Promise<void>
```

**Parameters:**
- `app: Application` - Express application instance
- `enabledModules: ModuleConfig[]` - Array of enabled module configurations

**Module Configuration:**
```typescript
interface ModuleConfig {
  name: string;
  enabled: boolean;
  routesPrefix?: string;      // Optional route prefix
  includeRoutes?: string[];   // Specific routes to include
  excludeRoutes?: string[];   // Specific routes to exclude
}
```

**Route Discovery Process:**
1. Scans module directories for route files
2. Applies include/exclude filters if specified
3. Loads route files and registers with Express
4. Applies route prefixes if configured

**Example Module Routes:**
```typescript
// src/modules/user/user.routes.ts
import { Router } from 'express';
import { UserController } from './user.controller';

const router = Router();
const userController = new UserController();

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

export default router;
```

**Route Registration:**
```typescript
const moduleConfig: ModuleConfig[] = [
  {
    name: 'user',
    enabled: true,
    routesPrefix: '/api/v1',
    includeRoutes: ['user', 'profile'], // Only load these route files
  },
  {
    name: 'auth',
    enabled: true,
    routesPrefix: '/auth',
    excludeRoutes: ['admin'] // Load all except admin routes
  }
];

await loadRoutes(app, moduleConfig);
```

**Resulting Routes:**
```
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id

GET    /api/v1/profiles
POST   /api/v1/profiles

POST   /auth/login
POST   /auth/register
POST   /auth/refresh
```

### Swagger Loader (`swagger.ts`)

Sets up API documentation using Swagger/OpenAPI.

```typescript
export const loadSwagger = async (app: Application): Promise<void>
```

**Features:**
- Automatic API documentation generation
- Interactive API explorer
- Schema validation
- Request/response examples

**Configuration:**
```typescript
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mifty API',
      version: '1.0.0',
      description: 'API documentation for Mifty application'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ]
  },
  apis: ['./src/modules/**/*.routes.ts'] // Path to route files
};
```

**Usage:**
```typescript
await loadSwagger(app);
// Swagger UI available at: http://localhost:3000/api-docs
```

## Complete Initialization Example

```typescript
import App from './app';
import { AppConfig } from './types/app-config';

const config: AppConfig = {
  modules: [
    {
      name: 'user',
      enabled: true,
      routesPrefix: '/api/v1',
      includeRoutes: ['user', 'profile']
    },
    {
      name: 'auth',
      enabled: true,
      routesPrefix: '/auth'
    },
    {
      name: 'product',
      enabled: process.env.ENABLE_PRODUCTS === 'true',
      routesPrefix: '/api/v1'
    }
  ],
  server: {
    port: parseInt(process.env.PORT || '3000'),
    enableCors: true,
    enableHelmet: true,
    enableCompression: true,
    enableLogging: process.env.NODE_ENV !== 'test'
  }
};

async function startApplication() {
  const app = new App(config);
  
  // Loaders are called automatically in App.build()
  // 1. connectPrisma()
  // 2. loadDI(enabledModules)
  // 3. loadExpressApp(app, serverConfig)
  // 4. loadRoutes(app, enabledModules)
  // 5. loadSwagger(app) - if enabled
  
  await app.build();
  app.listen();
}

startApplication().catch(console.error);
```

## Loader Execution Order

The loaders are executed in a specific order to ensure proper initialization:

1. **Database Connection** (`connectPrisma`)
   - Establishes database connectivity
   - Required before any database operations

2. **Dependency Injection** (`loadDI`)
   - Registers service dependencies
   - Required before route loading

3. **Express Configuration** (`loadExpressApp`)
   - Sets up middleware and security
   - Required before route registration

4. **Route Loading** (`loadRoutes`)
   - Registers API endpoints
   - Depends on DI and Express setup

5. **Documentation** (`loadSwagger`)
   - Sets up API documentation
   - Should be last to capture all routes

## Error Handling

### Loader Error Handling

```typescript
try {
  await connectPrisma();
  console.log('✅ Database connected');
} catch (error) {
  console.error('❌ Database connection failed:', error);
  process.exit(1);
}

try {
  await loadDI(enabledModules.map(m => m.name));
  console.log('✅ Dependencies loaded');
} catch (error) {
  console.error('❌ DI loading failed:', error);
  // Continue with degraded functionality
}
```

### Module Loading Errors

```typescript
// In loadDI function
for (const moduleName of modulesToLoad) {
  try {
    const diModule = await import(modulePath);
    if (typeof diModule.registerDependencies === 'function') {
      diModule.registerDependencies();
      console.info(`✅ Successfully registered dependencies for ${moduleName}`);
    }
  } catch (error) {
    console.error(`❌ Failed to load DI for ${moduleName}:`, error);
    // Continue with other modules
  }
}
```

## Environment-Specific Configuration

### Development Environment

```typescript
const developmentConfig: AppConfig = {
  modules: [
    { name: 'user', enabled: true },
    { name: 'auth', enabled: true },
    { name: 'admin', enabled: true }, // Admin routes in development
  ],
  server: {
    port: 3000,
    enableCors: true,
    enableLogging: true // Detailed logging
  }
};
```

### Production Environment

```typescript
const productionConfig: AppConfig = {
  modules: [
    { name: 'user', enabled: true },
    { name: 'auth', enabled: true },
    // Admin module disabled in production
  ],
  server: {
    port: parseInt(process.env.PORT || '8080'),
    enableCors: process.env.ENABLE_CORS === 'true',
    enableLogging: false // Minimal logging
  }
};
```

### Testing Environment

```typescript
const testConfig: AppConfig = {
  modules: [
    { name: 'user', enabled: true },
    { name: 'auth', enabled: false }, // Skip auth in tests
  ],
  server: {
    port: 0, // Random port
    enableLogging: false // No logging in tests
  }
};
```

## Best Practices

### 1. Module Organization

```typescript
// Good: Organized module structure
src/modules/user/
├── di.ts              # Dependency registration
├── user.controller.ts
├── user.service.ts
├── user.repository.ts
├── user.routes.ts
├── user.types.ts
└── user.schema.ts
```

### 2. Conditional Module Loading

```typescript
const config: AppConfig = {
  modules: [
    { name: 'user', enabled: true },
    { name: 'admin', enabled: process.env.NODE_ENV === 'development' },
    { name: 'analytics', enabled: process.env.ENABLE_ANALYTICS === 'true' }
  ]
};
```

### 3. Error Recovery

```typescript
// Graceful degradation for optional modules
const optionalModules = ['analytics', 'notifications'];
const criticalModules = ['user', 'auth'];

for (const module of criticalModules) {
  try {
    await loadModule(module);
  } catch (error) {
    console.error(`Critical module ${module} failed to load`);
    process.exit(1);
  }
}

for (const module of optionalModules) {
  try {
    await loadModule(module);
  } catch (error) {
    console.warn(`Optional module ${module} failed to load, continuing...`);
  }
}
```

## Related

- [App Class](./app.md) - Main application orchestration
- [Module Configuration](../types/app-config.md) - Configuration interfaces
- [Dependency Injection](../patterns/dependency-injection.md) - DI patterns
- [Route Organization](../patterns/route-organization.md) - Route structure patterns