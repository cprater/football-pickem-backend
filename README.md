# Football Pickem Backend

A full-stack football pickem application built with Node.js, Express, TypeScript, React, and PostgreSQL.

## Features

- User authentication and authorization
- League creation and management
- Game and team management
- Pick submission and tracking
- Real-time standings
- Responsive web interface

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL with Sequelize ORM
- JWT authentication
- Swagger API documentation
- Jest for testing

### Frontend
- React with TypeScript
- React Router for navigation
- Axios for API calls
- Vitest for testing
- CSS for styling

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd football-pickem-backend
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
# Backend
cp backend/env.example backend/.env
# Edit backend/.env with your database and JWT configuration

# Frontend
cp frontend/env.example frontend/.env
# Edit frontend/.env with your API URL
```

4. Set up the database:
```bash
cd backend
npm run db:reset
```

5. Start the development servers:
```bash
npm run dev
```

This will start both the backend (port 3001) and frontend (port 5173) servers.

## Testing

### Run All Tests
```bash
npm test
```

### Backend Tests Only
```bash
npm run test:backend
```

### Frontend Tests Only
```bash
npm run test:frontend
```

### Coverage Reports
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test:watch
```

## Test Coverage

The project includes comprehensive unit tests with full coverage for:

### Backend
- **Models**: User, League, Game, Team, Pick
- **Routes**: Authentication, Games, Leagues, Picks
- **Middleware**: Authentication, Validation, Error Handling
- **Services**: Database operations, JWT handling

### Frontend
- **Components**: Header, all page components
- **Pages**: Home, Login, Register, Dashboard, Leagues
- **Services**: API client, authentication helpers
- **Utilities**: Form handling, validation

## API Documentation

Once the backend is running, you can access the Swagger API documentation at:
```
http://localhost:3001/api-docs
```

## Project Structure

```
football-pickem-backend/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # API routes
│   │   ├── scripts/         # Utility scripts
│   │   └── types/           # TypeScript type definitions
│   ├── tests/               # Backend tests
│   │   ├── models/          # Model tests
│   │   ├── routes/          # Route tests
│   │   └── middleware/      # Middleware tests
│   └── dist/                # Compiled JavaScript
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   └── test/            # Test setup
│   └── public/              # Static assets
└── .github/workflows/       # CI/CD configuration
```

## Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Building for Production
```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the ISC License.