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
 * /api/v1/leagues/my-leagues:
 *   get:
 *     summary: Get user's leagues (leagues they're participating in)
 *     tags: [Leagues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: seasonYear
 *         schema:
 *           type: integer
 *         description: Filter by season year
 *         example: 2024
 *     responses:
 *       200:
 *         description: User's leagues retrieved successfully
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
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/my-leagues',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { seasonYear } = req.query;
    const userId = req.user!.id;

    const whereClause: any = { isActive: true };
    if (seasonYear) {
      whereClause.seasonYear = seasonYear;
    }

    // Get leagues where the user is a participant
    const user = await User.findByPk(userId, {
      include: [
        {
          model: League,
          as: 'leagues',
          where: whereClause,
          include: [
            {
              model: User,
              as: 'commissioner',
              attributes: ['id', 'username', 'firstName', 'lastName'],
            },
          ],
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      leagues: (user as any).leagues || [],
    });
  })
);

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
    const { name, description, maxParticipants, entryFee, scoringType, seasonYear, isPublic } = req.body;

    const league = await League.create({
      name,
      description,
      commissionerId: req.user!.id,
      maxParticipants: maxParticipants || 20,
      entryFee: entryFee || 0,
      scoringType: scoringType || 'confidence',
      seasonYear,
      isPublic: isPublic !== undefined ? isPublic : true,
      leagueSettings: {
        scoringType: scoringType || 'confidence',
        maxParticipants: maxParticipants || 20,
        entryFee: entryFee || 0,
        allowLatePicks: false,
        tieBreaker: 'confidence',
      },
    });

    // Add commissioner as first participant
    await (league as any).addParticipant(req.user!);

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
    const existingParticipant = await (league as any).countParticipants({ where: { id: req.user!.id } }) > 0;
    if (existingParticipant) {
      throw createError('User is already a participant in this league', 409);
    }

    // Check if league is full
    const participantCount = await (league as any).countParticipants();
    if (participantCount >= league.maxParticipants) {
      throw createError('League is full', 400);
    }

    // Add user to league
    await (league as any).addParticipant(req.user!);

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
    const isParticipant = await (league as any).countParticipants({ where: { id: req.user!.id } }) > 0;
    if (!isParticipant) {
      throw createError('User is not a participant in this league', 400);
    }

    // Remove user from league
    await (league as any).removeParticipant(req.user!);

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

    const participants = await (league as any).getParticipants({
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
 *         description: Week number for weekly standings (optional)
 *         example: 1
 *     responses:
 *       200:
 *         description: Standings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 standings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: integer
 *                         description: User ID
 *                         example: 1
 *                       user:
 *                         $ref: '#/components/schemas/User'
 *                       totalPoints:
 *                         type: number
 *                         description: Total points earned
 *                         example: 45
 *                       correctPicks:
 *                         type: integer
 *                         description: Number of correct picks
 *                         example: 12
 *                       totalPicks:
 *                         type: integer
 *                         description: Total number of picks made
 *                         example: 16
 *                       winPercentage:
 *                         type: number
 *                         description: Win percentage (0-1)
 *                         example: 0.75
 *                       rank:
 *                         type: integer
 *                         description: Current rank in standings
 *                         example: 1
 *                       weeklyPoints:
 *                         type: object
 *                         description: Points earned per week
 *                         additionalProperties:
 *                           type: number
 *                         example: {"1": 3, "2": 5, "3": 2}
 *                 week:
 *                   type: integer
 *                   description: Week number (if filtering by week)
 *                   example: 1
 *                 leagueId:
 *                   type: integer
 *                   description: League ID
 *                   example: 1
 *                 scoringType:
 *                   type: string
 *                   enum: [confidence, straight, survivor]
 *                   description: League scoring type
 *                   example: "confidence"
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

    const { Pick, Game, Team, User } = await import('../models');
    
    // Get all participants in the league
    const participants = await (league as any).getParticipants({
      attributes: ['id', 'username', 'firstName', 'lastName', 'avatarUrl'],
    });

    // Build where clause for picks
    const picksWhereClause: any = { leagueId: id };
    
    // Build where clause for games (if filtering by week)
    const gamesWhereClause: any = {};
    if (week) {
      gamesWhereClause.week = Number(week);
    }

    // Get all picks for the league with game and user data
    const picks = await Pick.findAll({
      where: picksWhereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatarUrl'],
        },
        {
          model: Game,
          as: 'game',
          where: Object.keys(gamesWhereClause).length > 0 ? gamesWhereClause : undefined,
          include: [
            {
              model: Team,
              as: 'homeTeam',
              attributes: ['id', 'name', 'city', 'abbreviation'],
            },
            {
              model: Team,
              as: 'awayTeam',
              attributes: ['id', 'name', 'city', 'abbreviation'],
            },
          ],
        },
        {
          model: Team,
          as: 'pickedTeam',
          attributes: ['id', 'name', 'city', 'abbreviation'],
        },
      ],
    });

    // Calculate standings for each participant
    const standingsMap = new Map();
    
    // Initialize standings for all participants
    participants.forEach((participant: any) => {
      standingsMap.set(participant.id, {
        userId: participant.id,
        user: participant,
        totalPoints: 0,
        correctPicks: 0,
        totalPicks: 0,
        winPercentage: 0,
        weeklyPoints: {},
      });
    });

    // Process picks and calculate points
    picks.forEach((pick: any) => {
      const userId = pick.userId;
      const game = pick.game;
      const pickedTeam = pick.pickedTeam;
      
      if (!game || !pickedTeam) return;

      const standing = standingsMap.get(userId);
      if (!standing) return;

      standing.totalPicks++;

      // Calculate if pick is correct
      let isCorrect = false;
      if (game.status === 'final' && game.homeScore !== null && game.awayScore !== null) {
        const homeScore = game.homeScore;
        const awayScore = game.awayScore;
        
        // Determine the winning team
        let winningTeamId;
        if (homeScore > awayScore) {
          winningTeamId = game.homeTeamId;
        } else if (awayScore > homeScore) {
          winningTeamId = game.awayTeamId;
        } else {
          // Tie game - no winner
          winningTeamId = null;
        }

        // Check if pick is correct
        if (winningTeamId && pickedTeam.id === winningTeamId) {
          isCorrect = true;
          standing.correctPicks++;
        }
      }

      // Calculate points based on league scoring type
      let points = 0;
      if (isCorrect) {
        switch (league.scoringType) {
          case 'confidence':
            // Use confidence points if available, otherwise 1 point
            points = pick.confidencePoints || 1;
            break;
          case 'straight':
            // 1 point per correct pick
            points = 1;
            break;
          case 'survivor':
            // In survivor, you get points until you're eliminated
            // For now, treat as straight scoring
            points = 1;
            break;
          default:
            points = 1;
        }
      }

      standing.totalPoints += points;

      // Track weekly points
      if (game.week) {
        if (!standing.weeklyPoints[game.week]) {
          standing.weeklyPoints[game.week] = 0;
        }
        standing.weeklyPoints[game.week] += points;
      }
    });

    // Calculate win percentage and convert to array
    const standings = Array.from(standingsMap.values()).map(standing => {
      standing.winPercentage = standing.totalPicks > 0 ? standing.correctPicks / standing.totalPicks : 0;
      return standing;
    });

    // Sort standings by total points (descending), then by correct picks (descending), then by win percentage (descending)
    standings.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      if (b.correctPicks !== a.correctPicks) {
        return b.correctPicks - a.correctPicks;
      }
      return b.winPercentage - a.winPercentage;
    });

    // Add rank to each standing
    standings.forEach((standing, index) => {
      standing.rank = index + 1;
    });

    res.json({
      standings,
      week: week ? Number(week) : undefined,
      leagueId: id,
      scoringType: league.scoringType,
    });
  })
);

