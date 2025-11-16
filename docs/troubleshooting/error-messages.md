# Error Messages Reference

Complete guide to understanding and resolving Mifty error messages.

## Installation Errors

### EACCES Permission Denied

**Error Message:**
```
npm ERR! code EACCES
npm ERR! syscall access
npm ERR! path /usr/local/lib/node_modules/@mifty/cli
npm ERR! errno -13
npm ERR! Error: EACCES: permission denied
```

**Cause:** Insufficient permissions to install global npm packages.

**Solutions:**

1. **Fix npm permissions (Recommended):**
   ```bash
   sudo chown -R $(whoami) ~/.npm
   sudo chown -R $(whoami) /usr/local/lib/node_modules
   ```

2. **Use npx instead:**
   ```bash
   npx @mifty/cli init my-project
   ```

3. **Use Node Version Manager:**
   ```bash
   # Install nvm
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install node
   npm install -g @mifty/cli
   ```

### EADDRINUSE Port Already in Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::3000
    at Server.setupListenHandle [as _listen2] (net.js:1318:16)
```

**Cause:** Another process is using the specified port.

**Solutions:**

1. **Find and kill the process:**
   ```bash
   # Find process using port 3000
   lsof -ti:3000 | xargs kill -9  # macOS/Linux
   netstat -ano | findstr :3000  # Windows
   ```

2. **Use a different port:**
   ```bash
   PORT=3001 npm run dev
   ```

3. **Update .env file:**
   ```env
   PORT=3001
   DB_DESIGNER_PORT=3002
   ```

## Database Errors

### Prisma Client Not Generated

**Error Message:**
```
PrismaClientInitializationError: Prisma Client could not locate the Query Engine for runtime "darwin".
```

**Cause:** Prisma client hasn't been generated after schema changes.

**Solution:**
```bash
npm run prisma:generate
```

### Database Connection Failed

**Error Message:**
```
PrismaClientInitializationError: Can't reach database server at `localhost:5432`
```

**Cause:** Database server is not running or connection string is incorrect.

**Solutions:**

1. **Check database service:**
   ```bash
   # PostgreSQL
   brew services start postgresql  # macOS
   sudo systemctl start postgresql  # Linux
   
   # MySQL
   brew services start mysql  # macOS
   sudo systemctl start mysql  # Linux
   ```

2. **Verify connection string:**
   ```env
   # PostgreSQL
   DATABASE_URL="postgresql://username:password@localhost:5432/database"
   
   # MySQL
   DATABASE_URL="mysql://username:password@localhost:3306/database"
   
   # PostgreSQL (default)
   DATABASE_URL="postgresql://postgres:password@localhost:5432/mifty_dev"
   ```

### Migration Failed

**Error Message:**
```
Error: P3009: migrate found failed migration file: 20231201000000_init/migration.sql
```

**Cause:** Previous migration failed and left the database in an inconsistent state.

**Solutions:**

1. **Reset migrations (Development only):**
   ```bash
   npm run prisma:migrate:reset
   ```

2. **Mark migration as applied:**
   ```bash
   npm run prisma:migrate:resolve --applied 20231201000000_init
   ```

3. **Fix and retry migration:**
   ```bash
   # Edit the migration file to fix SQL errors
   npm run prisma:migrate:dev
   ```

### Foreign Key Constraint Failed

**Error Message:**
```
PrismaClientKnownRequestError: Foreign key constraint failed on the field: `authorId`
```

**Cause:** Trying to create a record with a foreign key that doesn't exist.

**Solutions:**

1. **Check referenced record exists:**
   ```typescript
   // ❌ Wrong - user might not exist
   const post = await prisma.post.create({
     data: {
       title: "My Post",
       authorId: "non-existent-id"
     }
   });
   
   // ✅ Correct - verify user exists first
   const user = await prisma.user.findUnique({ where: { id: userId } });
   if (!user) throw new Error('User not found');
   
   const post = await prisma.post.create({
     data: {
       title: "My Post",
       authorId: userId
     }
   });
   ```

2. **Use nested create:**
   ```typescript
   const post = await prisma.post.create({
     data: {
       title: "My Post",
       author: {
         connect: { id: userId }  // Will fail gracefully if user doesn't exist
       }
     }
   });
   ```

## TypeScript Compilation Errors

### Cannot Find Module

**Error Message:**
```
TS2307: Cannot find module '@modules/user/user.service' or its corresponding type declarations.
```

**Cause:** TypeScript cannot resolve the module path.

**Solutions:**

1. **Check tsconfig.json paths:**
   ```json
   {
     "compilerOptions": {
       "baseUrl": "./src",
       "paths": {
         "@modules/*": ["modules/*"],
         "@services/*": ["services/*"],
         "@/*": ["*"]
       }
     }
   }
   ```

2. **Use relative imports:**
   ```typescript
   // ❌ Absolute import might fail
   import { UserService } from '@modules/user/user.service';
   
   // ✅ Relative import is reliable
   import { UserService } from '../user/user.service';
   ```

3. **Restart TypeScript server:**
   - VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### Circular Dependency Detected

**Error Message:**
```
TS6133: 'UserService' is declared but its value is never read.
Warning: Circular dependency detected:
src/modules/user/user.service.ts -> src/modules/post/post.service.ts -> src/modules/user/user.service.ts
```

**Cause:** Two or more modules import each other, creating a circular dependency.

**Solutions:**

1. **Use dependency injection:**
   ```typescript
   // ❌ Direct import creates circular dependency
   import { PostService } from '../post/post.service';
   
   @Injectable()
   export class UserService {
     constructor(private postService: PostService) {}
   }
   
   // ✅ Use forwardRef to break the cycle
   import { forwardRef, Inject } from '@nestjs/common';
   
   @Injectable()
   export class UserService {
     constructor(
       @Inject(forwardRef(() => PostService))
       private postService: PostService
     ) {}
   }
   ```

2. **Extract shared interfaces:**
   ```typescript
   // Create shared/interfaces.ts
   export interface IUser {
     id: string;
     email: string;
   }
   
   // Both services import from interfaces instead of each other
   ```

### Type Errors in Generated Code

**Error Message:**
```
TS2322: Type 'string | null' is not assignable to type 'string'.
```

**Cause:** Generated code doesn't match the database schema or Prisma types.

**Solutions:**

1. **Regenerate Prisma client:**
   ```bash
   npm run prisma:generate
   ```

2. **Update db.design.ts:**
   ```typescript
   // ❌ Nullable field without proper typing
   {
     name: "email",
     type: "String",
     isRequired: false  // This makes it nullable
   }
   
   // ✅ Handle nullable types properly
   {
     name: "email", 
     type: "String",
     isRequired: true  // Or handle null in code
   }
   ```

3. **Regenerate modules:**
   ```bash
   npm run generate
   ```

## Runtime Errors

### Module Generation Failed

**Error Message:**
```
Error: Failed to generate module 'User': Invalid table definition
    at ModuleGenerator.generate (/path/to/generator.js:45:13)
```

**Cause:** Invalid table definition in db.design.ts.

**Solutions:**

1. **Validate db.design.ts syntax:**
   ```bash
   npx tsc --noEmit src/db.design.ts
   ```

2. **Check for common issues:**
   ```typescript
   // ❌ Missing required fields
   {
     name: "User",
     columns: [
       // Missing id field
       {
         name: "email",
         type: "String"
       }
     ]
   }
   
   // ✅ Complete table definition
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
       }
     ]
   }
   ```

### Import Resolution Failed

**Error Message:**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot resolve module './non-existent-file'
```

**Cause:** Generated code references files that don't exist.

**Solutions:**

1. **Clean and regenerate:**
   ```bash
   # Remove generated files
   rm -rf src/modules/
   
   # Regenerate
   npm run generate
   ```

2. **Check file naming:**
   - Ensure table names use PascalCase
   - Avoid TypeScript reserved words
   - Use valid identifier names

### Validation Errors

**Error Message:**
```
ValidationError: "email" is required
    at Object.validate (/path/to/validation.js:12:11)
```

**Cause:** Request data doesn't match validation schema.

**Solutions:**

1. **Check request body:**
   ```typescript
   // ❌ Missing required field
   const response = await fetch('/api/users', {
     method: 'POST',
     body: JSON.stringify({
       name: "John Doe"
       // Missing email field
     })
   });
   
   // ✅ Include all required fields
   const response = await fetch('/api/users', {
     method: 'POST',
     body: JSON.stringify({
       name: "John Doe",
       email: "john@example.com"
     })
   });
   ```

2. **Update validation schema:**
   ```typescript
   // If email should be optional, update the schema
   const createUserSchema = z.object({
     name: z.string(),
     email: z.string().email().optional()
   });
   ```

## Development Server Errors

### Hot Reload Failed

**Error Message:**
```
[nodemon] app crashed - waiting for file changes before starting...
```

**Cause:** TypeScript compilation error or runtime exception.

**Solutions:**

1. **Check TypeScript errors:**
   ```bash
   npx tsc --noEmit
   ```

2. **Check for syntax errors:**
   ```bash
   npm run lint
   ```

3. **Restart development server:**
   ```bash
   # Stop server (Ctrl+C) and restart
   npm run dev
   ```

### Memory Limit Exceeded

**Error Message:**
```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```

**Cause:** Node.js ran out of memory during development.

**Solutions:**

1. **Increase memory limit:**
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run dev
   ```

2. **Add to package.json:**
   ```json
   {
     "scripts": {
       "dev": "NODE_OPTIONS='--max-old-space-size=4096' ts-node-dev src/main.ts"
     }
   }
   ```

3. **Check for memory leaks:**
   - Look for infinite loops
   - Check for large object accumulation
   - Monitor memory usage

## Testing Errors

### Test Database Connection Failed

**Error Message:**
```
PrismaClientInitializationError: Can't reach database server during testing
```

**Cause:** Test database not configured or not running.

**Solutions:**

1. **Set up test database:**
   ```env
   # .env.test
   DATABASE_URL="postgresql://postgres:password@localhost:5432/mifty_test"
   NODE_ENV=test
   ```

2. **Initialize test database:**
   ```bash
   NODE_ENV=test npm run prisma:migrate:dev
   NODE_ENV=test npm run prisma:generate
   ```

3. **Use in-memory database for tests:**
   ```env
   DATABASE_URL="file::memory:?cache=shared"
   ```

### Test Timeout

**Error Message:**
```
Timeout - Async callback was not invoked within the 5000ms timeout specified by jest.setTimeout
```

**Cause:** Test takes longer than the default timeout.

**Solutions:**

1. **Increase timeout for specific test:**
   ```typescript
   it('should handle long operation', async () => {
     // Increase timeout to 10 seconds
     jest.setTimeout(10000);
     
     const result = await longRunningOperation();
     expect(result).toBeDefined();
   });
   ```

2. **Set global timeout:**
   ```javascript
   // jest.config.js
   module.exports = {
     testTimeout: 10000  // 10 seconds
   };
   ```

## API Errors

### Route Not Found

**Error Message:**
```
Cannot GET /api/v1/nonexistent
```

**Cause:** Requested route doesn't exist or module not properly registered.

**Solutions:**

1. **Check route registration:**
   ```typescript
   // app.module.ts
   @Module({
     imports: [
       UserModule,  // Ensure module is imported
       PostModule
     ]
   })
   export class AppModule {}
   ```

2. **Verify controller routes:**
   ```typescript
   @Controller('api/v1/users')
   export class UserController {
     @Get()
     findAll() {
       // This creates GET /api/v1/users
     }
   }
   ```

### Validation Failed

**Error Message:**
```
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

**Cause:** Request data doesn't pass validation.

**Solutions:**

1. **Check request format:**
   ```typescript
   // ❌ Invalid email format
   {
     "email": "invalid-email",
     "name": "John Doe"
   }
   
   // ✅ Valid email format
   {
     "email": "john@example.com",
     "name": "John Doe"
   }
   ```

2. **Update validation rules:**
   ```typescript
   export class CreateUserDto {
     @IsEmail()
     @IsOptional()  // Make email optional if needed
     email?: string;
     
     @IsString()
     @IsNotEmpty()
     name: string;
   }
   ```

## Deployment Errors

### Build Failed

**Error Message:**
```
npm ERR! code ELIFECYCLE
npm ERR! errno 2
npm ERR! build script failed
```

**Cause:** TypeScript compilation errors or missing dependencies.

**Solutions:**

1. **Check TypeScript errors:**
   ```bash
   npx tsc --noEmit
   ```

2. **Install dependencies:**
   ```bash
   npm ci  # Clean install
   ```

3. **Check for missing environment variables:**
   ```env
   NODE_ENV=production
   DATABASE_URL=your-production-url
   ```

### Production Runtime Error

**Error Message:**
```
Error: Cannot find module './dist/main.js'
```

**Cause:** Build output not found or incorrect start script.

**Solutions:**

1. **Ensure build completed:**
   ```bash
   npm run build
   ls -la dist/  # Check if files exist
   ```

2. **Check start script:**
   ```json
   {
     "scripts": {
       "start": "node dist/main.js"
     }
   }
   ```

## Getting Additional Help

### Enable Verbose Logging

```bash
# Enable all debug output
DEBUG=* npm run dev

# Enable specific categories
DEBUG=mifty:* npm run dev
DEBUG=prisma:* npm run dev
```

### Generate Error Report

```bash
# Collect system information
node --version
npm --version
mifty --version

# Check configuration
npm run config:validate

# Generate debug bundle
npm run debug:bundle
```

### Common Error Patterns

| Error Pattern | Likely Cause | Quick Fix |
|---------------|--------------|-----------|
| `EACCES` | Permission issues | `sudo chown -R $(whoami) ~/.npm` |
| `EADDRINUSE` | Port conflict | Change port or kill process |
| `Cannot find module` | Import path issues | Use relative imports |
| `Prisma*Error` | Database issues | Regenerate client |
| `Validation*Error` | Invalid request data | Check request format |
| `Timeout` | Slow operations | Increase timeout |

> **💡 Pro Tip:** Most errors can be resolved by ensuring you have the latest version of Mifty, clearing caches, and regenerating the Prisma client. When in doubt, try the "clean slate" approach: clear caches, reinstall dependencies, and regenerate all code.