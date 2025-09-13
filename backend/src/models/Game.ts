import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Team } from './Team';

interface GameAttributes {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  gameDate: Date;
  week: number;
  seasonYear: number;
  homeScore?: number;
  awayScore?: number;
  spread?: number;
  overUnder?: number;
  status: 'scheduled' | 'in_progress' | 'final';
  createdAt: Date;
  updatedAt: Date;
}

interface GameCreationAttributes extends Optional<GameAttributes, 'id' | 'homeScore' | 'awayScore' | 'spread' | 'overUnder' | 'createdAt' | 'updatedAt'> {}

class Game extends Model<GameAttributes, GameCreationAttributes> implements GameAttributes {
  public id!: number;
  public homeTeamId!: number;
  public awayTeamId!: number;
  public gameDate!: Date;
  public week!: number;
  public seasonYear!: number;
  public homeScore?: number;
  public awayScore?: number;
  public spread?: number;
  public overUnder?: number;
  public status!: 'scheduled' | 'in_progress' | 'final';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public homeTeam?: Team;
  public awayTeam?: Team;
}

Game.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    homeTeamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'home_team_id',
      references: {
        model: Team,
        key: 'id',
      },
    },
    awayTeamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'away_team_id',
      references: {
        model: Team,
        key: 'id',
      },
    },
    gameDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'game_date',
    },
    week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 22, // Including playoffs
      },
    },
    seasonYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'season_year',
    },
    homeScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'home_score',
    },
    awayScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'away_score',
    },
    spread: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: true,
    },
    overUnder: {
      type: DataTypes.DECIMAL(5, 1),
      allowNull: true,
      field: 'over_under',
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'in_progress', 'final'),
      allowNull: false,
      defaultValue: 'scheduled',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'games',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Define associations
Game.belongsTo(Team, {
  foreignKey: 'homeTeamId',
  as: 'homeTeam',
});

Game.belongsTo(Team, {
  foreignKey: 'awayTeamId',
  as: 'awayTeam',
});

export { Game };
