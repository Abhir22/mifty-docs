# BaseController

The `BaseController` is an abstract class that provides a complete set of CRUD operations for your API endpoints. It handles request validation, response formatting, and error handling automatically.

## Class Definition

```typescript
abstract class BaseController<T, TCreateInput = any, TUpdateInput = any> {
  protected service: IService<T, TCreateInput, TUpdateInput>;
  protected responseClass: new (entity: T) => BaseResponse<T>;
  protected searchFields: string[];
  protected searchInclude: any;
  protected defaultInclude: any;
  protected createSchema?: ZodType<TCreateInput, any, any>;
  protected updateSchema?: ZodType<TUpdateInput, any, any>;
  protected querySchemas: QuerySchemas;

  constructor(options: BaseControllerOptions<T, TCreateInput, TUpdateInput>)
}
```

## Constructor Options

```typescript
type BaseControllerOptions<T, TCreateInput, TUpdateInput> = {
  service: IService<T, TCreateInput, TUpdateInput>;
  responseClass: new (entity: T) => BaseResponse<T>;
  createSchema?: ZodType<TCreateInput, any, any>;
  updateSchema?: ZodType<TUpdateInput, any, any>;
  searchFields?: string[];
  searchInclude?: any;
  defaultInclude?: any;
  querySchemas?: {
    includeSchema?: ZodSchema<any>;
    orderBySchema?: ZodSchema<any>;
    whereSchema?: ZodSchema<any>;
    paginationSchema?: ZodSchema<{
      page?: number;
      pageSize?: number;
    }>;
  };
};
```

## Methods

### `getAll(req: Request, res: Response): Promise<void>`

Retrieves all records with optional filtering, sorting, and including related data.

**Query Parameters:**
- `include` - JSON string for related data inclusion
- `orderBy` - JSON string for sorting
- `where` - JSON string for filtering

**Example:**
```typescript
// GET /users?include={"profile":true}&orderBy={"createdAt":"desc"}
```

**Response:**
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": [...],
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `getById(req: Request, res: Response): Promise<void>`

Retrieves a single record by ID.

**Parameters:**
- `id` - Record ID from URL parameters

**Example:**
```typescript
// GET /users/123
```

**Response:**
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": { "id": "123", "name": "John Doe" },
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `create(req: Request, res: Response): Promise<void>`

Creates a new record with validation.

**Body:** Validated against `createSchema` if provided

**Example:**
```typescript
// POST /users
// Body: { "name": "John Doe", "email": "john@example.com" }
```

**Response:**
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": { "id": "123", "name": "John Doe", "email": "john@example.com" },
  "statusCode": 201,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `update(req: Request, res: Response): Promise<void>`

Updates an existing record with validation.

**Parameters:**
- `id` - Record ID from URL parameters

**Body:** Validated against `updateSchema` if provided

**Example:**
```typescript
// PUT /users/123
// Body: { "name": "Jane Doe" }
```

### `delete(req: Request, res: Response): Promise<void>`

Deletes a record by ID.

**Parameters:**
- `id` - Record ID from URL parameters

**Example:**
```typescript
// DELETE /users/123
```

**Response:**
```json
{
  "success": true,
  "message": "Resource deleted successfully",
  "data": { "id": "123", "deleted": true },
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `findWithPagination(req: Request, res: Response): Promise<void>`

Retrieves paginated results with filtering and sorting.

**Query Parameters:**
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 10, max: 100)
- `include` - JSON string for related data
- `orderBy` - JSON string for sorting
- `where` - JSON string for filtering

**Example:**
```typescript
// GET /users/paginated?page=1&pageSize=10&orderBy={"createdAt":"desc"}
```

**Response:**
```json
{
  "success": true,
  "message": "Resources retrieved successfully",
  "data": [...],
  "page": 1,
  "limit": 10,
  "total": 100,
  "totalPages": 10,
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `search(req: Request, res: Response): Promise<void>`

Performs text search across configured search fields.

**Query Parameters:**
- `q` - Search term (required)

**Example:**
```typescript
// GET /users/search?q=john
```

**Response:**
```json
{
  "success": true,
  "message": "Found 5 results for \"john\"",
  "data": [...],
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `count(req: Request, res: Response): Promise<void>`

Returns the count of records matching the filter criteria.

**Query Parameters:**
- `where` - JSON string for filtering

**Example:**
```typescript
// GET /users/count?where={"active":true}
```

**Response:**
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": { "count": 42 },
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Implementation Example

```typescript
import { BaseController } from '@mifty/core/base';
import { UserService } from './user.service';
import { UserResponse } from './user.response';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { createUserSchema, updateUserSchema } from './user.schema';

export class UserController extends BaseController<User, CreateUserDto, UpdateUserDto> {
  constructor(userService: UserService) {
    super({
      service: userService,
      responseClass: UserResponse,
      createSchema: createUserSchema,
      updateSchema: updateUserSchema,
      searchFields: ['name', 'email', 'profile.firstName', 'profile.lastName'],
      searchInclude: { profile: true },
      defaultInclude: { profile: true }
    });
  }

  // Add custom methods if needed
  async getActiveUsers(req: Request, res: Response) {
    const users = await this.service.findMany({ 
      where: { active: true },
      include: { profile: true }
    });
    const responseData = BaseResponse.mapMany(users, this.responseClass);
    return SuccessResponse.get(responseData).send(res);
  }
}
```

## Route Setup

```typescript
import { Router } from 'express';
import { UserController } from './user.controller';

const router = Router();
const userController = new UserController(userService);

// Standard CRUD routes
router.get('/', userController.getAll);
router.get('/paginated', userController.findWithPagination);
router.get('/search', userController.search);
router.get('/count', userController.count);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

// Custom routes
router.get('/active', userController.getActiveUsers);

export default router;
```

## Error Handling

The BaseController automatically handles common errors:

- **ValidationException** - Invalid request data (400)
- **NotFoundException** - Resource not found (404)
- **BadRequestException** - Invalid query parameters (400)

All errors are formatted consistently using the error middleware.

## Related

- [BaseService](./base-service.md)
- [IService Interface](./interfaces/service-interface.md)
- [ApiResponse](./utils/api-response.md)
- [RequestOptionBuilder](./utils/request-option-builder.md)