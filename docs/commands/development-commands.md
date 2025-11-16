# Development Commands

Essential commands for daily development workflow with Mifty framework.

## Quick Start Commands

### Start Development Environment

```bash
npm run dev
```
Start API server with hot reload

```bash
npm run dev:full
```
Start complete development environment (API + DB Designer + Monitor + Prisma Studio)

### Individual Services

```bash
npm run dev:server
```
Start only the API server

```bash
npm run dev:db-designer
```
Start database designer UI on port 3001

```bash
npm run dev:monitor
```
Start error monitor with auto-fix

## Database Development

### Visual Database Design

```bash
npm run db-designer
```
Launch visual database designer at http://localhost:3001/ui

### Schema Management

```bash
npm run prisma:generate
```
Generate Prisma Client after schema changes

```bash
npm run prisma:migrate
```
Create and apply database migration

```bash
npm run prisma:studio
```
Open Prisma Studio for database browsing

```bash
npm run prisma:push
```
Push schema changes without migration (development only)

## Code Generation

### Module Generation

```bash
npm run generate
```
Generate all modules from database design

```bash
npm run generate:module
```
Generate specific module

## Testing During Development

### Continuous Testing

```bash
npm run test:watch
```
Run tests in watch mode - reruns on file changes

```bash
npm test
```
Run full test suite with coverage

## Code Quality

### Linting and Formatting

```bash
npm run lint
```
Check code quality with ESLint

```bash
npm run lint:fix
```
Auto-fix linting issues

```bash
npm run format
```
Format code with Prettier

## Error Monitoring and Debugging

### Error Monitoring

```bash
npm run monitor
```
Start error monitoring system

```bash
npm run monitor:autofix
```
Monitor with automatic error fixing

```bash
npm run watch:imports
```
Watch for import issues and report them

## Build Commands

### Development Build

```bash
npm run build
```
Build TypeScript to JavaScript

```bash
npm run build:watch
```
Build in watch mode - rebuilds on changes

## Development Workflows

### Standard Daily Workflow

1. **Start Development Environment**
   ```bash
   npm run dev:full
   ```
   This starts:
   - API server on http://localhost:3000
   - DB Designer on http://localhost:3001/ui
   - Error monitor
   - Prisma Studio on http://localhost:5555

2. **Design Database** (if needed)
   - Open http://localhost:3001/ui
   - Design your schema visually
   - Save changes

3. **Generate Code**
   ```bash
   npm run generate
   ```

4. **Develop with Testing**
   ```bash
   npm run test:watch
   ```

5. **Quality Check**
   ```bash
   npm run lint:fix
   npm run format
   ```

### Database-First Development

1. **Start Database Designer**
   ```bash
   npm run db-designer
   ```

2. **Design Schema**
   - Use visual designer at http://localhost:3001/ui
   - Or edit `src/db.design.ts` manually

3. **Generate Modules**
   ```bash
   npm run generate
   ```

4. **Apply Database Changes**
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

5. **Verify in Prisma Studio**
   ```bash
   npm run prisma:studio
   ```

### Test-Driven Development

1. **Start Test Watcher**
   ```bash
   npm run test:watch
   ```

2. **Write Tests First**
   - Create test files in `src/tests/`
   - Write failing tests

3. **Implement Code**
   - Write code to make tests pass
   - Tests automatically rerun

4. **Check Coverage**
   ```bash
   npm test
   ```

## Service URLs Reference

When running development commands, these services become available:

| Service | URL | Command | Description |
|---------|-----|---------|-------------|
| API Server | http://localhost:3000 | `npm run dev` | Main REST API |
| DB Designer | http://localhost:3001/ui | `npm run db-designer` | Visual database designer |
| Prisma Studio | http://localhost:5555 | `npm run prisma:studio` | Database browser |
| API Documentation | http://localhost:3000/api-docs | `npm run dev` | Swagger UI |

## Environment Configuration

### Development Environment Variables

Create a `.env` file in your project root:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/mifty_dev"

# Server
PORT=3000
NODE_ENV=development

# Database Designer
DB_DESIGNER_PORT=3001

# JWT
JWT_SECRET=your-jwt-secret-here

# Optional: External Services
# EMAIL_PROVIDER=gmail
# GMAIL_USER=your-email@gmail.com
# GMAIL_APP_PASSWORD=your-app-password
```

### Check Current Configuration

```bash
npm run services:config
```
View current services configuration

## Troubleshooting Development Issues

### Common Problems and Solutions

#### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:
1. Kill process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   ```

2. Change port in `.env`:
   ```bash
   PORT=3001
   ```

#### Database Connection Issues

**Problem**: Cannot connect to database

**Solutions**:
1. Check database URL:
   ```bash
npm run services:config
```
Verify database configuration

2. Reset database:
   ```bash
npm run prisma:reset
```
⚠️ Reset database (deletes all data)

3. Generate Prisma Client:
   ```bash
npm run prisma:generate
```
Regenerate Prisma Client

#### Hot Reload Not Working

**Problem**: Changes not reflected in browser

**Solutions**:
1. Restart development server:
   ```bash
npm run dev:server
```
Restart API server only

2. Clear cache and restart:
   ```bash
   # Clear npm cache
   npm cache clean --force
   npm run dev
   ```

#### Import Errors

**Problem**: Module import errors

**Solutions**:
1. Watch for import issues:
   ```bash
npm run watch:imports
```
Monitor and report import problems

2. Auto-fix imports:
   ```bash
npm run watch:imports:autofix
```
Automatically fix import issues

#### Test Failures After Database Changes

**Problem**: Tests fail after schema changes

**Solutions**:
1. Regenerate Prisma Client:
   ```bash
npm run prisma:generate
```
Update Prisma Client with new schema

2. Update test database:
   ```bash
npm run prisma:migrate
```
Apply migrations to test database

## Performance Tips

### Faster Development Startup

1. **Use Specific Services**: Instead of `npm run dev:full`, use only what you need:
   - `npm run dev:server` - API only
   - `npm run dev:db-designer` - Database designer only

2. **Skip Unnecessary Services**: Comment out unused services in development

### Efficient Testing

1. **Use Watch Mode**: `npm run test:watch` for continuous testing
2. **Test Specific Files**: `npm test -- --testPathPattern=user` for specific tests
3. **Skip Coverage**: `npm test -- --coverage=false` for faster runs

### Database Performance

1. **Use Push for Quick Changes**: `npm run prisma:push` instead of migrations during development
2. **Reset When Needed**: `npm run prisma:reset` to start fresh
3. **Use Studio for Data**: `npm run prisma:studio` instead of writing queries

## Development Best Practices

### Code Quality Workflow

1. **Before Committing**:
   ```bash
   npm run lint:fix
   npm run format
   npm test
   ```

2. **During Development**:
   ```bash
   npm run test:watch  # Keep running
   npm run monitor     # Keep running for error detection
   ```

3. **After Database Changes**:
   ```bash
   npm run generate
   npm run prisma:migrate
   npm run prisma:generate
   ```

### Efficient Development Cycle

1. **Start with Full Environment**:
   ```bash
   npm run dev:full
   ```

2. **Make Changes**:
   - Edit code
   - Design database (if needed)
   - Write tests

3. **Generate and Test**:
   ```bash
   npm run generate
   npm test
   ```

4. **Quality Check**:
   ```bash
   npm run lint:fix
   ```

5. **Commit**:
   ```bash
   git add .
   git commit -m "Your changes"
   ```