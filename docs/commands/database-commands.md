# Database & Prisma Commands

Complete guide to database management and Prisma commands in Mifty framework.


import CodeTabs from '@site/src/components/CodeTabs';

## Prisma Commands

### Schema Management

#### Generate Prisma Client

<CommandBlock 
  command="npm run prisma:generate"
  description="Generate Prisma Client from schema.prisma file"
/>

This command should be run after:
- Changing the database schema
- Installing the project for the first time
- Switching between database providers

#### Database Migrations

<CommandBlock 
  command="npm run prisma:migrate"
  description="Create and apply a new database migration"
/>

<CommandBlock 
  command="npm run prisma:migrate:status"
  description="Check the status of database migrations"
/>

<CommandBlock 
  command="npm run prisma:migrate:deploy"
  description="Apply pending migrations in production"
/>

<CommandBlock 
  command="npm run prisma:reset"
  description="⚠️ Reset database and apply all migrations (DELETES ALL DATA)"
/>

#### Schema Push (Development Only)

<CommandBlock 
  command="npm run prisma:push"
  description="Push schema changes directly to database without creating migration"
/>

:::warning
Use `prisma:push` only in development. For production, always use migrations.
:::

### Database Tools

#### Prisma Studio

<CommandBlock 
  command="npm run prisma:studio"
  description="Open Prisma Studio database browser at http://localhost:5555"
/>

Prisma Studio provides:
- Visual database browser
- Data editing capabilities
- Relationship visualization
- Query execution interface

#### Database Seeding

<CommandBlock 
  command="npm run prisma:seed"
  description="Run database seeding script to populate initial data"
/>

## Database Designer Commands

### Visual Database Designer

<CommandBlock 
  command="npm run db-designer"
  description="Start visual database designer UI at http://localhost:3001/ui"
/>

<CommandBlock 
  command="npm run db-designer:build"
  description="Build project and start database designer"
/>

The database designer provides:
- Visual schema design
- Drag-and-drop table creation
- Relationship management
- Real-time schema preview
- Export to Prisma schema

## Database Configuration

### Supported Database Providers

Mifty supports multiple database providers. PostgreSQL is the default. Configure your database by setting the `DATABASE_URL` in your `.env` file:

**PostgreSQL (Default):**
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/mifty_dev"
```

**MySQL:**
```bash
DATABASE_URL="mysql://username:password@localhost:3306/mydb"
```

**SQLite (Alternative):**
```bash
DATABASE_URL="file:./dev.db"
```

**SQL Server:**
```bash
DATABASE_URL="sqlserver://localhost:1433;database=mydb;user=username;password=password"
```

**MongoDB:**
```bash
DATABASE_URL="mongodb://username:password@localhost:27017/mydb"
```

### Database Provider Setup

#### PostgreSQL (Default)

PostgreSQL is the default database. Set it up quickly with Docker:

```bash
# Start PostgreSQL with Docker
docker run --name mifty-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=mifty_dev -p 5432:5432 -d postgres:15

# Configure environment
echo 'DATABASE_URL="postgresql://postgres:password@localhost:5432/mifty_dev"' > .env
```

#### PostgreSQL

1. **Install PostgreSQL** (if not already installed)
2. **Create Database**:
   ```sql
   CREATE DATABASE myapp;
   CREATE USER myuser WITH PASSWORD 'mypassword';
   GRANT ALL PRIVILEGES ON DATABASE myapp TO myuser;
   ```
3. **Configure Environment**:
   ```bash
   echo 'DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/myapp"' > .env
   ```

#### MySQL

1. **Install MySQL** (if not already installed)
2. **Create Database**:
   ```sql
   CREATE DATABASE myapp;
   CREATE USER 'myuser'@'localhost' IDENTIFIED BY 'mypassword';
   GRANT ALL PRIVILEGES ON myapp.* TO 'myuser'@'localhost';
   FLUSH PRIVILEGES;
   ```
3. **Configure Environment**:
   ```bash
   echo 'DATABASE_URL="mysql://myuser:mypassword@localhost:3306/myapp"' > .env
   ```

## Migration Workflows

### Development Migration Workflow

```mermaid
graph TD
    A[Schema Changes] --> B{Change Type}
    B -->|Visual| C[Use DB Designer]
    B -->|Manual| D[Edit db.design.ts]
    C --> E[Generate Modules]
    D --> E
    E --> F[npm run generate]
    F --> G[npm run prisma:migrate]
    G --> H[npm run prisma:generate]
    H --> I[Test Changes]
