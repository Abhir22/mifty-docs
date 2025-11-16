# CLI Commands

Complete reference for all Mifty CLI commands and npm scripts.

## Project Initialization

### Create New Project

```bash
mifty init my-api
```
Initialize a new Mifty project with the specified name

```bash
cd my-api
```
Navigate to the newly created project directory

```bash
npm run dev
```
Start the development server

## Development Commands

### Start Development Server

```bash
npm run dev
```
Start API server with hot reload

```bash
npm run dev:full
```
Start API + DB Designer + Monitor + Prisma Studio

```bash
npm run dev:server
```
Start API server only

```bash
npm run dev:monitor
```
Start error monitor only

```bash
npm run dev:db-designer
```
Start DB Designer only (port 3001)

### Database Designer

```bash
npm run db-designer
```
Start DB Designer UI at http://localhost:3001/ui

## Build & Production

### Build Commands

```bash
npm run build
```
Build TypeScript to JavaScript for production

```bash
npm run build:watch
```
Watch mode - rebuild automatically on file changes

### Production Server

```bash
npm start
```
Start production server (requires build first)

## Database Commands (Prisma)

### Schema Management

```bash
npm run prisma:generate
```
Generate Prisma Client from schema

```bash
npm run prisma:migrate
```
Create and apply database migration

```bash
npm run prisma:push
```
Push schema changes without creating migration

```bash
npm run prisma:reset
```
⚠️ Reset database (DELETES ALL DATA)

### Database Tools

```bash
npm run prisma:studio
```
Open Prisma Studio at http://localhost:5555

## Module Generation

### Generate Modules

```bash
npm run generate
```
Generate all modules from db.design.ts

```bash
npm run generate:module <name>
```
Generate a specific module by name

## Testing Commands

### Run Tests

```bash
npm test
```
Run all tests with coverage report

```bash
npm run test:watch
```
Run tests in watch mode (re-run on changes)

```bash
npm run test:coverage
```
Run tests with detailed coverage report

## Error Monitoring

### Monitor Commands

```bash
npm run monitor
```
Start error monitor for debugging

```bash
npm run monitor:autofix
```
Monitor with automatic error fixing enabled

```bash
npm run watch:imports
```
Watch and report import issues

## Code Quality

### Linting

```bash
npm run lint
```
Run ESLint to check code quality

```bash
npm run lint:fix
```
Run ESLint with automatic fixes

### Formatting

```bash
npm run format
```
Format code with Prettier

## Adapter Management

### List Adapters

```bash
npm run adapter list
```
List all available adapters

```bash
npm run adapter installed
```
Show currently installed adapters

### Install/Uninstall Adapters

```bash
npm run adapter install <name>
```
Install a specific adapter

```bash
npm run adapter uninstall <name>
```
Uninstall a specific adapter

## Service Adapters

### Email Services

```bash
npm run adapter install email-service
```
Install email service adapter (Gmail/SMTP)

### Storage Services

```bash
npm run adapter install storage-service
```
Install storage adapter (S3/Local/Cloudinary)

### Payment Processing

```bash
npm run adapter install stripe
```
Install Stripe payment processing adapter

### Communication Services

```bash
npm run adapter install twilio
```
Install Twilio SMS service adapter

### Caching

```bash
npm run adapter install redis
```
Install Redis caching adapter

### AI Services

```bash
npm run adapter install openai
```
Install OpenAI API adapter

## Authentication Adapters

### List Auth Adapters

```bash
npm run auth:list
```
List all available authentication adapters

### OAuth Providers

```bash
npm run auth:install auth-github
```
Install GitHub OAuth authentication

```bash
npm run auth:install auth-google
```
Install Google OAuth authentication

```bash
npm run auth:install auth-linkedin
```
Install LinkedIn OAuth authentication

```bash
npm run auth:install auth-facebook
```
Install Facebook OAuth authentication

### OTP Authentication

```bash
npm run auth:install auth-email-otp
```
Install Email OTP authentication

```bash
npm run auth:install auth-mobile-otp
```
Install Mobile OTP authentication

## Configuration

### View Configuration

```bash
npm run services:config
```
View current services configuration

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