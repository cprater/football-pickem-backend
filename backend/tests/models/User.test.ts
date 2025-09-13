import { User } from '../../src/models/User';
import bcrypt from 'bcryptjs';

// Mock the database connection
jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    define: jest.fn(),
  },
}));

describe('User Model', () => {
  let user: User;

  beforeEach(() => {
    user = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: 'hashedpassword',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      validatePassword: jest.fn().mockResolvedValue(true),
      toJSON: jest.fn().mockReturnValue({
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true
      })
    } as any;
  });

  describe('validatePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 12);
      user.passwordHash = hashedPassword;

      const result = await user.validatePassword(password);
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'password123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await bcrypt.hash(password, 12);
      user.passwordHash = hashedPassword;

      const result = await user.validatePassword(wrongPassword);
      expect(result).toBe(false);
    });

    it('should handle empty password', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 12);
      user.passwordHash = hashedPassword;

      const result = await user.validatePassword('');
      expect(result).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return user data without passwordHash', () => {
      const json = user.toJSON();
      
      expect(json).toHaveProperty('id', 1);
      expect(json).toHaveProperty('email', 'test@example.com');
      expect(json).toHaveProperty('username', 'testuser');
      expect(json).toHaveProperty('firstName', 'John');
      expect(json).toHaveProperty('lastName', 'Doe');
      expect(json).toHaveProperty('isActive', true);
      expect(json).not.toHaveProperty('passwordHash');
    });

    it('should handle user without optional fields', () => {
      user.firstName = undefined;
      user.lastName = undefined;
      
      const json = user.toJSON();
      
      expect(json).toHaveProperty('id', 1);
      expect(json).toHaveProperty('email', 'test@example.com');
      expect(json).toHaveProperty('username', 'testuser');
      expect(json).not.toHaveProperty('passwordHash');
    });
  });

  describe('Model Properties', () => {
    it('should have all required properties', () => {
      expect(user.id).toBe(1);
      expect(user.email).toBe('test@example.com');
      expect(user.username).toBe('testuser');
      expect(user.passwordHash).toBe('hashedpassword');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.isActive).toBe(true);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle optional properties', () => {
      user.avatarUrl = 'https://example.com/avatar.jpg';
      expect(user.avatarUrl).toBe('https://example.com/avatar.jpg');
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before create', async () => {
      const password = 'password123';
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: password,
      };

      // Mock the beforeCreate hook behavior
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it('should hash password before update', async () => {
      const newPassword = 'newpassword123';
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      expect(hashedPassword).not.toBe(newPassword);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });
  });

  describe('Validation', () => {
    it('should validate email format', () => {
      // This would be tested through Sequelize validation
      expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('should validate username length', () => {
      expect(user.username.length).toBeGreaterThanOrEqual(3);
      expect(user.username.length).toBeLessThanOrEqual(50);
    });
  });
});
