# Football Pickem League Backend

A Node.js + Express backend API for managing football pickem leagues.

## Features

- User authentication and authorization
- League creation and management
- Game and team data management
- Pick submission and tracking
- Standings calculation
- Real-time updates

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT tokens
- **Validation**: express-validator

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your configuration values.

4. Set up PostgreSQL database:
   ```sql
   CREATE DATABASE football_pickem;
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user profile

### Leagues
- `GET /api/v1/leagues` - Get all public leagues
- `POST /api/v1/leagues` - Create new league
- `GET /api/v1/leagues/:id` - Get league details
- `POST /api/v1/leagues/:id/join` - Join league
- `POST /api/v1/leagues/:id/leave` - Leave league

### Games
- `GET /api/v1/games` - Get games for current week
- `GET /api/v1/games/week/:week` - Get games for specific week
- `GET /api/v1/games/:id` - Get specific game
- `GET /api/v1/games/teams/all` - Get all teams

### Picks
- `GET /api/v1/picks` - Get user's picks
- `POST /api/v1/picks` - Submit new pick
- `PUT /api/v1/picks/:id` - Update existing pick
- `DELETE /api/v1/picks/:id` - Delete pick

## Database Schema

The application uses the following main entities:
- **Users**: User accounts and profiles
- **Leagues**: Pickem leagues with settings
- **Teams**: NFL teams
- **Games**: NFL games with scores and spreads
- **Picks**: User picks for games

## Development

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

### Database Sync
The application will automatically sync the database schema on startup in development mode.

## Environment Variables

See `env.example` for all required environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC
