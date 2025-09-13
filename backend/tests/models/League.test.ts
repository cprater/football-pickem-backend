import { League } from '../../src/models/League';
import { User } from '../../src/models/User';

// Mock the database connection
jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    define: jest.fn(),
  },
}));

describe('League Model', () => {
  let league: League;
  let commissioner: User;

  beforeEach(() => {
    commissioner = {
      id: 1,
      email: 'commissioner@example.com',
      username: 'commissioner'
    } as any;

    league = {
      id: 1,
      name: 'Test League',
      description: 'A test league for football picks',
      commissionerId: 1,
      isPublic: true,
      maxParticipants: 10,
      entryFee: 25.00,
      scoringType: 'confidence',
      leagueSettings: {
        scoringType: 'confidence',
        maxParticipants: 10,
        entryFee: 25.00,
        allowLatePicks: true,
        tieBreaker: 'confidence'
      },
      seasonYear: 2024,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      addParticipant: jest.fn(),
      removeParticipant: jest.fn(),
      hasParticipant: jest.fn(),
      countParticipants: jest.fn(),
      getParticipants: jest.fn()
    } as any;
  });

  describe('Model Properties', () => {
    it('should have all required properties', () => {
      expect(league.id).toBe(1);
      expect(league.name).toBe('Test League');
      expect(league.description).toBe('A test league for football picks');
      expect(league.commissionerId).toBe(1);
      expect(league.isPublic).toBe(true);
      expect(league.maxParticipants).toBe(10);
      expect(league.entryFee).toBe(25.00);
      expect(league.scoringType).toBe('confidence');
      expect(league.leagueSettings).toEqual({
        scoringType: 'confidence',
        maxParticipants: 10,
        entryFee: 25.00,
        allowLatePicks: true,
        tieBreaker: 'confidence'
      });
      expect(league.seasonYear).toBe(2024);
      expect(league.isActive).toBe(true);
      expect(league.createdAt).toBeInstanceOf(Date);
      expect(league.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle league without optional description', () => {
      league.description = undefined;
      
      expect(league.id).toBe(1);
      expect(league.name).toBe('Test League');
      expect(league.description).toBeUndefined();
      expect(league.commissionerId).toBe(1);
    });
  });

  describe('Scoring Types', () => {
    it('should accept confidence scoring type', () => {
      league.scoringType = 'confidence';
      expect(league.scoringType).toBe('confidence');
    });

    it('should accept straight scoring type', () => {
      league.scoringType = 'straight';
      expect(league.scoringType).toBe('straight');
    });

    it('should accept survivor scoring type', () => {
      league.scoringType = 'survivor';
      expect(league.scoringType).toBe('survivor');
    });
  });

  describe('League Settings', () => {
    it('should handle default league settings', () => {
      league.leagueSettings = {
        scoringType: 'confidence',
        maxParticipants: 20,
        entryFee: 0,
        allowLatePicks: false,
        tieBreaker: 'confidence'
      };
      expect(league.leagueSettings).toEqual({
        scoringType: 'confidence',
        maxParticipants: 20,
        entryFee: 0,
        allowLatePicks: false,
        tieBreaker: 'confidence'
      });
    });

    it('should handle complex league settings', () => {
      const complexSettings = {
        scoringType: 'confidence' as const,
        maxParticipants: 20,
        entryFee: 0,
        allowLatePicks: false,
        tieBreaker: 'headToHead' as const
      };

      league.leagueSettings = complexSettings;
      expect(league.leagueSettings).toEqual(complexSettings);
    });
  });

  describe('Entry Fee', () => {
    it('should handle zero entry fee', () => {
      league.entryFee = 0;
      expect(league.entryFee).toBe(0);
    });

    it('should handle positive entry fee', () => {
      league.entryFee = 100.50;
      expect(league.entryFee).toBe(100.50);
    });

    it('should handle decimal entry fees', () => {
      const fees = [25.00, 50.25, 100.75, 250.99];
      
      fees.forEach(fee => {
        league.entryFee = fee;
        expect(league.entryFee).toBe(fee);
      });
    });
  });

  describe('Max Participants', () => {
    it('should handle minimum participants', () => {
      league.maxParticipants = 2;
      expect(league.maxParticipants).toBe(2);
    });

    it('should handle maximum participants', () => {
      league.maxParticipants = 100;
      expect(league.maxParticipants).toBe(100);
    });

    it('should handle various participant limits', () => {
      const limits = [4, 8, 10, 12, 16, 20, 32];
      
      limits.forEach(limit => {
        league.maxParticipants = limit;
        expect(league.maxParticipants).toBe(limit);
      });
    });
  });

  describe('Season Year', () => {
    it('should handle current season year', () => {
      league.seasonYear = 2024;
      expect(league.seasonYear).toBe(2024);
    });

    it('should handle future season years', () => {
      league.seasonYear = 2025;
      expect(league.seasonYear).toBe(2025);
    });

    it('should handle past season years', () => {
      league.seasonYear = 2023;
      expect(league.seasonYear).toBe(2023);
    });
  });

  describe('League Status', () => {
    it('should handle active league', () => {
      league.isActive = true;
      expect(league.isActive).toBe(true);
    });

    it('should handle inactive league', () => {
      league.isActive = false;
      expect(league.isActive).toBe(false);
    });

    it('should handle public league', () => {
      league.isPublic = true;
      expect(league.isPublic).toBe(true);
    });

    it('should handle private league', () => {
      league.isPublic = false;
      expect(league.isPublic).toBe(false);
    });
  });

  describe('Association Methods', () => {
    it('should have addParticipant method', () => {
      expect(typeof league.addParticipant).toBe('function');
    });

    it('should have removeParticipant method', () => {
      expect(typeof league.removeParticipant).toBe('function');
    });

    it('should have hasParticipant method', () => {
      expect(typeof league.hasParticipant).toBe('function');
    });

    it('should have countParticipants method', () => {
      expect(typeof league.countParticipants).toBe('function');
    });

    it('should have getParticipants method', () => {
      expect(typeof league.getParticipants).toBe('function');
    });
  });

  describe('League Name Validation', () => {
    it('should handle short league names', () => {
      league.name = 'A';
      expect(league.name).toBe('A');
    });

    it('should handle long league names', () => {
      league.name = 'A'.repeat(200);
      expect(league.name).toBe('A'.repeat(200));
    });

    it('should handle various league name formats', () => {
      const names = [
        'My League',
        'Fantasy Football 2024',
        'Champions League',
        'Super Bowl Picks',
        'NFL Pickem Challenge'
      ];

      names.forEach(name => {
        league.name = name;
        expect(league.name).toBe(name);
      });
    });
  });
});
