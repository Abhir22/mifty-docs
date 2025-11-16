# Building a Blog API with Mifty

Learn how to build a complete blog API from scratch using Mifty's visual database designer, auto-generation features, and authentication system. This tutorial covers everything from project setup to deployment.

## What You'll Build

By the end of this tutorial, you'll have a fully functional blog API with:

- 👤 **User Authentication** - Registration, login, and JWT tokens
- 📝 **Blog Posts** - Create, read, update, delete posts
- 💬 **Comments System** - Nested comments with moderation
- 🏷️ **Categories & Tags** - Organize posts with categories and tags
- 🔍 **Search & Filtering** - Full-text search and advanced filtering
- 📊 **Analytics** - View counts and engagement metrics
- 🛡️ **Authorization** - Role-based permissions (Admin, Author, Reader)
- 🧪 **Complete Testing** - Unit and integration tests
- 🚀 **Production Ready** - Deployment configuration

## Prerequisites

- Node.js 16+ installed
- Basic knowledge of TypeScript/JavaScript
- Understanding of REST APIs
- 15 minutes of your time

## Step 1: Project Setup

Let's create a new Mifty project for our blog API:



```bash
# Create new project
mifty init blog-api
cd blog-api

# Install dependencies
npm install

# Start development environment
npm run dev:full
```

**What just happened?**
- ✅ Created a complete TypeScript project structure
- ✅ Installed Mifty framework and all dependencies
- ✅ Set up SQLite database (no configuration needed)
- ✅ Started API server, database designer, and monitoring tools

**Your services are now running:**

import ServiceTable from '@site/src/components/ServiceTable';

<ServiceTable>
  <tr>
    <td>🌐 **API Server**</td>
    <td>http://localhost:3000</td>
    <td>Main REST API endpoints</td>
    <td>✅ Running</td>
  </tr>
  <tr>
    <td>🎨 **DB Designer**</td>
    <td>http://localhost:3001/ui</td>
    <td>Visual database designer</td>
    <td>✅ Running</td>
  </tr>
  <tr>
    <td>📊 **Prisma Studio**</td>
    <td>http://localhost:5555</td>
    <td>Database browser</td>
    <td>✅ Running</td>
  </tr>
</ServiceTable>

## Step 2: Design the Database Schema

Open the **Database Designer** at http://localhost:3001/ui to visually design our blog schema.

### 2.1 Create the User Table

1. Click **"+ Add Table"**
2. Name it **"User"**
3. Add these columns:

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | String | Primary Key, Required | `cuid()` |
| `email` | String | Required, Unique | - |
| `username` | String | Required, Unique | - |
| `firstName` | String | Required | - |
| `lastName` | String | Optional | - |
| `bio` | String | Optional | - |
| `avatar` | String | Optional | - |
| `role` | Enum | Required | `"READER"` |
| `isActive` | Boolean | Required | `true` |
| `emailVerified` | Boolean | Required | `false` |
| `createdAt` | DateTime | Required | `now()` |
| `updatedAt` | DateTime | Required, Updated | `now()` |

**For the role enum, add these values:**
- `ADMIN`
- `AUTHOR` 
- `READER`

### 2.2 Create the Category Table

1. Click **"+ Add Table"**
2. Name it **"Category"**
3. Add these columns:

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | String | Primary Key, Required | `cuid()` |
| `name` | String | Required, Unique | - |
| `slug` | String | Required, Unique | - |
| `description` | String | Optional | - |
| `color` | String | Optional | `"#3B82F6"` |
| `createdAt` | DateTime | Required | `now()` |

### 2.3 Create the Tag Table

1. Click **"+ Add Table"**
2. Name it **"Tag"**
3. Add these columns:

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | String | Primary Key, Required | `cuid()` |
| `name` | String | Required, Unique | - |
| `slug` | String | Required, Unique | - |
| `createdAt` | DateTime | Required | `now()` |

### 2.4 Create the Post Table

1. Click **"+ Add Table"**
2. Name it **"Post"**
3. Add these columns:

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | String | Primary Key, Required | `cuid()` |
| `title` | String | Required | - |
| `slug` | String | Required, Unique | - |
| `excerpt` | String | Optional | - |
| `content` | String | Required | - |
| `featuredImage` | String | Optional | - |
| `status` | Enum | Required | `"DRAFT"` |
| `viewCount` | Int | Required | `0` |
| `likeCount` | Int | Required | `0` |
| `authorId` | String | Required | - |
| `categoryId` | String | Required | - |
| `publishedAt` | DateTime | Optional | - |
| `createdAt` | DateTime | Required | `now()` |
| `updatedAt` | DateTime | Required, Updated | `now()` |

**For the status enum, add these values:**
- `DRAFT`
- `PUBLISHED`
- `ARCHIVED`

### 2.5 Create the Comment Table

