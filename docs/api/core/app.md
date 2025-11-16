# App Class

The `App` class is the main application class that orchestrates the initialization and configuration of your Mifty application.

## Class Definition

```typescript
class App {
  public app: express.Application;
  private config: AppConfig;

  constructor(config: AppConfig)
  public async build(): Promise<void>
  public listen(): void
  public getServer(): express.Application
}
```

## Constructor

### `constructor(config: AppConfig)`

Creates a new App instance with the provided configuration.

**Parameters:**
- `config: AppConfig` - Application configuration object

**Example:**
```typescript
import App from '@mifty/core';
import { AppConfig } from '@mifty/types';

const config: AppConfig = {
  modules: [
    { name: 'user', enabled: true },
    { name: 'auth', enabled: true }
  ],
  server: {
    port: 3000,
    enableCors: true,
    enableHelmet: true,
    enableCompression: true,
    enableLogging: true
  }
};

const app = new App(config);
```

## Methods

### `build(): Promise<void>`

Initializes all application loaders and middleware in the correct order.

**Returns:** `Promise<void>`

**Process:**
1. Connects to Prisma database
2. Loads dependency injection containers
3. Configures Express middleware
4. Sets up request context middleware
5. Loads health check route
6. Loads configured module routes
7. Sets up error handling middleware

**Example:**
```typescript
const app = new App(config);
await app.build();
```

### `listen(): void`

Starts the HTTP server on the configured port.

**Returns:** `void`

**Example:**
```typescript
const app = new App(config);
await app.build();
app.listen(); // Server running on port 3000
```

### `getServer(): express.Application`

Returns the underlying Express application instance.

**Returns:** `express.Application`

**Example:**
```typescript
const app = new App(config);
const expressApp = app.getServer();

// Use for testing or additional configuration
export default expressApp;
```

## Configuration

The App class uses the `AppConfig` interface for configuration:

```typescript
interface AppConfig {
  modules: ModuleConfig[];
  server: ServerConfig;
}

interface ModuleConfig {
  name: string;
  enabled: boolean;
  routesPrefix?: string;
  includeRoutes?: string[];
  excludeRoutes?: string[];
}

interface ServerConfig {
  port: number;
  enableCors?: boolean;
  enableHelmet?: boolean;
  enableCompression?: boolean;
  enableLogging?: boolean;
}
```

## Health Check Endpoint

The App class automatically creates a health check endpoint at `/health`:

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "user-service",
  "port": 3000,
  "modules": [
    {
      "name": "user",
      "routes": "all"
    }
  ]
}
```

## Complete Example

```typescript
import App from '@mifty/core';
import { AppConfig } from '@mifty/types';

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
    }
  ],
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    enableCors: true,
    enableHelmet: true,
    enableCompression: true,
    enableLogging: process.env.NODE_ENV !== 'test'
  }
};

async function startServer() {
  const app = new App(config);
  await app.build();
  app.listen();
}

startServer().catch(console.error);
```

## Related

- [AppConfig Types](../types/app-config.md)
- [Loaders](./loaders.md)
- [BaseController](./base-controller.md)