# Visual Database Designer

Mifty's Visual Database Designer is a powerful drag-and-drop interface that lets you design your database schema without writing any code. It automatically generates Prisma schemas and keeps your `db.design.ts` file in sync.

## Getting Started

### Launching the Designer

You have several options to start the visual designer:

```bash
# Option 1: Full development suite (recommended)
npm run dev:full

# Option 2: Designer only
npm run db-designer

# Option 3: As part of regular development
npm run dev
```

**Access the designer at:** `http://localhost:3001/ui`

### Development Modes

import { ServiceTable } from '@site/src/components';

<ServiceTable>
  <tr>
    <th>Command</th>
    <th>Services Started</th>
    <th>Best For</th>
  </tr>
  <tr>
    <td><code>npm run dev</code></td>
    <td>🌐 API Server (3000)<br/>🔍 Error Monitor</td>
    <td>Daily coding, building API endpoints</td>
  </tr>
  <tr>
    <td><code>npm run dev:full</code></td>
    <td>🌐 API Server (3000)<br/>🎨 DB Designer (3001)<br/>📊 Prisma Studio (5555)<br/>🔍 Error Monitor</td>
    <td>Database design, full development suite</td>
  </tr>
  <tr>
    <td><code>npm run db-designer</code></td>
    <td>🎨 DB Designer only (3001)</td>
    <td>Schema design only, planning database structure</td>
  </tr>
</ServiceTable>

## Interface Overview

The Visual Database Designer consists of four main sections:

### 🎯 Canvas
The main design area where you:
- Drag and position tables
- Create visual relationships
- View your complete schema layout

### 🛠️ Toolbar
Contains essential design tools:
- **+ Add Table**: Create new database tables
- **+ Add Relationship**: Connect tables with foreign keys
- **💾 Save Design**: Manual save and backup
- **🔄 Refresh**: Reload from `db.design.ts`

### 📋 Properties Panel
Edit selected items with detailed controls:
- Column types and constraints
- Relationship configurations
- Validation rules
- Default values

### 📜 Schema Preview
Live Prisma schema generation:
- Real-time code preview
- Syntax highlighting
- Copy to clipboard functionality

## Creating Tables

### Step 1: Add a New Table

1. Click the **"+ Add Table"** button in the toolbar
2. Enter a table name (e.g., "User", "Post", "Product")
3. The table appears on the canvas and is automatically selected

### Step 2: Configure Table Properties

With the table selected, use the Properties Panel to:
- Set the table name
- Add a description
- Configure table-level options

### Step 3: Add Columns

Click **"+ Add Column"** in the Properties Panel and configure:

#### Column Configuration Options

| Setting | Description | Example |
|---------|-------------|---------|
| **Name** | Column identifier | `email`, `firstName`, `createdAt` |
| **Type** | Data type | `String`, `Int`, `Boolean`, `DateTime` |
| **Required** | Not null constraint | ✅ Required / ❌ Optional |
| **Unique** | Unique constraint | ✅ Unique / ❌ Not unique |
| **Primary Key** | Primary key designation | ✅ Primary / ❌ Regular |
| **Default Value** | Default value or function | `now()`, `cuid()`, `"PENDING"` |

#### Available Data Types

| Type | Use Case | Constraints Available |
|------|----------|----------------------|
| **String** | Text, emails, names | Required, Unique, Min/Max length |
| **Int** | Numbers, IDs, counts | Required, Unique, Min/Max value |
| **Float** | Decimals, prices | Required, Unique, Min/Max value |
| **Boolean** | True/false flags | Required, Default value |
| **DateTime** | Timestamps, dates | Required, Default: now(), updatedAt |
| **Json** | Complex data structures | Required, Default value |
| **Enum** | Fixed set of values | Required, Enum values list |

#### Default Value Functions

| Function | Description | Example Usage |
|----------|-------------|---------------|
| `cuid()` | Unique identifier | Primary keys |
| `uuid()` | UUID identifier | Primary keys |
| `now()` | Current timestamp | createdAt fields |
| `autoincrement()` | Auto-incrementing number | Numeric IDs |
| Static values | Fixed default | `"PENDING"`, `0`, `true` |

## Complete Example: User Table

Let's create a comprehensive User table step by step:

### Visual Steps

1. **Add Table** → Name: "User"
2. **Add Columns:**

| Column | Type | Required | Unique | Primary Key | Default |
|--------|------|----------|--------|-------------|---------|
| `id` | String | ✅ | ✅ | ✅ | `cuid()` |
| `email` | String | ✅ | ✅ | ❌ | - |
| `firstName` | String | ✅ | ❌ | ❌ | - |
| `lastName` | String | ❌ | ❌ | ❌ | - |
| `age` | Int | ❌ | ❌ | ❌ | - |
| `isActive` | Boolean | ✅ | ❌ | ❌ | `true` |
| `role` | Enum | ✅ | ❌ | ❌ | `"USER"` |
| `createdAt` | DateTime | ✅ | ❌ | ❌ | `now()` |
| `updatedAt` | DateTime | ✅ | ❌ | ❌ | `now()` (updatedAt) |

### Generated Schema Preview