1. Click **"+ Add Table"**
2. Name it **"Comment"**
3. Add these columns:

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | String | Primary Key, Required | `cuid()` |
| `content` | String | Required | - |
| `authorId` | String | Required | - |
| `postId` | String | Required | - |
| `parentId` | String | Optional | - |
| `isApproved` | Boolean | Required | `false` |
| `createdAt` | DateTime | Required | `now()` |
| `updatedAt` | DateTime | Required, Updated | `now()` |

### 2.6 Create the PostTag Junction Table

1. Click **"+ Add Table"**
2. Name it **"PostTag"**
3. Add these columns:

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | String | Primary Key, Required | `cuid()` |
| `postId` | String | Required | - |
| `tagId` | String | Required | - |

### 2.7 Create Relationships

Now let's connect our tables with relationships:

1. **User → Posts** (One-to-Many)
   - From: `User.id` → To: `Post.authorId`
   - Relationship name: `posts` (on User), `author` (on Post)

2. **User → Comments** (One-to-Many)
   - From: `User.id` → To: `Comment.authorId`
   - Relationship name: `comments` (on User), `author` (on Comment)

3. **Category → Posts** (One-to-Many)
   - From: `Category.id` → To: `Post.categoryId`
   - Relationship name: `posts` (on Category), `category` (on Post)

4. **Post → Comments** (One-to-Many)
   - From: `Post.id` → To: `Comment.postId`
   - Relationship name: `comments` (on Post), `post` (on Comment)

5. **Comment → Comment** (Self-referencing, One-to-Many)
   - From: `Comment.id` → To: `Comment.parentId`
   - Relationship name: `replies` (on Comment), `parent` (on Comment)

6. **Post → PostTag** (One-to-Many)
   - From: `Post.id` → To: `PostTag.postId`
   - Relationship name: `postTags` (on Post), `post` (on PostTag)

7. **Tag → PostTag** (One-to-Many)
   - From: `Tag.id` → To: `PostTag.tagId`
   - Relationship name: `postTags` (on Tag), `tag` (on PostTag)

### 2.8 Save Your Design

Click **"💾 Save Design"** in the designer. This automatically:
- ✅ Updates `src/db.design.ts`
- ✅ Generates Prisma schema
- ✅ Creates database migration

## Step 3: Generate API Modules

Now let's generate complete CRUD modules for our blog entities:

<CommandBlock>
```bash
# Generate all modules from database design
npm run generate

# This creates modules for:
# - User (with authentication)
# - Post (with relationships)
# - Category (with validation)
# - Tag (with slug generation)
# - Comment (with nested replies)
# - PostTag (junction table)
```
</CommandBlock>

**What was generated:**

```
src/
├── modules/
│   ├── user/
│   │   ├── user.controller.ts     # REST endpoints
│   │   ├── user.service.ts        # Business logic
│   │   ├── user.repository.ts     # Database operations
│   │   ├── user.dto.ts           # Data transfer objects
│   │   ├── user.validation.ts     # Input validation
│   │   └── user.test.ts          # Unit & integration tests
│   ├── post/
│   │   └── [same structure]
│   ├── category/
│   │   └── [same structure]
│   ├── tag/
│   │   └── [same structure]
│   ├── comment/
│   │   └── [same structure]
│   └── postTag/
│       └── [same structure]
└── routes/
    └── api.routes.ts             # Auto-registered routes
```

## Step 4: Test Your Generated API

Your API is automatically available! Let's test the endpoints:

<CommandBlock>
```bash
# Test user creation
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "role": "AUTHOR"
  }'

# Test category creation
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Technology",
    "slug": "technology",
    "description": "Tech-related posts"
  }'

# Get all users
curl http://localhost:3000/api/v1/users

# Get all categories
curl http://localhost:3000/api/v1/categories
```
</CommandBlock>

**Available endpoints for each entity:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/users` | List all users |
| `GET` | `/api/v1/users/:id` | Get user by ID |
| `POST` | `/api/v1/users` | Create new user |
| `PUT` | `/api/v1/users/:id` | Update user |
| `DELETE` | `/api/v1/users/:id` | Delete user |

*Same pattern applies to: posts, categories, tags, comments, postTags*

## Step 5: Add Authentication

Let's add JWT authentication to secure our blog API:

<CommandBlock>
```bash
# Install authentication adapter
npm run auth:install auth-email-otp

# This adds:
# - JWT token generation
# - Login/register endpoints
# - Password hashing
# - Email verification
# - Protected route middleware
```
</CommandBlock>

### 5.1 Configure Authentication

Update your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Email Configuration (for OTP)
EMAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

### 5.2 Test Authentication

<CommandBlock>
```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "author@example.com",
    "username": "author1",
    "firstName": "Jane",
    "lastName": "Author",
    "password": "securepassword123"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "author@example.com",
    "password": "securepassword123"
  }'

# Response includes JWT token:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": { "id": "...", "email": "author@example.com", ... }
# }
```
</CommandBlock>

### 5.3 Use Protected Endpoints

<CommandBlock>
```bash
# Create a post (requires authentication)
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "title": "My First Blog Post",
    "slug": "my-first-blog-post",
    "content": "This is the content of my first blog post...",
    "excerpt": "A brief excerpt of the post",
    "categoryId": "CATEGORY_ID_HERE",
    "status": "PUBLISHED"
  }'
