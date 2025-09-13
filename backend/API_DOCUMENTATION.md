# API Documentation

This document explains how to generate and use the OpenAPI schema for the Football Pickem League API.

## 📚 Available Scripts

### Generate OpenAPI Schema
```bash
npm run generate:oas
```
This command generates a complete OpenAPI 3.0 schema file at `dist/oas-schema.json`.

### Serve API Documentation
```bash
npm run docs
```
This command generates the schema and serves it using Swagger UI for interactive documentation.

## 🔧 Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Access API Documentation
- **Swagger UI**: http://localhost:3000/api-docs
- **Raw JSON Schema**: http://localhost:3000/api-docs.json

## 📖 Adding API Documentation

To document your API endpoints, add JSDoc comments above your route handlers:

```typescript
/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
router.post('/register', ...)
```

## 🏗️ Schema Components

The OpenAPI schema includes the following predefined components:

### Schemas
- `User` - User account information
- `League` - League details and settings
- `Game` - Game information with scores and spreads
- `Team` - Team information
- `Pick` - User picks with confidence points
- `Error` - Standard error response format
- `Pagination` - Pagination metadata

### Security
- `bearerAuth` - JWT Bearer token authentication

## 🚀 Production Usage

### Generate Schema for Frontend
```bash
npm run generate:oas
```
The generated `dist/oas-schema.json` can be used with:
- **OpenAPI Generator** for client SDKs
- **Postman** for API testing
- **Insomnia** for API development
- **Frontend frameworks** for type generation

### Example: Generate TypeScript Types
```bash
npx @openapitools/openapi-generator-cli generate \
  -i dist/oas-schema.json \
  -g typescript-fetch \
  -o src/generated/api
```

## 📝 Best Practices

1. **Always document new endpoints** with JSDoc comments
2. **Use consistent response formats** across all endpoints
3. **Include examples** in your schema definitions
4. **Tag related endpoints** for better organization
5. **Update schema** when making breaking changes

## 🔍 Troubleshooting

### Database Connection Issues
If you see database connection errors when starting the development server:
- The server will still start and serve API documentation
- Database connection is optional for viewing API docs
- To fix: Set up PostgreSQL and configure `DATABASE_URL` in your `.env` file
- Run `npm run setup` to create a `.env` file from the template

### Schema Not Updating
- Ensure JSDoc comments are properly formatted
- Check that route files are included in the `apis` array
- Restart the development server after adding documentation

### Missing Endpoints
- Verify that route files are in the `src/routes/` directory
- Check that JSDoc comments are above the route handler
- Ensure the route path matches the OpenAPI path

### Type Errors
- Install missing type definitions: `npm install --save-dev @types/swagger-jsdoc @types/swagger-ui-express`
- Check TypeScript configuration in `tsconfig.json`

### Server Won't Start
- Run `npm run setup` to create necessary files
- Check that all dependencies are installed: `npm install`
- Ensure no other process is using port 3000

## 📚 Additional Resources

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger JSDoc Documentation](https://github.com/Surnet/swagger-jsdoc)
- [Swagger UI Express](https://github.com/scottie1984/swagger-ui-express)
- [OpenAPI Generator](https://openapi-generator.tech/)
