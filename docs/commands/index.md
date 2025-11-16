# Commands Reference

Complete reference for all Mifty CLI commands, npm scripts, and development workflows.

## Quick Navigation

### [CLI Commands](./cli-commands.md)
Complete reference for all Mifty CLI commands and npm scripts including:
- Project initialization
- Development server commands
- Database management (Prisma)
- Module generation
- Testing and quality assurance
- Adapter management
- Authentication setup

### [NPM Scripts](./npm-scripts.md)
Detailed documentation of all package.json scripts and development workflows.

### [Development Commands](./development-commands.md)
Development-specific commands and workflows for daily use.

### [Production Commands](./production-commands.md)
Production deployment and build commands.

## Most Common Commands

### Quick Start
```bash
mifty init my-api && cd my-api && npm run dev
```
Create new project and start development server

### Development Workflow
```bash
npm run dev:full
```
Start all development services (API + DB Designer + Monitor)

### Generate Code
```bash
npm run generate
```
Generate modules from database design

### Run Tests
```bash
npm test
```
Run all tests with coverage

## Command Categories

- **Project Setup**: Initialize and configure new projects
- **Development**: Daily development workflow commands  
- **Database**: Prisma and database management
- **Testing**: Test execution and coverage
- **Build**: Production build and deployment
- **Adapters**: Third-party service integrations
- **Quality**: Code linting, formatting, and monitoring

## Service URLs

When running development commands, these services become available:

| Service | URL | Command |
|---------|-----|---------|
| API Server | http://localhost:3000 | `npm run dev` |
| DB Designer | http://localhost:3001/ui | `npm run db-designer` |
| Prisma Studio | http://localhost:5555 | `npm run prisma:studio` |

## Need Help?

- See [Troubleshooting](../troubleshooting/) for common command issues
- Check [Development Workflows](./development-commands.md) for detailed processes
- Visit [Getting Started](../getting-started/quick-start) for initial setup guidance