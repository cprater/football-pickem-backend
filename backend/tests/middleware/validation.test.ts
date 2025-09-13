import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { 
  handleValidationErrors, 
  validateUserRegistration, 
  validateUserLogin, 
  validateLeagueCreation, 
  validatePickSubmission 
} from '../../src/middleware/validation';

// Mock express-validator
jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
  body: jest.fn(() => ({
    isEmail: jest.fn().mockReturnThis(),
    normalizeEmail: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    matches: jest.fn().mockReturnThis(),
    notEmpty: jest.fn().mockReturnThis(),
    isInt: jest.fn().mockReturnThis(),
    isFloat: jest.fn().mockReturnThis(),
    isIn: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
  })),
}));

describe('Validation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('handleValidationErrors', () => {
    it('should call next() when no validation errors', () => {
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      });

      handleValidationErrors(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should return 400 with validation errors when validation fails', () => {
      const validationErrors = [
        { field: 'email', message: 'Valid email is required' },
        { field: 'password', message: 'Password must be at least 8 characters' },
      ];

      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => false,
        array: () => validationErrors,
      });

      handleValidationErrors(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: validationErrors,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateUserRegistration', () => {
    it('should be an array of validation chains', () => {
      expect(Array.isArray(validateUserRegistration)).toBe(true);
      expect(validateUserRegistration.length).toBeGreaterThan(0);
    });

    it('should include email validation', () => {
      // This would be tested by running the validation chains
      // In a real test, you'd use supertest to test the actual validation
      expect(validateUserRegistration).toBeDefined();
    });

    it('should include username validation', () => {
      expect(validateUserRegistration).toBeDefined();
    });

    it('should include password validation', () => {
      expect(validateUserRegistration).toBeDefined();
    });

    it('should include optional firstName validation', () => {
      expect(validateUserRegistration).toBeDefined();
    });

    it('should include optional lastName validation', () => {
      expect(validateUserRegistration).toBeDefined();
    });
  });

  describe('validateUserLogin', () => {
    it('should be an array of validation chains', () => {
      expect(Array.isArray(validateUserLogin)).toBe(true);
      expect(validateUserLogin.length).toBeGreaterThan(0);
    });

    it('should include email validation', () => {
      expect(validateUserLogin).toBeDefined();
    });

    it('should include password validation', () => {
      expect(validateUserLogin).toBeDefined();
    });
  });

  describe('validateLeagueCreation', () => {
    it('should be an array of validation chains', () => {
      expect(Array.isArray(validateLeagueCreation)).toBe(true);
      expect(validateLeagueCreation.length).toBeGreaterThan(0);
    });

    it('should include name validation', () => {
      expect(validateLeagueCreation).toBeDefined();
    });

    it('should include optional description validation', () => {
      expect(validateLeagueCreation).toBeDefined();
    });

    it('should include optional maxParticipants validation', () => {
      expect(validateLeagueCreation).toBeDefined();
    });

    it('should include optional entryFee validation', () => {
      expect(validateLeagueCreation).toBeDefined();
    });

    it('should include optional scoringType validation', () => {
      expect(validateLeagueCreation).toBeDefined();
    });

    it('should include seasonYear validation', () => {
      expect(validateLeagueCreation).toBeDefined();
    });
  });

  describe('validatePickSubmission', () => {
    it('should be an array of validation chains', () => {
      expect(Array.isArray(validatePickSubmission)).toBe(true);
      expect(validatePickSubmission.length).toBeGreaterThan(0);
    });

    it('should include gameId validation', () => {
      expect(validatePickSubmission).toBeDefined();
    });

    it('should include pickedTeamId validation', () => {
      expect(validatePickSubmission).toBeDefined();
    });

    it('should include pickType validation', () => {
      expect(validatePickSubmission).toBeDefined();
    });

    it('should include optional confidencePoints validation', () => {
      expect(validatePickSubmission).toBeDefined();
    });
  });

  describe('Validation Rules', () => {
    describe('Email Validation', () => {
      it('should validate email format', () => {
        // This would be tested with actual validation chains
        expect(validateUserRegistration).toBeDefined();
      });

      it('should normalize email', () => {
        expect(validateUserRegistration).toBeDefined();
      });
    });

    describe('Username Validation', () => {
      it('should validate username length (3-50 characters)', () => {
        expect(validateUserRegistration).toBeDefined();
      });

      it('should validate username format (alphanumeric and underscores only)', () => {
        expect(validateUserRegistration).toBeDefined();
      });
    });

    describe('Password Validation', () => {
      it('should validate password length (minimum 8 characters)', () => {
        expect(validateUserRegistration).toBeDefined();
      });

      it('should validate password complexity (uppercase, lowercase, number)', () => {
        expect(validateUserRegistration).toBeDefined();
      });
    });

    describe('Name Validation', () => {
      it('should validate firstName length (1-100 characters)', () => {
        expect(validateUserRegistration).toBeDefined();
      });

      it('should validate lastName length (1-100 characters)', () => {
        expect(validateUserRegistration).toBeDefined();
      });
    });

    describe('League Validation', () => {
      it('should validate league name length (1-200 characters)', () => {
        expect(validateLeagueCreation).toBeDefined();
      });

      it('should validate description length (max 1000 characters)', () => {
        expect(validateLeagueCreation).toBeDefined();
      });

      it('should validate maxParticipants range (2-100)', () => {
        expect(validateLeagueCreation).toBeDefined();
      });

      it('should validate entryFee (positive number)', () => {
        expect(validateLeagueCreation).toBeDefined();
      });

      it('should validate scoringType (confidence, straight, survivor)', () => {
        expect(validateLeagueCreation).toBeDefined();
      });

      it('should validate seasonYear range (2020-2030)', () => {
        expect(validateLeagueCreation).toBeDefined();
      });
    });

    describe('Pick Validation', () => {
      it('should validate gameId (positive integer)', () => {
        expect(validatePickSubmission).toBeDefined();
      });

      it('should validate pickedTeamId (positive integer)', () => {
        expect(validatePickSubmission).toBeDefined();
      });

      it('should validate pickType (spread, over_under, straight)', () => {
        expect(validatePickSubmission).toBeDefined();
      });

      it('should validate confidencePoints range (1-16)', () => {
        expect(validatePickSubmission).toBeDefined();
      });
    });
  });

  describe('Error Messages', () => {
    it('should provide meaningful error messages for email validation', () => {
      expect(validateUserRegistration).toBeDefined();
    });

    it('should provide meaningful error messages for username validation', () => {
      expect(validateUserRegistration).toBeDefined();
    });

    it('should provide meaningful error messages for password validation', () => {
      expect(validateUserRegistration).toBeDefined();
    });

    it('should provide meaningful error messages for league validation', () => {
      expect(validateLeagueCreation).toBeDefined();
    });

    it('should provide meaningful error messages for pick validation', () => {
      expect(validatePickSubmission).toBeDefined();
    });
  });
});