/**
 * @swagger
 * /api/v1/leagues/{id}/picks:
 *   get:
 *     summary: Get all picks for a league
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
 *         description: Week number to filter picks
 *         example: 1
 *     responses:
 *       200:
 *         description: League picks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 picks:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Pick'
 *                       - type: object
 *                         properties:
 *                           user:
 *                             $ref: '#/components/schemas/User'
 *                           game:
 *                             allOf:
 *                               - $ref: '#/components/schemas/Game'
 *                               - type: object
 *                                 properties:
 *                                   homeTeam:
 *                                     $ref: '#/components/schemas/Team'
 *                                   awayTeam:
 *                                     $ref: '#/components/schemas/Team'
 *                           pickedTeam:
 *                             $ref: '#/components/schemas/Team'
 *       404:
 *         description: League not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id/picks',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { week } = req.query;

    const league = await League.findByPk(id);
    if (!league) {
      throw createError('League not found', 404);
    }

    const { Pick, Game, Team, User } = await import('../models');
    
    const whereClause: any = { leagueId: id };
    
    const picks = await Pick.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatarUrl'],
        },
        {
          model: Game,
          as: 'game',
          where: week ? { week: Number(week) } : undefined,
          include: [
            {
              model: Team,
              as: 'homeTeam',
              attributes: ['id', 'name', 'city', 'abbreviation', 'logoUrl'],
            },
            {
              model: Team,
              as: 'awayTeam',
              attributes: ['id', 'name', 'city', 'abbreviation', 'logoUrl'],
            },
          ],
        },
        {
          model: Team,
          as: 'pickedTeam',
          attributes: ['id', 'name', 'city', 'abbreviation', 'logoUrl'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ picks });
  })
);

/**
 * @swagger
 * /api/v1/leagues/{id}/admin/remove-participant:
 *   post:
 *     summary: Remove participant from league (commissioner only)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of user to remove
 *                 example: 2
 *     responses:
 *       200:
 *         description: Participant removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Participant removed successfully"
 *       403:
 *         description: User is not the commissioner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: League or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/admin/remove-participant',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { userId } = req.body;
    const currentUserId = req.user!.id;

    const league = await League.findByPk(id);
    if (!league) {
      throw createError('League not found', 404);
    }

    // Check if current user is the commissioner
    if (league.commissionerId !== currentUserId) {
      throw createError('Only the commissioner can remove participants', 403);
    }

    // Check if trying to remove the commissioner
    if (Number(userId) === league.commissionerId) {
      throw createError('Cannot remove the commissioner from the league', 400);
    }

    const userToRemove = await User.findByPk(userId);
    if (!userToRemove) {
      throw createError('User not found', 404);
    }

    // Remove the participant
    await (league as any).removeParticipant(userToRemove);

    res.json({
      message: 'Participant removed successfully',
    });
  })
);

/**
 * @swagger
 * /api/v1/leagues/{id}/admin/update-settings:
 *   put:
 *     summary: Update league settings (commissioner only)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: League name
 *                 example: "Updated League Name"
 *               description:
 *                 type: string
 *                 description: League description
 *                 example: "Updated description"
 *               maxParticipants:
 *                 type: integer
 *                 description: Maximum participants
 *                 example: 25
 *               entryFee:
 *                 type: number
 *                 description: Entry fee
 *                 example: 50.00
 *               scoringType:
 *                 type: string
 *                 enum: [confidence, straight, survivor]
 *                 description: Scoring type
 *                 example: "confidence"
 *               isPublic:
 *                 type: boolean
 *                 description: Whether league is public
 *                 example: true
 *     responses:
 *       200:
 *         description: League settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "League settings updated successfully"
 *                 league:
 *                   $ref: '#/components/schemas/League'
 *       403:
 *         description: User is not the commissioner
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
router.put('/:id/admin/update-settings',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const currentUserId = req.user!.id;
    const updateData = req.body;

    const league = await League.findByPk(id);
    if (!league) {
      throw createError('League not found', 404);
    }

    // Check if current user is the commissioner
    if (league.commissionerId !== currentUserId) {
      throw createError('Only the commissioner can update league settings', 403);
    }

    // Update the league
    await league.update(updateData);

    // Fetch updated league with associations
    const updatedLeague = await League.findByPk(id, {
      include: [
        {
          model: User,
          as: 'commissioner',
          attributes: ['id', 'username', 'firstName', 'lastName'],
        },
      ],
    });

    res.json({
      message: 'League settings updated successfully',
      league: updatedLeague,
    });
  })
);

export default router;
