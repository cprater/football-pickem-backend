import sequelize from '../config/database';
import { User } from './User';
import { League } from './League';
import { Team } from './Team';
import { Game } from './Game';
import { Pick } from './Pick';

// Define all associations
const defineAssociations = () => {
  // User associations
  User.hasMany(League, {
    foreignKey: 'commissionerId',
    as: 'commissionedLeagues',
  });

  // League associations
  League.belongsToMany(User, {
    through: 'league_participants',
    foreignKey: 'leagueId',
    otherKey: 'userId',
    as: 'participants',
  });

  User.belongsToMany(League, {
    through: 'league_participants',
    foreignKey: 'userId',
    otherKey: 'leagueId',
    as: 'leagues',
  });

  // Pick associations
  User.hasMany(Pick, {
    foreignKey: 'userId',
    as: 'picks',
  });

  League.hasMany(Pick, {
    foreignKey: 'leagueId',
    as: 'picks',
  });

  Game.hasMany(Pick, {
    foreignKey: 'gameId',
    as: 'picks',
  });

  Team.hasMany(Pick, {
    foreignKey: 'pickedTeamId',
    as: 'picks',
  });

  // Game associations
  Team.hasMany(Game, {
    foreignKey: 'homeTeamId',
    as: 'homeGames',
  });

  Team.hasMany(Game, {
    foreignKey: 'awayTeamId',
    as: 'awayGames',
  });
};

// Initialize associations
defineAssociations();

// Export all models
export {
  sequelize,
  User,
  League,
  Team,
  Game,
  Pick,
};

// Sync database (for development)
export const syncDatabase = async (force: boolean = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error;
  }
};
