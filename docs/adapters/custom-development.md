# Custom Adapter Development

Creating custom adapters for Mifty Framework to integrate with third-party services and APIs.

## Overview

Mifty adapters are reusable modules that provide standardized interfaces for integrating with external services. They follow a consistent pattern and can be easily shared across projects or published to npm.

## Adapter Architecture

### Core Components

Every Mifty adapter consists of:

- **Configuration Schema** - Defines required and optional settings
- **Service Interface** - Standardized methods for the service type
- **Implementation** - Actual service integration logic
- **Type Definitions** - TypeScript interfaces and types
- **Tests** - Unit and integration tests

### Adapter Types

Mifty supports several adapter categories:

- **Authentication** - OAuth, SAML, JWT providers
- **Storage** - File storage, CDN, cloud storage
- **Communication** - Email, SMS, push notifications
- **Payment** - Payment processors, billing systems
- **Analytics** - Tracking, metrics, monitoring
- **Database** - Additional database providers
- **Cache** - Redis, Memcached, in-memory stores

## Creating Your First Adapter

### 1. Generate Adapter Scaffold

```bash
# Create a new adapter
mifty adapter:create my-service-adapter --type=communication

# Or use the interactive generator
mifty adapter:create --interactive
```

This generates the following structure:

```
src/adapters/my-service-adapter/
├── index.ts                 # Main export
├── config.ts               # Configuration schema
├── service.ts              # Service implementation
├── types.ts                # Type definitions
├── __tests__/              # Test files
│   ├── service.test.ts
│   └── integration.test.ts
└── README.md               # Adapter documentation
```

### 2. Define Configuration Schema

```typescript
// src/adapters/my-service-adapter/config.ts
import { z } from 'zod';
import { AdapterConfig } from '@mifty/core';

export const MyServiceConfigSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  apiUrl: z.string().url().default('https://api.myservice.com'),
  timeout: z.number().positive().default(5000),
  retryAttempts: z.number().min(0).default(3),
  enableLogging: z.boolean().default(false)
});

export type MyServiceConfig = z.infer<typeof MyServiceConfigSchema>;

export const myServiceAdapterConfig: AdapterConfig<MyServiceConfig> = {
  name: 'my-service',
  version: '1.0.0',
  description: 'Integration with MyService API',
  configSchema: MyServiceConfigSchema,
  category: 'communication',
  tags: ['email', 'notifications', 'api']
};
```

### 3. Define Service Interface

```typescript
// src/adapters/my-service-adapter/types.ts
export interface SendMessageRequest {
  to: string;
  subject?: string;
  content: string;
  template?: string;
  variables?: Record<string, any>;
}

export interface SendMessageResponse {
  messageId: string;
  status: 'sent' | 'queued' | 'failed';
  timestamp: Date;
}

export interface MessageStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'failed' | 'bounced';
  deliveredAt?: Date;
  error?: string;
}

export interface MyServiceAdapter {
  sendMessage(request: SendMessageRequest): Promise<SendMessageResponse>;
  getMessageStatus(messageId: string): Promise<MessageStatus>;
  validateConfig(): Promise<boolean>;
}
```

### 4. Implement Service Logic

```typescript
// src/adapters/my-service-adapter/service.ts
import { Logger } from '@mifty/core';
import { MyServiceConfig } from './config';
import { 
  MyServiceAdapter, 
  SendMessageRequest, 
  SendMessageResponse, 
  MessageStatus 
} from './types';

export class MyServiceAdapterImpl implements MyServiceAdapter {
  private readonly logger: Logger;
  private readonly httpClient: any; // Use your preferred HTTP client

  constructor(
    private readonly config: MyServiceConfig,
    logger?: Logger
  ) {
    this.logger = logger || new Logger('MyServiceAdapter');
    this.httpClient = this.createHttpClient();
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      this.logger.info('Sending message', { to: request.to });

      const response = await this.httpClient.post('/messages', {
        recipient: request.to,
        subject: request.subject,
        body: request.content,
        template_id: request.template,
        variables: request.variables
      });

      return {
        messageId: response.data.id,
        status: response.data.status,
        timestamp: new Date(response.data.created_at)
      };
    } catch (error) {
      this.logger.error('Failed to send message', error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async getMessageStatus(messageId: string): Promise<MessageStatus> {
    try {
      const response = await this.httpClient.get(`/messages/${messageId}`);
      
      return {
        messageId: response.data.id,
        status: response.data.status,
        deliveredAt: response.data.delivered_at ? 
          new Date(response.data.delivered_at) : undefined,
        error: response.data.error_message
      };
    } catch (error) {
      this.logger.error('Failed to get message status', error);
      throw new Error(`Failed to get message status: ${error.message}`);
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      await this.httpClient.get('/health');
      return true;
    } catch (error) {
      this.logger.error('Config validation failed', error);
      return false;
    }
  }

  private createHttpClient() {
    // Configure HTTP client with authentication, timeouts, etc.
    return {
      baseURL: this.config.apiUrl,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      // Add retry logic, error handling, etc.
    };
  }
}
```