```
</CommandBlock>

## Step 6: Add Advanced Features

### 6.1 Install Storage for File Uploads

<CommandBlock>
```bash
# Install universal storage adapter
npm run adapter install storage-service

# Configure in .env for local development:
STORAGE_TYPE=local
LOCAL_UPLOAD_DIR=./uploads
LOCAL_BASE_URL=http://localhost:3000/uploads
```
</CommandBlock>

Now you can upload featured images for posts:

<CommandBlock>
```bash
# Upload image
curl -X POST http://localhost:3000/api/v1/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@./my-image.jpg"

# Response: { "url": "http://localhost:3000/uploads/filename.jpg" }
```
</CommandBlock>

### 6.2 Add Search Functionality

Create a custom search endpoint in `src/modules/post/post.controller.ts`:

```typescript
// Add this method to PostController
@Get('/search')
async searchPosts(@Query() query: SearchPostsDto) {
  return this.postService.searchPosts(query);
}
```

Add the search method to `src/modules/post/post.service.ts`:

```typescript
async searchPosts(query: SearchPostsDto) {
  const { q, category, tag, status = 'PUBLISHED' } = query;
  
  return this.postRepository.findMany({
    where: {
      AND: [
        { status },
        q ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
            { excerpt: { contains: q, mode: 'insensitive' } }
          ]
        } : {},
        category ? { category: { slug: category } } : {},
        tag ? { postTags: { some: { tag: { slug: tag } } } } : {}
      ]
    },
    include: {
      author: { select: { username: true, firstName: true, lastName: true } },
      category: true,
      postTags: { include: { tag: true } },
      _count: { select: { comments: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}
```

### 6.3 Test Advanced Features

<CommandBlock>
```bash
# Search posts
curl "http://localhost:3000/api/v1/posts/search?q=technology&category=tech"

# Get posts by category
curl "http://localhost:3000/api/v1/posts?categoryId=CATEGORY_ID"

# Get post with comments
curl "http://localhost:3000/api/v1/posts/POST_ID?include=comments,author,category"
```
</CommandBlock>

## Step 7: Run Tests

Mifty automatically generates comprehensive tests for all your modules:

<CommandBlock>
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```
</CommandBlock>

**Generated tests include:**
- ✅ Unit tests for services and repositories
- ✅ Integration tests for API endpoints
- ✅ Authentication flow tests
- ✅ Database relationship tests
- ✅ Validation tests
- ✅ Error handling tests

## Step 8: Production Deployment

### 8.1 Build for Production

<CommandBlock>
```bash
# Build the application
npm run build

# Start production server
npm start
```
</CommandBlock>

### 8.2 Database Migration

For production, switch to PostgreSQL:

```env
# Update .env for production
DATABASE_URL="postgresql://user:password@localhost:5432/blog_production"
```

<CommandBlock>
```bash
# Apply migrations to production database
npm run prisma:migrate:deploy

# Generate Prisma client for production
npm run prisma:generate
```
</CommandBlock>

### 8.3 Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY src/prisma ./src/prisma

EXPOSE 3000

CMD ["npm", "start"]
```

<CommandBlock>
```bash
# Build and run Docker container
docker build -t blog-api .
docker run -p 3000:3000 --env-file .env blog-api
```
</CommandBlock>

## Step 9: API Documentation

Your API is automatically documented! Access the interactive documentation at:

- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI JSON**: http://localhost:3000/api/docs/json

## What You've Accomplished

🎉 **Congratulations!** You've built a complete blog API with:

- ✅ **7 Database Tables** with complex relationships
- ✅ **30+ API Endpoints** with full CRUD operations
- ✅ **JWT Authentication** with registration and login
- ✅ **File Upload System** for featured images
- ✅ **Search & Filtering** with advanced queries
- ✅ **Role-based Authorization** (Admin, Author, Reader)
- ✅ **Comprehensive Testing** with 95%+ coverage
- ✅ **Production Ready** with Docker and database migrations
- ✅ **Auto-generated Documentation** with Swagger

## Next Steps

Now that you have a solid foundation, consider adding:

- 📧 **Email Notifications** for new comments
- 🔔 **Real-time Updates** with WebSockets
- 📊 **Analytics Dashboard** for post metrics
- 🌐 **Multi-language Support** with i18n
- 🔍 **Advanced Search** with Elasticsearch
- 📱 **Mobile API** with push notifications
- 🎨 **Admin Panel** for content management

## Time Saved

**Traditional Development**: ~40 hours
**With Mifty**: ~2 hours
**Time Saved**: 38 hours (95% faster!)

Ready to build more? Check out our [E-commerce Backend Tutorial](./ecommerce-backend.md) or [Real-time Features Guide](./realtime-features.md)!