# Production Commands

Essential commands for building, deploying, and managing Mifty applications in production.

import CommandBlock from '@site/src/components/CommandBlock';

## Build Commands

### Standard Build

<CommandBlock 
  command="npm run build"
  description="Build TypeScript to JavaScript for production"
/>

This command:
- Compiles TypeScript to JavaScript
- Resolves path aliases with tsc-alias
- Copies UI assets to dist folder
- Prepares application for production deployment

### Watch Build

<CommandBlock 
  command="npm run build:watch"
  description="Build in watch mode - rebuilds on file changes"
/>

Use during development when you need to test the built version.

## Production Server

### Start Production Server

<CommandBlock 
  command="npm start"
  description="Start production server (requires build first)"
/>

:::warning Prerequisites
Ensure you have run `npm run build` before starting the production server.
:::

### Production Workflow

```bash
# Complete production deployment workflow
npm run build
npm run prisma:migrate:deploy
npm start
```

## Database Production Commands

### Migration Deployment

<CommandBlock 
  command="npm run prisma:migrate:deploy"
  description="Apply all pending migrations in production"
/>

<CommandBlock 
  command="npm run prisma:migrate:status"
  description="Check migration status before deployment"
/>

### Prisma Client Generation

<CommandBlock 
  command="npm run prisma:generate"
  description="Generate Prisma Client for production"
/>

## Advanced Build Commands

### Secure Build (Enterprise)

<CommandBlock 
  command="npm run secure-build"
  description="Build with security features: bundling, obfuscation, and byte-compilation"
/>

This command performs:
1. Standard TypeScript build
2. Code bundling with esbuild
3. Byte compilation for security
4. Code obfuscation
5. Loader creation
6. JavaScript cleanup

### Individual Bundle Commands

<CommandBlock 
  command="npm run bundle"
  description="Bundle all CLI executables"
/>

<CommandBlock 
  command="npm run bundle:mifty"
  description="Bundle main Mifty CLI executable"
/>

<CommandBlock 
  command="npm run bundle:generate"
  description="Bundle code generation executable"
/>

<CommandBlock 
  command="npm run bundle:dbdesigner"
  description="Bundle database designer executable"
/>

<CommandBlock 
  command="npm run bundle:monitor"
  description="Bundle error monitor executable"
/>

<CommandBlock 
  command="npm run bundle:adapter"
  description="Bundle adapter management executable"
/>

### Security Commands

<CommandBlock 
  command="npm run obfuscate"
  description="Obfuscate JavaScript code for security"
/>

<CommandBlock 
  command="npm run byte-compile"
  description="Compile JavaScript to bytecode"
/>

## Packaging Commands

### NPM Package

<CommandBlock 
  command="npm run pack"
  description="Create NPM package (.tgz file)"
/>

### Platform-Specific Executables

<CommandBlock 
  command="npm run pkg:all"
  description="Create executables for all platforms (Linux, Windows, macOS)"
/>

<CommandBlock 
  command="npm run pkg:test:linux"
  description="Create Linux executable for testing"
/>

## Production Environment Setup

### Environment Variables

Create a production `.env` file with these essential variables:

```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# Database (use your production database URL)
DATABASE_URL="postgresql://user:password@localhost:5432/production_db"

# Security
JWT_SECRET=your-super-secure-jwt-secret-here

# Optional: External Services
EMAIL_PROVIDER=gmail
GMAIL_USER=your-production-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Storage (if using S3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-production-bucket

# Redis (if using)
REDIS_URL=redis://localhost:6379
```

### Database Configuration

<CommandBlock 
  command="npm run services:config"
  description="View current production configuration"
/>

## Deployment Workflows

### Standard Deployment

```mermaid
graph TD
    A[Code Ready] --> B[npm run lint]
    B --> C[npm test]
    C --> D[npm run build]
    D --> E[npm run prisma:migrate:deploy]
    E --> F[npm start]
    F --> G[Verify Deployment]
```

#### Step-by-Step Deployment

1. **Quality Assurance**
   <CommandBlock 
     command="npm run lint && npm test"
     description="Ensure code quality and all tests pass"
   />

2. **Build Application**
   <CommandBlock 
     command="npm run build"
     description="Build for production"
   />

3. **Database Migration**
   <CommandBlock 
     command="npm run prisma:migrate:deploy"
     description="Apply database migrations"
   />

4. **Start Production Server**
   <CommandBlock 
     command="npm start"
     description="Start production server"
   />

5. **Health Check**
   ```bash
   curl http://localhost:3000/health
   ```

### Secure Deployment (Enterprise)

For enhanced security in enterprise environments:

1. **Secure Build**
   <CommandBlock 
     command="npm run secure-build"
     description="Build with security features"
   />

2. **Create Executables**
   <CommandBlock 
     command="npm run pkg:all"
     description="Create platform-specific executables"
   />

