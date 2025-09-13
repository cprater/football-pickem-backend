import { Router, Response, Request } from 'express';
import { Game, Team } from '../models';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = Router();

// Get games for current week
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

// Get games for specific week
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

// Get specific game
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

// Get all teams
router.get('/teams/all', asyncHandler(async (req: Request, res: Response) => {
  const teams = await Team.findAll({
    order: [['conference', 'ASC'], ['division', 'ASC'], ['name', 'ASC']],
  });

  res.json({ teams });
}));

export default router;