```

#### Step-by-Step Development Migration

1. **Make Schema Changes**
   - Use visual designer: `npm run db-designer`
   - Or edit `src/db.design.ts` manually

2. **Generate Modules**
   <CommandBlock 
     command="npm run generate"
     description="Generate TypeScript modules from schema"
   />

3. **Create Migration**
   <CommandBlock 
     command="npm run prisma:migrate"
     description="Create and apply migration"
   />
   
   You'll be prompted to name your migration (e.g., "add_user_table")

4. **Generate Prisma Client**
   <CommandBlock 
     command="npm run prisma:generate"
     description="Update Prisma Client with new schema"
   />

5. **Verify Changes**
   <CommandBlock 
     command="npm run prisma:studio"
     description="Open Prisma Studio to verify schema"
   />

### Production Migration Workflow

```mermaid
graph TD
    A[Development Complete] --> B[npm run prisma:migrate:status]
    B --> C{Migrations Pending?}
    C -->|Yes| D[npm run prisma:migrate:deploy]
    C -->|No| E[No Action Needed]
    D --> F[Verify Deployment]
    F --> G[npm run prisma:generate]
```

#### Production Migration Steps

1. **Check Migration Status**
   <CommandBlock 
     command="npm run prisma:migrate:status"
     description="Check which migrations need to be applied"
   />

2. **Deploy Migrations**
   <CommandBlock 
     command="npm run prisma:migrate:deploy"
     description="Apply all pending migrations"
   />

3. **Generate Client**
   <CommandBlock 
     command="npm run prisma:generate"
     description="Generate Prisma Client in production"
   />

## Database Troubleshooting

### Common Issues and Solutions

#### Migration Conflicts

**Problem**: Migration conflicts when working in a team

**Solution**:
<CommandBlock 
  command="npm run prisma:migrate:status"
  description="Check migration status and resolve conflicts"
/>

If conflicts exist:
1. Pull latest changes from repository
2. Reset your database: `npm run prisma:reset`
3. Apply all migrations: `npm run prisma:migrate`

#### Prisma Client Out of Sync

**Problem**: Prisma Client doesn't match database schema

**Solution**:
<CommandBlock 
  command="npm run prisma:generate"
  description="Regenerate Prisma Client"
/>

#### Database Connection Issues

**Problem**: Cannot connect to database

**Solutions**:

1. **Check Database URL**:
   <CommandBlock 
     command="npm run services:config"
     description="View current database configuration"
   />

2. **Test Connection**:
   <CommandBlock 
     command="npm run prisma:studio"
     description="Try to open Prisma Studio to test connection"
   />

3. **Reset Database** (development only):
   <CommandBlock 
     command="npm run prisma:reset"
     description="Reset database and start fresh"
   />

#### Schema Drift

**Problem**: Database schema doesn't match Prisma schema

**Solution**:
<CommandBlock 
  command="npm run prisma:push"
  description="Push schema changes to sync database (development only)"
/>

For production, create proper migrations:
<CommandBlock 
  command="npm run prisma:migrate"
  description="Create migration to fix schema drift"
/>

### Database Provider Specific Issues

#### PostgreSQL Issues

**Problem**: Connection refused
- Ensure PostgreSQL service is running
- Check connection parameters in DATABASE_URL
- Verify user permissions

**Problem**: Database does not exist
```sql
-- Connect to PostgreSQL and create database
CREATE DATABASE mifty_dev;
```

**Problem**: Authentication failed
- Check username and password in DATABASE_URL
- Verify user has proper permissions
- Ensure PostgreSQL is accepting connections

#### SQLite Issues (Alternative Database)

**Problem**: Database file locked
- Close all connections to the database
- Restart the development server
- Check if another process is using the file

**Problem**: Database file not found
```bash
npm run prisma:migrate
```

#### MySQL Issues

**Problem**: Access denied
- Check username and password in DATABASE_URL
- Verify user has proper permissions
- Ensure MySQL service is running

**Problem**: Unknown database
```sql
-- Connect to MySQL and create database
CREATE DATABASE your_database_name;
```

## Advanced Database Commands

### Custom Prisma Commands

You can run custom Prisma commands using npx:

<CommandBlock 
  command="npx prisma db pull"
  description="Pull schema from existing database"
/>

<CommandBlock 
  command="npx prisma db seed"
  description="Run custom seed script"
/>

<CommandBlock 
  command="npx prisma format"
  description="Format Prisma schema file"
/>

### Database Inspection

<CommandBlock 
  command="npx prisma db execute --file ./script.sql"
  description="Execute custom SQL script"
/>

<CommandBlock 
  command="npx prisma validate"
  description="Validate Prisma schema"
/>

## Database Performance Optimization

### Query Optimization

1. **Use Prisma Studio** to analyze queries:
   <CommandBlock 
     command="npm run prisma:studio"
     description="Open Prisma Studio for query analysis"
   />

2. **Enable Query Logging** in development:
   ```typescript
   // In your Prisma client configuration
   const prisma = new PrismaClient({
     log: ['query', 'info', 'warn', 'error'],
   });
   ```

### Index Management

Add indexes in your Prisma schema:

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String
  
  @@index([email])
  @@index([name, email])
}
```

