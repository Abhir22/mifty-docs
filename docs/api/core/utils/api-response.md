# API Response Utilities

The API Response utilities provide standardized response formatting for REST API endpoints in the Mifty framework. They ensure consistent response structure across all endpoints.

## Interfaces

### `IApiResponse<T>`

Base interface for all API responses.

```typescript
interface IApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  statusCode: number;
  timestamp: string;
}
```

## Classes

### `SuccessResponse<T>`

Handles successful API responses with standardized formatting.

```typescript
class SuccessResponse<T> implements IApiResponse<T> {
  public success: boolean = true;
  public timestamp: string = new Date().toISOString();

  constructor(
    public data: T,
    public message: string,
    public statusCode: number
  )

  public send(res: Response): void
  
  // Factory methods
  static ok<T>(data: T, message?: string): SuccessResponse<T>
  static create<T>(data: T, message?: string): SuccessResponse<T>
  static get<T>(data: T, message?: string): SuccessResponse<T>
  static update<T>(data: T, message?: string): SuccessResponse<T>
  static delete<T>(data: T, message?: string): SuccessResponse<T>
  static found<T>(data: T, message?: string): SuccessResponse<T>
  static accepted<T>(data: T, message?: string): SuccessResponse<T>
  static noContent<T>(data: T, message?: string): SuccessResponse<T>
  static custom<T>(data: T, message: string, statusCode: number): SuccessResponse<T>
}
```

### `PaginatedResponse<T>`

Extends SuccessResponse to handle paginated data with metadata.

```typescript
class PaginatedResponse<T> extends SuccessResponse<T[]> {
  constructor(
    data: T[],
    message: string,
    statusCode: number,
    public page: number,
    public limit: number,
    public total: number,
    public totalPages: number = Math.ceil(total / limit)
  )

  public send(res: Response): void

  // Factory methods
  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): PaginatedResponse<T>

  static paginatedCustom<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message: string,
    statusCode: number
  ): PaginatedResponse<T>
}
```

## Factory Methods

### CRUD Operations

#### `SuccessResponse.create<T>(data: T, message?: string)`

Creates a response for successful resource creation (201 Created).

**Parameters:**
- `data: T` - The created resource
- `message?: string` - Custom message (default: "Resource created successfully")

**Returns:** `SuccessResponse<T>` with status code 201

**Example:**
```typescript
const newUser = await userService.create(userData);
return SuccessResponse.create(newUser, 'User created successfully').send(res);
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "clx1234567890",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "statusCode": 201,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `SuccessResponse.get<T>(data: T, message?: string)`

Creates a response for successful resource retrieval (200 OK).

**Parameters:**
- `data: T` - The retrieved resource(s)
- `message?: string` - Custom message (default: "Resource retrieved successfully")

**Returns:** `SuccessResponse<T>` with status code 200

**Example:**
```typescript
const users = await userService.findAll();
return SuccessResponse.get(users, 'Users retrieved successfully').send(res);
```

#### `SuccessResponse.update<T>(data: T, message?: string)`

Creates a response for successful resource update (200 OK).

**Parameters:**
- `data: T` - The updated resource
- `message?: string` - Custom message (default: "Resource updated successfully")

**Returns:** `SuccessResponse<T>` with status code 200

**Example:**
```typescript
const updatedUser = await userService.update(id, updateData);
return SuccessResponse.update(updatedUser, 'User updated successfully').send(res);
```

#### `SuccessResponse.delete<T>(data: T, message?: string)`

Creates a response for successful resource deletion (200 OK).

**Parameters:**
- `data: T` - Deletion confirmation data
- `message?: string` - Custom message (default: "Resource deleted successfully")

**Returns:** `SuccessResponse<T>` with status code 200

**Example:**
```typescript
const deleted = await userService.delete(id);
return SuccessResponse.delete({ id, deleted: true }, 'User deleted successfully').send(res);
```

### Additional Operations

#### `SuccessResponse.ok<T>(data: T, message?: string)`

Generic success response (200 OK).

**Example:**
```typescript
const stats = await analyticsService.getStats();
return SuccessResponse.ok(stats, 'Statistics retrieved').send(res);
```

#### `SuccessResponse.found<T>(data: T, message?: string)`

Response for successful search/find operations (200 OK).

**Example:**
```typescript
const searchResults = await userService.search(query);
return SuccessResponse.found(searchResults, `Found ${searchResults.length} users`).send(res);
```

#### `SuccessResponse.accepted<T>(data: T, message?: string)`

Response for accepted requests that will be processed asynchronously (202 Accepted).

**Example:**
```typescript
const jobId = await emailService.sendBulkEmails(recipients);
return SuccessResponse.accepted({ jobId }, 'Email job queued for processing').send(res);
```

#### `SuccessResponse.noContent<T>(data: T, message?: string)`

Response for successful operations with no content to return (204 No Content).

**Example:**
```typescript
await userService.updateLastLogin(userId);
return SuccessResponse.noContent({}, 'Last login updated').send(res);
```

#### `SuccessResponse.custom<T>(data: T, message: string, statusCode: number)`

Custom response with specified status code.

**Example:**
```typescript
return SuccessResponse.custom(
  { message: 'Partial success' },
  'Some operations completed',
  207 // Multi-Status
).send(res);
```

## Pagination Responses

### `PaginatedResponse.paginated<T>(data, page, limit, total, message?)`

Creates a paginated response with metadata.

**Parameters:**
- `data: T[]` - Array of items for current page
- `page: number` - Current page number
- `limit: number` - Items per page
- `total: number` - Total number of items
- `message?: string` - Custom message (default: "Resources retrieved successfully")

**Returns:** `PaginatedResponse<T>` with status code 200

**Example:**
```typescript
const result = await userService.findWithPagination({
  page: 1,
  pageSize: 10,
  where: { active: true }
});

