# Code Generation Capabilities

Mifty's powerful code generation system automatically creates complete, production-ready modules from your database design. This eliminates hours of boilerplate coding and ensures consistent, high-quality code across your application.

## 🚀 Overview

Mifty provides **two main approaches** to code generation:

1. **🎨 Visual Database Designer** → Auto-generate modules
2. **📝 Manual Configuration** → Interactive module creation

Both approaches generate the same comprehensive module structure with all necessary files and patterns.

## 🎯 What Gets Generated

When you generate a module, Mifty creates a complete, production-ready structure:

```
src/modules/user/
├── 📁 controllers/
│   └── 📄 user.controller.ts        # HTTP request handlers
├── 📁 services/
│   ├── 📄 user.service.ts           # Business logic implementation
│   └── 📁 interfaces/
│       └── 📄 user.service.interface.ts
├── 📁 repositories/
│   ├── 📄 user.repository.ts        # Data access layer
│   └── 📁 interfaces/
│       └── 📄 user.repository.interface.ts
├── 📁 entities/
│   └── 📄 user.entity.ts            # TypeScript type definitions
├── 📁 dtos/
│   └── 📄 user-response.dto.ts      # Response formatting
├── 📁 validations/
│   └── 📄 user.validation.ts        # Input validation schemas
├── 📁 routes/
│   └── 📄 user.routes.ts            # Express route definitions
├── 📁 tests/
│   ├── 📄 user.service.test.ts      # Unit tests
│   └── 📄 user.controller.test.ts   # Controller tests
└── 📄 di.ts                         # Dependency injection setup
```

### 📋 Generated Files Overview

| File Type | Purpose | Features |
|-----------|---------|----------|
| **Controller** | HTTP request handling | CRUD operations, validation, error handling |
| **Service** | Business logic | Domain operations, data transformation |
| **Repository** | Data access | Database operations, query optimization |
| **Entity** | Type definitions | Prisma types, DTOs, interfaces |
| **Validation** | Input validation | Zod schemas, transformation logic |
| **Routes** | API endpoints | RESTful routes, middleware integration |
| **Tests** | Quality assurance | Unit tests, integration tests |
| **DI** | Dependency injection | Service registration, container setup |

## 🎨 Method 1: Visual Database Designer

### Step 1: Design Your Database

```bash
# Start the database designer
npm run db-designer
```

Open `http://localhost:3001/ui` and visually design your database:

1. **Add Tables**: Click "Add Table" and name your entities
2. **Define Columns**: Add fields with types, constraints, and validations
3. **Create Relationships**: Connect tables with foreign keys
4. **Save Design**: Your design is saved to `src/db.design.ts`

### Step 2: Generate Modules

```bash
# Generate modules from your visual design
npm run generate
```

Choose option **2** (From db design) and Mifty will:
- ✅ Read your `db.design.ts` file
- ✅ Generate modules for each table
- ✅ Create all relationships and foreign keys
- ✅ Set up proper validation schemas
- ✅ Generate complete test suites

### Example: Visual Design to Code

**Visual Design** (`src/db.design.ts`):
```typescript
export const dbDesign = {
  User: {
    columns: {
      id: { type: 'String', primary: true, randomUUID: true },
      email: { type: 'String', unique: true, nullable: false },
      name: { type: 'String', nullable: true },
      createdAt: { type: 'DateTime', default: 'now()' }
    }
  },
  Post: {
    columns: {
      id: { type: 'String', primary: true, randomUUID: true },
      title: { type: 'String', nullable: false },
      content: { type: 'String', nullable: true },
      authorId: { type: 'String', nullable: false },
      createdAt: { type: 'DateTime', default: 'now()' }
    },
    relations: {
      author: { type: 'manyToOne', model: 'User', foreignKey: 'authorId' }
    }
  }
};
```

**Generated Controller** (`user.controller.ts`):
```typescript
@injectable()
export class UserController extends BaseController<User, UserCreateDto, UserUpdateDto> {
  constructor(
    @inject('IUserService') private userService: IUserService
  ) {
    super({
      service: userService,
      responseClass: UserResponse,
      createSchema: userValidation.create,
      updateSchema: userValidation.update,
      searchFields: ['name', 'email'],
      defaultInclude: { posts: true }
    });
  }
}
```

**Generated Service** (`user.service.ts`):
```typescript
@injectable()
export class UserService extends BaseService<User, UserCreateDto, UserUpdateDto> implements IUserService {
  constructor(
    @inject('IUserRepository') repository: IUserRepository
  ) {
    super(repository);
  }
  
  // Custom business logic methods can be added here
}
```

