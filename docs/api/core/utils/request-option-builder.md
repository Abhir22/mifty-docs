# RequestOptionBuilder Utility

The `RequestOptionBuilder` utility provides methods for parsing and validating query parameters from HTTP requests, converting them into structured options for database queries.

## Class Definition

```typescript
class RequestOptionBuilder {
  static getDefaultQuerySchemas(): QuerySchemas
  static validateQueryParam<T>(value: string, schema: z.ZodSchema<T>): T
  static buildFindOptions(req: Request, querySchemas: QuerySchemas): any
  static buildSearchOptions(req: Request, querySchemas: QuerySchemas): SearchOptions
}
```

## Types

### `QuerySchemas`

```typescript
interface QuerySchemas {
  includeSchema: ZodSchema<any>;
  orderBySchema: ZodSchema<any>;
  whereSchema: ZodSchema<any>;
  paginationSchema: ZodSchema<{
    page?: number;
    pageSize?: number;
  }>;
}
```

## Methods

### `getDefaultQuerySchemas(): QuerySchemas`

Returns default Zod schemas for validating query parameters.

**Returns:** `QuerySchemas` - Default validation schemas

**Default Schemas:**
```typescript
{
  includeSchema: z.record(z.any()).optional(),
  orderBySchema: z.record(z.enum(['asc', 'desc'])).optional(),
  whereSchema: z.record(z.any()).optional(),
  paginationSchema: z.object({
    page: z.number().int().positive(),
    pageSize: z.number().int().positive().max(100),
  }).strict()
}
```

**Example:**
```typescript
const defaultSchemas = RequestOptionBuilder.getDefaultQuerySchemas();

// Customize schemas
const customSchemas = {
  ...defaultSchemas,
  whereSchema: z.object({
    active: z.boolean().optional(),
    role: z.string().optional(),
    createdAt: z.object({
      gte: z.date().optional(),
      lte: z.date().optional()
    }).optional()
  }).optional()
};
```

### `validateQueryParam<T>(value: string, schema: ZodSchema<T>): T`

Validates and parses a JSON query parameter using a Zod schema.

**Parameters:**
- `value: string` - JSON string from query parameter
- `schema: ZodSchema<T>` - Zod schema for validation

**Returns:** `T` - Parsed and validated value

**Throws:** `BadRequestException` for invalid JSON or validation errors

**Example:**
```typescript
// URL: /users?where={"active":true,"role":"user"}
const whereParam = req.query.where as string;
const whereClause = RequestOptionBuilder.validateQueryParam(
  whereParam,
  z.object({
    active: z.boolean().optional(),
    role: z.string().optional()
  })
);
// Result: { active: true, role: "user" }
```

### `buildFindOptions(req: Request, querySchemas: QuerySchemas): any`

Builds query options for simple find operations (without pagination).

**Parameters:**
- `req: Request` - Express request object
- `querySchemas: QuerySchemas` - Validation schemas

**Returns:** Query options object with `include`, `orderBy`, and `where` properties

**Supported Query Parameters:**
- `include` - JSON string for related data inclusion
- `orderBy` - JSON string for sorting criteria
- `where` - JSON string for filtering criteria

**Example:**
```typescript
// URL: /users?include={"profile":true}&orderBy={"createdAt":"desc"}&where={"active":true}

const options = RequestOptionBuilder.buildFindOptions(req, querySchemas);
// Result:
// {
//   include: { profile: true },
//   orderBy: { createdAt: 'desc' },
//   where: { active: true }
// }

const users = await userRepository.findMany(options);
```

### `buildSearchOptions(req: Request, querySchemas: QuerySchemas): SearchOptions`

Builds comprehensive search options including pagination parameters.

**Parameters:**
- `req: Request` - Express request object
- `querySchemas: QuerySchemas` - Validation schemas

**Returns:** `SearchOptions` - Complete search options with pagination

**Supported Query Parameters:**
- `page` - Page number (integer)
- `pageSize` - Items per page (integer, max 100)
- `include` - JSON string for related data inclusion
- `orderBy` - JSON string for sorting criteria
- `where` - JSON string for filtering criteria

**Example:**
```typescript
// URL: /users/paginated?page=2&pageSize=20&include={"profile":true}&orderBy={"name":"asc"}&where={"active":true}

const options = RequestOptionBuilder.buildSearchOptions(req, querySchemas);
// Result:
// {
//   page: 2,
//   pageSize: 20,
//   include: { profile: true },
//   orderBy: { name: 'asc' },
//   where: { active: true }
// }

const result = await userRepository.findWithPagination(options);
```

## Usage Examples

### Basic Controller Integration

```typescript
import { RequestOptionBuilder } from '@mifty/core/utils';
import { Request, Response } from 'express';

export class UserController extends BaseController<User, CreateUserDto, UpdateUserDto> {
  constructor(userService: UserService) {
    const querySchemas = RequestOptionBuilder.getDefaultQuerySchemas();
    
    super({
      service: userService,
      responseClass: UserResponse,
      querySchemas
    });
  }

  // The BaseController automatically uses RequestOptionBuilder
  // for getAll, findWithPagination, and other methods
}
```

### Custom Schema Validation

```typescript
import { z } from 'zod';
import { RequestOptionBuilder } from '@mifty/core/utils';

export class UserController {
  private querySchemas = {
    ...RequestOptionBuilder.getDefaultQuerySchemas(),
    whereSchema: z.object({
      active: z.boolean().optional(),
      role: z.enum(['user', 'admin', 'moderator']).optional(),
      email: z.object({
        contains: z.string(),
        mode: z.enum(['insensitive', 'default']).optional()
      }).optional(),
      createdAt: z.object({
        gte: z.coerce.date().optional(),
        lte: z.coerce.date().optional()
      }).optional()
    }).optional(),
    
    includeSchema: z.object({
      profile: z.boolean().optional(),
      posts: z.union([
        z.boolean(),
        z.object({
          where: z.object({
            published: z.boolean().optional()
          }).optional(),
          orderBy: z.record(z.enum(['asc', 'desc'])).optional(),
          take: z.number().int().positive().optional()
        })
      ]).optional()
    }).optional(),
    
    orderBySchema: z.record(z.enum(['asc', 'desc'])).optional()
  };

  async getUsers(req: Request, res: Response) {
    const options = RequestOptionBuilder.buildSearchOptions(req, this.querySchemas);
    const result = await this.userService.findWithPagination(options);
    
    return PaginatedResponse.paginated(
      result.data,
      result.page,
      result.pageSize,
      result.total
    ).send(res);
  }
}
```

### Manual Parameter Parsing

```typescript
import { RequestOptionBuilder } from '@mifty/core/utils';
import { z } from 'zod';

export class ProductController {
  async searchProducts(req: Request, res: Response) {
    // Parse individual parameters
    const whereClause = req.query.where ? 
      RequestOptionBuilder.validateQueryParam(
        req.query.where as string,
        z.object({
          category: z.string().optional(),
          price: z.object({
            gte: z.number().optional(),
            lte: z.number().optional()
          }).optional(),
          inStock: z.boolean().optional()
        })
      ) : {};

    const orderBy = req.query.orderBy ?
      RequestOptionBuilder.validateQueryParam(
        req.query.orderBy as string,
        z.record(z.enum(['asc', 'desc']))
      ) : { createdAt: 'desc' };

    // Build search options manually
    const searchOptions: SearchOptions = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 10,
      where: whereClause,
      orderBy,
      include: { category: true, reviews: true }
    };

    const result = await this.productService.findWithPagination(searchOptions);
    return PaginatedResponse.paginated(
      result.data,
      result.page,
      result.pageSize,
      result.total
    ).send(res);
  }
}
```

## URL Examples

### Basic Queries

```bash
# Simple filtering
GET /users?where={"active":true}

# Sorting
GET /users?orderBy={"createdAt":"desc","name":"asc"}

# Including related data
GET /users?include={"profile":true,"posts":true}

# Pagination
GET /users/paginated?page=2&pageSize=25
```

### Complex Queries

```bash
# Date range filtering
GET /users?where={"createdAt":{"gte":"2024-01-01T00:00:00.000Z","lte":"2024-12-31T23:59:59.999Z"}}

# Text search with case insensitive matching
GET /users?where={"email":{"contains":"john","mode":"insensitive"}}

# Multiple conditions
GET /users?where={"OR":[{"name":{"contains":"john"}},{"email":{"contains":"john"}}],"active":true}

# Complex includes with nested conditions
GET /users?include={"profile":true,"posts":{"where":{"published":true},"orderBy":{"createdAt":"desc"},"take":5}}
```

### Combined Parameters

```bash
# Full query with all parameters
GET /users/paginated?page=1&pageSize=20&where={"active":true,"role":"user"}&orderBy={"createdAt":"desc"}&include={"profile":true}
```

## Error Handling

### Validation Errors

```typescript
try {
  const options = RequestOptionBuilder.buildSearchOptions(req, querySchemas);
  const result = await this.userService.findWithPagination(options);
  return PaginatedResponse.paginated(result.data, result.page, result.pageSize, result.total).send(res);
} catch (error) {
  if (error instanceof BadRequestException) {
    // Handle validation errors
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      error: error.message
    });
  }
  throw error;
}
```

### Custom Error Messages

```typescript
const customSchemas = {
  ...RequestOptionBuilder.getDefaultQuerySchemas(),
  paginationSchema: z.object({
    page: z.number().int().positive().max(1000, 'Page number cannot exceed 1000'),
    pageSize: z.number().int().positive().max(50, 'Page size cannot exceed 50')
  }).strict()
};
```

## Performance Considerations

### Query Optimization

```typescript
// Good: Limit includes to necessary data
const includeSchema = z.object({
  profile: z.object({
    select: z.object({
      firstName: z.boolean().optional(),
      lastName: z.boolean().optional(),
      avatar: z.boolean().optional()
    }).optional()
  }).optional()
});

// Avoid: Including too much data
const includeSchema = z.record(z.any()); // Allows any includes
```

### Pagination Limits

```typescript
const paginationSchema = z.object({
  page: z.number().int().positive().max(10000),
  pageSize: z.number().int().positive().max(100) // Reasonable limit
}).strict();
```

## Security Considerations

### Input Validation

```typescript
// Good: Strict validation
const whereSchema = z.object({
  active: z.boolean().optional(),
  role: z.enum(['user', 'admin']).optional(),
  email: z.string().email().optional()
}).strict(); // Reject unknown properties

// Avoid: Loose validation
const whereSchema = z.record(z.any()); // Allows any properties
```

### SQL Injection Prevention

The RequestOptionBuilder works with Prisma ORM, which provides built-in SQL injection protection through parameterized queries. However, always validate input structure:

```typescript
// Good: Validate structure
const whereSchema = z.object({
  name: z.object({
    contains: z.string().max(100), // Limit length
    mode: z.enum(['insensitive', 'default']).optional()
  }).optional()
});

// Avoid: Raw SQL in where clauses (not possible with Prisma, but good practice)
```

## Best Practices

### 1. Use Specific Schemas

```typescript
// Good: Specific validation
const userQuerySchemas = {
  whereSchema: z.object({
    active: z.boolean().optional(),
    role: z.enum(['user', 'admin', 'moderator']).optional(),
    email: z.string().email().optional()
  }).optional()
};

// Avoid: Generic validation
const querySchemas = {
  whereSchema: z.record(z.any()).optional()
};
```

### 2. Set Reasonable Limits

```typescript
const paginationSchema = z.object({
  page: z.number().int().positive().max(1000),
  pageSize: z.number().int().positive().min(1).max(100)
}).strict();
```

### 3. Provide Default Values

```typescript
function buildSearchOptionsWithDefaults(req: Request, schemas: QuerySchemas): SearchOptions {
  const options = RequestOptionBuilder.buildSearchOptions(req, schemas);
  
  return {
    page: 1,
    pageSize: 10,
    orderBy: { createdAt: 'desc' },
    ...options
  };
}
```

### 4. Document Query Parameters

```typescript
/**
 * Get users with pagination and filtering
 * 
 * @param page - Page number (1-based, max 1000)
 * @param pageSize - Items per page (1-100, default 10)
 * @param where - Filter criteria: {"active": boolean, "role": "user"|"admin"}
 * @param orderBy - Sort criteria: {"field": "asc"|"desc"}
 * @param include - Related data: {"profile": boolean, "posts": boolean}
 */
async getUsers(req: Request, res: Response) {
  // Implementation
}
```

## Related

- [SearchOptions Interface](../interfaces/search-options-interface.md) - Options structure
- [BaseController](../base-controller.md) - Automatic integration
- [API Response](./api-response.md) - Response formatting