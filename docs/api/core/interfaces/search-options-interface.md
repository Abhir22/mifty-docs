# SearchOptions Interface

The `SearchOptions` interface defines the structure for query parameters used in search and pagination operations throughout the Mifty framework.

## Interface Definition

```typescript
interface SearchOptions {
  page?: number;
  pageSize?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  where?: any;
  include?: any;
}
```

## Properties

### `page?: number`

The page number for pagination (1-based indexing).

**Type:** `number` (optional)
**Default:** `1`

**Description:** Specifies which page of results to retrieve. Pages are numbered starting from 1.

**Example:**
```typescript
const options: SearchOptions = {
  page: 3, // Get the 3rd page
  pageSize: 10
};
```

### `pageSize?: number`

The number of records to return per page.

**Type:** `number` (optional)
**Default:** `10`

**Description:** Specifies the maximum number of records to return in a single page. Most implementations enforce a maximum limit (e.g., 100).

**Example:**
```typescript
const options: SearchOptions = {
  page: 1,
  pageSize: 25 // Return up to 25 records
};
```

### `orderBy?: Record<string, 'asc' | 'desc'>`

Sorting criteria for the results.

**Type:** `Record<string, 'asc' | 'desc'>` (optional)

**Description:** Defines how to sort the results. Keys are field names, values are sort directions.

**Examples:**

**Single Field Sorting:**
```typescript
const options: SearchOptions = {
  orderBy: { createdAt: 'desc' } // Sort by creation date, newest first
};
```

**Multiple Field Sorting:**
```typescript
const options: SearchOptions = {
  orderBy: { 
    status: 'asc',     // First by status ascending
    createdAt: 'desc'  // Then by creation date descending
  }
};
```

**Nested Field Sorting:**
```typescript
const options: SearchOptions = {
  orderBy: { 
    'profile.lastName': 'asc',  // Sort by profile's last name
    'profile.firstName': 'asc'  // Then by first name
  }
};
```

### `where?: any`

Filter criteria for the query.

**Type:** `any` (optional)

**Description:** Defines the conditions that records must meet to be included in the results. The structure depends on your ORM (typically Prisma query format).

**Examples:**

**Simple Filtering:**
```typescript
const options: SearchOptions = {
  where: { 
    active: true,
    role: 'user'
  }
};
```

**Complex Filtering:**
```typescript
const options: SearchOptions = {
  where: {
    OR: [
      { name: { contains: 'john', mode: 'insensitive' } },
      { email: { contains: 'john', mode: 'insensitive' } }
    ],
    AND: [
      { active: true },
      { createdAt: { gte: new Date('2024-01-01') } }
    ]
  }
};
```

**Nested Filtering:**
```typescript
const options: SearchOptions = {
  where: {
    profile: {
      age: { gte: 18 },
      country: 'US'
    }
  }
};
```

### `include?: any`

Related data to include in the results.

**Type:** `any` (optional)

**Description:** Specifies which related entities should be included in the query results. Helps avoid N+1 query problems.

**Examples:**

**Simple Inclusion:**
```typescript
const options: SearchOptions = {
  include: { 
    profile: true,  // Include user's profile
    posts: true     // Include user's posts
  }
};
```

**Nested Inclusion:**
```typescript
const options: SearchOptions = {
  include: {
    profile: true,
    posts: {
      include: {
        comments: {
          include: {
            author: true
          }
        }
      }
    }
  }
};
```

**Selective Inclusion:**
```typescript
const options: SearchOptions = {
  include: {
    profile: {
      select: {
        firstName: true,
        lastName: true,
        avatar: true
      }
    }
  }
};
```

## Usage Examples

### Basic Pagination

```typescript
import { SearchOptions } from '@mifty/core/interfaces';

const options: SearchOptions = {
  page: 1,
  pageSize: 10,
  orderBy: { createdAt: 'desc' }
};

const users = await userService.findWithPagination(options);
```

### Advanced Filtering and Sorting

```typescript
const options: SearchOptions = {
  page: 2,
  pageSize: 20,
  where: {
    active: true,
    role: { in: ['user', 'moderator'] },
    createdAt: { 
      gte: new Date('2024-01-01'),
      lte: new Date('2024-12-31')
    }
  },
  orderBy: {
    'profile.lastName': 'asc',
    'profile.firstName': 'asc'
  },
  include: {
    profile: true,
    posts: {
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    }
  }
};

const result = await userService.findWithPagination(options);
```

### Search with Text Query

```typescript
const searchOptions: SearchOptions = {
  page: 1,
  pageSize: 15,
  where: {
    OR: [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { email: { contains: searchTerm, mode: 'insensitive' } },
      { profile: { 
        firstName: { contains: searchTerm, mode: 'insensitive' } 
      }}
    ],
    active: true
  },
  include: { profile: true },
  orderBy: { updatedAt: 'desc' }
};

const searchResults = await userService.findWithPagination(searchOptions);
```

## API Integration

### Query Parameter Parsing

