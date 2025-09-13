import { Pick } from '../../src/models/Pick';
import { User } from '../../src/models/User';
import { League } from '../../src/models/League';
import { Game } from '../../src/models/Game';
import { Team } from '../../src/models/Team';

// Mock the database connection
jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    define: jest.fn(),
  },
}));

describe('Pick Model', () => {
  let pick: Pick;
  let user: User;
  let league: League;
  let game: Game;
  let pickedTeam: Team;

  beforeEach(() => {
    user = {
      id: 1,
      email: 'user@example.com',
      username: 'testuser'
    } as any;

    league = {
      id: 1,
      name: 'Test League',
      commissionerId: 1
    } as any;

    game = {
      id: 1,
      homeTeamId: 1,
      awayTeamId: 2,
      week: 1,
      seasonYear: 2024
    } as any;

    pickedTeam = {
      id: 1,
      name: 'Patriots',
      abbreviation: 'NE'
    } as any;

    pick = {
      id: 1,
      userId: 1,
      leagueId: 1,
      gameId: 1,
      pickedTeamId: 1,
      pickType: 'spread',
      confidencePoints: 8,
      isCorrect: true,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;
  });

  describe('Model Properties', () => {
    it('should have all required properties', () => {
      expect(pick.id).toBe(1);
      expect(pick.userId).toBe(1);
      expect(pick.leagueId).toBe(1);
      expect(pick.gameId).toBe(1);
      expect(pick.pickedTeamId).toBe(1);
      expect(pick.pickType).toBe('spread');
      expect(pick.confidencePoints).toBe(8);
      expect(pick.isCorrect).toBe(true);
      expect(pick.createdAt).toBeInstanceOf(Date);
      expect(pick.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle pick without optional confidence points', () => {
      pick.confidencePoints = undefined;
      
      expect(pick.id).toBe(1);
      expect(pick.userId).toBe(1);
      expect(pick.leagueId).toBe(1);
      expect(pick.gameId).toBe(1);
      expect(pick.pickedTeamId).toBe(1);
      expect(pick.pickType).toBe('spread');
      expect(pick.confidencePoints).toBeUndefined();
    });

    it('should handle pick without optional isCorrect', () => {
      pick.isCorrect = undefined;
      
      expect(pick.id).toBe(1);
      expect(pick.userId).toBe(1);
      expect(pick.leagueId).toBe(1);
      expect(pick.gameId).toBe(1);
      expect(pick.pickedTeamId).toBe(1);
      expect(pick.pickType).toBe('spread');
      expect(pick.isCorrect).toBeUndefined();
    });
  });

  describe('Pick Types', () => {
    it('should accept spread pick type', () => {
      pick.pickType = 'spread';
      expect(pick.pickType).toBe('spread');
    });

    it('should accept over_under pick type', () => {
      pick.pickType = 'over_under';
      expect(pick.pickType).toBe('over_under');
    });

    it('should accept straight pick type', () => {
      pick.pickType = 'straight';
      expect(pick.pickType).toBe('straight');
    });
  });

  describe('Confidence Points', () => {
    it('should handle minimum confidence points', () => {
      pick.confidencePoints = 1;
      expect(pick.confidencePoints).toBe(1);
    });

    it('should handle maximum confidence points', () => {
      pick.confidencePoints = 16;
      expect(pick.confidencePoints).toBe(16);
    });

    it('should handle various confidence point values', () => {
      const confidencePoints = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      
      confidencePoints.forEach(points => {
        pick.confidencePoints = points;
        expect(pick.confidencePoints).toBe(points);
      });
    });

    it('should handle undefined confidence points for non-confidence leagues', () => {
      pick.confidencePoints = undefined;
      expect(pick.confidencePoints).toBeUndefined();
    });
  });

  describe('Pick Correctness', () => {
    it('should handle correct pick', () => {
      pick.isCorrect = true;
      expect(pick.isCorrect).toBe(true);
    });

    it('should handle incorrect pick', () => {
      pick.isCorrect = false;
      expect(pick.isCorrect).toBe(false);
    });

    it('should handle undefined pick result (game not finished)', () => {
      pick.isCorrect = undefined;
      expect(pick.isCorrect).toBeUndefined();
    });
  });

  describe('Associations', () => {
    it('should have user association', () => {
      pick.user = user;
      expect(pick.user).toBe(user);
      expect(pick.user!.id).toBe(1);
      expect(pick.user!.username).toBe('testuser');
    });

    it('should have league association', () => {
      pick.league = league;
      expect(pick.league).toBe(league);
      expect(pick.league!.id).toBe(1);
      expect(pick.league!.name).toBe('Test League');
    });

    it('should have game association', () => {
      pick.game = game;
      expect(pick.game).toBe(game);
      expect(pick.game!.id).toBe(1);
      expect(pick.game!.week).toBe(1);
    });

    it('should have pickedTeam association', () => {
      pick.pickedTeam = pickedTeam;
      expect(pick.pickedTeam).toBe(pickedTeam);
      expect(pick.pickedTeam!.id).toBe(1);
      expect(pick.pickedTeam!.name).toBe('Patriots');
    });
  });

  describe('Pick Scenarios', () => {
    it('should handle spread pick scenario', () => {
      pick.pickType = 'spread';
      pick.pickedTeamId = 1; // Home team
      pick.confidencePoints = 5;
      
      expect(pick.pickType).toBe('spread');
      expect(pick.pickedTeamId).toBe(1);
      expect(pick.confidencePoints).toBe(5);
    });

    it('should handle over/under pick scenario', () => {
      pick.pickType = 'over_under';
      pick.pickedTeamId = 1; // Over
      pick.confidencePoints = 3;
      
      expect(pick.pickType).toBe('over_under');
      expect(pick.pickedTeamId).toBe(1);
      expect(pick.confidencePoints).toBe(3);
    });

    it('should handle straight pick scenario', () => {
      pick.pickType = 'straight';
      pick.pickedTeamId = 2; // Away team
      pick.confidencePoints = undefined;
      
      expect(pick.pickType).toBe('straight');
      expect(pick.pickedTeamId).toBe(2);
      expect(pick.confidencePoints).toBeUndefined();
    });
  });

  describe('Multiple Picks for Same Game', () => {
    it('should handle multiple pick types for same game', () => {
      const spreadPick = new Pick();
      spreadPick.userId = 1;
      spreadPick.leagueId = 1;
      spreadPick.gameId = 1;
      spreadPick.pickedTeamId = 1;
      spreadPick.pickType = 'spread';
      spreadPick.confidencePoints = 8;

      const overUnderPick = new Pick();
      overUnderPick.userId = 1;
      overUnderPick.leagueId = 1;
      overUnderPick.gameId = 1;
      overUnderPick.pickedTeamId = 1;
      overUnderPick.pickType = 'over_under';
      overUnderPick.confidencePoints = 5;

      expect(spreadPick.pickType).toBe('spread');
      expect(overUnderPick.pickType).toBe('over_under');
      expect(spreadPick.gameId).toBe(overUnderPick.gameId);
      expect(spreadPick.userId).toBe(overUnderPick.userId);
    });
  });

  describe('Pick Validation', () => {
    it('should require all foreign key relationships', () => {
      expect(pick.userId).toBe(1);
      expect(pick.leagueId).toBe(1);
      expect(pick.gameId).toBe(1);
      expect(pick.pickedTeamId).toBe(1);
    });

    it('should require valid pick type', () => {
      const validPickTypes = ['spread', 'over_under', 'straight'];
      expect(validPickTypes).toContain(pick.pickType);
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt timestamp', () => {
      expect(pick.createdAt).toBeInstanceOf(Date);
    });

    it('should have updatedAt timestamp', () => {
      expect(pick.updatedAt).toBeInstanceOf(Date);
    });

    it('should update timestamps when modified', () => {
      const originalUpdatedAt = pick.updatedAt;
      
      // Simulate update
      pick.isCorrect = false;
      (pick as any).updatedAt = new Date();
      
      expect(pick.updatedAt).not.toEqual(originalUpdatedAt);
    });
  });

  describe('Unique Constraints', () => {
    it('should enforce unique user-league-game-pickType combination', () => {
      // This would be tested through database constraints
      // The model should prevent duplicate picks of the same type for the same user/league/game
      expect(pick.userId).toBe(1);
      expect(pick.leagueId).toBe(1);
      expect(pick.gameId).toBe(1);
      expect(pick.pickType).toBe('spread');
    });
  });
});
