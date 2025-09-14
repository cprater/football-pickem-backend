import { Router, Response, Request } from 'express';
import { League, User } from '../models';
import { authenticateToken } from '../middleware/auth';
import { validateLeagueCreation, handleValidationErrors } from '../middleware/validation';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';

const router = Router();

/**
 * @swagger
 * /api/v1/leagues:
 *   get:
 *     summary: Get all public leagues
 *     tags: [Leagues]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of leagues per page
 *         example: 10
 *       - in: query
 *         name: seasonYear
 *         schema:
 *           type: integer
 *         description: Filter by season year
 *         example: 2024
 *     responses:
 *       200:
 *         description: Leagues retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 leagues:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/League'
 *                       - type: object
 *                         properties:
 *                           commissioner:
 *                             $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
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

/**
 * @swagger
 * /api/v1/leagues/{id}:
 *   get:
 *     summary: Get league by ID
 *     tags: [Leagues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: League ID
 *         example: 1
 *     responses:
 *       200:
 *         description: League retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 league:
 *                   allOf:
 *                     - $ref: '#/components/schemas/League'
 *                     - type: object
 *                       properties:
 *                         commissioner:
 *                           $ref: '#/components/schemas/User'
 *       404:
 *         description: League not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/v1/leagues:
 *   post:
 *     summary: Create new league
 *     tags: [Leagues]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - seasonYear
 *             properties:
 *               name:
 *                 type: string
 *                 description: League name
 *                 example: "My Fantasy League"
 *               description:
 *                 type: string
 *                 description: League description
 *                 example: "A competitive fantasy football league"
 *               maxParticipants:
 *                 type: integer
 *                 description: Maximum number of participants
 *                 example: 20
 *               entryFee:
 *                 type: number
 *                 description: Entry fee for the league
 *                 example: 25.00
 *               scoringType:
 *                 type: string
 *                 enum: [confidence, straight, survivor]
 *                 description: Type of scoring system
 *                 example: "confidence"
 *               seasonYear:
 *                 type: integer
 *                 description: Season year
 *                 example: 2024
 *     responses:
 *       201:
 *         description: League created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "League created successfully"
 *                 league:
 *                   allOf:
 *                     - $ref: '#/components/schemas/League'
 *                     - type: object
 *                       properties:
 *                         commissioner:
 *                           $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/v1/leagues/{id}/join:
 *   post:
 *     summary: Join a league
 *     tags: [Leagues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: League ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Successfully joined league
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully joined league"
 *                 league:
 *                   $ref: '#/components/schemas/League'
 *       400:
 *         description: League is not active or full
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: League not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User is already a participant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/v1/leagues/{id}/leave:
 *   post:
 *     summary: Leave a league
 *     tags: [Leagues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: League ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Successfully left league
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully left league"
 *       400:
 *         description: Commissioner cannot leave or user is not a participant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: League not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/v1/leagues/{id}/participants:
 *   get:
 *     summary: Get league participants
 *     tags: [Leagues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: League ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Participants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 participants:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       404:
 *         description: League not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/v1/leagues/{id}/standings:
 *   get:
 *     summary: Get league standings
 *     tags: [Leagues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: League ID
 *         example: 1
 *       - in: query
 *         name: week
 *         schema:
 *           type: integer
 *         description: Week number for weekly standings
 *         example: 1
 *     responses:
 *       200:
 *         description: Standings retrieved successfully (placeholder implementation)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Standings endpoint - to be implemented"
 *                 leagueId:
 *                   type: string
 *                   example: "1"
 *                 week:
 *                   type: string
 *                   example: "season"
 *       404:
 *         description: League not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
