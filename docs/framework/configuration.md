# Configuration

Learn how to configure your Mifty application for different environments and use cases.

## Overview

Mifty uses a hierarchical configuration system that supports environment variables, configuration files, and runtime overrides. This allows you to maintain different settings for development, staging, and production environments while keeping your configuration organized and secure.

The configuration system follows this priority order (highest to lowest):
1. Runtime overrides
2. Environment variables
3. Environment-specific config files (e.g., `config.production.json`)
4. Base configuration file (`config.json`)
5. Default framework settings

## Configuration Files

### Base Configuration

Create a `config.json` file in your project root to define your base application settings:

```json
{
  "app": {
    "name": "my-mifty-app",
    "version": "1.0.0",
    "port": 3000,
    "host": "localhost"
  },
  "database": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "database": "mifty_app",
    "synchronize": false,
    "logging": false
  },
  "security": {
    "cors": {
      "enabled": true,
      "origin": ["http://localhost:3000"]
    },
    "rateLimit": {
      "windowMs": 900000,
      "max": 100
    }
  }
}
```

### Environment-Specific Configuration

Create environment-specific configuration files to override base settings:

- `config.development.json` - Development environment
- `config.staging.json` - Staging environment  
- `config.production.json` - Production environment

Example `config.production.json`:

```json
{
  "app": {
    "port": 8080,
    "host": "0.0.0.0"
  },
  "database": {
    "host": "prod-db.example.com",
    "ssl": true,
    "logging": false
  },
  "security": {
    "cors": {
      "origin": ["https://myapp.com", "https://www.myapp.com"]
    }
  }
}
```

## Environment Variables

Environment variables take precedence over configuration files and are ideal for sensitive data like API keys and database credentials.

### Database Configuration

```bash
# Database connection
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=myuser
DB_PASSWORD=mypassword
DB_DATABASE=mifty_app

# Database SSL (production)
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

### Application Settings

```bash
# Application
NODE_ENV=production
PORT=8080
HOST=0.0.0.0

# Security
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-32-character-encryption-key

# External Services
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=smtp-password
```

## Application Settings

### Server Configuration

Configure your application server behavior:

```json
{
  "app": {
    "name": "my-app",
    "version": "1.0.0",
    "port": 3000,
    "host": "localhost",
    "trustProxy": false,
    "bodyLimit": "10mb",
    "timeout": 30000
  }
}
```

### Database Settings

Configure your database connection and behavior:

```json
{
  "database": {
    "type": "postgresql",
    "host": "localhost", 
    "port": 5432,
    "username": "user",
    "password": "password",
    "database": "myapp",
    "synchronize": false,
    "logging": ["error", "warn"],
    "ssl": false,
    "poolSize": 10,
    "connectionTimeout": 60000,
    "acquireTimeout": 60000,
    "timeout": 60000
  }
}
```

### Security Configuration

Configure security features including CORS, rate limiting, and authentication:

```json
{
  "security": {
    "cors": {
      "enabled": true,
      "origin": ["http://localhost:3000"],
      "methods": ["GET", "POST", "PUT", "DELETE"],
      "allowedHeaders": ["Content-Type", "Authorization"],
      "credentials": true
    },
    "rateLimit": {
      "windowMs": 900000,
      "max": 100,
      "message": "Too many requests from this IP"
    },
    "helmet": {
      "enabled": true,
      "contentSecurityPolicy": false
    },
    "jwt": {
      "expiresIn": "24h",
      "issuer": "mifty-app",
      "audience": "mifty-users"
    }
  }
}
```
###
 Logging Configuration

Configure application logging levels and outputs:

```json
{
  "logging": {
    "level": "info",
    "format": "json",
    "transports": [
      {
        "type": "console",
        "colorize": true
      },
      {
        "type": "file",
        "filename": "logs/app.log",
        "maxSize": "20m",
        "maxFiles": 5
      }
    ],
    "requestLogging": {
      "enabled": true,
      "excludePaths": ["/health", "/metrics"]
    }
  }
}
```

### Cache Configuration

Configure caching behavior for improved performance:

```json
{
  "cache": {
    "type": "redis",
    "host": "localhost",
    "port": 6379,
    "password": null,
    "db": 0,
    "ttl": 3600,
    "keyPrefix": "mifty:",
    "retryDelayOnFailover": 100,
    "maxRetriesPerRequest": 3
  }
}
```

## Runtime Configuration

### Accessing Configuration

Access configuration values in your application code:

```typescript
import { ConfigService } from '@mifty/core';

