import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface TeamAttributes {
  id: number;
  name: string;
  city: string;
  abbreviation: string;
  conference: 'AFC' | 'NFC';
  division: string;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TeamCreationAttributes extends Optional<TeamAttributes, 'id' | 'logoUrl' | 'createdAt' | 'updatedAt'> {}

class Team extends Model<TeamAttributes, TeamCreationAttributes> implements TeamAttributes {
  public id!: number;
  public name!: string;
  public city!: string;
  public abbreviation!: string;
  public conference!: 'AFC' | 'NFC';
  public division!: string;
  public logoUrl?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Team.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    abbreviation: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    conference: {
      type: DataTypes.ENUM('AFC', 'NFC'),
      allowNull: false,
    },
    division: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    logoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'logo_url',
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
    tableName: 'teams',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export { Team };
