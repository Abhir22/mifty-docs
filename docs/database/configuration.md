# Database Configuration

Mifty supports all major databases through Prisma ORM. You can easily switch between databases by simply changing the provider in your Prisma schema and updating your connection string - no code changes required!

## Quick Database Switch

**Step 1:** Update the `provider` in `src/prisma/schema.prisma`  
**Step 2:** Update `DATABASE_URL` in `.env`  
**Step 3:** Run `npm run prisma:migrate`

That's it! Your entire application automatically works with the new database.

## Supported Databases

| Database | Provider | Best For | Setup Difficulty |
|----------|----------|----------|------------------|
| **PostgreSQL** | `postgresql` | Production, Development | 🟢 Default |
| **SQLite** | `sqlite` | Prototyping, Simple apps | 🟢 None |
| **MySQL** | `mysql` | Web applications, WordPress | 🟡 Easy |
| **SQL Server** | `sqlserver` | Enterprise, Microsoft stack | 🟠 Medium |
| **MongoDB** | `mongodb` | Document storage, NoSQL | 🟡 Easy |

## Database Configuration Examples



### 1️⃣ PostgreSQL (Default)

PostgreSQL is the default database for Mifty, providing excellent performance for both development and production.

#### Prisma Schema Configuration

```prisma title="src/prisma/schema.prisma"
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
}
```

#### Environment Configuration

**.env:**
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/mifty_dev"
```

**.env.example:**
```bash
# PostgreSQL Database (Default)
DATABASE_URL="postgresql://postgres:password@localhost:5432/mifty_dev"
```

#### Benefits
- ✅ **Zero setup** - works immediately
- ✅ **File-based** - easy to backup and share
- ✅ **Perfect for development** and testing
- ✅ **Lightweight** - no server required

#### Use Cases
- Development and testing
- Small applications
- Prototyping
- Desktop applications

---

### 2️⃣ PostgreSQL (Recommended for Production)

PostgreSQL is the recommended database for production applications due to its robustness and feature set.

#### Prisma Schema Configuration

```prisma title="src/prisma/schema.prisma"
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
}
```

#### Environment Configuration

**Local PostgreSQL:**
```bash
# Local PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/myapp_db"
```

**Cloud PostgreSQL:**
```bash
# Cloud PostgreSQL (e.g., Heroku, Railway, Supabase)
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"
```

**With Connection Pooling:**
```bash
# With connection pooling
DATABASE_URL="postgresql://user:pass@host:5432/dbname?connection_limit=5&pool_timeout=10"
```

#### Setup PostgreSQL Locally

**Docker:**
```bash
# Using Docker
docker run --name postgres -e POSTGRES_PASSWORD=mypassword -p 5432:5432 -d postgres
```

**macOS (Homebrew):**
```bash
# Using Homebrew (macOS)
brew install postgresql
brew services start postgresql
createdb myapp_db
```

**Ubuntu/Debian:**
```bash
# Using apt (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb myapp_db
```

#### Benefits
- ✅ **Production-ready** - enterprise-grade reliability
- ✅ **Advanced features** - JSON, arrays, full-text search
- ✅ **ACID compliance** - data integrity guaranteed
- ✅ **Excellent performance** - optimized for complex queries

#### Use Cases
- Production applications
- Complex data relationships
- High-traffic applications
- Enterprise systems

---

### 3️⃣ MySQL/MariaDB

MySQL is widely used for web applications and offers excellent compatibility with existing systems.

#### Prisma Schema Configuration

```prisma title="src/prisma/schema.prisma"
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
}
```

#### Environment Configuration

**Local MySQL:**
```bash
# Local MySQL
DATABASE_URL="mysql://username:password@localhost:3306/myapp_db"
```

**Cloud MySQL:**
```bash
# Cloud MySQL (e.g., PlanetScale, AWS RDS)
DATABASE_URL="mysql://user:pass@host:3306/dbname?sslaccept=strict"
```

**With SSL Options:**
```bash
# With SSL and connection options
DATABASE_URL="mysql://user:pass@host:3306/dbname?sslmode=REQUIRED&connection_limit=5"
```

#### Setup MySQL Locally

**Docker:**
```bash
# Using Docker
docker run --name mysql -e MYSQL_ROOT_PASSWORD=mypassword -e MYSQL_DATABASE=myapp_db -p 3306:3306 -d mysql:8
```

**macOS (Homebrew):**
```bash
# Using Homebrew (macOS)
brew install mysql
brew services start mysql
mysql -u root -p -e "CREATE DATABASE myapp_db;"
```

**Ubuntu/Debian:**
```bash
# Using apt (Ubuntu/Debian)
sudo apt update
sudo apt install mysql-server
sudo mysql -e "CREATE DATABASE myapp_db;"
```

#### Benefits
- ✅ **Wide compatibility** - works with most hosting providers
- ✅ **Mature ecosystem** - extensive tooling and support
- ✅ **Good performance** - optimized for web applications
- ✅ **Easy migration** - from existing MySQL systems

#### Use Cases
- Web applications
- WordPress and CMS systems
- E-commerce platforms
- Legacy system integration

---

### 4️⃣ SQL Server

Microsoft SQL Server is ideal for enterprise applications and Microsoft stack integration.

#### Prisma Schema Configuration

```prisma title="src/prisma/schema.prisma"
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
}
```

#### Environment Configuration

**Local SQL Server:**
```bash
# Local SQL Server
DATABASE_URL="sqlserver://localhost:1433;database=myapp_db;user=sa;password=YourPassword123;trustServerCertificate=true"
```

**Azure SQL Database:**
```bash
# Azure SQL Database
DATABASE_URL="sqlserver://server.database.windows.net:1433;database=myapp_db;user=username;password=password;encrypt=true"
```

#### Benefits
- ✅ **Enterprise features** - advanced security and compliance
- ✅ **Microsoft integration** - seamless with .NET and Azure
- ✅ **Robust tooling** - SQL Server Management Studio
- ✅ **High availability** - clustering and replication

#### Use Cases
- Enterprise applications
- Microsoft stack integration
- Financial and healthcare systems
- Large-scale data processing

---

### 5️⃣ MongoDB

MongoDB is perfect for document-based applications and flexible schema requirements.

#### Prisma Schema Configuration

```prisma title="src/prisma/schema.prisma"
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
}
```

#### Environment Configuration

**Local MongoDB:**
```bash
# Local MongoDB
DATABASE_URL="mongodb://localhost:27017/myapp_db"
```

**MongoDB Atlas:**
```bash
# MongoDB Atlas (Cloud)
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/myapp_db?retryWrites=true&w=majority"
```

**With Authentication:**
```bash
# With authentication
DATABASE_URL="mongodb://username:password@localhost:27017/myapp_db?authSource=admin"
```

#### Setup MongoDB Locally

**Docker:**
```bash
# Using Docker
docker run --name mongodb -p 27017:27017 -d mongo
```

**macOS (Homebrew):**
```bash
# Using Homebrew (macOS)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
# Using apt (Ubuntu/Debian)
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
```

#### Benefits
- ✅ **Flexible schema** - no rigid table structure
- ✅ **JSON-native** - perfect for JavaScript applications
- ✅ **Horizontal scaling** - built-in sharding support
- ✅ **Rich queries** - powerful aggregation framework

#### Use Cases
- Content management systems
- Real-time applications
- IoT and analytics
- Rapid prototyping

## Database Switching Examples

### Example: SQLite → PostgreSQL

Switching from SQLite to PostgreSQL is seamless with Mifty:

#### 1. Update Prisma Schema

**Before (SQLite):**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**After (PostgreSQL):**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 2. Update Environment Variables

**Before (.env):**
```bash
# PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/mifty_dev"
```

**After (.env):**
```bash
# MySQL
DATABASE_URL="mysql://user:pass@localhost:3306/myapp"
```

#### 3. Apply Changes

```bash
npm run prisma:generate
npm run prisma:migrate
```

**That's it!** Your entire application now works with PostgreSQL. All your generated modules, API endpoints, and business logic remain exactly the same.

## Database Migration Commands

**Development:**
```bash
# Generate Prisma client after schema changes
npm run prisma:generate

