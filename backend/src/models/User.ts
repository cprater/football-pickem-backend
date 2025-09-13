import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

interface UserAttributes {
  id: number;
  email: string;
  username: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'firstName' | 'lastName' | 'avatarUrl' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public username!: string;
  public passwordHash!: string;
  public firstName?: string;
  public lastName?: string;
  public avatarUrl?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }

  public toJSON(): any {
    const values = Object.assign({}, this.get());
    delete (values as any).passwordHash;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash',
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'first_name',
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'last_name',
    },
    avatarUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'avatar_url',
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
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.changed('passwordHash')) {
          const saltRounds = 12;
          user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('passwordHash')) {
          const saltRounds = 12;
          user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);
        }
      },
    },
  }
);

export { User };
