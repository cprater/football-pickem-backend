import { Router, Response, Request } from 'express';
import { League, User } from '../models';
import { authenticateToken } from '../middleware/auth';
import { validateLeagueCreation, handleValidationErrors } from '../middleware/validation';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Get all public leagues
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, seasonYear } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const whereClause: any = { isPublic: true, isActive: true };
  if (seasonYear) {
    whereClause.seasonYear = seasonYear;
  }

  const { count, rows: leagues } = await League.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'commissioner',
        attributes: ['id', 'username', 'firstName', 'lastName'],
      },
    ],
    limit: Number(limit),
    offset,
    order: [['createdAt', 'DESC']],
  });

  res.json({
    leagues,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
      pages: Math.ceil(count / Number(limit)),
    },
  });
}));

// Get league by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const league = await League.findByPk(id, {
    include: [
      {
        model: User,
        as: 'commissioner',
        attributes: ['id', 'username', 'firstName', 'lastName'],
      },
    ],
  });

  if (!league) {
    throw createError('League not found', 404);
  }

  res.json({ league });
}));

// Create new league
router.post('/',
  authenticateToken,
  validateLeagueCreation,
  handleValidationErrors,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { name, description, maxParticipants, entryFee, scoringType, seasonYear } = req.body;

    const league = await League.create({
      name,
      description,
      commissionerId: req.user!.id,
      maxParticipants: maxParticipants || 20,
      entryFee: entryFee || 0,
      scoringType: scoringType || 'confidence',
      seasonYear,
      leagueSettings: {
        scoringType: scoringType || 'confidence',
        maxParticipants: maxParticipants || 20,
        entryFee: entryFee || 0,
        allowLatePicks: false,
        tieBreaker: 'confidence',
      },
    });

    // Add commissioner as first participant
    await league.addParticipant(req.user!);

    const leagueWithCommissioner = await League.findByPk(league.id, {
      include: [
        {
          model: User,
          as: 'commissioner',
          attributes: ['id', 'username', 'firstName', 'lastName'],
        },
      ],
    });

    res.status(201).json({
      message: 'League created successfully',
      league: leagueWithCommissioner,
    });
  })
);

// Join league
router.post('/:id/join',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const league = await League.findByPk(id);
    if (!league) {
      throw createError('League not found', 404);
    }

    if (!league.isActive) {
      throw createError('League is not active', 400);
    }

    // Check if user is already a participant
    const existingParticipant = await league.hasParticipant(req.user!);
    if (existingParticipant) {
      throw createError('User is already a participant in this league', 409);
    }

    // Check if league is full
    const participantCount = await league.countParticipants();
    if (participantCount >= league.maxParticipants) {
      throw createError('League is full', 400);
    }

    // Add user to league
    await league.addParticipant(req.user!);

    res.json({
      message: 'Successfully joined league',
      league,
    });
  })
);

// Leave league
router.post('/:id/leave',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const league = await League.findByPk(id);
    if (!league) {
      throw createError('League not found', 404);
    }

    // Check if user is the commissioner
    if (league.commissionerId === req.user!.id) {
      throw createError('Commissioner cannot leave the league', 400);
    }

    // Check if user is a participant
    const isParticipant = await league.hasParticipant(req.user!);
    if (!isParticipant) {
      throw createError('User is not a participant in this league', 400);
    }

    // Remove user from league
    await league.removeParticipant(req.user!);

    res.json({
      message: 'Successfully left league',
    });
  })
);

// Get league participants
router.get('/:id/participants',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const league = await League.findByPk(id);
    if (!league) {
      throw createError('League not found', 404);
    }

    const participants = await league.getParticipants({
      attributes: ['id', 'username', 'firstName', 'lastName', 'avatarUrl'],
    });

    res.json({ participants });
  })
);

// Get league standings
router.get('/:id/standings',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { week } = req.query;

    const league = await League.findByPk(id);
    if (!league) {
      throw createError('League not found', 404);
    }

    // This would need to be implemented based on your standings calculation logic
    // For now, returning a placeholder
    res.json({
      message: 'Standings endpoint - to be implemented',
      leagueId: id,
      week: week || 'season',
    });
  })
);

export default router;
