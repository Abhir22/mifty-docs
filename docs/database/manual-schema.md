# Manual Schema Editing

For developers who prefer code-first approach or need advanced control, you can directly edit the `src/db.design.ts` file. This method provides more flexibility and is perfect for complex schemas, version control, and team collaboration.

## Overview

The `db.design.ts` file is the source of truth for your database schema. Both the Visual Designer and Prisma schema generation read from this file, making it the central configuration point for your database structure.

### Benefits of Manual Editing

- **🎯 Precise Control**: Fine-tune every aspect of your schema
- **📝 Code-First Workflow**: Work entirely in your preferred editor
- **🔄 Version Control Friendly**: Easy to track changes and collaborate
- **⚡ Bulk Operations**: Make multiple changes quickly
- **🧪 Advanced Patterns**: Implement complex relationships and constraints

## File Structure

### Basic Structure

```typescript
// src/db.design.ts
export const dbDesign = {
  tables: [
    {
      name: "TableName",
      columns: [
        // Column definitions
      ],
      relationships: [
        // Relationship definitions  
      ]
    }
  ]
};
```

### Complete Example

```typescript
// src/db.design.ts
export const dbDesign = {
  tables: [
    {
      name: "User",
      columns: [
        {
          name: "id",
          type: "String",
          isPrimaryKey: true,
          isRequired: true,
          defaultValue: "cuid()"
        },
        {
          name: "email",
          type: "String",
          isRequired: true,
          isUnique: true
        },
        {
          name: "firstName",
          type: "String",
          isRequired: true
        },
        {
          name: "lastName",
          type: "String",
          isRequired: false
        },
        {
          name: "age",
          type: "Int",
          isRequired: false,
          minValue: 0,
          maxValue: 150
        },
        {
          name: "role",
          type: "Enum",
          enumValues: ["USER", "ADMIN", "MODERATOR"],
          isRequired: true,
          defaultValue: "USER"
        },
        {
          name: "isActive",
          type: "Boolean",
          isRequired: true,
          defaultValue: "true"
        },
        {
          name: "createdAt",
          type: "DateTime",
          isRequired: true,
          defaultValue: "now()"
        },
        {
          name: "updatedAt",
          type: "DateTime",
          isRequired: true,
          isUpdatedAt: true
        }
      ]
    }
  ]
};
```

## Column Configuration

### All Available Column Properties

```typescript
{
  name: "columnName",           // Required: Column identifier
  type: "String",               // Required: Data type
  
  // Constraints
  isRequired: true,             // Optional: Not null constraint
  isUnique: true,               // Optional: Unique constraint  
  isPrimaryKey: true,           // Optional: Primary key
  isUpdatedAt: true,            // Optional: Auto-update timestamp
  
  // Default values
  defaultValue: "cuid()",       // Optional: Default value or function
  
  // Validation (for String/Int/Float)
  minLength: 5,                 // Optional: Minimum string length
  maxLength: 100,               // Optional: Maximum string length
  minValue: 0,                  // Optional: Minimum numeric value
  maxValue: 999,                // Optional: Maximum numeric value
  
  // Enum specific
  enumValues: ["A", "B", "C"],  // Required for Enum type
  
  // Database specific
  dbType: "VARCHAR(255)",       // Optional: Override database type
  isIndexed: true,              // Optional: Create database index
  
  // Documentation
  description: "User's email",  // Optional: Column description
  example: "user@example.com"   // Optional: Example value
}
```

### Data Types Reference

#### String Type
```typescript
{
  name: "email",
  type: "String",
  isRequired: true,
  isUnique: true,
  minLength: 5,
  maxLength: 255,
  description: "User's email address"
}
```

#### Integer Type
```typescript
{
  name: "age",
  type: "Int",
  isRequired: false,
  minValue: 0,
  maxValue: 150,
  description: "User's age in years"
}
```

#### Float Type
```typescript
{
  name: "price",
  type: "Float",
  isRequired: true,
  minValue: 0.01,
  maxValue: 999999.99,
  description: "Product price in USD"
}
```

