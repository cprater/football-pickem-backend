# Football Pickem League - Monorepo

A full-stack application for managing football pickem leagues, built with React frontend and Node.js/Express backend.

## Project Structure

This is a monorepo containing both frontend and backend applications:

```
football-pickem/
├── backend/          # Node.js/Express API server
├── frontend/         # React TypeScript application
├── package.json      # Root package.json with workspace configuration
└── README.md         # This file
```

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT tokens
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install all dependencies:
   ```bash
   npm run install:all
   ```

3. Set up environment variables:
   ```bash
   cp backend/env.example backend/.env
   ```
   Edit `backend/.env` with your configuration values.

4. Set up PostgreSQL database:
   ```sql
   CREATE DATABASE football_pickem;
   ```

5. Set up the backend:
   ```bash
   npm run setup
   ```

### Development

#### Run both frontend and backend in development mode:
```bash
npm run dev
```

#### Run only the backend:
```bash
npm run dev:backend
```

#### Run only the frontend:
```bash
npm run dev:frontend
```

**Note**: The frontend now uses Vite and runs on port 3001 with automatic API proxying to the backend on port 3000.

### Production

#### Build both applications:
```bash
npm run build
```

#### Start the backend server:
```bash
npm start
```

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:backend` - Start only the backend development server
- `npm run dev:frontend` - Start only the frontend development server
- `npm run build` - Build both applications for production
- `npm run build:backend` - Build only the backend
- `npm run build:frontend` - Build only the frontend
- `npm start` - Start the backend production server
- `npm run install:all` - Install dependencies for all workspaces
- `npm run clean` - Clean all build artifacts and node_modules
- `npm run setup` - Run the full setup process

## API Documentation

The backend API documentation is available at:
- Development: `http://localhost:3000/api-docs`
- Generated docs: `backend/API_DOCUMENTATION.md`

## Environment Variables

See `backend/env.example` for all required environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC