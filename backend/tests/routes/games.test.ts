import request from 'supertest';
import express from 'express';
import gamesRoutes from '../../src/routes/games';
import { Game, Team } from '../../src/models';

// Mock the models
jest.mock('../../src/models', () => ({
  Game: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  Team: {
    findAll: jest.fn(),
  },
}));

// Mock error handler
jest.mock('../../src/middleware/errorHandler', () => ({
  asyncHandler: (fn: Function) => fn,
  createError: (message: string, statusCode: number) => {
    const error = new Error(message);
    (error as any).statusCode = statusCode;
    return error;
  },
}));

const app = express();
app.use(express.json());
app.use('/games', gamesRoutes);

describe('Games Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /games', () => {
    it('should return games for current season', async () => {
      const mockGames = [
        {
          id: 1,
          homeTeamId: 1,
          awayTeamId: 2,
          gameDate: new Date('2024-01-15T20:00:00Z'),
          week: 1,
          seasonYear: 2024,
          status: 'scheduled',
          homeTeam: {
            id: 1,
            name: 'Patriots',
            city: 'New England',
            abbreviation: 'NE',
            logoUrl: 'https://example.com/patriots.png',
          },
          awayTeam: {
            id: 2,
            name: 'Bills',
            city: 'Buffalo',
            abbreviation: 'BUF',
            logoUrl: 'https://example.com/bills.png',
          },
        },
      ];

      (Game.findAll as jest.Mock).mockResolvedValue(mockGames);

      const response = await request(app).get('/games');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('games');
      expect(response.body.games).toHaveLength(1);
      expect(Game.findAll).toHaveBeenCalledWith({
        where: { seasonYear: new Date().getFullYear() },
        include: expect.arrayContaining([
          expect.objectContaining({
            model: Team,
            as: 'homeTeam',
            attributes: ['id', 'name', 'city', 'abbreviation', 'logoUrl'],
          }),
          expect.objectContaining({
            model: Team,
            as: 'awayTeam',
            attributes: ['id', 'name', 'city', 'abbreviation', 'logoUrl'],
          }),
        ]),
        order: [['gameDate', 'ASC']],
      });
    });

    it('should return games for specific week', async () => {
      const mockGames = [
        {
          id: 1,
          week: 1,
          seasonYear: 2024,
          homeTeam: { id: 1, name: 'Patriots' },
          awayTeam: { id: 2, name: 'Bills' },
        },
      ];

      (Game.findAll as jest.Mock).mockResolvedValue(mockGames);

      const response = await request(app).get('/games?week=1');

      expect(response.status).toBe(200);
      expect(Game.findAll).toHaveBeenCalledWith({
        where: { seasonYear: new Date().getFullYear(), week: 1 },
        include: expect.any(Array),
        order: [['gameDate', 'ASC']],
      });
    });

    it('should return games for specific season year', async () => {
      const mockGames = [
        {
          id: 1,
          week: 1,
          seasonYear: 2023,
          homeTeam: { id: 1, name: 'Patriots' },
          awayTeam: { id: 2, name: 'Bills' },
        },
      ];

      (Game.findAll as jest.Mock).mockResolvedValue(mockGames);

      const response = await request(app).get('/games?seasonYear=2023');

      expect(response.status).toBe(200);
      expect(Game.findAll).toHaveBeenCalledWith({
        where: { seasonYear: 2023 },
        include: expect.any(Array),
        order: [['gameDate', 'ASC']],
      });
    });

    it('should return games for specific week and season', async () => {
      const mockGames = [
        {
          id: 1,
          week: 5,
          seasonYear: 2023,
          homeTeam: { id: 1, name: 'Patriots' },
          awayTeam: { id: 2, name: 'Bills' },
        },
      ];

      (Game.findAll as jest.Mock).mockResolvedValue(mockGames);

      const response = await request(app).get('/games?week=5&seasonYear=2023');

      expect(response.status).toBe(200);
      expect(Game.findAll).toHaveBeenCalledWith({
        where: { seasonYear: 2023, week: 5 },
        include: expect.any(Array),
        order: [['gameDate', 'ASC']],
      });
    });

    it('should return empty array when no games found', async () => {
      (Game.findAll as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get('/games');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('games');
      expect(response.body.games).toHaveLength(0);
    });
  });

  describe('GET /games/week/:week', () => {
    it('should return games for specific week', async () => {
      const mockGames = [
        {
          id: 1,
          week: 1,
          seasonYear: 2024,
          homeTeam: { id: 1, name: 'Patriots' },
          awayTeam: { id: 2, name: 'Bills' },
        },
      ];

      (Game.findAll as jest.Mock).mockResolvedValue(mockGames);

      const response = await request(app).get('/games/week/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('games');
      expect(Game.findAll).toHaveBeenCalledWith({
        where: { week: 1, seasonYear: new Date().getFullYear() },
        include: expect.any(Array),
        order: [['gameDate', 'ASC']],
      });
    });

    it('should return games for specific week and season', async () => {
      const mockGames = [
        {
          id: 1,
          week: 3,
          seasonYear: 2023,
          homeTeam: { id: 1, name: 'Patriots' },
          awayTeam: { id: 2, name: 'Bills' },
        },
      ];

      (Game.findAll as jest.Mock).mockResolvedValue(mockGames);

      const response = await request(app).get('/games/week/3?seasonYear=2023');

      expect(response.status).toBe(200);
      expect(Game.findAll).toHaveBeenCalledWith({
        where: { week: 3, seasonYear: 2023 },
        include: expect.any(Array),
        order: [['gameDate', 'ASC']],
      });
    });
  });

  describe('GET /games/:id', () => {
    it('should return specific game by ID', async () => {
      const mockGame = {
        id: 1,
        homeTeamId: 1,
        awayTeamId: 2,
        gameDate: new Date('2024-01-15T20:00:00Z'),
        week: 1,
        seasonYear: 2024,
        status: 'scheduled',
        homeTeam: {
          id: 1,
          name: 'Patriots',
          city: 'New England',
          abbreviation: 'NE',
          logoUrl: 'https://example.com/patriots.png',
        },
        awayTeam: {
          id: 2,
          name: 'Bills',
          city: 'Buffalo',
          abbreviation: 'BUF',
          logoUrl: 'https://example.com/bills.png',
        },
      };

      (Game.findByPk as jest.Mock).mockResolvedValue(mockGame);

      const response = await request(app).get('/games/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('game');
      expect(response.body.game).toEqual({
        ...mockGame,
        gameDate: expect.any(String)
      });
      expect(Game.findByPk).toHaveBeenCalledWith('1', {
        include: expect.arrayContaining([
          expect.objectContaining({
            model: Team,
            as: 'homeTeam',
            attributes: ['id', 'name', 'city', 'abbreviation', 'logoUrl'],
          }),
          expect.objectContaining({
            model: Team,
            as: 'awayTeam',
            attributes: ['id', 'name', 'city', 'abbreviation', 'logoUrl'],
          }),
        ]),
      });
    });

    it('should return 404 when game not found', async () => {
      (Game.findByPk as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/games/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /games/teams/all', () => {
    it('should return all teams', async () => {
      const mockTeams = [
        {
          id: 1,
          name: 'Patriots',
          city: 'New England',
          abbreviation: 'NE',
          conference: 'AFC',
          division: 'East',
          logoUrl: 'https://example.com/patriots.png',
        },
        {
          id: 2,
          name: 'Bills',
          city: 'Buffalo',
          abbreviation: 'BUF',
          conference: 'AFC',
          division: 'East',
          logoUrl: 'https://example.com/bills.png',
        },
      ];

      (Team.findAll as jest.Mock).mockResolvedValue(mockTeams);

      const response = await request(app).get('/games/teams/all');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('teams');
      expect(response.body.teams).toHaveLength(2);
      expect(Team.findAll).toHaveBeenCalledWith({
        order: [['conference', 'ASC'], ['division', 'ASC'], ['name', 'ASC']],
      });
    });

    it('should return empty array when no teams found', async () => {
      (Team.findAll as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get('/games/teams/all');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('teams');
      expect(response.body.teams).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      (Game.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/games');

      expect(response.status).toBe(500);
    });

    it('should handle invalid week parameter', async () => {
      const response = await request(app).get('/games/week/invalid');

      expect(response.status).toBe(500);
      expect(Game.findAll).toHaveBeenCalledWith({
        where: { week: NaN, seasonYear: new Date().getFullYear() },
        include: expect.any(Array),
        order: [['gameDate', 'ASC']],
      });
    });

    it('should handle invalid season year parameter', async () => {
      const response = await request(app).get('/games?seasonYear=invalid');

      expect(response.status).toBe(500);
      expect(Game.findAll).toHaveBeenCalledWith({
        where: { seasonYear: NaN },
        include: expect.any(Array),
        order: [['gameDate', 'ASC']],
      });
    });
  });
});