The designer automatically generates this Prisma schema:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  firstName String
  lastName  String?
  age       Int?
  isActive  Boolean  @default(true)
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
  MODERATOR
}
```

## Creating Relationships

### Step 1: Add Related Tables

Before creating relationships, ensure you have the related tables. For example:

**Post Table:**
- `id`: String, Primary Key, Default: `cuid()`
- `title`: String, Required
- `content`: String, Optional
- `published`: Boolean, Default: `false`
- `authorId`: String, Required
- `createdAt`: DateTime, Default: `now()`

### Step 2: Create the Relationship

1. Click **"+ Add Relationship"** in the toolbar
2. **Select Source Table**: User
3. **Select Source Column**: id
4. **Select Target Table**: Post  
5. **Select Target Column**: authorId
6. **Choose Relationship Type**: One-to-Many
7. **Name the Relationship**: 
   - Forward: "posts" (User has many posts)
   - Backward: "author" (Post belongs to author)

### Relationship Types

#### One-to-One Relationship
**Example**: User ↔ Profile

```prisma
model User {
  id      String   @id @default(cuid())
  email   String   @unique
  profile Profile?
}

model Profile {
  id     String @id @default(cuid())
  bio    String?
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
}
```

**Visual Indicator**: `1 ——— 1`

#### One-to-Many Relationship
**Example**: User → Posts

```prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  posts Post[]
}

model Post {
  id       String @id @default(cuid())
  title    String
  authorId String
  author   User   @relation(fields: [authorId], references: [id])
}
```

**Visual Indicator**: `1 ——— ∞`

#### Many-to-Many Relationship
**Example**: Users ↔ Roles

```prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  roles UserRole[]
}

model Role {
  id    String @id @default(cuid())
  name  String @unique
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

**Visual Indicator**: `∞ ——— ∞`

## Advanced Features

### Auto-Save and Backup

The designer includes several save mechanisms:

- ✅ **Auto-saves** every change you make
- ✅ **Creates timestamped backups** automatically
- ✅ **Updates** `src/db.design.ts` in real-time
- ✅ **Generates** Prisma schema continuously

### Manual Save Options

Click the **"💾 Save Design"** button to:
- Force save all changes
- Download a backup file
- Confirm all changes are persisted

### Schema Validation

The designer provides real-time validation:
- **Syntax checking** for column names and types
- **Relationship validation** for foreign key consistency
- **Constraint verification** for unique and required fields
- **Type compatibility** checking between related columns

### Undo/Redo System

Navigate your design history:
- **Ctrl+Z** (Cmd+Z on Mac): Undo last change
- **Ctrl+Y** (Cmd+Y on Mac): Redo last undone change
- **History panel**: View and jump to any previous state

## Working with Complex Schemas

### Best Practices

1. **Start Simple**: Begin with core entities (User, Product, Order)
2. **Add Relationships Gradually**: Connect tables one relationship at a time
3. **Use Consistent Naming**: Follow conventions like `userId` for foreign keys
4. **Test Frequently**: Generate and test your schema regularly
5. **Document Relationships**: Use clear, descriptive relationship names

### Performance Considerations

- **Index Important Columns**: Mark frequently queried columns as indexed
- **Optimize Relationships**: Avoid unnecessary many-to-many relationships
- **Use Appropriate Types**: Choose the most efficient data type for each column
- **Consider Constraints**: Add appropriate unique and required constraints

### Schema Organization

For large schemas:
- **Group Related Tables**: Position related tables near each other on canvas
- **Use Color Coding**: Assign colors to different functional areas
- **Create Sections**: Organize tables by domain (Auth, Content, Commerce)
- **Document Decisions**: Add comments explaining complex relationships

## Integration with Development Workflow

### From Design to Code

1. **Design in UI**: Create your schema visually
2. **Auto-Generation**: `db.design.ts` updates automatically
3. **Generate Modules**: Run `npm run generate` to create CRUD modules
4. **Test API**: Your endpoints are immediately available

### Synchronization

The designer maintains perfect sync between:
- **Visual Interface** ↔ `src/db.design.ts`
- **Design File** ↔ Prisma Schema
- **Schema** ↔ Generated Modules

### Version Control

Best practices for team collaboration:
- **Commit `db.design.ts`**: Include in version control
- **Review Schema Changes**: Use pull requests for database modifications
- **Backup Before Major Changes**: Create manual backups for significant updates
- **Coordinate Team Changes**: Avoid simultaneous schema editing

## Troubleshooting

### Common Issues

#### Designer Won't Load
```bash
# Check if port 3001 is available
lsof -i :3001

# Kill conflicting process
kill -9 <PID>

# Restart designer
npm run db-designer
```

#### Changes Not Saving
1. Check file permissions on `src/db.design.ts`
2. Ensure the file isn't open in another editor
3. Restart the designer service
4. Check browser console for JavaScript errors

#### Relationship Creation Fails
- Verify both tables exist
- Check that column types match
- Ensure foreign key column is properly typed
- Confirm relationship direction is correct

#### Schema Generation Errors
- Validate all column names are valid identifiers
- Check for circular relationships
- Ensure all required fields have appropriate defaults
- Verify enum values are properly defined

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Review the terminal output for backend errors
3. Verify your `db.design.ts` file syntax
4. Consult the [troubleshooting guide](../troubleshooting/common-issues.md)

## Next Steps

After designing your database:

1. **[Generate Modules](../framework/code-generation.md)**: Create CRUD operations automatically
2. **[Configure Database](./configuration.md)**: Set up your preferred database provider
3. **[Manual Schema Editing](./manual-schema.md)**: Learn advanced schema customization
4. **[API Development](../tutorials/blog-api.md)**: Build your first API endpoints