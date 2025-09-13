import { Request } from 'express';
import { User } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface JWTPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export interface LeagueSettings {
  scoringType: 'confidence' | 'straight' | 'survivor';
  maxParticipants: number;
  entryFee: number;
  allowLatePicks: boolean;
  tieBreaker: 'confidence' | 'headToHead' | 'random';
}

export interface PickValidation {
  isValid: boolean;
  errors: string[];
}

export interface GameResult {
  homeScore: number;
  awayScore: number;
  status: 'scheduled' | 'in_progress' | 'final';
}

export interface StandingsEntry {
  userId: number;
  username: string;
  correctPicks: number;
  totalPicks: number;
  confidencePoints: number;
  winPercentage: number;
  rank: number;
}
