import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { User } from './User';
import { LeagueSettings } from '../types';

interface LeagueAttributes {
  id: number;
  name: string;
  description?: string;
  commissionerId: number;
  isPublic: boolean;
  maxParticipants: number;
  entryFee: number;
  scoringType: 'confidence' | 'straight' | 'survivor';
  leagueSettings: LeagueSettings;
  seasonYear: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface LeagueCreationAttributes extends Optional<LeagueAttributes, 'id' | 'description' | 'isPublic' | 'maxParticipants' | 'entryFee' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class League extends Model<LeagueAttributes, LeagueCreationAttributes> implements LeagueAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public commissionerId!: number;
  public isPublic!: boolean;
  public maxParticipants!: number;
  public entryFee!: number;
  public scoringType!: 'confidence' | 'straight' | 'survivor';
  public leagueSettings!: LeagueSettings;
  public seasonYear!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public commissioner?: User;
  public participants?: User[];

  // Association methods
  public async addParticipant(user: User): Promise<void> {
    await (this as any).addParticipant(user);
  }

  public async removeParticipant(user: User): Promise<void> {
    await (this as any).removeParticipant(user);
  }

  public async hasParticipant(user: User): Promise<boolean> {
    const count = await (this as any).countParticipants({ where: { id: user.id } });
    return count > 0;
  }

  public async countParticipants(): Promise<number> {
    return await (this as any).countParticipants();
  }

  public async getParticipants(options?: any): Promise<User[]> {
    return await (this as any).getParticipants(options);
  }
}

League.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [1, 200],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    commissionerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'commissioner_id',
      references: {
        model: User,
        key: 'id',
      },
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_public',
    },
    maxParticipants: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 20,
      field: 'max_participants',
      validate: {
        min: 2,
        max: 100,
      },
    },
    entryFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'entry_fee',
      validate: {
        min: 0,
      },
    },
    scoringType: {
      type: DataTypes.ENUM('confidence', 'straight', 'survivor'),
      allowNull: false,
      defaultValue: 'confidence',
      field: 'scoring_type',
    },
    leagueSettings: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
      field: 'league_settings',
    },
    seasonYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'season_year',
      validate: {
        min: 2020,
        max: 2030,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
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
    tableName: 'leagues',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Define associations
League.belongsTo(User, {
  foreignKey: 'commissionerId',
  as: 'commissioner',
});

export { League };
