import { Request, Response, NextFunction } from 'express';
import { 
  createError, 
  errorHandler, 
  notFoundHandler, 
  asyncHandler,
  AppError 
} from '../../src/middleware/errorHandler';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('Error Handler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      url: '/test',
      method: 'GET',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-user-agent'),
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('createError', () => {
    it('should create error with default status code 500', () => {
      const error = createError('Test error');
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it('should create error with custom status code', () => {
      const error = createError('Not found', 404);
      
      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });

    it('should create operational error', () => {
      const error = createError('Bad request', 400);
      
      expect(error.isOperational).toBe(true);
    });
  });

  describe('errorHandler', () => {
    it('should handle generic error with default status code', () => {
      const error = new Error('Generic error');
      
      errorHandler(error as AppError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Generic error',
      });
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle error with custom status code', () => {
      const error = createError('Custom error', 400);
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Custom error',
      });
    });

    it('should handle ValidationError', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      
      errorHandler(error as AppError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
      });
    });

    it('should handle CastError', () => {
      const error = new Error('Invalid ID');
      error.name = 'CastError';
      
      errorHandler(error as AppError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid ID format',
      });
    });

    it('should handle JsonWebTokenError', () => {
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';
      
      errorHandler(error as AppError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid token',
      });
    });

    it('should handle TokenExpiredError', () => {
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      
      errorHandler(error as AppError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token expired',
      });
    });

    it('should handle SequelizeUniqueConstraintError', () => {
      const error = new Error('Duplicate entry');
      error.name = 'SequelizeUniqueConstraintError';
      
      errorHandler(error as AppError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Resource already exists',
      });
    });

    it('should handle SequelizeValidationError', () => {
      const error = new Error('Validation failed');
      error.name = 'SequelizeValidationError';
      
      errorHandler(error as AppError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
      });
    });

    it('should handle SequelizeForeignKeyConstraintError', () => {
      const error = new Error('Foreign key constraint');
      error.name = 'SequelizeForeignKeyConstraintError';
      
      errorHandler(error as AppError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid reference',
      });
    });

    it('should hide error details in production for non-operational errors', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const error = new Error('Sensitive error details');
      (error as any).isOperational = false;
      
      errorHandler(error as AppError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Something went wrong',
      });
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should show error details in production for operational errors', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const error = createError('Operational error', 400);
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Operational error',
      });
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should log error details for debugging', () => {
      const error = new Error('Test error');
      
      errorHandler(error as AppError, mockReq as Request, mockRes as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('Error:', {
        message: 'Test error',
        stack: expect.any(String),
        url: '/test',
        method: 'GET',
        ip: '127.0.0.1',
        userAgent: 'test-user-agent',
      });
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 with route information', () => {
      mockReq.url = '/test';
      notFoundHandler(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Route not found',
        path: '/test',
        method: 'GET',
      });
    });

    it('should handle different routes and methods', () => {
      mockReq.url = '/api/v1/users';
      mockReq.method = 'POST';
      
      notFoundHandler(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Route not found',
        path: '/api/v1/users',
        method: 'POST',
      });
    });
  });

  describe('asyncHandler', () => {
    it('should call next with error if async function throws', async () => {
      const asyncFn = jest.fn().mockRejectedValue(new Error('Async error'));
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should not call next if async function succeeds', async () => {
      const asyncFn = jest.fn().mockResolvedValue(undefined);
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle synchronous function that throws', async () => {
      const syncFn = jest.fn().mockImplementation(() => {
        throw new Error('Sync error');
      });
      const wrappedFn = asyncHandler(syncFn);

      try {
        await wrappedFn(mockReq as Request, mockRes as Response, mockNext);
      } catch (error) {
        // Expected to throw
      }

      expect(syncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    });

    it('should handle synchronous function that succeeds', async () => {
      const syncFn = jest.fn().mockReturnValue(undefined);
      const wrappedFn = asyncHandler(syncFn);

      await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

      expect(syncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Error Logging', () => {
    it('should log comprehensive error information', () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      
      errorHandler(error as AppError, mockReq as Request, mockRes as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('Error:', {
        message: 'Test error',
        stack: 'Error stack trace',
        url: '/test',
        method: 'GET',
        ip: '127.0.0.1',
        userAgent: 'test-user-agent',
      });
    });

    it('should handle missing request properties gracefully', () => {
      const error = new Error('Test error');
      const minimalReq = {
        method: 'GET',
        url: '/test',
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-user-agent'),
      } as any;
      
      errorHandler(error as AppError, minimalReq, mockRes as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('Error:', {
        message: 'Test error',
        stack: expect.any(String),
        url: '/test',
        method: 'GET',
        ip: '127.0.0.1',
        userAgent: 'test-user-agent',
      });
    });
  });
});
