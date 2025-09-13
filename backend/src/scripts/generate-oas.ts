import swaggerJSDoc from 'swagger-jsdoc';
import fs from 'fs';
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
          id: {
            type: 'integer',
            description: 'User ID',
            example: 1,
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'user@example.com',
          },
          username: {
            type: 'string',
            description: 'Username',
            example: 'johndoe',
          },
          firstName: {
            type: 'string',
            description: 'First name',
            example: 'John',
          },
          lastName: {
            type: 'string',
            description: 'Last name',
            example: 'Doe',
          },
          avatarUrl: {
            type: 'string',
            format: 'uri',
            description: 'Avatar image URL',
            example: 'https://example.com/avatar.jpg',
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the user account is active',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      League: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'League ID',
            example: 1,
          },
          name: {
            type: 'string',
            description: 'League name',
            example: 'Fantasy Football League 2024',
          },
          description: {
            type: 'string',
            description: 'League description',
            example: 'A competitive fantasy football league',
          },
          commissionerId: {
            type: 'integer',
            description: 'ID of the league commissioner',
            example: 1,
          },
          isPublic: {
            type: 'boolean',
            description: 'Whether the league is public',
            example: true,
          },
          maxParticipants: {
            type: 'integer',
            description: 'Maximum number of participants',
            example: 20,
          },
          entryFee: {
            type: 'number',
            format: 'decimal',
            description: 'Entry fee for the league',
            example: 25.00,
          },
          scoringType: {
            type: 'string',
            enum: ['confidence', 'straight', 'survivor'],
            description: 'Type of scoring system',
            example: 'confidence',
          },
          seasonYear: {
            type: 'integer',
            description: 'Season year',
            example: 2024,
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the league is active',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'League creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      Game: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Game ID',
            example: 1,
          },
          homeTeamId: {
            type: 'integer',
            description: 'Home team ID',
            example: 1,
          },
          awayTeamId: {
            type: 'integer',
            description: 'Away team ID',
            example: 2,
          },
          gameDate: {
            type: 'string',
            format: 'date-time',
            description: 'Game date and time',
          },
          week: {
            type: 'integer',
            description: 'Week number',
            example: 1,
          },
          seasonYear: {
            type: 'integer',
            description: 'Season year',
            example: 2024,
          },
          homeScore: {
            type: 'integer',
            description: 'Home team score',
            example: 24,
          },
          awayScore: {
            type: 'integer',
            description: 'Away team score',
            example: 21,
          },
          spread: {
            type: 'number',
            format: 'decimal',
            description: 'Point spread',
            example: -3.5,
          },
          overUnder: {
            type: 'number',
            format: 'decimal',
            description: 'Over/under total',
            example: 45.5,
          },
          status: {
            type: 'string',
            enum: ['scheduled', 'in_progress', 'final'],
            description: 'Game status',
            example: 'final',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Game creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      Team: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Team ID',
            example: 1,
          },
          name: {
            type: 'string',
            description: 'Team name',
            example: 'Chiefs',
          },
          city: {
            type: 'string',
            description: 'Team city',
            example: 'Kansas City',
          },
          abbreviation: {
            type: 'string',
            description: 'Team abbreviation',
            example: 'KC',
          },
          conference: {
            type: 'string',
            description: 'Conference',
            example: 'AFC',
          },
          division: {
            type: 'string',
            description: 'Division',
            example: 'West',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Team creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      Pick: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Pick ID',
            example: 1,
          },
          userId: {
            type: 'integer',
            description: 'User ID who made the pick',
            example: 1,
          },
          leagueId: {
            type: 'integer',
            description: 'League ID',
            example: 1,
          },
          gameId: {
            type: 'integer',
            description: 'Game ID',
            example: 1,
          },
          pickedTeamId: {
            type: 'integer',
            description: 'ID of the team picked',
            example: 1,
          },
          pickType: {
            type: 'string',
            enum: ['spread', 'over_under', 'straight'],
            description: 'Type of pick',
            example: 'spread',
          },
          confidencePoints: {
            type: 'integer',
            description: 'Confidence points (1-16)',
            example: 10,
          },
          isCorrect: {
            type: 'boolean',
            description: 'Whether the pick was correct',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Pick creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Error message',
            example: 'Validation failed',
          },
          errors: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Array of validation errors',
            example: ['Email is required', 'Password must be at least 8 characters'],
          },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            description: 'Current page number',
            example: 1,
          },
          limit: {
            type: 'integer',
            description: 'Number of items per page',
            example: 10,
          },
          total: {
            type: 'integer',
            description: 'Total number of items',
            example: 100,
          },
          pages: {
            type: 'integer',
            description: 'Total number of pages',
            example: 10,
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
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

// Ensure dist directory exists
const distDir = path.join(__dirname, '../../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Write the schema to file
const outputPath = path.join(distDir, 'oas-schema.json');
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

console.log(`✅ OpenAPI schema generated successfully at: ${outputPath}`);
console.log(`📊 Schema contains ${Object.keys((swaggerSpec as any).paths || {}).length} endpoints`);
console.log(`🔧 Components: ${Object.keys((swaggerSpec as any).components?.schemas || {}).length} schemas defined`);

export default swaggerSpec;
