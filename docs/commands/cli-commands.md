# CLI Commands

Complete reference for all Mifty CLI commands and npm scripts.

import CommandBlock from '@site/src/components/CommandBlock';

## Project Initialization

### Create New Project

<CommandBlock 
  command="mifty init my-api"
  description="Initialize a new Mifty project with the specified name"
/>

<CommandBlock 
  command="cd my-api"
  description="Navigate to the newly created project directory"
/>

<CommandBlock 
  command="npm run dev"
  description="Start the development server"
/>

## Development Commands

### Start Development Server

<CommandBlock 
  command="npm run dev"
  description="Start API server with hot reload"
/>

<CommandBlock 
  command="npm run dev:full"
  description="Start API + DB Designer + Monitor + Prisma Studio"
/>

<CommandBlock 
  command="npm run dev:server"
  description="Start API server only"
/>

<CommandBlock 
  command="npm run dev:monitor"
  description="Start error monitor only"
/>

<CommandBlock 
  command="npm run dev:db-designer"
  description="Start DB Designer only (port 3001)"
/>

### Database Designer

<CommandBlock 
  command="npm run db-designer"
  description="Start DB Designer UI at http://localhost:3001/ui"
/>

## Build & Production

### Build Commands

<CommandBlock 
  command="npm run build"
  description="Build TypeScript to JavaScript for production"
/>

<CommandBlock 
  command="npm run build:watch"
  description="Watch mode - rebuild automatically on file changes"
/>

### Production Server

<CommandBlock 
  command="npm start"
  description="Start production server (requires build first)"
/>

## Database Commands (Prisma)

### Schema Management

<CommandBlock 
  command="npm run prisma:generate"
  description="Generate Prisma Client from schema"
/>

<CommandBlock 
  command="npm run prisma:migrate"
  description="Create and apply database migration"
/>

<CommandBlock 
  command="npm run prisma:push"
  description="Push schema changes without creating migration"
/>

<CommandBlock 
  command="npm run prisma:reset"
  description="⚠️ Reset database (DELETES ALL DATA)"
/>

### Database Tools

<CommandBlock 
  command="npm run prisma:studio"
  description="Open Prisma Studio at http://localhost:5555"
/>

## Module Generation

### Generate Modules

<CommandBlock 
  command="npm run generate"
  description="Generate all modules from db.design.ts"
/>

<CommandBlock 
  command="npm run generate:module <name>"
  description="Generate a specific module by name"
/>

## Testing Commands

### Run Tests

<CommandBlock 
  command="npm test"
  description="Run all tests with coverage report"
/>

<CommandBlock 
  command="npm run test:watch"
  description="Run tests in watch mode (re-run on changes)"
/>

<CommandBlock 
  command="npm run test:coverage"
  description="Run tests with detailed coverage report"
/>

## Error Monitoring

### Monitor Commands

<CommandBlock 
  command="npm run monitor"
  description="Start error monitor for debugging"
/>

<CommandBlock 
  command="npm run monitor:autofix"
  description="Monitor with automatic error fixing enabled"
/>

<CommandBlock 
  command="npm run watch:imports"
  description="Watch and report import issues"
/>

## Code Quality

### Linting

<CommandBlock 
  command="npm run lint"
  description="Run ESLint to check code quality"
/>

<CommandBlock 
  command="npm run lint:fix"
  description="Run ESLint with automatic fixes"
/>

### Formatting

<CommandBlock 
  command="npm run format"
  description="Format code with Prettier"
/>

## Adapter Management

### List Adapters

<CommandBlock 
  command="npm run adapter list"
  description="List all available adapters"
/>

<CommandBlock 
  command="npm run adapter installed"
  description="Show currently installed adapters"
/>

### Install/Uninstall Adapters

<CommandBlock 
  command="npm run adapter install <name>"
  description="Install a specific adapter"
/>

<CommandBlock 
  command="npm run adapter uninstall <name>"
  description="Uninstall a specific adapter"
/>

## Service Adapters

### Email Services

<CommandBlock 
  command="npm run adapter install email-service"
  description="Install email service adapter (Gmail/SMTP)"
/>

### Storage Services

<CommandBlock 
  command="npm run adapter install storage-service"
  description="Install storage adapter (S3/Local/Cloudinary)"
/>

### Payment Processing

<CommandBlock 
  command="npm run adapter install stripe"
  description="Install Stripe payment processing adapter"
/>

### Communication Services

<CommandBlock 
  command="npm run adapter install twilio"
  description="Install Twilio SMS service adapter"
/>

### Caching

<CommandBlock 
  command="npm run adapter install redis"
  description="Install Redis caching adapter"
/>

### AI Services

<CommandBlock 
  command="npm run adapter install openai"
  description="Install OpenAI API adapter"
/>

## Authentication Adapters

### List Auth Adapters

<CommandBlock 
  command="npm run auth:list"
  description="List all available authentication adapters"
/>

### OAuth Providers

<CommandBlock 
  command="npm run auth:install auth-github"
  description="Install GitHub OAuth authentication"
/>

<CommandBlock 
  command="npm run auth:install auth-google"
  description="Install Google OAuth authentication"
/>

<CommandBlock 
  command="npm run auth:install auth-linkedin"
  description="Install LinkedIn OAuth authentication"
/>

<CommandBlock 
  command="npm run auth:install auth-facebook"
  description="Install Facebook OAuth authentication"
/>

### OTP Authentication

<CommandBlock 
  command="npm run auth:install auth-email-otp"
  description="Install Email OTP authentication"
/>

<CommandBlock 
  command="npm run auth:install auth-mobile-otp"
  description="Install Mobile OTP authentication"
/>

## Configuration

### View Configuration

<CommandBlock 
  command="npm run services:config"
  description="View current services configuration"
/>

## Service URLs

When running in development mode, these services are available:

- **API Server**: http://localhost:3000
- **DB Designer**: http://localhost:3001/ui  
- **Prisma Studio**: http://localhost:5555

## Quick Development Workflow

Here's the typical development workflow using these commands:

1. **Initialize Project**
   ```bash
   mifty init my-project
   cd my-project
   ```

2. **Start Development**
   ```bash
   npm run dev
   ```

3. **Design Database** (in separate terminal)
   ```bash
   npm run db-designer
   ```

4. **Generate Modules**
   ```bash
   npm run generate
   ```

5. **Run Tests**
   ```bash
   npm test
   ```

6. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

## Command Categories

### By Frequency of Use

**Daily Development**
- `npm run dev`
- `npm run db-designer`
- `npm run generate`
- `npm test`

**Project Setup**
- `mifty init`
- `npm run adapter install`
- `npm run auth:install`

**Database Management**
- `npm run prisma:migrate`
- `npm run prisma:studio`
- `npm run prisma:generate`

**Production**
- `npm run build`
- `npm start`
- `npm run lint`

### By Component

**Core Framework**
- Project initialization
- Development server
- Build system

**Database**
- Prisma commands
- Migration management
- Schema generation

**Adapters**
- Service integrations
- Authentication providers
- Third-party APIs

**Quality Assurance**
- Testing
- Linting
- Error monitoring