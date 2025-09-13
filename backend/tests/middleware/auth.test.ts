import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, generateToken, optionalAuth } from '../../src/middleware/auth';
import { User } from '../../src/models/User';
import { AuthenticatedRequest } from '../../src/types';

// Mock the User model
jest.mock('../../src/models/User', () => ({
  User: {
    findByPk: jest.fn(),
  },
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn(),
  JsonWebTokenError: class JsonWebTokenError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'JsonWebTokenError';
    }
  },
  TokenExpiredError: class TokenExpiredError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'TokenExpiredError';
    }
  },
}));

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockUser: User;

  beforeEach(() => {
    mockUser = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      isActive: true,
      validatePassword: jest.fn().mockResolvedValue(true)
    } as any;

    mockReq = {
      headers: {},
      user: undefined,
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();

    // Set up environment variables
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '7d';

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token and set user', async () => {
      const token = 'valid-token';
      const decoded = { userId: 1, email: 'test@example.com' };
      
      mockReq.headers = { authorization: `Bearer ${token}` };
      (jwt.verify as jest.Mock).mockReturnValue(decoded);
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      await authenticateToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret');
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(mockReq.user).toBe(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 if no token provided', async () => {
      mockReq.headers = {};

      await authenticateToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access token required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token format is invalid', async () => {
      mockReq.headers = { authorization: 'InvalidFormat' };

      await authenticateToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access token required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 500 if JWT secret not configured', async () => {
      delete process.env.JWT_SECRET;
      mockReq.headers = { authorization: 'Bearer valid-token' };

      await authenticateToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'JWT secret not configured' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', async () => {
      const token = 'invalid-token';
      mockReq.headers = { authorization: `Bearer ${token}` };
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      await authenticateToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for expired token', async () => {
      const token = 'expired-token';
      mockReq.headers = { authorization: `Bearer ${token}` };
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });

      await authenticateToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token expired' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if user not found', async () => {
      const token = 'valid-token';
      const decoded = { userId: 999, email: 'nonexistent@example.com' };
      
      mockReq.headers = { authorization: `Bearer ${token}` };
      (jwt.verify as jest.Mock).mockReturnValue(decoded);
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await authenticateToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid or inactive user' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if user is inactive', async () => {
      const token = 'valid-token';
      const decoded = { userId: 1, email: 'test@example.com' };
      const inactiveUser = { ...mockUser, isActive: false };
      
      mockReq.headers = { authorization: `Bearer ${token}` };
      (jwt.verify as jest.Mock).mockReturnValue(decoded);
      (User.findByPk as jest.Mock).mockResolvedValue(inactiveUser);

      await authenticateToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid or inactive user' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      const token = 'valid-token';
      mockReq.headers = { authorization: `Bearer ${token}` };
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await authenticateToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('generateToken', () => {
    it('should generate valid JWT token', () => {
      const expectedToken = 'generated-token';
      (jwt.sign as jest.Mock).mockReturnValue(expectedToken);

      const token = generateToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 1, email: 'test@example.com' },
        'test-secret',
        { expiresIn: '7d' }
      );
      expect(token).toBe(expectedToken);
    });

    it('should throw error if JWT secret not configured', () => {
      delete process.env.JWT_SECRET;

      expect(() => generateToken(mockUser)).toThrow('JWT secret not configured');
    });

    it('should use default expiration if not configured', () => {
      delete process.env.JWT_EXPIRES_IN;
      const expectedToken = 'generated-token';
      (jwt.sign as jest.Mock).mockReturnValue(expectedToken);

      const token = generateToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 1, email: 'test@example.com' },
        'test-secret',
        { expiresIn: '7d' }
      );
    });
  });

  describe('optionalAuth', () => {
    it('should set user if valid token provided', async () => {
      const token = 'valid-token';
      const decoded = { userId: 1, email: 'test@example.com' };
      
      mockReq.headers = { authorization: `Bearer ${token}` };
      (jwt.verify as jest.Mock).mockReturnValue(decoded);
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      await optionalAuth(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toBe(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user if no token provided', async () => {
      mockReq.headers = {};

      await optionalAuth(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user if token is invalid', async () => {
      const token = 'invalid-token';
      mockReq.headers = { authorization: `Bearer ${token}` };
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      await optionalAuth(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user if user not found', async () => {
      const token = 'valid-token';
      const decoded = { userId: 999, email: 'nonexistent@example.com' };
      
      mockReq.headers = { authorization: `Bearer ${token}` };
      (jwt.verify as jest.Mock).mockReturnValue(decoded);
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await optionalAuth(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user if user is inactive', async () => {
      const token = 'valid-token';
      const decoded = { userId: 1, email: 'test@example.com' };
      const inactiveUser = { ...mockUser, isActive: false };
      
      mockReq.headers = { authorization: `Bearer ${token}` };
      (jwt.verify as jest.Mock).mockReturnValue(decoded);
      (User.findByPk as jest.Mock).mockResolvedValue(inactiveUser);

      await optionalAuth(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user if JWT secret not configured', async () => {
      delete process.env.JWT_SECRET;
      const token = 'valid-token';
      mockReq.headers = { authorization: `Bearer ${token}` };

      await optionalAuth(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
