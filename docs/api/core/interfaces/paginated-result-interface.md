# PaginatedResult Interface

The `PaginatedResult` interface defines the structure for paginated query results in the Mifty framework. It provides metadata about pagination along with the actual data.

## Interface Definition

```typescript
interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

## Type Parameters

- `T` - The entity type contained in the data array (e.g., `User`, `Post`)

## Properties

### `data: T[]`

The array of entities for the current page.

**Type:** `T[]`

**Description:** Contains the actual records returned for the requested page. The length of this array will be at most `pageSize`, but may be less on the last page or when there are fewer results than the page size.

**Example:**
```typescript
const result: PaginatedResult<User> = {
  data: [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
  ],
  // ... other properties
};
```

### `total: number`

The total number of records that match the query criteria across all pages.

**Type:** `number`

**Description:** This represents the complete count of records that match the filter criteria, not just the records on the current page.

**Example:**
```typescript
const result: PaginatedResult<User> = {
  data: [...], // 10 users on current page
  total: 150,  // 150 total users match the criteria
  // ... other properties
};
```

### `page: number`

The current page number (1-based indexing).

**Type:** `number`

**Description:** Indicates which page of results this represents. Pages are numbered starting from 1.

**Example:**
```typescript
const result: PaginatedResult<User> = {
  data: [...],
  total: 150,
  page: 3,     // This is the 3rd page
  // ... other properties
};
```

### `pageSize: number`

The number of records requested per page.

**Type:** `number`

**Description:** The maximum number of records that should be returned per page. The actual `data` array may contain fewer items on the last page.

**Example:**
```typescript
const result: PaginatedResult<User> = {
  data: [...],   // May contain up to 10 items
  total: 150,
  page: 3,
  pageSize: 10,  // Requested 10 items per page
  // ... other properties
};
```

### `totalPages: number`

The total number of pages available.

**Type:** `number`

**Description:** Calculated as `Math.ceil(total / pageSize)`. Represents the total number of pages needed to display all records.

**Example:**
```typescript
const result: PaginatedResult<User> = {
  data: [...],
  total: 150,
  page: 3,
  pageSize: 10,
  totalPages: 15  // Math.ceil(150 / 10) = 15 pages
};
```

## Usage Examples

### Basic Pagination

```typescript
import { PaginatedResult } from '@mifty/core/interfaces';

async function getUsers(page: number = 1, pageSize: number = 10): Promise<PaginatedResult<User>> {
  const result = await userService.findWithPagination({
    page,
    pageSize,
    orderBy: { createdAt: 'desc' }
  });

  return result;
}

// Usage
const users = await getUsers(1, 10);
console.log(`Showing ${users.data.length} of ${users.total} users`);
console.log(`Page ${users.page} of ${users.totalPages}`);
```

### Pagination with Filtering

```typescript
async function searchUsers(
  searchTerm: string, 
  page: number = 1, 
  pageSize: number = 10
): Promise<PaginatedResult<User>> {
  return userService.findWithPagination({
    page,
    pageSize,
    where: {
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } }
      ]
    },
    include: { profile: true },
    orderBy: { createdAt: 'desc' }
  });
}

// Usage
const searchResults = await searchUsers('john', 1, 5);
console.log(`Found ${searchResults.total} users matching "john"`);
```

### API Response Example

```typescript
import { PaginatedResponse } from '@mifty/core/utils';

async function getUsersEndpoint(req: Request, res: Response) {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  const result = await userService.findWithPagination({
    page,
    pageSize,
    include: { profile: true }
  });

  return PaginatedResponse.paginated(
    result.data,
    result.page,
    result.pageSize,
    result.total,
    'Users retrieved successfully'
  ).send(res);
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "clx1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "profile": {
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 150,
  "totalPages": 15,
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Pagination Calculations

### Calculating Skip/Offset

```typescript
function calculateSkip(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

// Example: Page 3 with 10 items per page
const skip = calculateSkip(3, 10); // 20 (skip first 20 records)
```

### Calculating Total Pages

```typescript
function calculateTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}

// Example: 157 total records with 10 per page
const totalPages = calculateTotalPages(157, 10); // 16 pages
```

### Pagination Metadata

```typescript
function getPaginationMetadata(result: PaginatedResult<any>) {
  return {
    hasNextPage: result.page < result.totalPages,
    hasPreviousPage: result.page > 1,
    isFirstPage: result.page === 1,
    isLastPage: result.page === result.totalPages,
    nextPage: result.page < result.totalPages ? result.page + 1 : null,
    previousPage: result.page > 1 ? result.page - 1 : null,
    startIndex: (result.page - 1) * result.pageSize + 1,
    endIndex: Math.min(result.page * result.pageSize, result.total)
  };
}

// Usage
const metadata = getPaginationMetadata(users);
console.log(`Showing ${metadata.startIndex}-${metadata.endIndex} of ${users.total}`);
```

## Implementation in Repository

```typescript
import { PaginatedResult } from '@mifty/core/interfaces';

async findWithPagination(options: SearchOptions): Promise<PaginatedResult<User>> {
  const { page = 1, pageSize = 10, where, include, orderBy } = options;
  
  const skip = (page - 1) * pageSize;
  const queryOptions: any = { skip, take: pageSize };
  
  if (where) queryOptions.where = where;
  if (include) queryOptions.include = include;
  if (orderBy) queryOptions.orderBy = orderBy;

  // Execute both queries in parallel for better performance
  const [data, total] = await Promise.all([
    this.prisma.user.findMany(queryOptions),
    this.prisma.user.count({ where })
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}
```

## Frontend Integration

### React Hook Example

```typescript
import { useState, useEffect } from 'react';
import { PaginatedResult } from '@mifty/core/interfaces';

function useUserPagination(initialPageSize: number = 10) {
  const [users, setUsers] = useState<PaginatedResult<User> | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const fetchUsers = async (page: number, size: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/paginated?page=${page}&pageSize=${size}`);
      const result = await response.json();
      setUsers(result);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, pageSize);
  }, [currentPage, pageSize]);

  return {
    users,
    loading,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    refetch: () => fetchUsers(currentPage, pageSize)
  };
}
```

## Best Practices

### 1. Reasonable Page Sizes
Set appropriate limits for page sizes:

```typescript
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 10;

function validatePageSize(pageSize: number): number {
  if (pageSize < 1) return DEFAULT_PAGE_SIZE;
  if (pageSize > MAX_PAGE_SIZE) return MAX_PAGE_SIZE;
  return pageSize;
}
```

### 2. Efficient Counting
For large datasets, consider approximate counts:

```typescript
async findWithPagination(options: SearchOptions): Promise<PaginatedResult<User>> {
  // For very large datasets, you might want to use approximate counts
  // or implement cursor-based pagination instead
  
  const [data, total] = await Promise.all([
    this.findMany(options),
    this.count({ where: options.where })
  ]);

  return {
    data,
    total,
    page: options.page || 1,
    pageSize: options.pageSize || 10,
    totalPages: Math.ceil(total / (options.pageSize || 10))
  };
}
```

### 3. Cursor-Based Pagination
For real-time data or very large datasets:

```typescript
interface CursorPaginatedResult<T> {
  data: T[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}
```

## Related

- [SearchOptions](./search-options-interface.md) - Query options for pagination
- [BaseRepository](../base-repository.md) - Repository implementation
- [BaseService](../base-service.md) - Service layer implementation
- [PaginatedResponse](../utils/api-response.md#paginatedresponse) - API response wrapper