import { Router, Response, Request } from 'express';
import { User } from '../models/User';
import { generateToken } from '../middleware/auth';
import { validateUserRegistration, validateUserLogin, handleValidationErrors } from '../middleware/validation';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';
import { Op } from 'sequelize';

const router = Router();

// Register new user
router.post('/register', 
  validateUserRegistration,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { email, username, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      throw createError('User with this email or username already exists', 409);
    }

    // Create new user
    const user = await User.create({
      email,
      username,
      passwordHash: password, // Will be hashed by the model hook
      firstName,
      lastName,
    });

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toJSON(),
    });
  })
);

// Login user
router.post('/login',
  validateUserLogin,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw createError('Account is deactivated', 401);
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw createError('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  })
);

// Get current user profile
router.get('/me', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // This route should be protected by auth middleware
  // The user will be available in req.user
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  res.json({
    user: req.user.toJSON(),
  });
}));

export default router;
