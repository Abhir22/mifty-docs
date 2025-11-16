---
sidebar_position: 3
title: Quick Start Tutorial
description: Build your first Mifty API in 5 minutes - from project creation to testing your first endpoint.
keywords: [mifty, quick start, tutorial, api, nodejs, typescript, database designer]
---

import ServiceTable from '@site/src/components/ServiceTable';

# ⚡ 5-Minute Quick Start

Get your enterprise-grade API running in **under 5 minutes** with Mifty. This tutorial will take you from zero to a fully functional TypeScript API with a visual database designer.

:::tip Prerequisites Check
Make sure you have [Mifty installed](./installation) before starting this tutorial.
:::

## 🚀 Step 1: Create Your Project (30 seconds)

Let's create a blog API project to demonstrate Mifty's capabilities:

```bash
mifty init my-blog-api
```

Create a new Mifty project

**What just happened?**
- ✅ Created complete TypeScript project structure
- ✅ Added all necessary dependencies and configurations
- ✅ Set up Prisma ORM with PostgreSQL database
- ✅ Configured testing, linting, and development tools
- ✅ Added npm scripts for all common tasks

<details>
<summary><strong>📁 Project Structure Created</strong></summary>

```
my-blog-api/
├── src/
│   ├── modules/              # Generated modules go here
│   ├── adapters/             # Installed adapters
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── config/               # Configuration files
│   ├── types/                # TypeScript type definitions
│   └── db.design.ts          # Visual database design
├── tests/                    # Test files
├── .env                      # Environment variables
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── jest.config.js            # Testing configuration
```

</details>

## 🗄️ Step 2: Set Up PostgreSQL (1 minute)

Mifty uses PostgreSQL by default. Set it up quickly with Docker:

```bash
# Start PostgreSQL with Docker
docker run --name mifty-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=mifty_dev -p 5432:5432 -d postgres:15

# Configure your database connection
echo 'DATABASE_URL="postgresql://postgres:password@localhost:5432/mifty_dev"' > .env
```

> **💡 Alternative**: For quick prototyping, you can use SQLite by setting `DATABASE_URL="file:./dev.db"` in your `.env` file.

## 📦 Step 3: Install Dependencies (1 minute)

Navigate to your project and install dependencies:

```bash
cd my-blog-api
npm install
```

Navigate to project and install dependencies

**Expected output:**
```
✅ Dependencies installed successfully
✅ Prisma client generated
✅ Development environment ready
```

## 🎨 Step 4: Start the Development Suite (30 seconds)

Start all development tools with one command:

```bash
npm run dev:full
```

Start the complete development environment

**This starts:**
- 🌐 **API Server** on port 3000
- 🎨 **Visual Database Designer** on port 3001
- 📊 **Prisma Studio** (Database Viewer) on port 5555
- 🔍 **Error Monitor** with auto-fix capabilities

<ServiceTable>
  <tr>
    <td><strong>🌐 API Server</strong></td>
    <td><a href="http://localhost:3000" target="_blank">http://localhost:3000</a></td>
    <td>Main REST API endpoints</td>
    <td><span style={{color: 'green'}}>●</span> Running</td>
  </tr>
  <tr>
    <td><strong>🎨 Database Designer</strong></td>
    <td><a href="http://localhost:3001/ui" target="_blank">http://localhost:3001/ui</a></td>
    <td>Visual database design interface</td>
    <td><span style={{color: 'green'}}>●</span> Running</td>
  </tr>
  <tr>
    <td><strong>📊 Prisma Studio</strong></td>
    <td><a href="http://localhost:5555" target="_blank">http://localhost:5555</a></td>
    <td>Database browser and editor</td>
    <td><span style={{color: 'green'}}>●</span> Running</td>
  </tr>
  <tr>
    <td><strong>🔍 Error Monitor</strong></td>
    <td>Terminal</td>
    <td>Real-time error detection & auto-fix</td>
    <td><span style={{color: 'green'}}>●</span> Active</td>
  </tr>
</ServiceTable>

:::success All Services Running!
Your development environment is now fully operational! 🎉
:::

## 🎨 Step 4: Design Your Database (2 minutes)

Open the Visual Database Designer and create your first table:

