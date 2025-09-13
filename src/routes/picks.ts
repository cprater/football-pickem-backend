import { Router, Response } from 'express';
import { Pick, Game, Team, League } from '../models';
import { authenticateToken } from '../middleware/auth';
import { validatePickSubmission, handleValidationErrors } from '../middleware/validation';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Get user's picks for current week
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

// Submit new pick
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

// Update existing pick
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

// Delete pick
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
