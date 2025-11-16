# Repository Decorator

The Repository Decorator provides automatic error handling and logging for repository operations.

## Overview

The Repository Decorator wraps repository methods to provide consistent error handling, logging, and response formatting across all repository operations.

## Usage

```typescript
import { RepositoryDecorator } from '@mifty/core';

@RepositoryDecorator()
export class UserRepository extends BaseRepository<User> {
  // Repository methods are automatically wrapped with error handling
}
```

## Features

- **Automatic Error Handling**: Catches and formats repository errors
- **Logging Integration**: Logs all repository operations
- **Response Formatting**: Standardizes repository response format
- **Transaction Support**: Handles database transactions automatically

## Configuration

The decorator can be configured with custom options:

```typescript
@RepositoryDecorator({
  logLevel: 'debug',
  enableTransactions: true,
  errorHandler: customErrorHandler
})
export class CustomRepository extends BaseRepository<Entity> {
  // Custom configuration applied
}
```

## Related

- [BaseRepository](../base-repository.md) - Base repository implementation
- [IRepository Interface](../interfaces/repository-interface.md) - Repository contract
- [Error Handling](../../patterns/error-handling.md) - Error handling patterns