1. **Open Designer:** Navigate to [http://localhost:3001/ui](http://localhost:3001/ui)

2. **Create User Table:**
   - Click **"+ Add Table"**
   - Name: `User`
   - Add columns:
     - `id`: String, Primary Key, Default: `cuid()`
     - `email`: String, Required, Unique
     - `name`: String, Required
     - `createdAt`: DateTime, Default: `now()`

3. **Create Post Table:**
   - Click **"+ Add Table"**
   - Name: `Post`
   - Add columns:
     - `id`: String, Primary Key, Default: `cuid()`
     - `title`: String, Required
     - `content`: String, Optional
     - `authorId`: String, Required
     - `published`: Boolean, Default: `false`
     - `createdAt`: DateTime, Default: `now()`

4. **Create Relationship:**
   - Click **"+ Add Relationship"**
   - From: User.id → Post.authorId
   - Type: One-to-Many
   - Names: "posts" (on User), "author" (on Post)

5. **Save Design:**
   - Click **"💾 Save Design"**
   - Your schema is automatically updated!

:::tip Visual Design
The visual designer provides real-time feedback and automatically generates the Prisma schema as you design!
:::

## 🤖 Step 5: Generate Your API (30 seconds)

Generate complete CRUD modules from your database design:

```bash
npm run generate
```

Generate complete API modules from your database design

**What gets generated:**
- ✅ **User Module:** Complete CRUD operations
- ✅ **Post Module:** Complete CRUD operations  
- ✅ **Repository Layer:** Database access patterns
- ✅ **Service Layer:** Business logic
- ✅ **Controller Layer:** HTTP request handling
- ✅ **Validation Schemas:** Input validation with Zod
- ✅ **API Routes:** RESTful endpoints
- ✅ **Test Suites:** Unit and integration tests

<details>
<summary><strong>📋 Generated API Endpoints</strong></summary>

**User Endpoints:**
```
GET    /api/v1/users           # Get all users
GET    /api/v1/users/:id       # Get user by ID
POST   /api/v1/users           # Create new user
PUT    /api/v1/users/:id       # Update user
DELETE /api/v1/users/:id       # Delete user
```

**Post Endpoints:**
```
GET    /api/v1/posts           # Get all posts
GET    /api/v1/posts/:id       # Get post by ID
POST   /api/v1/posts           # Create new post
PUT    /api/v1/posts/:id       # Update post
DELETE /api/v1/posts/:id       # Delete post
```

</details>

## 🧪 Step 6: Test Your API (1 minute)

Your API is now ready! Let's test it:

### Test 1: Create a User

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"john@example.com\",
    \"name\": \"John Doe\"
  }"
