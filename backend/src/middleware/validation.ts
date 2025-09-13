import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
    return;
  }
  next();
};

// User registration validation
export const validateUserRegistration: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('username')
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-50 characters and contain only letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be 1-100 characters'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be 1-100 characters'),
];

// User login validation
export const validateUserLogin: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// League creation validation
export const validateLeagueCreation: ValidationChain[] = [
  body('name')
    .isLength({ min: 1, max: 200 })
    .withMessage('League name must be 1-200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 2, max: 100 })
    .withMessage('Max participants must be between 2 and 100'),
  body('entryFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Entry fee must be a positive number'),
  body('scoringType')
    .optional()
    .isIn(['confidence', 'straight', 'survivor'])
    .withMessage('Scoring type must be confidence, straight, or survivor'),
  body('seasonYear')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Season year must be between 2020 and 2030'),
];

// Pick submission validation
export const validatePickSubmission: ValidationChain[] = [
  body('gameId')
    .isInt({ min: 1 })
    .withMessage('Valid game ID is required'),
  body('pickedTeamId')
    .isInt({ min: 1 })
    .withMessage('Valid team ID is required'),
  body('pickType')
    .isIn(['spread', 'over_under', 'straight'])
    .withMessage('Pick type must be spread, over_under, or straight'),
  body('confidencePoints')
    .optional()
    .isInt({ min: 1, max: 16 })
    .withMessage('Confidence points must be between 1 and 16'),
];
