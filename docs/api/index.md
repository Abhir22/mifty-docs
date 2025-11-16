# API Reference

Welcome to the Mifty Framework API Reference. This section provides comprehensive documentation for all core modules, interfaces, and utilities available in the Mifty framework.

## Core Modules

The Mifty framework is built around several core modules that provide the foundation for rapid API development:

### Base Classes
- **[BaseController](./core/base-controller.md)** - Abstract controller class with CRUD operations
- **[BaseService](./core/base-service.md)** - Abstract service class with business logic
- **[BaseRepository](./core/base-repository.md)** - Abstract repository class with data access

### Interfaces
- **[IRepository](./core/interfaces/repository-interface.md)** - Repository pattern interface
- **[IService](./core/interfaces/service-interface.md)** - Service layer interface
- **[PaginatedResult](./core/interfaces/paginated-result-interface.md)** - Pagination result interface
- **[SearchOptions](./core/interfaces/search-options-interface.md)** - Search and filtering options

### Utilities
- **[ApiResponse](./core/utils/api-response.md)** - Standardized API response utilities
- **[Logger](./core/utils/logger.md)** - Logging utilities with Winston
- **[RequestOptionBuilder](./core/utils/request-option-builder.md)** - Query parameter validation and parsing

### Application Core
- **[App](./core/app.md)** - Main application class
- **[Loaders](./core/loaders.md)** - Application initialization loaders

## Quick Navigation

### By Category

**Controllers & Routing**
- [BaseController](./core/base-controller.md)
- [Route Loading](./core/loaders.md#route-loader-routests)

**Services & Business Logic**
- [BaseService](./core/base-service.md)
- [IService Interface](./core/interfaces/service-interface.md)

**Data Access**
- [BaseRepository](./core/base-repository.md)
- [IRepository Interface](./core/interfaces/repository-interface.md)

**Utilities**
- [API Responses](./core/utils/api-response.md)
- [Logging](./core/utils/logger.md)
- [Request Parsing](./core/utils/request-option-builder.md)

### By Use Case

**Creating a New Module**
1. [IRepository Interface](./core/interfaces/repository-interface.md) - Define data access
2. [BaseRepository](./core/base-repository.md) - Implement repository
3. [IService Interface](./core/interfaces/service-interface.md) - Define business logic
4. [BaseService](./core/base-service.md) - Implement service
5. [BaseController](./core/base-controller.md) - Create API endpoints

**Handling Requests**
1. [RequestOptionBuilder](./core/utils/request-option-builder.md) - Parse query parameters
2. [SearchOptions](./core/interfaces/search-options-interface.md) - Handle search and pagination
3. [ApiResponse](./core/utils/api-response.md) - Return standardized responses

## Type Definitions

All interfaces and types are fully documented with TypeScript definitions. The framework uses strict typing to ensure type safety and better developer experience.

## Examples

Each API reference page includes:
- Complete method signatures
- Parameter descriptions
- Return type information
- Usage examples
- Related methods and classes

## Getting Started

If you're new to the Mifty framework, start with:
1. [App](./core/app.md) - Understanding the application structure
2. [BaseController](./core/base-controller.md) - Creating your first controller
3. [BaseService](./core/base-service.md) - Implementing business logic
4. [BaseRepository](./core/base-repository.md) - Data access patterns