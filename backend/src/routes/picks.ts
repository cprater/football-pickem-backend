import { Router, Response } from 'express';
import { Pick, Game, Team, League } from '../models';
import { authenticateToken } from '../middleware/auth';
import { validatePickSubmission, handleValidationErrors } from '../middleware/validation';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';

const router = Router();

/**
 * @swagger
 * /api/v1/picks:
 *   get:
 *     summary: Get user's picks
 *     tags: [Picks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: week
 *         schema:
 *           type: integer
 *         description: Week number to filter picks
 *         example: 1
 *       - in: query
 *         name: leagueId
 *         schema:
 *           type: integer
 *         description: League ID to filter picks
 *         example: 1
 *     responses:
 *       200:
 *         description: Picks retrieved successfully
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
 *                           league:
 *                             $ref: '#/components/schemas/League'
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { week, leagueId } = req.query;
    const userId = req.user!.id;

    const whereClause: any = { userId };
    if (leagueId) {
      whereClause.leagueId = leagueId;
    }

    const picks = await Pick.findAll({
      where: whereClause,
      include: [
        {
          model: Game,
          as: 'game',
          where: week ? { week: Number(week) } : undefined,
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
        {
          model: League,
          as: 'league',
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ picks });
  })
);

/**
 * @swagger
 * /api/v1/picks:
 *   post:
 *     summary: Submit new pick
 *     tags: [Picks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gameId
 *               - pickedTeamId
 *               - pickType
 *               - leagueId
 *             properties:
 *               gameId:
 *                 type: integer
 *                 description: ID of the game
 *                 example: 1
 *               pickedTeamId:
 *                 type: integer
 *                 description: ID of the team picked
 *                 example: 1
 *               pickType:
 *                 type: string
 *                 enum: [spread, over_under, straight]
 *                 description: Type of pick
 *                 example: "spread"
 *               confidencePoints:
 *                 type: integer
 *                 description: Confidence points (1-16)
 *                 example: 10
 *               leagueId:
 *                 type: integer
 *                 description: ID of the league
 *                 example: 1
 *     responses:
 *       201:
 *         description: Pick submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Pick submitted successfully"
 *                 pick:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Pick'
 *                     - type: object
 *                       properties:
 *                         game:
 *                           allOf:
 *                             - $ref: '#/components/schemas/Game'
 *                             - type: object
 *                               properties:
 *                                 homeTeam:
 *                                   $ref: '#/components/schemas/Team'
 *                                 awayTeam:
 *                                   $ref: '#/components/schemas/Team'
 *                         pickedTeam:
 *                           $ref: '#/components/schemas/Team'
 *                         league:
 *                           $ref: '#/components/schemas/League'
 *       400:
 *         description: Validation error or game has started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: User is not a participant in the league
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Game or league not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Pick already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/',
  authenticateToken,
  validatePickSubmission,
  handleValidationErrors,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { gameId, pickedTeamId, pickType, confidencePoints, leagueId } = req.body;
    const userId = req.user!.id;

    // Verify the game exists and is not locked
    const game = await Game.findByPk(gameId);
    if (!game) {
      throw createError('Game not found', 404);
    }

    // Check if game has already started (basic validation)
    const now = new Date();
    if (game.gameDate <= now) {
      throw createError('Cannot submit picks for games that have already started', 400);
    }

    // Verify the picked team is playing in this game
    if (pickedTeamId !== game.homeTeamId && pickedTeamId !== game.awayTeamId) {
      throw createError('Picked team is not playing in this game', 400);
    }

    // Check if user is a participant in the league
    const league = await League.findByPk(leagueId);
    if (!league) {
      throw createError('League not found', 404);
    }

    const isParticipant = await league.hasParticipant(req.user!);
    if (!isParticipant) {
      throw createError('User is not a participant in this league', 403);
    }

    // Check if pick already exists
    const existingPick = await Pick.findOne({
      where: {
        userId,
        leagueId,
        gameId,
        pickType,
      },
    });

    if (existingPick) {
      throw createError('Pick already exists for this game and type', 409);
    }

    // Create the pick
    const pick = await Pick.create({
      userId,
      leagueId,
      gameId,
      pickedTeamId,
      pickType,
      confidencePoints,
    });

    // Fetch the complete pick with associations
    const completePick = await Pick.findByPk(pick.id, {
      include: [
        {
          model: Game,
          as: 'game',
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
        {
          model: League,
          as: 'league',
          attributes: ['id', 'name'],
        },
      ],
    });

    res.status(201).json({
      message: 'Pick submitted successfully',
      pick: completePick,
    });
  })
);

/**
 * @swagger
 * /api/v1/picks/{id}:
 *   put:
 *     summary: Update existing pick
 *     tags: [Picks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pick ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pickedTeamId
 *             properties:
 *               pickedTeamId:
 *                 type: integer
 *                 description: ID of the team picked
 *                 example: 2
 *               confidencePoints:
 *                 type: integer
 *                 description: Confidence points (1-16)
 *                 example: 12
 *     responses:
 *       200:
 *         description: Pick updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Pick updated successfully"
 *                 pick:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Pick'
 *                     - type: object
 *                       properties:
 *                         game:
 *                           allOf:
 *                             - $ref: '#/components/schemas/Game'
 *                             - type: object
 *                               properties:
 *                                 homeTeam:
 *                                   $ref: '#/components/schemas/Team'
 *                                 awayTeam:
 *                                   $ref: '#/components/schemas/Team'
 *                         pickedTeam:
 *                           $ref: '#/components/schemas/Team'
 *                         league:
 *                           $ref: '#/components/schemas/League'
 *       400:
 *         description: Validation error or game has started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Unauthorized to update this pick
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Pick not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id',
  authenticateToken,
  validatePickSubmission,
  handleValidationErrors,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { pickedTeamId, confidencePoints } = req.body;
    const userId = req.user!.id;

    const pick = await Pick.findByPk(id, {
      include: [
        {
          model: Game,
          as: 'game',
        },
      ],
    });

    if (!pick) {
      throw createError('Pick not found', 404);
    }

    if (pick.userId !== userId) {
      throw createError('Unauthorized to update this pick', 403);
    }

    // Check if game has already started
    const now = new Date();
    if (pick.game && pick.game.gameDate <= now) {
      throw createError('Cannot update picks for games that have already started', 400);
    }

    // Verify the picked team is playing in this game
    if (pick.game && pickedTeamId !== pick.game.homeTeamId && pickedTeamId !== pick.game.awayTeamId) {
      throw createError('Picked team is not playing in this game', 400);
    }

    // Update the pick
    await pick.update({
      pickedTeamId,
      confidencePoints,
    });

    // Fetch the updated pick with associations
    const updatedPick = await Pick.findByPk(pick.id, {
      include: [
        {
          model: Game,
          as: 'game',
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
        {
          model: League,
          as: 'league',
          attributes: ['id', 'name'],
        },
      ],
    });

    res.json({
      message: 'Pick updated successfully',
      pick: updatedPick,
    });
  })
);

/**
 * @swagger
 * /api/v1/picks/{id}:
 *   delete:
 *     summary: Delete pick
 *     tags: [Picks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pick ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Pick deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Pick deleted successfully"
 *       400:
 *         description: Game has already started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Unauthorized to delete this pick
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Pick not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const pick = await Pick.findByPk(id, {
      include: [
        {
          model: Game,
          as: 'game',
        },
      ],
    });

    if (!pick) {
      throw createError('Pick not found', 404);
    }

    if (pick.userId !== userId) {
      throw createError('Unauthorized to delete this pick', 403);
    }

    // Check if game has already started
    const now = new Date();
    if (pick.game && pick.game.gameDate <= now) {
      throw createError('Cannot delete picks for games that have already started', 400);
    }

    await pick.destroy();

    res.json({
      message: 'Pick deleted successfully',
    });
  })
);

export default router;