#### Boolean Type
```typescript
{
  name: "isActive",
  type: "Boolean",
  isRequired: true,
  defaultValue: "true",
  description: "Whether the user account is active"
}
```

#### DateTime Type
```typescript
{
  name: "createdAt",
  type: "DateTime",
  isRequired: true,
  defaultValue: "now()",
  description: "Record creation timestamp"
}

// Auto-updating timestamp
{
  name: "updatedAt",
  type: "DateTime",
  isRequired: true,
  isUpdatedAt: true,
  description: "Record last update timestamp"
}
```

#### JSON Type
```typescript
{
  name: "metadata",
  type: "Json",
  isRequired: false,
  defaultValue: "{}",
  description: "Additional user metadata"
}
```

#### Enum Type
```typescript
{
  name: "status",
  type: "Enum",
  enumValues: ["PENDING", "ACTIVE", "SUSPENDED", "DELETED"],
  isRequired: true,
  defaultValue: "PENDING",
  description: "User account status"
}
```

### Default Value Functions

| Function | Description | Example |
|----------|-------------|---------|
| `cuid()` | Collision-resistant unique identifier | `"cuid()"` |
| `uuid()` | UUID v4 identifier | `"uuid()"` |
| `now()` | Current timestamp | `"now()"` |
| `autoincrement()` | Auto-incrementing integer | `"autoincrement()"` |
| Static values | Fixed default values | `"PENDING"`, `0`, `true` |

## Creating Relationships

### Relationship Structure

```typescript
{
  name: "relationshipName",     // Required: Relationship identifier
  type: "OneToMany",           // Required: Relationship type
  fromTable: "User",           // Required: Source table
  fromColumn: "id",            // Required: Source column
  toTable: "Post",             // Required: Target table
  toColumn: "authorId",        // Required: Target column
  onDelete: "CASCADE",         // Optional: Delete behavior
  onUpdate: "CASCADE"          // Optional: Update behavior
}
```

### One-to-One Relationship

```typescript
// User has one Profile
{
  name: "profile",
  type: "OneToOne",
  fromTable: "User",
  fromColumn: "id",
  toTable: "Profile", 
  toColumn: "userId",
  onDelete: "CASCADE"
}
```

**Generated Prisma Schema:**
```prisma
model User {
  id      String   @id @default(cuid())
  profile Profile?
}

model Profile {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### One-to-Many Relationship

```typescript
// User has many Posts
{
  name: "posts",
  type: "OneToMany",
  fromTable: "User",
  fromColumn: "id", 
  toTable: "Post",
  toColumn: "authorId",
  onDelete: "CASCADE"
}
```

**Generated Prisma Schema:**
```prisma
model User {
  id    String @id @default(cuid())
  posts Post[]
}

model Post {
  id       String @id @default(cuid())
  authorId String
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
}
```

### Many-to-Many Relationship

```typescript
// Users have many Roles through UserRole
{
  name: "userRoles",
  type: "ManyToMany",
  fromTable: "User",
  fromColumn: "id",
  toTable: "Role", 
  toColumn: "id",
  throughTable: "UserRole",
  throughFromColumn: "userId",
  throughToColumn: "roleId"
}
```

**Generated Prisma Schema:**
```prisma
model User {
  id    String     @id @default(cuid())
  roles UserRole[]
}

model Role {
  id    String     @id @default(cuid())
  users UserRole[]
}