export class MyService {
  constructor(private configService: ConfigService) {}

  getAppName(): string {
    return this.configService.get<string>('app.name');
  }

  getDatabaseConfig(): any {
    return this.configService.get('database');
  }

  getPortWithDefault(): number {
    return this.configService.get<number>('app.port', 3000);
  }
}
```

### Dynamic Configuration Updates

Update configuration at runtime for specific scenarios:

```typescript
import { ConfigService } from '@mifty/core';

// Update a configuration value
configService.set('app.maintenance', true);

// Merge configuration objects
configService.merge('security.rateLimit', {
  max: 50,
  windowMs: 600000
});

// Watch for configuration changes
configService.watch('database.host', (newValue, oldValue) => {
  console.log(`Database host changed from ${oldValue} to ${newValue}`);
});
```

## Environment Setup

### Development Environment

Create a `.env` file for local development:

```bash
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=dev_user
DB_PASSWORD=dev_password
DB_DATABASE=mifty_dev
JWT_SECRET=dev-jwt-secret-key
REDIS_URL=redis://localhost:6379
```

### Production Environment

Set environment variables in your production deployment:

```bash
# Application
NODE_ENV=production
PORT=8080
HOST=0.0.0.0

# Database
DB_HOST=prod-db.example.com
DB_PORT=5432
DB_USERNAME=prod_user
DB_PASSWORD=secure-prod-password
DB_DATABASE=mifty_prod
DB_SSL=true

# Security
JWT_SECRET=super-secure-jwt-secret-key
ENCRYPTION_KEY=32-character-encryption-key-here

# External Services
REDIS_URL=redis://prod-redis.example.com:6379
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

## Configuration Validation

### Schema Validation

Define configuration schemas to validate settings:

```typescript
import { ConfigSchema } from '@mifty/core';

const appConfigSchema: ConfigSchema = {
  app: {
    name: { type: 'string', required: true },
    port: { type: 'number', min: 1, max: 65535 },
    host: { type: 'string', default: 'localhost' }
  },
  database: {
    type: { type: 'string', enum: ['postgresql', 'mysql', 'sqlite'] },
    host: { type: 'string', required: true },
    port: { type: 'number', required: true }
  }
};

// Apply schema validation
configService.validateSchema(appConfigSchema);
```

### Environment Validation

Ensure required environment variables are present:

```typescript
import { validateEnv } from '@mifty/core';

validateEnv({
  NODE_ENV: ['development', 'staging', 'production'],
  DB_HOST: 'string',
  DB_PORT: 'number',
  JWT_SECRET: 'string'
});
```

## Best Practices

### Security

- Never commit sensitive data like passwords or API keys to version control
- Use environment variables for all sensitive configuration
- Rotate secrets regularly in production environments
- Use different database credentials for each environment

### Organization

- Keep configuration files organized by environment
- Use descriptive names for configuration keys
- Group related settings together
- Document configuration options and their purposes

### Performance

- Cache frequently accessed configuration values
- Use appropriate data types for configuration values
- Minimize configuration file size and complexity
- Consider using configuration management tools for large deployments

### Monitoring

- Log configuration changes in production
- Monitor configuration drift between environments
- Set up alerts for critical configuration changes
- Regularly audit configuration settings

## Troubleshooting

### Common Issues

**Configuration not loading:**
- Check file paths and naming conventions
- Verify JSON syntax in configuration files
- Ensure environment variables are properly set

**Environment variables not recognized:**
- Verify variable names match exactly (case-sensitive)
- Check if variables are exported in your shell
- Restart your application after setting new variables

**Database connection issues:**
- Verify database credentials and connection details
- Check network connectivity and firewall settings
- Ensure database server is running and accessible

**Performance issues:**
- Review connection pool settings
- Check cache configuration and TTL values
- Monitor resource usage and adjust limits accordingly