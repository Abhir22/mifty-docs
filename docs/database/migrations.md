# Migrations and Schema Management

Managing database migrations and schema changes in Mifty Framework.

## Overview

Mifty provides a robust migration system that works seamlessly with the visual database designer. Migrations allow you to version control your database schema changes and apply them consistently across different environments.

## Creating Migrations

### Using the CLI

Generate a new migration file:

```bash
# Create a new migration
mifty migration:create add_user_table

# Create migration with specific type
mifty migration:create add_email_to_users --type=alter
```

### Using the Visual Designer

When you make changes in the visual database designer, Mifty automatically generates migration files:

1. Open the visual designer at `http://localhost:3001/ui`
2. Make your schema changes (add tables, columns, relationships)
3. Click "Generate Migration" 
4. Review the generated SQL and TypeScript code
5. Apply the migration

## Migration Structure

Migration files are stored in `src/database/migrations/` and follow this structure:

```typescript
import { Migration } from '@mifty/core';

export class AddUserTable1234567890 implements Migration {
  name = 'AddUserTable1234567890';

  async up(): Promise<void> {
    // Forward migration logic
    await this.query(`
      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      )
    `);
  }

  async down(): Promise<void> {
    // Rollback migration logic
    await this.query(`DROP TABLE "users"`);
  }
}
```

## Running Migrations

### Development Environment

```bash
# Run all pending migrations
mifty migration:run

# Run migrations up to a specific version
mifty migration:run --to=1234567890

# Check migration status
mifty migration:status
```

### Production Environment

```bash
# Run migrations in production mode
NODE_ENV=production mifty migration:run

# Dry run to see what would be executed
mifty migration:run --dry-run
```

## Rolling Back Migrations

```bash
# Rollback the last migration
mifty migration:rollback

# Rollback to a specific migration
mifty migration:rollback --to=1234567890

# Rollback multiple migrations
mifty migration:rollback --steps=3
```

## Schema Synchronization

Mifty can automatically synchronize your database schema with your entity definitions:

```bash
# Sync schema (development only)
mifty schema:sync

# Generate migration from current schema differences
mifty schema:diff

# Drop and recreate schema (development only)
mifty schema:drop
```

## Best Practices

### Migration Naming

Use descriptive names that indicate the change:

```bash
mifty migration:create add_user_authentication_table
mifty migration:create add_email_index_to_users
mifty migration:create remove_deprecated_status_column
```

### Safe Migration Patterns

**Adding Columns:**
```typescript
// ✅ Safe - adding nullable column
await this.query(`
  ALTER TABLE "users" 
  ADD COLUMN "phone" VARCHAR(20)
`);

// ✅ Safe - adding column with default
await this.query(`
  ALTER TABLE "users" 
  ADD COLUMN "status" VARCHAR(20) DEFAULT 'active'
`);
```

**Removing Columns:**
```typescript
// ⚠️ Use caution - ensure no code references this column
await this.query(`
  ALTER TABLE "users" 
  DROP COLUMN "deprecated_field"
`);
```

**Renaming Columns:**
```typescript
// ⚠️ Coordinate with code changes
await this.query(`
  ALTER TABLE "users" 
  RENAME COLUMN "old_name" TO "new_name"
`);
```

### Data Migrations

For complex data transformations:

```typescript
export class MigrateUserData1234567890 implements Migration {
  name = 'MigrateUserData1234567890';

  async up(): Promise<void> {
    // Add new column
    await this.query(`
      ALTER TABLE "users" 
      ADD COLUMN "full_name" VARCHAR(255)
    `);

    // Migrate existing data
    await this.query(`
      UPDATE "users" 
      SET "full_name" = CONCAT("first_name", ' ', "last_name")
      WHERE "full_name" IS NULL
    `);

    // Remove old columns (in separate migration)
  }

  async down(): Promise<void> {
    await this.query(`
      ALTER TABLE "users" 
      DROP COLUMN "full_name"
    `);
  }
}
```

## Environment-Specific Migrations

### Configuration

Configure different migration settings per environment in `config/database.ts`:

```typescript
export const databaseConfig = {
  development: {
    migrations: {
      directory: 'src/database/migrations',
      autoRun: true
    }
  },
  production: {
    migrations: {
      directory: 'dist/database/migrations',
      autoRun: false // Manual migration in production
    }
  }
};
```

### Conditional Migrations

```typescript
export class ConditionalMigration1234567890 implements Migration {
  name = 'ConditionalMigration1234567890';

  async up(): Promise<void> {
    const env = process.env.NODE_ENV;
    
    if (env === 'development') {
      // Development-only changes
      await this.seedTestData();
    }
    
    // Common changes for all environments
    await this.createTable();
  }
}
```

## Troubleshooting

### Common Issues

**Migration fails with "relation already exists":**
```bash
# Check current schema state
mifty migration:status

# Reset migration state (development only)
mifty migration:reset
```

**Migration stuck in pending state:**
```bash
# Mark migration as completed manually
mifty migration:resolve --name=MigrationName --as=up
```

**Schema drift detected:**
```bash
# Generate migration to fix drift
mifty schema:diff --output=fix_schema_drift
```

### Debugging Migrations

Enable detailed logging:

```bash
# Run with debug output
DEBUG=mifty:migration mifty migration:run

# Verbose SQL logging
MIFTY_LOG_SQL=true mifty migration:run
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Database Migration
on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm ci
      - run: npm run build
      
      # Run migrations
      - run: mifty migration:run
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

This comprehensive migration system ensures your database schema changes are versioned, reviewable, and safely deployable across all environments.