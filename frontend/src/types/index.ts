// User types
export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// League types
export interface League {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  maxParticipants?: number;
  currentParticipants: number;
  createdAt: string;
  updatedAt: string;
  creatorId: number;
}

// Team types
export interface Team {
  id: number;
  name: string;
  city: string;
  abbreviation: string;
  logo?: string;
}

// Game types
export interface Game {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  week: number;
  season: number;
  gameTime: string;
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
  createdAt: string;
  updatedAt: string;
  game?: Game;
  pickedTeam?: Team;
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
}

export interface AuthResponse {
  token: string;
  user: User;
}