# Create and apply new migration
npm run prisma:migrate

# Push schema changes without migration
npm run prisma:push

# Open database browser
npm run prisma:studio
```

**Production:**
```bash
# View migration status
npm run prisma:migrate:status

# Deploy migrations (production)
npm run prisma:migrate:deploy

# Reset database (⚠️ deletes all data)
npm run prisma:reset
```

## Cloud Database Providers

| Provider | Database | Free Tier | Best For |
|----------|----------|-----------|----------|
| **Supabase** | PostgreSQL | ✅ 500MB | Full-stack apps with auth |
| **PlanetScale** | MySQL | ✅ 5GB | Serverless MySQL |
| **Railway** | PostgreSQL | ✅ 1GB | Simple deployment |
| **MongoDB Atlas** | MongoDB | ✅ 512MB | Document databases |
| **Heroku Postgres** | PostgreSQL | ✅ 1GB | Easy Heroku integration |

## Troubleshooting

### Common Connection Issues

#### Database Connection Refused

**PostgreSQL:**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL
brew services start postgresql

# Check connection
psql -h localhost -p 5432 -U username -d myapp_db
```

**MySQL:**
```bash
# Check if MySQL is running
brew services list | grep mysql

# Start MySQL
brew services start mysql

# Check connection
mysql -h localhost -P 3306 -u username -p myapp_db
```

**MongoDB:**
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community

# Check connection
mongosh mongodb://localhost:27017/myapp_db
```

#### Invalid Connection String

```bash
# Check your DATABASE_URL in .env
echo $DATABASE_URL

# Common issues:
# - Wrong port number
# - Incorrect username/password
# - Database name doesn't exist
# - Missing SSL parameters for cloud databases
```

#### Migration Errors

**Schema Drift:**
```bash
# Reset and recreate migrations
npm run prisma:migrate:reset

# Generate new migration
npm run prisma:migrate:dev --name init
```

**Production Deployment:**
```bash
# Check migration status
npm run prisma:migrate:status

# Deploy pending migrations
npm run prisma:migrate:deploy
```

### Performance Optimization

#### Connection Pooling

**PostgreSQL:**
```bash
# Add connection pooling parameters
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=5&pool_timeout=10"
```

**MySQL:**
```bash
# Add connection pooling parameters
DATABASE_URL="mysql://user:pass@host:3306/db?connection_limit=5&pool_timeout=10"
```

#### Index Optimization

```prisma title="src/prisma/schema.prisma"
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  
  // Add indexes for frequently queried fields
  @@index([createdAt])
  @@index([name, email])
}
```

## Pro Tips

- 🚀 **PostgreSQL by default** - excellent performance for development and production
- 📈 **Use SQLite** for quick prototyping - zero setup required  
- 🔄 **Switch anytime** - Mifty makes database changes seamless
- 🧪 **Test migrations** on a copy of your data before production
- 📊 **Use Prisma Studio** (`npm run prisma:studio`) to browse your data
- 🔒 **Always backup** before running `prisma:reset`
- 🔍 **Monitor performance** - use database-specific monitoring tools
- 🛡️ **Secure connections** - always use SSL in production
  