import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Football Pickem League API',
    version: '1.0.0',
    description: 'API for managing football pickem leagues, games, picks, and standings',
    contact: {
      name: 'API Support',
      email: 'support@footballpickem.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://api.footballpickem.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          username: { type: 'string', example: 'johndoe' },
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          avatarUrl: { type: 'string', format: 'uri', example: 'https://example.com/avatar.jpg' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      League: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Fantasy Football League 2024' },
          description: { type: 'string', example: 'A competitive fantasy football league' },
          commissionerId: { type: 'integer', example: 1 },
          isPublic: { type: 'boolean', example: true },
          maxParticipants: { type: 'integer', example: 20 },
          entryFee: { type: 'number', format: 'decimal', example: 25.00 },
          scoringType: { type: 'string', enum: ['confidence', 'straight', 'survivor'], example: 'confidence' },
          seasonYear: { type: 'integer', example: 2024 },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Game: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          homeTeamId: { type: 'integer', example: 1 },
          awayTeamId: { type: 'integer', example: 2 },
          gameDate: { type: 'string', format: 'date-time' },
          week: { type: 'integer', example: 1 },
          seasonYear: { type: 'integer', example: 2024 },
          homeScore: { type: 'integer', example: 24 },
          awayScore: { type: 'integer', example: 21 },
          spread: { type: 'number', format: 'decimal', example: -3.5 },
          overUnder: { type: 'number', format: 'decimal', example: 45.5 },
          status: { type: 'string', enum: ['scheduled', 'in_progress', 'final'], example: 'final' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Team: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Chiefs' },
          city: { type: 'string', example: 'Kansas City' },
          abbreviation: { type: 'string', example: 'KC' },
          conference: { type: 'string', example: 'AFC' },
          division: { type: 'string', example: 'West' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Pick: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 1 },
          leagueId: { type: 'integer', example: 1 },
          gameId: { type: 'integer', example: 1 },
          pickedTeamId: { type: 'integer', example: 1 },
          pickType: { type: 'string', enum: ['spread', 'over_under', 'straight'], example: 'spread' },
          confidencePoints: { type: 'integer', example: 10 },
          isCorrect: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validation failed' },
          errors: { type: 'array', items: { type: 'string' }, example: ['Email is required'] },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 100 },
          pages: { type: 'integer', example: 10 },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

// Options for the swagger docs
const options = {
  definition: swaggerDefinition,
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../models/*.ts'),
  ],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Application): void => {
  // Swagger UI options
  const swaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Football Pickem API Documentation',
    customfavIcon: '/favicon.ico',
  };

  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  // Serve raw JSON schema
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 API Documentation available at: http://localhost:3000/api-docs');
  console.log('📄 OpenAPI JSON schema available at: http://localhost:3000/api-docs.json');
};

export default swaggerSpec;
