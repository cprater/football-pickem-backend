import { Router, Response, Request } from 'express';
import { Game, Team } from '../models';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * /api/v1/games:
 *   get:
 *     summary: Get games for current or specified week/season
 *     tags: [Games]
 *     parameters:
 *       - in: query
 *         name: week
 *         schema:
 *           type: integer
 *         description: Week number (optional)
 *         example: 1
 *       - in: query
 *         name: seasonYear
 *         schema:
 *           type: integer
 *         description: Season year (defaults to current year)
 *         example: 2024
 *     responses:
 *       200:
 *         description: Games retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 games:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Game'
 *                       - type: object
 *                         properties:
 *                           homeTeam:
 *                             $ref: '#/components/schemas/Team'
 *                           awayTeam:
 *                             $ref: '#/components/schemas/Team'
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { week, seasonYear = new Date().getFullYear() } = req.query;

  const whereClause: any = { seasonYear: Number(seasonYear) };
  if (week) {
    whereClause.week = Number(week);
  }

  const games = await Game.findAll({
    where: whereClause,
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
    order: [['gameDate', 'ASC']],
  });

  res.json({ games });
}));

/**
 * @swagger
 * /api/v1/games/week/{week}:
 *   get:
 *     summary: Get games for specific week
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: week
 *         required: true
 *         schema:
 *           type: integer
 *         description: Week number
 *         example: 1
 *       - in: query
 *         name: seasonYear
 *         schema:
 *           type: integer
 *         description: Season year (defaults to current year)
 *         example: 2024
 *     responses:
 *       200:
 *         description: Games retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 games:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Game'
 *                       - type: object
 *                         properties:
 *                           homeTeam:
 *                             $ref: '#/components/schemas/Team'
 *                           awayTeam:
 *                             $ref: '#/components/schemas/Team'
 */
router.get('/week/:week', asyncHandler(async (req: Request, res: Response) => {
  const { week } = req.params;
  const { seasonYear = new Date().getFullYear() } = req.query;

  const games = await Game.findAll({
    where: {
      week: Number(week),
      seasonYear: Number(seasonYear),
    },
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
    order: [['gameDate', 'ASC']],
  });

  res.json({ games });
}));

/**
 * @swagger
 * /api/v1/games/{id}:
 *   get:
 *     summary: Get specific game by ID
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Game ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Game retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 game:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Game'
 *                     - type: object
 *                       properties:
 *                         homeTeam:
 *                           $ref: '#/components/schemas/Team'
 *                         awayTeam:
 *                           $ref: '#/components/schemas/Team'
 *       404:
 *         description: Game not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const game = await Game.findByPk(id, {
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
  });

  if (!game) {
    throw createError('Game not found', 404);
  }

  res.json({ game });
}));

/**
 * @swagger
 * /api/v1/games/teams/all:
 *   get:
 *     summary: Get all teams
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Teams retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teams:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Team'
 */
router.get('/teams/all', asyncHandler(async (req: Request, res: Response) => {
  const teams = await Team.findAll({
    order: [['conference', 'ASC'], ['division', 'ASC'], ['name', 'ASC']],
  });

  res.json({ teams });
}));

export default router;