### 5. Create Main Export

```typescript
// src/adapters/my-service-adapter/index.ts
import { AdapterFactory } from '@mifty/core';
import { MyServiceAdapterImpl } from './service';
import { myServiceAdapterConfig, MyServiceConfig } from './config';

export const createMyServiceAdapter: AdapterFactory<MyServiceConfig> = (config) => {
  return new MyServiceAdapterImpl(config);
};

export { 
  myServiceAdapterConfig,
  MyServiceConfig,
  MyServiceAdapter,
  SendMessageRequest,
  SendMessageResponse,
  MessageStatus
} from './types';

// Default export for easy importing
export default {
  config: myServiceAdapterConfig,
  factory: createMyServiceAdapter
};
```

## Advanced Features

### Error Handling and Retry Logic

```typescript
import { RetryPolicy, CircuitBreaker } from '@mifty/core';

export class RobustMyServiceAdapter extends MyServiceAdapterImpl {
  private readonly retryPolicy: RetryPolicy;
  private readonly circuitBreaker: CircuitBreaker;

  constructor(config: MyServiceConfig) {
    super(config);
    
    this.retryPolicy = new RetryPolicy({
      maxAttempts: config.retryAttempts,
      backoffStrategy: 'exponential',
      baseDelay: 1000
    });

    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 30000
    });
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    return this.circuitBreaker.execute(async () => {
      return this.retryPolicy.execute(async () => {
        return super.sendMessage(request);
      });
    });
  }
}
```

### Caching Support

```typescript
import { CacheManager } from '@mifty/core';

export class CachedMyServiceAdapter extends MyServiceAdapterImpl {
  constructor(
    config: MyServiceConfig,
    private readonly cache: CacheManager
  ) {
    super(config);
  }

  async getMessageStatus(messageId: string): Promise<MessageStatus> {
    const cacheKey = `message_status:${messageId}`;
    
    // Try cache first
    const cached = await this.cache.get<MessageStatus>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const status = await super.getMessageStatus(messageId);
    
    // Cache for 5 minutes
    await this.cache.set(cacheKey, status, 300);
    
    return status;
  }
}
```

### Event Emission

```typescript
import { EventEmitter } from '@mifty/core';

export class EventAwareMyServiceAdapter extends MyServiceAdapterImpl {
  constructor(
    config: MyServiceConfig,
    private readonly eventEmitter: EventEmitter
  ) {
    super(config);
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    this.eventEmitter.emit('message.sending', { request });
    
    try {
      const response = await super.sendMessage(request);
      this.eventEmitter.emit('message.sent', { request, response });
      return response;
    } catch (error) {
      this.eventEmitter.emit('message.failed', { request, error });
      throw error;
    }
  }
}
```

## Testing Your Adapter

### Unit Tests