3. **Deploy Executables**
   - Copy executables to production servers
   - Set appropriate permissions
   - Configure systemd/PM2 services

## Process Management

### Using PM2 (Recommended)

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Create PM2 Configuration**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'mifty-app',
       script: 'dist/app.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   ```

3. **Start with PM2**
   <CommandBlock 
     command="pm2 start ecosystem.config.js"
     description="Start application with PM2"
   />

4. **PM2 Management Commands**
   ```bash
   pm2 status          # Check status
   pm2 restart all     # Restart all processes
   pm2 stop all        # Stop all processes
   pm2 logs            # View logs
   pm2 monit           # Monitor processes
   ```

### Using Systemd

1. **Create Service File**
   ```ini
   # /etc/systemd/system/mifty-app.service
   [Unit]
   Description=Mifty Application
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/path/to/your/app
   ExecStart=/usr/bin/node dist/app.js
   Restart=on-failure
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target
   ```

2. **Enable and Start Service**
   <CommandBlock 
     command="sudo systemctl enable mifty-app && sudo systemctl start mifty-app"
     description="Enable and start systemd service"
   />

## Monitoring and Logging

### Application Monitoring

<CommandBlock 
  command="npm run monitor"
  description="Start production error monitoring"
/>

### Log Management

Production logs are automatically managed by Winston. Configure log levels in production:

```typescript
// src/config/logger.ts
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});
```

## Performance Optimization

### Build Optimization

1. **Enable Production Mode**
   ```bash
   NODE_ENV=production npm run build
   ```

2. **Use Secure Build for Better Performance**
   <CommandBlock 
     command="npm run secure-build"
     description="Optimized build with bundling and compression"
   />

### Runtime Optimization

1. **Enable Compression**
   - Compression middleware is automatically enabled in production
   - Gzip compression reduces response sizes

2. **Database Connection Pooling**
   - Prisma automatically manages connection pooling
   - Configure pool size based on your needs

3. **Caching**
   - Implement Redis caching for frequently accessed data
   - Use HTTP caching headers

## Security Considerations

### Production Security Checklist

1. **Environment Variables**
   - Use strong JWT secrets
   - Secure database credentials
   - Enable HTTPS in production

2. **Code Security**
   <CommandBlock 
     command="npm run secure-build"
     description="Use obfuscated build for enhanced security"
   />

3. **Database Security**
   - Use production database with proper access controls
   - Enable SSL connections
   - Regular security updates

4. **Server Security**
   - Keep Node.js updated
   - Use reverse proxy (nginx/Apache)
   - Implement rate limiting

## Troubleshooting Production Issues

### Common Production Problems

#### Build Failures

**Problem**: TypeScript compilation errors

**Solution**:
<CommandBlock 
  command="npm run lint:fix && npm run build"
  description="Fix linting issues and rebuild"
/>

#### Database Connection Issues

**Problem**: Cannot connect to production database

**Solutions**:
1. Check DATABASE_URL in production environment
2. Verify database server is running
3. Check network connectivity and firewall rules

#### Memory Issues

**Problem**: Application running out of memory

**Solutions**:
1. Monitor with PM2: `pm2 monit`
2. Increase Node.js memory limit: `node --max-old-space-size=4096 dist/app.js`
3. Implement proper garbage collection

#### Performance Issues

**Problem**: Slow response times

**Solutions**:
1. Enable application monitoring
2. Check database query performance
3. Implement caching strategies
4. Use clustering with PM2

### Health Checks

Implement health check endpoints:

```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

Test health check:
<CommandBlock 
  command="curl http://localhost:3000/health"
  description="Check application health"
/>

## Backup and Recovery

### Database Backup

<CommandBlock 
  command="pg_dump production_db > backup-$(date +%Y%m%d).sql"
  description="Create database backup (PostgreSQL)"
/>

### Application Backup

1. **Code Backup**
   - Use Git for version control
   - Tag releases: `git tag v1.0.0`

2. **Configuration Backup**
   - Backup environment files
   - Document configuration changes

### Recovery Procedures

1. **Database Recovery**
   ```bash
   # Restore from backup
   psql production_db < backup-20231201.sql
   ```

2. **Application Recovery**
   ```bash
   # Rollback to previous version
   git checkout v1.0.0
   npm run build
   pm2 restart all
   ```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer Configuration**
   - Use nginx or AWS ALB
   - Configure health checks
   - Implement session affinity if needed

2. **Database Scaling**
   - Read replicas for read-heavy workloads
   - Connection pooling
   - Query optimization

### Vertical Scaling

1. **Resource Monitoring**
   - Monitor CPU and memory usage
   - Scale server resources as needed

2. **Performance Tuning**
   - Optimize database queries
   - Implement caching
   - Use CDN for static assets