After adding indexes:
<CommandBlock 
  command="npm run prisma:migrate"
  description="Create migration with new indexes"
/>

## Database Backup and Restore

### PostgreSQL Backup

```bash
# Create PostgreSQL backup
pg_dump -h localhost -U postgres -d mifty_dev > backup/mifty-backup-$(date +%Y%m%d).sql
```

### MySQL Backup

```bash
# Create MySQL backup
mysqldump -u username -p database_name > backup.sql
```

### SQLite Backup (Alternative)

```bash
# Create SQLite backup (if using SQLite)
cp ./prisma/dev.db ./backup/dev-backup-$(date +%Y%m%d).db
```

## Database Testing

### Test Database Setup

1. **Create Test Database Configuration**:
   ```bash
   # .env.test
   DATABASE_URL="postgresql://postgres:password@localhost:5432/mifty_test"
   ```

2. **Run Tests with Test Database**:
   <CommandBlock 
     command="NODE_ENV=test npm test"
     description="Run tests with test database"
   />

3. **Reset Test Database**:
   <CommandBlock 
     command="NODE_ENV=test npm run prisma:reset"
     description="Reset test database"
   />

## Database Monitoring

### Query Performance

Enable query logging in development:

```typescript
// src/config/database.ts
export const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
    { level: 'error', emit: 'stdout' },
  ],
});

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});
```

### Connection Monitoring

Monitor database connections:

<CommandBlock 
  command="npm run monitor"
  description="Start error monitor to track database issues"
/>

## Best Practices

### Development Best Practices

1. **Always Generate Client After Schema Changes**:
   ```bash
   npm run generate
   npm run prisma:generate
   ```

2. **Use Migrations in Team Development**:
   - Never use `prisma:push` in shared environments
   - Always create migrations for schema changes
   - Commit migration files to version control

3. **Regular Database Backups**:
   - Backup before major migrations
   - Test restore procedures
   - Keep multiple backup versions

### Production Best Practices

1. **Migration Strategy**:
   - Test migrations in staging first
   - Use `prisma:migrate:deploy` for production
   - Monitor migration performance

2. **Connection Management**:
   - Use connection pooling
   - Monitor connection limits
   - Implement proper error handling

3. **Security**:
   - Use environment variables for credentials
   - Implement proper access controls
   - Regular security updates

### Schema Design Best Practices

1. **Naming Conventions**:
   - Use consistent naming (camelCase or snake_case)
   - Descriptive field names
   - Clear relationship names

2. **Performance Considerations**:
   - Add appropriate indexes
   - Consider query patterns
   - Optimize for common operations

3. **Data Integrity**:
   - Use proper constraints
   - Implement validation
   - Consider cascade behaviors