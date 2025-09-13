import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { User } from './User';
import { League } from './League';
import { Game } from './Game';
import { Team } from './Team';

interface PickAttributes {
  id: number;
  userId: number;
  leagueId: number;
  gameId: number;
  pickedTeamId: number;
  pickType: 'spread' | 'over_under' | 'straight';
  confidencePoints?: number;
  isCorrect?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PickCreationAttributes extends Optional<PickAttributes, 'id' | 'confidencePoints' | 'isCorrect' | 'createdAt' | 'updatedAt'> {}

class Pick extends Model<PickAttributes, PickCreationAttributes> implements PickAttributes {
  public id!: number;
  public userId!: number;
  public leagueId!: number;
  public gameId!: number;
  public pickedTeamId!: number;
  public pickType!: 'spread' | 'over_under' | 'straight';
  public confidencePoints?: number;
  public isCorrect?: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public user?: User;
  public league?: League;
  public game?: Game;
  public pickedTeam?: Team;
}

Pick.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: User,
        key: 'id',
      },
    },
    leagueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'league_id',
      references: {
        model: League,
        key: 'id',
      },
    },
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'game_id',
      references: {
        model: Game,
        key: 'id',
      },
    },
    pickedTeamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'picked_team_id',
      references: {
        model: Team,
        key: 'id',
      },
    },
    pickType: {
      type: DataTypes.ENUM('spread', 'over_under', 'straight'),
      allowNull: false,
      field: 'pick_type',
    },
    confidencePoints: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'confidence_points',
      validate: {
        min: 1,
        max: 16, // Max 16 games per week
      },
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'is_correct',
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
    tableName: 'picks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'league_id', 'game_id', 'pick_type'],
        name: 'unique_user_league_game_pick_type',
      },
    ],
  }
);

// Define associations
Pick.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

Pick.belongsTo(League, {
  foreignKey: 'leagueId',
  as: 'league',
});

Pick.belongsTo(Game, {
  foreignKey: 'gameId',
  as: 'game',
});

Pick.belongsTo(Team, {
  foreignKey: 'pickedTeamId',
  as: 'pickedTeam',
});

export { Pick };