```typescript
import { Request } from 'express';
import { SearchOptions } from '@mifty/core/interfaces';

function parseSearchOptions(req: Request): SearchOptions {
  const options: SearchOptions = {};

  // Parse pagination
  if (req.query.page) {
    options.page = parseInt(req.query.page as string);
  }
  
  if (req.query.pageSize) {
    options.pageSize = parseInt(req.query.pageSize as string);
  }

  // Parse JSON parameters
  if (req.query.where) {
    options.where = JSON.parse(req.query.where as string);
  }

  if (req.query.orderBy) {
    options.orderBy = JSON.parse(req.query.orderBy as string);
  }

  if (req.query.include) {
    options.include = JSON.parse(req.query.include as string);
  }

  return options;
}

// Usage in controller
async function getUsers(req: Request, res: Response) {
  const options = parseSearchOptions(req);
  const result = await userService.findWithPagination(options);
  return PaginatedResponse.paginated(result.data, result.page, result.pageSize, result.total).send(res);
}
```

### URL Examples

```bash
# Basic pagination
GET /users?page=2&pageSize=20

# With filtering
GET /users?page=1&pageSize=10&where={"active":true,"role":"user"}

# With sorting
GET /users?orderBy={"createdAt":"desc","name":"asc"}

# With includes
GET /users?include={"profile":true,"posts":true}

# Combined
GET /users?page=1&pageSize=15&where={"active":true}&orderBy={"createdAt":"desc"}&include={"profile":true}
```

## Validation

### Zod Schema Example

```typescript
import { z } from 'zod';

const SearchOptionsSchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
  orderBy: z.record(z.enum(['asc', 'desc'])).optional(),
  where: z.record(z.any()).optional(),
  include: z.record(z.any()).optional()
});

// Usage
function validateSearchOptions(options: unknown): SearchOptions {
  return SearchOptionsSchema.parse(options);
}
```

### Request Validation

```typescript
import { RequestOptionBuilder } from '@mifty/core/utils';

async function getUsersEndpoint(req: Request, res: Response) {
  try {
    const options = RequestOptionBuilder.buildSearchOptions(req, {
      paginationSchema: z.object({
        page: z.number().int().positive(),
        pageSize: z.number().int().positive().max(50)
      }),
      whereSchema: z.object({
        active: z.boolean().optional(),
        role: z.string().optional(),
        createdAt: z.object({
          gte: z.date().optional(),
          lte: z.date().optional()
        }).optional()
      }).optional(),
      orderBySchema: z.record(z.enum(['asc', 'desc'])).optional(),
      includeSchema: z.object({
        profile: z.boolean().optional(),
        posts: z.boolean().optional()
      }).optional()
    });

    const result = await userService.findWithPagination(options);
    return PaginatedResponse.paginated(result.data, result.page, result.pageSize, result.total).send(res);
  } catch (error) {
    // Handle validation errors
    throw new BadRequestException('Invalid search parameters');
  }
}
```

## Performance Considerations

### Indexing

Ensure database indexes exist for commonly filtered and sorted fields:

```sql
-- For filtering
CREATE INDEX idx_users_active ON users(active);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- For sorting
CREATE INDEX idx_users_name ON users(name);
CREATE INDEX idx_users_updated_at ON users(updated_at);

-- Composite indexes for common filter combinations
CREATE INDEX idx_users_active_role ON users(active, role);
```

### Query Optimization

```typescript
// Good: Selective includes
const options: SearchOptions = {
  include: {
    profile: {
      select: {
        firstName: true,
        lastName: true,
        avatar: true
      }
    }
  }
};

// Avoid: Including too much data
const options: SearchOptions = {
  include: {
    profile: true,
    posts: true,
    comments: true,
    followers: true,
    following: true
  }
};
```

### Pagination Limits

```typescript
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 10;

function sanitizeSearchOptions(options: SearchOptions): SearchOptions {
  return {
    ...options,
    page: Math.max(1, options.page || 1),
    pageSize: Math.min(MAX_PAGE_SIZE, Math.max(1, options.pageSize || DEFAULT_PAGE_SIZE))
  };
}
```

## Best Practices

### 1. Default Values
Always provide sensible defaults:

```typescript
function applyDefaults(options: SearchOptions): Required<SearchOptions> {
  return {
    page: options.page || 1,
    pageSize: options.pageSize || 10,
    orderBy: options.orderBy || { createdAt: 'desc' },
    where: options.where || {},
    include: options.include || {}
  };
}
```

### 2. Type Safety
Use typed interfaces for specific entities:

```typescript
interface UserSearchOptions extends SearchOptions {
  where?: {
    active?: boolean;
    role?: string;
    email?: { contains: string; mode: 'insensitive' };
    createdAt?: { gte?: Date; lte?: Date };
  };
  include?: {
    profile?: boolean;
    posts?: boolean;
  };
}
```

### 3. Validation
Always validate search options:

```typescript
function validateSearchOptions(options: SearchOptions): void {
  if (options.page && options.page < 1) {
    throw new ValidationException('Page must be greater than 0');
  }
  
  if (options.pageSize && (options.pageSize < 1 || options.pageSize > 100)) {
    throw new ValidationException('Page size must be between 1 and 100');
  }
}
```

## Related

- [PaginatedResult](./paginated-result-interface.md) - Result structure for paginated queries
- [BaseRepository](../base-repository.md) - Repository implementation using SearchOptions
- [BaseService](../base-service.md) - Service layer using SearchOptions
- [RequestOptionBuilder](../utils/request-option-builder.md) - Utility for parsing query parameters