return PaginatedResponse.paginated(
  result.data,
  result.page,
  result.pageSize,
  result.total,
  'Active users retrieved'
).send(res);
```

**Response:**
```json
{
  "success": true,
  "message": "Active users retrieved",
  "data": [
    {
      "id": "clx1234567890",
      "name": "John Doe",
      "email": "john@example.com"
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

## Usage in Controllers

### Basic Controller Implementation

```typescript
import { Request, Response } from 'express';
import { SuccessResponse, PaginatedResponse } from '@mifty/core/utils';
import { UserService } from './user.service';

export class UserController {
  constructor(private userService: UserService) {}

  async getAll(req: Request, res: Response) {
    const users = await this.userService.findAll();
    return SuccessResponse.get(users).send(res);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const user = await this.userService.findById(id);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return SuccessResponse.get(user).send(res);
  }

  async create(req: Request, res: Response) {
    const newUser = await this.userService.create(req.body);
    return SuccessResponse.create(newUser).send(res);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const updatedUser = await this.userService.update(id, req.body);
    return SuccessResponse.update(updatedUser).send(res);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await this.userService.delete(id);
    return SuccessResponse.delete({ id, deleted: true }).send(res);
  }

  async findWithPagination(req: Request, res: Response) {
    const options = this.parseSearchOptions(req);
    const result = await this.userService.findWithPagination(options);
    
    return PaginatedResponse.paginated(
      result.data,
      result.page,
      result.pageSize,
      result.total
    ).send(res);
  }

  async search(req: Request, res: Response) {
    const { q: searchTerm } = req.query;
    const results = await this.userService.search(
      searchTerm as string,
      ['name', 'email']
    );
    
    return SuccessResponse.found(
      results,
      `Found ${results.length} users matching "${searchTerm}"`
    ).send(res);
  }
}
```

### Advanced Usage with Custom Messages

```typescript
export class OrderController {
  async processOrder(req: Request, res: Response) {
    const order = await this.orderService.create(req.body);
    
    if (order.status === 'pending_payment') {
      return SuccessResponse.accepted(
        order,
        'Order created and awaiting payment confirmation'
      ).send(res);
    }
    
    return SuccessResponse.create(
      order,
      'Order created and confirmed'
    ).send(res);
  }

  async getOrderStats(req: Request, res: Response) {
    const stats = await this.orderService.getStatistics();
    return SuccessResponse.ok(
      stats,
      'Order statistics calculated successfully'
    ).send(res);
  }

  async bulkUpdateStatus(req: Request, res: Response) {
    const { orderIds, status } = req.body;
    const result = await this.orderService.bulkUpdateStatus(orderIds, status);
    
    return SuccessResponse.custom(
      { updated: result.count, failed: orderIds.length - result.count },
      `Updated ${result.count} of ${orderIds.length} orders`,
      207 // Multi-Status
    ).send(res);
  }
}
```

## Response Transformation

### Data Transformation

```typescript
import { BaseResponse } from '@mifty/core/base/response';

class UserResponse extends BaseResponse<User> {
  constructor(user: User) {
    super(user);
  }

  transform() {
    return {
      id: this.entity.id,
      name: this.entity.name,
      email: this.entity.email,
      profile: this.entity.profile ? {
        firstName: this.entity.profile.firstName,
        lastName: this.entity.profile.lastName,
        avatar: this.entity.profile.avatar
      } : null,
      createdAt: this.entity.createdAt,
      // Exclude sensitive fields like password
    };
  }
}

// Usage in controller
async getUsers(req: Request, res: Response) {
  const users = await this.userService.findAll();
  const transformedUsers = BaseResponse.mapMany(users, UserResponse);
  return SuccessResponse.get(transformedUsers).send(res);
}
```

## Error Handling Integration

The response utilities work seamlessly with the error handling middleware:

```typescript
import { asyncHandler } from '@mifty/core/middlewares';

export class UserController {
  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.userService.findById(id);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return SuccessResponse.get(user).send(res);
  });
}
```

## Best Practices

### 1. Consistent Messaging

```typescript
// Good: Descriptive, consistent messages
return SuccessResponse.create(user, 'User account created successfully');
return SuccessResponse.update(user, 'User profile updated successfully');
return SuccessResponse.delete({ id }, 'User account deleted successfully');

// Avoid: Generic or inconsistent messages
return SuccessResponse.create(user, 'Success');
return SuccessResponse.update(user, 'Done');
```

### 2. Appropriate Status Codes

```typescript
// Good: Use appropriate factory methods
return SuccessResponse.create(resource); // 201 Created
return SuccessResponse.get(resource);    // 200 OK
return SuccessResponse.accepted(job);    // 202 Accepted

// Avoid: Wrong status codes
return SuccessResponse.ok(newResource);  // Should be .create()
```

### 3. Data Transformation

```typescript
// Good: Transform sensitive data
const safeUser = {
  id: user.id,
  name: user.name,
  email: user.email
  // password excluded
};
return SuccessResponse.get(safeUser);

// Avoid: Exposing sensitive data
return SuccessResponse.get(user); // May include password hash
```

### 4. Pagination Metadata

```typescript
// Good: Include helpful pagination info
return PaginatedResponse.paginated(
  result.data,
  result.page,
  result.pageSize,
  result.total,
  `Retrieved ${result.data.length} of ${result.total} users`
);
```

## Related

- [BaseController](../base-controller.md) - Uses response utilities
- [Error Middleware](../middlewares/error-middleware.md) - Error handling integration
- [BaseResponse](../base/response/base-response.md) - Data transformation utilities