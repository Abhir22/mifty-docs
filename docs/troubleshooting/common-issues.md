# Common Issues

Solutions to common problems when using Mifty Framework.

## Installation Issues

### npm Installation Problems

**Problem:** Installation fails with permission errors or network issues.

**Solutions:**

```bash
# Clear npm cache and reinstall
npm cache clean --force
npm uninstall -g @mifty/cli
npm install -g @mifty/cli
```

**Alternative installation methods:**

```bash
# Using npx (no global install needed)
npx @mifty/cli init my-project

# Using yarn
yarn global add @mifty/cli

# Local installation
npm install @mifty/cli
npx mifty init my-project
```

### Permission Errors (macOS/Linux)

**Problem:** `EACCES` permission errors during global installation.

**Solution:**

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Or use a Node version manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
```

### Windows Installation Issues

**Problem:** Installation fails on Windows with path or permission errors.

**Solutions:**

1. **Run as Administrator:**
   - Open Command Prompt or PowerShell as Administrator
   - Run the installation command

2. **Use Windows Subsystem for Linux (WSL):**
   ```bash
   # Install WSL and use Linux commands
   wsl --install
   # Then use Linux installation method
   ```

## Port Conflicts

### Port Already in Use

**Problem:** `EADDRINUSE` error when starting development server.

**Diagnosis:**

```bash
# Check what's using the port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

**Solutions:**

1. **Change port in environment:**
   ```bash
   PORT=3001 npm run dev
   ```

2. **Update .env file:**
   ```env
   PORT=3001
   DB_DESIGNER_PORT=3002
   PRISMA_STUDIO_PORT=5556
   ```

3. **Use different ports for services:**
   ```bash
   npm run dev:server  # API only on port 3000
   npm run db-designer  # Designer only on port 3001
   ```

## Database Connection Issues

### PostgreSQL Database Problems

**Problem:** Connection refused or authentication failed.

**Solutions:**

1. **Check DATABASE_URL in .env:**
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/mifty_dev"
   ```

2. **Generate Prisma client:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

3. **Reset database if corrupted:**
   ```bash
   npm run prisma:reset
   ```

### PostgreSQL Connection Issues

**Problem:** Connection refused or authentication failed.

**Diagnosis:**

```bash
# Test connection
psql -h localhost -U username -d database_name

# Check if PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql  # Linux
```

**Solutions:**

1. **Check connection string format:**
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   ```

2. **Common connection string variations:**
   ```env
   # With SSL
   DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
   
   # With connection pooling
   DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=5"
   
   # Cloud providers
   DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require&connect_timeout=10"
   ```

### MySQL Connection Issues

**Problem:** Access denied or connection timeout.

**Solutions:**

1. **Check MySQL service:**
   ```bash
   # Start MySQL
   brew services start mysql  # macOS
   sudo systemctl start mysql  # Linux
   net start mysql  # Windows
   ```

2. **Verify connection string:**
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/database_name"
   ```

3. **Create database if it doesn't exist:**
   ```bash
   mysql -u root -p -e "CREATE DATABASE my_database;"
   ```

## Module Generation Issues

### Generation Fails

**Problem:** `npm run generate` fails with errors.

**Diagnosis:**

1. **Check db.design.ts syntax:**
   ```bash
   # Validate TypeScript syntax
   npx tsc --noEmit src/db.design.ts
   ```

2. **Check for missing relationships:**
   - Ensure all foreign key references exist
   - Verify relationship names are unique
   - Check for circular dependencies

**Solutions:**

1. **Fix common db.design.ts issues:**
   ```typescript
   // ❌ Wrong - missing table reference
   {
     name: "authorId",
     type: "String",
     references: "NonExistentTable"
   }
   
   // ✅ Correct - proper reference
   {
     name: "authorId", 
     type: "String",
     references: "User"
   }
   ```

2. **Regenerate from scratch:**
   ```bash
   # Backup current design
   cp src/db.design.ts src/db.design.backup.ts
   
   # Start fresh
   npm run db-designer
   # Recreate your schema in the UI
   ```

### Generated Code Compilation Errors

**Problem:** Generated modules have TypeScript compilation errors.

**Solutions:**

1. **Update imports after generation:**
   ```bash
   npm run lint:fix
   ```

2. **Check for naming conflicts:**
   - Ensure table names don't conflict with TypeScript keywords
   - Use PascalCase for table names
   - Avoid reserved words (User, Date, etc.)

3. **Regenerate Prisma client:**
   ```bash
   npm run prisma:generate
   ```

## Development Server Issues

### Hot Reload Not Working

**Problem:** Changes not reflected automatically.

**Solutions:**

1. **Check file watching:**
   ```bash
   # Increase file watcher limit (Linux)
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. **Restart development server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

3. **Clear TypeScript cache:**
   ```bash
   # Remove compiled files
   rm -rf dist/
   npm run build
   ```

### Memory Issues During Development

**Problem:** Development server crashes with out of memory errors.

**Solutions:**