```typescript
// src/adapters/my-service-adapter/__tests__/service.test.ts
import { MyServiceAdapterImpl } from '../service';
import { MyServiceConfig } from '../config';

describe('MyServiceAdapter', () => {
  let adapter: MyServiceAdapterImpl;
  let mockConfig: MyServiceConfig;

  beforeEach(() => {
    mockConfig = {
      apiKey: 'test-key',
      apiUrl: 'https://api.test.com',
      timeout: 5000,
      retryAttempts: 3,
      enableLogging: false
    };
    
    adapter = new MyServiceAdapterImpl(mockConfig);
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      // Mock HTTP client response
      jest.spyOn(adapter as any, 'httpClient').mockResolvedValue({
        data: {
          id: 'msg-123',
          status: 'sent',
          created_at: '2023-01-01T00:00:00Z'
        }
      });

      const request = {
        to: 'test@example.com',
        subject: 'Test',
        content: 'Hello World'
      };

      const response = await adapter.sendMessage(request);

      expect(response.messageId).toBe('msg-123');
      expect(response.status).toBe('sent');
    });

    it('should handle API errors', async () => {
      jest.spyOn(adapter as any, 'httpClient').mockRejectedValue(
        new Error('API Error')
      );

      const request = {
        to: 'test@example.com',
        content: 'Hello World'
      };

      await expect(adapter.sendMessage(request)).rejects.toThrow('Failed to send message');
    });
  });
});
```

### Integration Tests

```typescript
// src/adapters/my-service-adapter/__tests__/integration.test.ts
import { MyServiceAdapterImpl } from '../service';

describe('MyServiceAdapter Integration', () => {
  let adapter: MyServiceAdapterImpl;

  beforeAll(() => {
    // Use test API credentials
    adapter = new MyServiceAdapterImpl({
      apiKey: process.env.TEST_API_KEY!,
      apiUrl: 'https://api-sandbox.myservice.com',
      timeout: 10000,
      retryAttempts: 1,
      enableLogging: true
    });
  });

  it('should validate configuration', async () => {
    const isValid = await adapter.validateConfig();
    expect(isValid).toBe(true);
  });

  it('should send and track message', async () => {
    const response = await adapter.sendMessage({
      to: 'test@example.com',
      subject: 'Integration Test',
      content: 'This is a test message'
    });

    expect(response.messageId).toBeDefined();
    expect(response.status).toMatch(/sent|queued/);

    // Check status
    const status = await adapter.getMessageStatus(response.messageId);
    expect(status.messageId).toBe(response.messageId);
  });
});
```

## Publishing Your Adapter

### 1. Package Configuration

```json
// package.json
{
  "name": "@your-org/mifty-adapter-myservice",
  "version": "1.0.0",
  "description": "Mifty adapter for MyService integration",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "keywords": ["mifty", "adapter", "myservice", "communication"],
  "peerDependencies": {
    "@mifty/core": "^1.0.0"
  },
  "files": ["dist", "README.md"]
}
```

### 2. Documentation

Create comprehensive README.md:

```markdown
# Mifty MyService Adapter

Integration adapter for MyService API.

## Installation

\`\`\`bash
npm install @your-org/mifty-adapter-myservice
\`\`\`

## Configuration

\`\`\`typescript
import { myServiceAdapter } from '@your-org/mifty-adapter-myservice';

const adapter = myServiceAdapter.factory({
  apiKey: process.env.MYSERVICE_API_KEY,
  apiUrl: 'https://api.myservice.com',
  timeout: 5000
});
\`\`\`

## Usage

\`\`\`typescript
const response = await adapter.sendMessage({
  to: 'user@example.com',
  subject: 'Welcome!',
  content: 'Welcome to our service!'
});
\`\`\`
```

### 3. Publish to Registry

```bash
# Build the adapter
npm run build

# Run tests
npm test

# Publish to npm
npm publish

# Or publish to Mifty adapter registry
mifty adapter:publish
```

## Best Practices

### Configuration Management

- Use environment variables for sensitive data
- Provide sensible defaults
- Validate configuration on startup
- Support multiple environments

### Error Handling

- Use specific error types
- Provide meaningful error messages
- Implement proper retry logic
- Log errors appropriately

### Performance

- Implement connection pooling
- Use caching where appropriate
- Add circuit breakers for external calls
- Monitor and measure performance

### Security

- Never log sensitive data
- Validate all inputs
- Use secure communication (HTTPS)
- Follow principle of least privilege

This comprehensive guide should help you create robust, reusable adapters that integrate seamlessly with the Mifty ecosystem.