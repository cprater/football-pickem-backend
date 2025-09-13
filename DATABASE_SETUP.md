# Database Setup Guide

This guide will help you set up the PostgreSQL database locally for the Football Pickem application.

## Prerequisites

- macOS (this guide is for macOS, but can be adapted for other systems)
- Homebrew package manager
- Node.js and npm

## Step 1: Install PostgreSQL

```bash
# Install PostgreSQL 15
brew install postgresql@15

# Add PostgreSQL to your PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# Start PostgreSQL service
brew services start postgresql@15
```

## Step 2: Create Database

```bash
# Create the football_pickem database
createdb football_pickem

# Verify database was created
psql -l | grep football_pickem
```

## Step 3: Configure Environment Variables

The `.env` file should be configured with the following database settings:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=football_pickem
DB_USER=chris  # Replace with your username
DB_PASSWORD=   # Leave empty if no password
```

## Step 4: Run Database Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Build the project
npm run build

# Run database migration (creates tables)
npm run migrate

# Seed the database with NFL teams
npm run seed

# Or run both migration and seeding together
npm run db:reset
```

## Step 5: Verify Setup

```bash
# Check that tables were created
psql football_pickem -c "\dt"

# Check that teams were inserted
psql football_pickem -c "SELECT COUNT(*) FROM teams;"

# Test API endpoint
curl http://localhost:3000/api/v1/games/teams/all
```

## Available Database Scripts

- `npm run migrate` - Create/update database tables
- `npm run seed` - Populate database with initial data (NFL teams)
- `npm run db:reset` - Reset database (migrate + seed)

## Database Schema

The application creates the following tables:

- `users` - User accounts and profiles
- `leagues` - Pickem leagues with settings
- `league_participants` - Many-to-many relationship between users and leagues
- `teams` - NFL teams (32 teams seeded by default)
- `games` - NFL games with scores and spreads
- `picks` - User picks for games

## Troubleshooting

### Connection Issues

If you get connection errors:

1. Make sure PostgreSQL is running:
   ```bash
   brew services list | grep postgresql
   ```

2. Check your database credentials in `.env` file

3. Verify the database exists:
   ```bash
   psql -l | grep football_pickem
   ```

### Permission Issues

If you get permission errors:

1. Make sure your user has access to PostgreSQL:
   ```bash
   psql postgres -c "CREATE USER your_username;"
   psql postgres -c "ALTER USER your_username CREATEDB;"
   ```

2. Or use the default postgres user:
   ```bash
   psql postgres -c "CREATE DATABASE football_pickem;"
   ```

### Reset Database

To completely reset the database:

```bash
# Drop and recreate database
dropdb football_pickem
createdb football_pickem

# Run migration and seeding
npm run db:reset
```

## Production Considerations

For production deployment:

1. Use a strong password for the database user
2. Set up proper database backups
3. Configure connection pooling
4. Use environment-specific configuration
5. Set up database monitoring

## Useful PostgreSQL Commands

```bash
# Connect to database
psql football_pickem

# List all tables
\dt

# Describe a table
\d table_name

# List all databases
\l

# Exit psql
\q

# Run SQL from command line
psql football_pickem -c "SELECT * FROM teams LIMIT 5;"
```

## Next Steps

Once the database is set up:

1. Start the backend server: `npm run dev`
2. Visit the API documentation: http://localhost:3000/api-docs
3. Test the API endpoints
4. Begin development on the frontend integration