1. **Increase Node.js memory limit:**
   ```bash
   # Increase to 4GB
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

## Testing Issues

### Tests Failing

**Problem:** Generated tests fail to run or pass.

**Solutions:**

1. **Update test database:**
   ```bash
   # Set test environment
   NODE_ENV=test npm run prisma:migrate
   NODE_ENV=test npm run prisma:generate
   ```

2. **Check test configuration:**
   ```typescript
   // jest.config.js
   module.exports = {
     testEnvironment: 'node',
     setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
     testMatch: ['**/*.test.ts', '**/*.spec.ts']
   };
   ```

3. **Run tests with debugging:**
   ```bash
   # Run with verbose output
   npm test -- --verbose
   
   # Run specific test file
   npm test -- user.service.test.ts
   ```

## Import and Module Issues

### Cannot Find Module Errors

**Problem:** TypeScript cannot resolve module imports.

**Solutions:**

1. **Check tsconfig.json paths:**
   ```json
   {
     "compilerOptions": {
       "baseUrl": "./src",
       "paths": {
         "@/*": ["*"],
         "@modules/*": ["modules/*"],
         "@services/*": ["services/*"]
       }
     }
   }
   ```

2. **Use relative imports:**
   ```typescript
   // ❌ Absolute import issues
   import { UserService } from '@modules/user/user.service';
   
   // ✅ Relative imports work reliably
   import { UserService } from '../user/user.service';
   ```

3. **Restart TypeScript server:**
   - In VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### Circular Dependency Errors

**Problem:** Circular dependency detected between modules.

**Solutions:**

1. **Identify circular dependencies:**
   ```bash
   # Install dependency analyzer
   npm install --save-dev madge
   
   # Check for circular dependencies
   npx madge --circular src/
   ```

2. **Refactor to break cycles:**
   ```typescript
   // ❌ Circular dependency
   // user.service.ts imports post.service.ts
   // post.service.ts imports user.service.ts
   
   // ✅ Use shared interfaces
   // Create shared/interfaces.ts
   // Both services import from interfaces
   ```

## Performance Issues

### Slow API Responses

**Problem:** API endpoints respond slowly.

**Diagnosis:**

1. **Enable query logging:**
   ```typescript
   // In prisma.service.ts
   const prisma = new PrismaClient({
     log: ['query', 'info', 'warn', 'error']
   });
   ```

2. **Check database queries:**
   ```bash
   # Open Prisma Studio to inspect data
   npm run prisma:studio
   ```

**Solutions:**

1. **Add database indexes:**
   ```prisma
   model User {
     id    String @id @default(cuid())
     email String @unique
     
     @@index([email])
   }
   ```

2. **Optimize queries:**
   ```typescript
   // ❌ N+1 query problem
   const users = await prisma.user.findMany();
   for (const user of users) {
     user.posts = await prisma.post.findMany({ where: { authorId: user.id } });
   }
   
   // ✅ Use include or select
   const users = await prisma.user.findMany({
     include: { posts: true }
   });
   ```

### High Memory Usage

**Problem:** Application uses excessive memory.

**Solutions:**

1. **Monitor memory usage:**
   ```bash
   # Start with memory monitoring
   NODE_OPTIONS="--expose-gc" npm run dev
   ```

2. **Implement pagination:**
   ```typescript
   // ❌ Loading all records
   const users = await prisma.user.findMany();
   
   // ✅ Paginated results
   const users = await prisma.user.findMany({
     take: 10,
     skip: page * 10
   });
   ```

## Deployment Issues

### Build Failures

**Problem:** `npm run build` fails with errors.

**Solutions:**

1. **Check TypeScript errors:**
   ```bash
   # Type check without emitting
   npx tsc --noEmit
   ```

2. **Update dependencies:**
   ```bash
   # Update all dependencies
   npm update
   
   # Check for security vulnerabilities
   npm audit fix
   ```

3. **Clean build:**
   ```bash
   # Remove node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

### Production Environment Issues

**Problem:** Application works in development but fails in production.

**Solutions:**

1. **Check environment variables:**
   ```env
   NODE_ENV=production
   DATABASE_URL="your-production-db-url"
   PORT=3000
   ```

2. **Run production build locally:**
   ```bash
   npm run build
   NODE_ENV=production npm start
   ```

3. **Check logs for errors:**
   ```bash
   # Enable detailed logging
   DEBUG=* npm start
   ```

## Getting Help

### Enable Debug Mode

```bash
# Enable all debug output
DEBUG=* npm run dev

# Enable specific debug categories
DEBUG=mifty:* npm run dev
```

### Collect System Information

```bash
# Check versions
node --version
npm --version
mifty --version

# Check system info
npm run doctor  # If available
```

### Report Issues

When reporting issues, include:

1. **Error message and stack trace**
2. **Steps to reproduce**
3. **System information (OS, Node.js version)**
4. **Mifty version**
5. **Relevant configuration files**

**Useful commands for debugging:**

```bash
# Generate debug report
npm run debug:report

# Check service status
npm run services:status

# Validate configuration
npm run config:validate
```

### Community Resources

- **GitHub Issues:** [Report bugs and feature requests](https://github.com/abhir22/mifty-docs/issues)
- **Documentation:** [Complete documentation](https://mifty.dev/docs)
- **Examples:** [Sample projects and tutorials](https://github.com/mifty-docs-examples)

> **💡 Pro Tip:** Most issues are resolved by ensuring you have the latest version of Mifty and clearing npm cache. Try `npm cache clean --force` and reinstalling before reporting issues.