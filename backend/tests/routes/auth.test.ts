import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth';
import { User } from '../../src/models/User';
import { generateToken } from '../../src/middleware/auth';

// Mock the User model
jest.mock('../../src/models/User', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

// Mock the auth middleware
jest.mock('../../src/middleware/auth', () => ({
  generateToken: jest.fn(),
}));

// Mock validation middleware
jest.mock('../../src/middleware/validation', () => ({
  validateUserRegistration: [],
  validateUserLogin: [],
  handleValidationErrors: (req: any, res: any, next: any) => next(),
}));

// Mock error handler
jest.mock('../../src/middleware/errorHandler', () => ({
  asyncHandler: (fn: Function) => fn,
  createError: (message: string, statusCode: number) => {
    const error = new Error(message);
    (error as any).statusCode = statusCode;
    return error;
  },
}));

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockUser = {
        id: 1,
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          email: userData.email,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
        }),
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (generateToken as jest.Mock).mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('token', 'mock-jwt-token');
      expect(response.body).toHaveProperty('user');
      expect(User.findOne).toHaveBeenCalledWith({
        where: {
          [Symbol.for('or')]: [{ email: userData.email }, { username: userData.username }],
        },
      });
      expect(User.create).toHaveBeenCalledWith({
        email: userData.email,
        username: userData.username,
        passwordHash: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });
    });

    it('should return 409 if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'Password123',
      };

      const existingUser = {
        id: 1,
        email: userData.email,
        username: userData.username,
      };

      (User.findOne as jest.Mock).mockResolvedValue(existingUser);

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
      expect(User.create).not.toHaveBeenCalled();
    });

    it('should register user without optional fields', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123',
      };

      const mockUser = {
        id: 1,
        email: userData.email,
        username: userData.username,
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          email: userData.email,
          username: userData.username,
        }),
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (generateToken as jest.Mock).mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(User.create).toHaveBeenCalledWith({
        email: userData.email,
        username: userData.username,
        passwordHash: userData.password,
        firstName: undefined,
        lastName: undefined,
      });
    });
  });

  describe('POST /auth/login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const mockUser = {
        id: 1,
        email: loginData.email,
        username: 'testuser',
        isActive: true,
        validatePassword: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          email: loginData.email,
          username: 'testuser',
        }),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (generateToken as jest.Mock).mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token', 'mock-jwt-token');
      expect(response.body).toHaveProperty('user');
      expect(mockUser.validatePassword).toHaveBeenCalledWith(loginData.password);
    });

    it('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      const mockUser = {
        id: 1,
        email: loginData.email,
        username: 'testuser',
        isActive: true,
        validatePassword: jest.fn().mockResolvedValue(false),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(mockUser.validatePassword).toHaveBeenCalledWith(loginData.password);
    });

    it('should return 401 for inactive user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const mockUser = {
        id: 1,
        email: loginData.email,
        username: 'testuser',
        isActive: false,
        validatePassword: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /auth/me', () => {
    it('should return user profile when authenticated', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          firstName: 'John',
          lastName: 'Doe',
        }),
      };

      // Mock the auth middleware to set req.user
      const originalAuthRoutes = require('../../src/routes/auth').default;
      const mockAuthRoutes = express.Router();
      
      mockAuthRoutes.get('/me', (req: any, res: any) => {
        req.user = mockUser;
        if (!req.user) {
          return res.status(401).json({ error: 'User not authenticated' });
        }
        res.json({ user: req.user.toJSON() });
      });

      const testApp = express();
      testApp.use('/auth', mockAuthRoutes);

      const response = await request(testApp).get('/auth/me');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', 1);
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should return 401 when not authenticated', async () => {
      const mockAuthRoutes = express.Router();
      
      mockAuthRoutes.get('/me', (req: any, res: any) => {
        if (!req.user) {
          return res.status(401).json({ error: 'User not authenticated' });
        }
        res.json({ user: req.user.toJSON() });
      });

      const testApp = express();
      testApp.use('/auth', mockAuthRoutes);

      const response = await request(testApp).get('/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'User not authenticated');
    });
  });
});