**Generated Validation** (`user.validation.ts`):
```typescript
export const createUserSchema = flatToNestedSchema(
  z.object({
    email: z.string().email(),
    name: z.string().optional(),
  }),
  data => ({
    email: data.email,
    name: data.name,
  })
);

export const userValidation = {
  create: createUserSchema,
  update: updateUserSchema,
  idParam: userIdParamSchema,
  search: searchQuerySchema
};
```

## 📝 Method 2: Manual Interactive Generation

### Step 1: Start Interactive Generator

```bash
npm run generate
```

Choose option **1** (Manually) for interactive prompts.

### Step 2: Configure Your Module

The generator will ask you to configure:

#### 🏗️ Basic Module Information
```
Enter module name: product
```

#### 📋 Fields Configuration
```
Add custom fields? (y/n): y
Field name: title
Field type: string
Is optional? (y/n): n
Add validation rules? (y/n): y
Validation rule: min(3).max(100)
```

#### 🔗 Relationships Configuration
```
Add relationships? (y/n): y
Relationship name: category
Related model: Category
Relationship type: manyToOne
Foreign key: categoryId
```

#### 🛣️ Routes Configuration
```
Include route: getAll? (y/n): y
Include route: getById? (y/n): y
Include route: create? (y/n): y
Include route: update? (y/n): y
Include route: delete? (y/n): y
Include route: search? (y/n): y
```

#### 🧪 Testing Configuration
```
Generate service tests? (y/n): y
Generate controller tests? (y/n): y
Generate integration tests? (y/n): y
```

### Step 3: Generated Output

The generator creates all files with your specifications:

```typescript
// Generated entity with your custom fields
export type Product = Prisma.ProductGetPayload<{
  include: {
    category: true
  }
}>;

// Generated validation with your rules
const createProductSchema = z.object({
  title: z.string().min(3).max(100),
  categoryId: z.string().uuid(),
});

// Generated routes with your selections
router.get('/product/', productController.findWithPagination);
router.get('/product/search', productController.search);
router.get('/product/:id', productController.getById);
router.post('/product/', productController.create);
router.put('/product/:id', productController.update);
router.delete('/product/:id', productController.delete);
```

## 🔧 Advanced Generation Features

### 🎯 Prisma Integration

Mifty automatically integrates with your Prisma schema:

```typescript
// Reads existing Prisma models
const getAllPrismaModelNames = (): string[] => {
  const schemaContent = fs.readFileSync('src/prisma/schema.prisma', 'utf-8');
  const modelMatches = schemaContent.match(/model\s+(\w+)\s*{/g);
  return modelMatches.map(match => match.match(/model\s+(\w+)/)[1]);
};

// Generates type-safe entities
export type User = Prisma.UserGetPayload<{
  include: {
    posts: true,
    profile: true
  }
}>;
```

### 🔄 Relationship Handling

Mifty automatically handles complex relationships:

#### One-to-Many Relationships
```typescript
// Generated validation for User -> Posts relationship
const createPostSchema = flatToNestedSchema(
  z.object({
    title: z.string(),
    authorId: z.string().uuid(),
  }),
  data => ({
    title: data.title,
    author: { connect: { id: data.authorId } }
  })
);
```

#### Many-to-Many Relationships
```typescript
// Generated validation for User <-> Role relationship
const createUserSchema = flatToNestedSchema(
  z.object({
    email: z.string().email(),
    roleIds: z.array(z.string().uuid()),
  }),
  data => ({
    email: data.email,
    roles: { connect: data.roleIds.map(id => ({ id })) }
  })
);
```

### 🧪 Test Generation

Comprehensive test suites are automatically generated:

#### Unit Tests
```typescript
describe('UserService', () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    userService = new UserService(mockRepository);
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createDto: UserCreateDto = {
        email: 'test@example.com',
        name: 'Test User'
      };
      
      mockRepository.create.mockResolvedValue(mockUser);
      
      const result = await userService.create(createDto);
      
      expect(result).toEqual(mockUser);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    });
  });
});
```

#### Integration Tests
```typescript
describe('User Routes', () => {
  let app: Application;

  beforeAll(async () => {
    app = await createTestApp();
  });

  describe('POST /api/v1/user', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/v1/user')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
    });
  });
});
```

## 🎨 Customization Options

### 🔧 Template Customization

You can customize the generated code by modifying templates in `src/scripts/templates/`:

```typescript
// Custom controller template
export const generateControllerTemplate = (name: string, options: any) => {
  return `
@injectable()
export class ${pascalCase(name)}Controller extends BaseController {
  constructor(
    @inject('I${pascalCase(name)}Service') private service: I${pascalCase(name)}Service
  ) {
    super({
      service,
      responseClass: ${pascalCase(name)}Response,
      // Your custom configuration
      searchFields: ${JSON.stringify(options.searchFields)},
      defaultInclude: ${JSON.stringify(options.defaultInclude)}
    });
  }
  
  // Add custom methods here
}`;
};
```

### 🎯 Field Type Mapping

Mifty automatically maps database types to TypeScript/Zod types:

| Database Type | TypeScript Type | Zod Validation |
|---------------|-----------------|----------------|
| `String` | `string` | `z.string()` |
| `Int` | `number` | `z.number().int()` |
| `Float` | `number` | `z.number()` |
| `Boolean` | `boolean` | `z.boolean()` |
| `DateTime` | `Date` | `z.union([z.string(), z.date()])` |
| `Json` | `any` | `z.any()` |
| `Enum` | `union type` | `z.enum([...])` |

### 🔄 Validation Transformation

Mifty generates smart validation schemas that handle nested relationships:

```typescript
// Flat input schema for API
const flatSchema = z.object({
  title: z.string(),
  categoryId: z.string().uuid(),
});

// Transformed to nested Prisma input
const transformedSchema = flatSchema.transform(data => ({
  title: data.title,
  category: { connect: { id: data.categoryId } }
}));
```

## 🚀 Generation Commands

### Basic Commands

```bash
# Interactive generator
npm run generate

# Generate specific module
npm run generate generate-module user

# Generate from database design
npm run generate generate-module auto
```

### Advanced Commands

```bash
# Generate with AI assistance
npm run generate generate-ai --module user --type test

# Generate only tests
npm run generate generate-ai --module user --type test

# Generate only documentation
npm run generate generate-ai --module user --type docs
```

## 🔍 Generated Code Quality

### 🛡️ Type Safety

All generated code is fully type-safe:

```typescript
// Generated with proper Prisma types
export type User = Prisma.UserGetPayload<{
  include: { posts: true }
}>;

// Type-safe service methods
async findById(id: string): Promise<User> {
  return this.repository.findById(id);
}
```

### 🧪 Test Coverage

Generated tests provide comprehensive coverage:

- ✅ **Unit Tests**: Service and repository logic
- ✅ **Integration Tests**: API endpoint testing
- ✅ **Validation Tests**: Input validation scenarios
- ✅ **Error Handling**: Exception and edge cases

### 📋 Best Practices

Generated code follows enterprise patterns:

- ✅ **Clean Architecture**: Layered separation of concerns
- ✅ **Dependency Injection**: Loose coupling and testability
- ✅ **Error Handling**: Proper exception management
- ✅ **Validation**: Input sanitization and transformation
- ✅ **Documentation**: JSDoc comments and type annotations

## 🔄 Regeneration and Updates

### Safe Regeneration

Mifty supports safe regeneration of modules:

```bash
# Regenerate existing module (prompts for confirmation)
npm run generate generate-module user
```

### Incremental Updates

You can regenerate specific parts:

1. **Update database design** in visual designer
2. **Regenerate entities** to reflect schema changes
3. **Keep custom business logic** in services
4. **Update tests** to match new structure

### Migration Strategy

When updating existing modules:

1. **Backup custom code** before regeneration
2. **Regenerate base files** (entities, repositories)
3. **Merge custom logic** back into services
4. **Update tests** for new functionality

## 💡 Pro Tips

### 🎯 Optimization Tips

1. **Use meaningful names** for better generated code
2. **Design relationships carefully** for optimal queries
3. **Add validation rules** during generation for better security
4. **Generate tests early** for better development workflow

### 🔧 Customization Best Practices

1. **Extend base classes** rather than modifying generated code
2. **Add custom methods** to services for business logic
3. **Use dependency injection** for additional services
4. **Keep generated files clean** and add customizations in separate files

### 🚀 Performance Considerations

1. **Generated queries** are optimized for common use cases
2. **Pagination** is built into all list endpoints
3. **Search functionality** uses database indexes
4. **Relationships** are loaded efficiently with Prisma includes

The code generation system in Mifty eliminates the tedious work of writing boilerplate code while ensuring consistency, type safety, and best practices across your entire application.