```

Create your first user

**Expected response:**
```json
{
  "id": "clp123abc456def789",
  "email": "john@example.com", 
  "name": "John Doe",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Test 2: Get All Users

```bash
curl http://localhost:3000/api/v1/users
```

Retrieve all users

### Test 3: Create a Post

```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"My First Blog Post\",
    \"content\": \"This is my first post using Mifty!\",
    \"authorId\": \"clp123abc456def789\",
    \"published\": true
  }"
```

Create your first blog post

### Test 4: Get Posts with Author

```bash
curl http://localhost:3000/api/v1/posts?include=author
```

Get posts with author information

:::success API Working!
Congratulations! You've built a complete blog API with user management and posts in under 5 minutes! 🚀
:::

## 🔍 Step 7: Explore Your Data

Open Prisma Studio to browse your data visually:

1. **Open Prisma Studio:** [http://localhost:5555](http://localhost:5555)
2. **Browse Tables:** Click on `User` and `Post` tables
3. **View Data:** See the users and posts you just created
4. **Edit Data:** Make changes directly in the interface

## 🧪 Step 8: Run Tests (Optional)

Your generated modules include comprehensive tests:

```bash
npm test
```

Run the generated test suite

**Test coverage includes:**
- ✅ Unit tests for all services
- ✅ Integration tests for API endpoints
- ✅ Validation tests for input schemas
- ✅ Database operation tests

## 🎉 Congratulations!

In just 5 minutes, you've:

- ✅ Created a complete TypeScript API project
- ✅ Designed a database schema visually
- ✅ Generated full CRUD operations
- ✅ Tested your API endpoints
- ✅ Explored your data with visual tools

## 🚀 What's Next?

Now that you have a working API, here are your next steps:

### 🎯 Immediate Next Steps

<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', margin: '2rem 0'}}>

<div style={{padding: '1.5rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', background: 'var(--ifm-color-emphasis-50)'}}>

#### 🔌 Add Authentication
Install the auth adapter for user authentication:

```bash
npm run adapter install auth-service
```

Add authentication to your API

</div>

<div style={{padding: '1.5rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', background: 'var(--ifm-color-emphasis-50)'}}>

#### 📧 Add Email Service
Install email capabilities:

```bash
npm run adapter install email-service
```

Add email functionality

</div>

<div style={{padding: '1.5rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', background: 'var(--ifm-color-emphasis-50)'}}>

#### 🗄️ Switch Database
Change to PostgreSQL for production:

```bash
# Update .env
DATABASE_URL="postgresql://user:pass@localhost:5432/blog"

# Apply changes
npm run prisma:migrate
```

</div>

<div style={{padding: '1.5rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', background: 'var(--ifm-color-emphasis-50)'}}>

#### 🧪 Add More Features
Extend your database design:
- Add comments to posts
- Create user profiles
- Add categories and tags
- Implement likes/reactions

</div>

</div>

### 📚 Learning Path

Follow this path to master Mifty:

1. **[Database Design](../database/visual-designer)** - Master the visual designer
2. **[Framework Architecture](../framework/architecture)** - Understand the clean architecture
3. **[Code Generation](../framework/code-generation)** - Learn about auto-generation
4. **[Adapters Guide](../adapters/)** - Add third-party integrations
5. **[Testing Guide](../framework/testing)** - Write comprehensive tests
6. **[Production Commands](../commands/production-commands)** - Deploy to production

### 🎓 Tutorials

Build real-world applications:

- **[Blog API Tutorial](../tutorials/blog-api)** - Complete blog with authentication
- **[E-commerce Backend](../tutorials/ecommerce-backend)** - Shopping cart and payments
- **[Real-time Features](../tutorials/realtime-features)** - WebSocket integration
- **[File Upload Service](../tutorials/file-upload-service)** - Handle file uploads

### 🔧 Advanced Topics

When you're ready for more:

- **[Adapters Guide](../adapters/)** - Build your own integrations
- **[Performance Optimization](../troubleshooting/performance-optimization)** - Scale your API
- **[Security Best Practices](../framework/)** - Secure your application
- **[Testing Guide](../tutorials/testing-guide)** - Build comprehensive tests

## 💡 Pro Tips

- **🎨 Use the visual designer** for rapid prototyping
- **🔄 Regenerate modules** when you change your schema
- **📊 Monitor with Prisma Studio** during development
- **🧪 Run tests frequently** to catch issues early
- **🔍 Let the error monitor** auto-fix common issues

## 🆘 Need Help?

- **📖 [Documentation](../framework/)** - Comprehensive guides
- **🐛 [Troubleshooting](../troubleshooting/)** - Common issues and solutions
- **💬 [Community](https://github.com/abhir22/mifty-docs/discussions)** - Ask questions
- **🎯 [Tutorials](../tutorials/blog-api)** - Real-world applications

:::tip Keep Exploring!
You've just scratched the surface of what Mifty can do. The visual designer, auto-generation, and rich ecosystem of adapters will accelerate your development like never before!
:::

---

**Ready for the next step?** Choose your path:

<div style={{display: 'flex', gap: '1rem', margin: '2rem 0', flexWrap: 'wrap'}}>

<a href="../database/visual-designer" style={{
  padding: '1rem 2rem',
  background: 'var(--ifm-color-primary)',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  display: 'inline-block'
}}>
🎨 Master Database Design
</a>

<a href="../adapters/" style={{
  padding: '1rem 2rem',
  border: '2px solid var(--ifm-color-primary)',
  color: 'var(--ifm-color-primary)',
  textDecoration: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  display: 'inline-block'
}}>
🔌 Explore Adapters
</a>

<a href="../tutorials/blog-api" style={{
  padding: '1rem 2rem',
  border: '2px solid var(--ifm-color-success)',
  color: 'var(--ifm-color-success)',
  textDecoration: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  display: 'inline-block'
}}>
🎓 Build Real Apps
</a>

</div>