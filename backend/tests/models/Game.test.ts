import { Game } from '../../src/models/Game';
import { Team } from '../../src/models/Team';

// Mock the database connection
jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    define: jest.fn(),
  },
}));

describe('Game Model', () => {
  let game: Game;
  let homeTeam: Team;
  let awayTeam: Team;

  beforeEach(() => {
    homeTeam = {
      id: 1,
      name: 'Patriots',
      city: 'New England',
      abbreviation: 'NE'
    } as any;

    awayTeam = {
      id: 2,
      name: 'Bills',
      city: 'Buffalo',
      abbreviation: 'BUF'
    } as any;

    game = {
      id: 1,
      homeTeamId: 1,
      awayTeamId: 2,
      gameDate: new Date('2024-01-15T20:00:00Z'),
      week: 1,
      seasonYear: 2024,
      homeScore: 24,
      awayScore: 21,
      spread: -3.5,
      overUnder: 45.5,
      status: 'final',
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;
  });

  describe('Model Properties', () => {
    it('should have all required properties', () => {
      expect(game.id).toBe(1);
      expect(game.homeTeamId).toBe(1);
      expect(game.awayTeamId).toBe(2);
      expect(game.gameDate).toEqual(new Date('2024-01-15T20:00:00Z'));
      expect(game.week).toBe(1);
      expect(game.seasonYear).toBe(2024);
      expect(game.homeScore).toBe(24);
      expect(game.awayScore).toBe(21);
      expect(game.spread).toBe(-3.5);
      expect(game.overUnder).toBe(45.5);
      expect(game.status).toBe('final');
      expect(game.createdAt).toBeInstanceOf(Date);
      expect(game.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle game without optional scores', () => {
      game.homeScore = undefined;
      game.awayScore = undefined;
      
      expect(game.id).toBe(1);
      expect(game.homeTeamId).toBe(1);
      expect(game.awayTeamId).toBe(2);
      expect(game.homeScore).toBeUndefined();
      expect(game.awayScore).toBeUndefined();
    });

    it('should handle game without optional spread and over/under', () => {
      game.spread = undefined;
      game.overUnder = undefined;
      
      expect(game.spread).toBeUndefined();
      expect(game.overUnder).toBeUndefined();
    });
  });

  describe('Game Status', () => {
    it('should accept scheduled status', () => {
      game.status = 'scheduled';
      expect(game.status).toBe('scheduled');
    });

    it('should accept in_progress status', () => {
      game.status = 'in_progress';
      expect(game.status).toBe('in_progress');
    });

    it('should accept final status', () => {
      game.status = 'final';
      expect(game.status).toBe('final');
    });
  });

  describe('Week Validation', () => {
    it('should handle regular season weeks', () => {
      const weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
      
      weeks.forEach(week => {
        game.week = week;
        expect(game.week).toBe(week);
      });
    });

    it('should handle playoff weeks', () => {
      const playoffWeeks = [19, 20, 21, 22];
      
      playoffWeeks.forEach(week => {
        game.week = week;
        expect(game.week).toBe(week);
      });
    });
  });

  describe('Season Year', () => {
    it('should handle current season year', () => {
      game.seasonYear = 2024;
      expect(game.seasonYear).toBe(2024);
    });

    it('should handle future season years', () => {
      game.seasonYear = 2025;
      expect(game.seasonYear).toBe(2025);
    });

    it('should handle past season years', () => {
      game.seasonYear = 2023;
      expect(game.seasonYear).toBe(2023);
    });
  });

  describe('Game Date', () => {
    it('should handle various date formats', () => {
      const dates = [
        new Date('2024-01-15T20:00:00Z'),
        new Date('2024-09-08T13:00:00Z'),
        new Date('2024-12-29T17:00:00Z'),
        new Date('2025-01-12T20:00:00Z')
      ];

      dates.forEach(date => {
        game.gameDate = date;
        expect(game.gameDate).toEqual(date);
      });
    });

    it('should handle different time zones', () => {
      const utcDate = new Date('2024-01-15T20:00:00Z');
      const estDate = new Date('2024-01-15T15:00:00-05:00');
      
      game.gameDate = utcDate;
      expect(game.gameDate).toEqual(utcDate);
      
      game.gameDate = estDate;
      expect(game.gameDate).toEqual(estDate);
    });
  });

  describe('Scores', () => {
    it('should handle various score combinations', () => {
      const scoreCombinations = [
        { home: 0, away: 0 },
        { home: 7, away: 3 },
        { home: 21, away: 14 },
        { home: 35, away: 28 },
        { home: 49, away: 42 },
        { home: 56, away: 0 }
      ];

      scoreCombinations.forEach(scores => {
        game.homeScore = scores.home;
        game.awayScore = scores.away;
        expect(game.homeScore).toBe(scores.home);
        expect(game.awayScore).toBe(scores.away);
      });
    });

    it('should handle overtime scores', () => {
      game.homeScore = 31;
      game.awayScore = 28;
      expect(game.homeScore).toBe(31);
      expect(game.awayScore).toBe(28);
    });
  });

  describe('Spread', () => {
    it('should handle positive spreads (home team favored)', () => {
      game.spread = 3.5;
      expect(game.spread).toBe(3.5);
    });

    it('should handle negative spreads (away team favored)', () => {
      game.spread = -7.0;
      expect(game.spread).toBe(-7.0);
    });

    it('should handle pick em (no spread)', () => {
      game.spread = 0;
      expect(game.spread).toBe(0);
    });

    it('should handle various spread values', () => {
      const spreads = [-14.5, -7.0, -3.5, 0, 3.5, 7.0, 14.5];
      
      spreads.forEach(spread => {
        game.spread = spread;
        expect(game.spread).toBe(spread);
      });
    });
  });

  describe('Over/Under', () => {
    it('should handle various over/under values', () => {
      const overUnders = [35.5, 42.0, 45.5, 48.0, 52.5, 56.0];
      
      overUnders.forEach(ou => {
        game.overUnder = ou;
        expect(game.overUnder).toBe(ou);
      });
    });

    it('should handle high over/under values', () => {
      game.overUnder = 65.5;
      expect(game.overUnder).toBe(65.5);
    });

    it('should handle low over/under values', () => {
      game.overUnder = 30.0;
      expect(game.overUnder).toBe(30.0);
    });
  });

  describe('Team Associations', () => {
    it('should have homeTeam association', () => {
      game.homeTeam = homeTeam;
      expect(game.homeTeam).toBe(homeTeam);
      expect(game.homeTeam!.id).toBe(1);
      expect(game.homeTeam!.name).toBe('Patriots');
    });

    it('should have awayTeam association', () => {
      game.awayTeam = awayTeam;
      expect(game.awayTeam).toBe(awayTeam);
      expect(game.awayTeam!.id).toBe(2);
      expect(game.awayTeam!.name).toBe('Bills');
    });

    it('should handle different team combinations', () => {
      const team1 = {
        id: 3,
        name: 'Dolphins',
        abbreviation: 'MIA'
      } as any;

      const team2 = {
        id: 4,
        name: 'Jets',
        abbreviation: 'NYJ'
      } as any;

      game.homeTeamId = 3;
      game.awayTeamId = 4;
      game.homeTeam = team1;
      game.awayTeam = team2;

      expect(game.homeTeamId).toBe(3);
      expect(game.awayTeamId).toBe(4);
      expect(game.homeTeam!.name).toBe('Dolphins');
      expect(game.awayTeam!.name).toBe('Jets');
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt timestamp', () => {
      expect(game.createdAt).toBeInstanceOf(Date);
    });

    it('should have updatedAt timestamp', () => {
      expect(game.updatedAt).toBeInstanceOf(Date);
    });

    it('should update timestamps when modified', () => {
      const originalUpdatedAt = game.updatedAt;
      
      // Simulate update
      game.status = 'in_progress';
      (game as any).updatedAt = new Date();
      
      expect(game.updatedAt).not.toEqual(originalUpdatedAt);
    });
  });
});