model UserRole {
  userId String
  roleId String
  user   User   @relation(fields: [userId], references: [id])
  role   Role   @relation(fields: [roleId], references: [id])
  
  @@id([userId, roleId])
}
```

## Complete Schema Examples

### Blog Application Schema

```typescript
export const dbDesign = {
  tables: [
    {
      name: "User",
      columns: [
        {
          name: "id",
          type: "String",
          isPrimaryKey: true,
          isRequired: true,
          defaultValue: "cuid()"
        },
        {
          name: "email",
          type: "String",
          isRequired: true,
          isUnique: true
        },
        {
          name: "username",
          type: "String",
          isRequired: true,
          isUnique: true,
          minLength: 3,
          maxLength: 30
        },
        {
          name: "firstName",
          type: "String",
          isRequired: true
        },
        {
          name: "lastName",
          type: "String",
          isRequired: true
        },
        {
          name: "bio",
          type: "String",
          isRequired: false,
          maxLength: 500
        },
        {
          name: "avatar",
          type: "String",
          isRequired: false
        },
        {
          name: "role",
          type: "Enum",
          enumValues: ["USER", "AUTHOR", "ADMIN"],
          isRequired: true,
          defaultValue: "USER"
        },
        {
          name: "isActive",
          type: "Boolean",
          isRequired: true,
          defaultValue: "true"
        },
        {
          name: "createdAt",
          type: "DateTime",
          isRequired: true,
          defaultValue: "now()"
        },
        {
          name: "updatedAt",
          type: "DateTime",
          isRequired: true,
          isUpdatedAt: true
        }
      ]
    },
    {
      name: "Post",
      columns: [
        {
          name: "id",
          type: "String",
          isPrimaryKey: true,
          isRequired: true,
          defaultValue: "cuid()"
        },
        {
          name: "title",
          type: "String",
          isRequired: true,
          maxLength: 200
        },
        {
          name: "slug",
          type: "String",
          isRequired: true,
          isUnique: true
        },
        {
          name: "excerpt",
          type: "String",
          isRequired: false,
          maxLength: 300
        },
        {
          name: "content",
          type: "String",
          isRequired: true
        },
        {
          name: "featuredImage",
          type: "String",
          isRequired: false
        },
        {
          name: "status",
          type: "Enum",
          enumValues: ["DRAFT", "PUBLISHED", "ARCHIVED"],
          isRequired: true,
          defaultValue: "DRAFT"
        },
        {
          name: "publishedAt",
          type: "DateTime",
          isRequired: false
        },
        {
          name: "authorId",
          type: "String",
          isRequired: true
        },
        {
          name: "viewCount",
          type: "Int",
          isRequired: true,
          defaultValue: "0",
          minValue: 0
        },
        {
          name: "metadata",
          type: "Json",
          isRequired: false,
          defaultValue: "{}"
        },
        {
          name: "createdAt",
          type: "DateTime",
          isRequired: true,
          defaultValue: "now()"
        },
        {
          name: "updatedAt",
          type: "DateTime",
          isRequired: true,
          isUpdatedAt: true
        }
      ]
    },
    {
      name: "Category",
      columns: [
        {
          name: "id",
          type: "String",
          isPrimaryKey: true,
          isRequired: true,
          defaultValue: "cuid()"
        },
        {
          name: "name",
          type: "String",
          isRequired: true,
          isUnique: true,
          maxLength: 50
        },
        {
          name: "slug",
          type: "String",
          isRequired: true,
          isUnique: true
        },
        {
          name: "description",
          type: "String",
          isRequired: false,
          maxLength: 200
        },
        {
          name: "color",
          type: "String",
          isRequired: false,
          defaultValue: "#6366f1"
        },
        {
          name: "createdAt",
          type: "DateTime",
          isRequired: true,
          defaultValue: "now()"
        }
      ]
    },
    {
      name: "PostCategory",
      columns: [
        {
          name: "postId",
          type: "String",
          isRequired: true
        },
        {
          name: "categoryId",
          type: "String",
          isRequired: true
        }
      ]
    },
    {
      name: "Comment",
      columns: [
        {
          name: "id",
          type: "String",
          isPrimaryKey: true,
          isRequired: true,
          defaultValue: "cuid()"
        },
        {
          name: "content",
          type: "String",
          isRequired: true,
          maxLength: 1000
        },
        {
          name: "postId",
          type: "String",
          isRequired: true
        },
        {
          name: "authorId",
          type: "String",
          isRequired: true
        },
        {
          name: "parentId",
          type: "String",
          isRequired: false
        },
        {
          name: "isApproved",
          type: "Boolean",
          isRequired: true,
          defaultValue: "false"
        },
        {
          name: "createdAt",
          type: "DateTime",
          isRequired: true,
          defaultValue: "now()"
        },
        {
          name: "updatedAt",
          type: "DateTime",
          isRequired: true,
          isUpdatedAt: true
        }
      ]
    }
  ]
};
```

### E-commerce Application Schema

```typescript
export const dbDesign = {
  tables: [
    {
      name: "Customer",
      columns: [
        {
          name: "id",
          type: "String",
          isPrimaryKey: true,
          isRequired: true,
          defaultValue: "cuid()"
        },
        {
          name: "email",
          type: "String",
          isRequired: true,
          isUnique: true
        },
        {
          name: "firstName",
          type: "String",
          isRequired: true
        },
        {
          name: "lastName",
          type: "String",
          isRequired: true
        },
        {
          name: "phone",
          type: "String",
          isRequired: false
        },
        {
          name: "dateOfBirth",
          type: "DateTime",
          isRequired: false
        },
        {
          name: "isActive",
          type: "Boolean",
          isRequired: true,
          defaultValue: "true"
        },
        {
          name: "createdAt",
          type: "DateTime",
          isRequired: true,
          defaultValue: "now()"
        },
        {
          name: "updatedAt",
          type: "DateTime",
          isRequired: true,
          isUpdatedAt: true
        }
      ]
    },
    {
      name: "Product",
      columns: [
        {
          name: "id",
          type: "String",
          isPrimaryKey: true,
          isRequired: true,
          defaultValue: "cuid()"
        },
        {
          name: "name",
          type: "String",
          isRequired: true
        },
        {
          name: "description",
          type: "String",
          isRequired: false
        },
        {
          name: "price",
          type: "Float",
          isRequired: true,
          minValue: 0
        },
        {
          name: "compareAtPrice",
          type: "Float",
          isRequired: false,
          minValue: 0
        },
        {
          name: "sku",
          type: "String",
          isRequired: true,
          isUnique: true
        },
        {
          name: "inventory",
          type: "Int",
          isRequired: true,
          defaultValue: "0",
          minValue: 0
        },
        {
          name: "weight",
          type: "Float",
          isRequired: false,
          minValue: 0
        },
        {
          name: "status",
          type: "Enum",
          enumValues: ["DRAFT", "ACTIVE", "ARCHIVED"],
          isRequired: true,
          defaultValue: "DRAFT"
        },
        {
          name: "images",
          type: "Json",
          isRequired: false,
          defaultValue: "[]"
        },
        {
          name: "metadata",
          type: "Json",
          isRequired: false,
          defaultValue: "{}"
        },
        {
          name: "createdAt",
          type: "DateTime",
          isRequired: true,
          defaultValue: "now()"
        },
        {
          name: "updatedAt",
          type: "DateTime",
          isRequired: true,
          isUpdatedAt: true
        }
      ]
    },
    {
      name: "Order",
      columns: [
        {
          name: "id",
          type: "String",
          isPrimaryKey: true,
          isRequired: true,
          defaultValue: "cuid()"
        },
        {
          name: "orderNumber",
          type: "String",
          isRequired: true,
          isUnique: true
        },
        {
          name: "customerId",
          type: "String",
          isRequired: true
        },
        {
          name: "status",
          type: "Enum",
          enumValues: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
          isRequired: true,
          defaultValue: "PENDING"
        },
        {
          name: "subtotal",
          type: "Float",
          isRequired: true,
          minValue: 0
        },
        {
          name: "tax",
          type: "Float",
          isRequired: true,
          defaultValue: "0",
          minValue: 0
        },
        {
          name: "shipping",
          type: "Float",
          isRequired: true,
          defaultValue: "0",
          minValue: 0
        },
        {
          name: "total",
          type: "Float",
          isRequired: true,
          minValue: 0
        },
        {
          name: "shippingAddress",
          type: "Json",
          isRequired: true
        },
        {
          name: "billingAddress",
          type: "Json",
          isRequired: true
        },
        {
          name: "notes",
          type: "String",
          isRequired: false
        },
        {
          name: "createdAt",
          type: "DateTime",
          isRequired: true,
          defaultValue: "now()"
        },
        {
          name: "updatedAt",
          type: "DateTime",
          isRequired: true,
          isUpdatedAt: true
        }
      ]
    },
    {
      name: "OrderItem",
      columns: [
        {
          name: "id",
          type: "String",
          isPrimaryKey: true,
          isRequired: true,
          defaultValue: "cuid()"
        },
        {
          name: "orderId",
          type: "String",
          isRequired: true
        },
        {
          name: "productId",
          type: "String",
          isRequired: true
        },
        {
          name: "quantity",
          type: "Int",
          isRequired: true,
          minValue: 1
        },
        {
          name: "price",
          type: "Float",
          isRequired: true,
          minValue: 0
        },
        {
          name: "total",
          type: "Float",
          isRequired: true,
          minValue: 0
        }
      ]
    }
  ]
};
```

## Migration Between Visual and Manual Editing

### Visual to Manual Workflow

1. **Design in Visual UI**: Create your schema using the drag-and-drop interface
2. **Auto-Generated Code**: The `db.design.ts` file updates automatically
3. **Refine Manually**: Edit the generated code for advanced customizations
4. **Refresh UI**: The visual designer loads your manual changes

### Manual to Visual Workflow

1. **Edit Code**: Make changes directly in `db.design.ts`
2. **Save File**: Ensure your changes are saved
3. **Refresh Designer**: Reload the visual designer to see your changes
4. **Continue Visually**: Use the UI for further modifications

### Best Practices for Hybrid Workflow

1. **Start Visual**: Use the UI for initial schema design
2. **Copy Generated Code**: Save the auto-generated code as a starting point
3. **Add Advanced Features**: Manually add complex constraints and validations
4. **Test Frequently**: Run `npm run prisma:generate` to validate changes
5. **Version Control**: Commit `db.design.ts` changes for team collaboration
6. **Document Changes**: Add comments explaining manual customizations

## Advanced Schema Patterns

### Polymorphic Relationships

```typescript
// Comments that can belong to Posts or Products
{
  name: "Comment",
  columns: [
    {
      name: "id",
      type: "String",
      isPrimaryKey: true,
      defaultValue: "cuid()"
    },
    {
      name: "content",
      type: "String",
      isRequired: true
    },
    {
      name: "commentableId",
      type: "String",
      isRequired: true
    },
    {
      name: "commentableType",
      type: "Enum",
      enumValues: ["POST", "PRODUCT"],
      isRequired: true
    }
  ]
}
```

### Self-Referencing Relationships

```typescript
// Categories with parent-child relationships
{
  name: "Category",
  columns: [
    {
      name: "id",
      type: "String",
      isPrimaryKey: true,
      defaultValue: "cuid()"
    },
    {
      name: "name",
      type: "String",
      isRequired: true
    },
    {
      name: "parentId",
      type: "String",
      isRequired: false
    }
  ]
}
```

### Soft Deletes

```typescript
// Users with soft delete capability
{
  name: "User",
  columns: [
    {
      name: "id",
      type: "String",
      isPrimaryKey: true,
      defaultValue: "cuid()"
    },
    {
      name: "email",
      type: "String",
      isRequired: true,
      isUnique: true
    },
    {
      name: "deletedAt",
      type: "DateTime",
      isRequired: false
    }
  ]
}
```

### Audit Fields

```typescript
// Complete audit trail
{
  name: "AuditableEntity",
  columns: [
    {
      name: "id",
      type: "String",
      isPrimaryKey: true,
      defaultValue: "cuid()"
    },
    {
      name: "createdAt",
      type: "DateTime",
      isRequired: true,
      defaultValue: "now()"
    },
    {
      name: "updatedAt",
      type: "DateTime",
      isRequired: true,
      isUpdatedAt: true
    },
    {
      name: "createdById",
      type: "String",
      isRequired: true
    },
    {
      name: "updatedById",
      type: "String",
      isRequired: true
    },
    {
      name: "version",
      type: "Int",
      isRequired: true,
      defaultValue: "1"
    }
  ]
}
```

## Validation and Testing

### Schema Validation

After editing `db.design.ts`, validate your schema:

```bash
# Generate Prisma client to check for errors
npm run prisma:generate

