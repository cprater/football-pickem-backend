// User types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// League types
export interface League {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  isActive: boolean;
  maxParticipants: number;
  currentParticipants: number;
  entryFee: number;
  scoringType: 'confidence' | 'straight' | 'survivor';
  seasonYear: number;
  commissionerId: number;
  leagueSettings: {
    scoringType: string;
    maxParticipants: number;
    entryFee: number;
    allowLatePicks: boolean;
    tieBreaker: string;
  };
  createdAt: string;
  updatedAt: string;
  commissioner?: User;
}

// Team types
export interface Team {
  id: number;
  name: string;
  city: string;
  abbreviation: string;
  conference?: string;
  division?: string;
  logoUrl?: string;
}

// Game types
export interface Game {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  week: number;
  seasonYear: number;
  gameDate: string;
  homeTeamScore?: number;
  awayTeamScore?: number;
  spread?: number;
  overUnder?: number;
  status: 'scheduled' | 'in_progress' | 'final';
  homeTeam?: Team;
  awayTeam?: Team;
}

// Pick types
export interface Pick {
  id: number;
  userId: number;
  gameId: number;
  pickedTeamId: number;
  leagueId: number;
  pickType: 'spread' | 'over_under' | 'straight';
  confidencePoints?: number;
  createdAt: string;
  updatedAt: string;
  game?: Game;
  pickedTeam?: Team;
  league?: League;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// League API responses
export interface LeaguesResponse {
  leagues: League[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LeagueResponse {
  league: League;
}

export interface LeagueParticipantsResponse {
  participants: User[];
}

// Game API responses
export interface GamesResponse {
  games: Game[];
}

export interface GameResponse {
  game: Game;
}

export interface TeamsResponse {
  teams: Team[];
}

// Pick API responses
export interface PicksResponse {
  picks: Pick[];
}

export interface PickResponse {
  pick: Pick;
}

// Query key types for React Query
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  leagues: {
    all: ['leagues'] as const,
    list: (filters?: { page?: number; limit?: number; seasonYear?: number }) => 
      ['leagues', 'list', filters] as const,
    detail: (id: number) => ['leagues', 'detail', id] as const,
    participants: (id: number) => ['leagues', 'participants', id] as const,
    standings: (id: number, week?: number) => ['leagues', 'standings', id, week] as const,
  },
  games: {
    all: ['games'] as const,
    list: (filters?: { week?: number; seasonYear?: number }) => 
      ['games', 'list', filters] as const,
    byWeek: (week: number, seasonYear?: number) => 
      ['games', 'week', week, seasonYear] as const,
    detail: (id: number) => ['games', 'detail', id] as const,
    teams: ['games', 'teams'] as const,
  },
  picks: {
    all: ['picks'] as const,
    list: (filters?: { week?: number; leagueId?: number }) => 
      ['picks', 'list', filters] as const,
    detail: (id: number) => ['picks', 'detail', id] as const,
  },
} as const;