# Push schema to database (development)
npm run prisma:push

# Create migration (production)
npm run prisma:migrate
```

### Common Validation Errors

#### Invalid Column Names
```typescript
// ❌ Invalid - reserved keyword
{ name: "order", type: "String" }

// ✅ Valid - descriptive name
{ name: "orderNumber", type: "String" }
```

#### Missing Required Properties
```typescript
// ❌ Invalid - missing required properties
{ name: "email" }

// ✅ Valid - all required properties
{ name: "email", type: "String", isRequired: true }
```

#### Circular Relationships
```typescript
// ❌ Invalid - circular dependency
// User -> Profile -> User (both required)

// ✅ Valid - one side optional
// User -> Profile? -> User (profile optional)
```

### Testing Your Schema

```bash
# Generate and test Prisma client
npm run prisma:generate

# Reset database and apply schema
npm run prisma:reset

# Seed database with test data
npm run prisma:seed

# Generate modules from schema
npm run generate

# Test generated API endpoints
npm test
```

## Performance Optimization

### Indexing Strategy

```typescript
{
  name: "email",
  type: "String",
  isRequired: true,
  isUnique: true,    // Automatically creates unique index
  isIndexed: true    // Creates additional index if needed
}
```

### Query Optimization

```typescript
// Optimize for common queries
{
  name: "User",
  columns: [
    {
      name: "email",
      type: "String",
      isUnique: true,     // Fast lookups
      isIndexed: true
    },
    {
      name: "status",
      type: "Enum",
      enumValues: ["ACTIVE", "INACTIVE"],
      isIndexed: true     // Fast filtering
    },
    {
      name: "createdAt",
      type: "DateTime",
      isIndexed: true     // Fast date range queries
    }
  ]
}
```

### Relationship Optimization

```typescript
// Optimize foreign key relationships
{
  name: "authorId",
  type: "String",
  isRequired: true,
  isIndexed: true,      // Fast joins
  description: "Foreign key to User.id"
}
```

## Troubleshooting

### Common Issues

#### File Permission Errors
```bash
# Fix file permissions
chmod 644 src/db.design.ts

# Ensure directory is writable
chmod 755 src/
```

#### Syntax Errors
- Validate JSON structure
- Check for missing commas
- Verify property names are quoted
- Ensure all required properties are present

#### Type Mismatches
- Verify enum values are strings
- Check numeric constraints are numbers
- Ensure boolean defaults are strings ("true"/"false")

#### Relationship Errors
- Confirm both tables exist
- Verify column types match
- Check foreign key column exists
- Ensure relationship direction is correct

### Debugging Tips

1. **Use TypeScript**: Enable TypeScript checking in your editor
2. **Validate Incrementally**: Test after each major change
3. **Check Generated Schema**: Review the Prisma schema output
4. **Use Version Control**: Commit working versions frequently
5. **Test with Real Data**: Seed database to test relationships

## Next Steps

After mastering manual schema editing:

1. **[Database Configuration](./configuration.md)**: Set up different database providers
2. **[Visual Designer](./visual-designer.md)**: Learn the UI approach
3. **[Code Generation](../framework/code-generation.md)**: Generate modules from your schema
4. **[API Development](../tutorials/blog-api.md)**: Build APIs using your schema