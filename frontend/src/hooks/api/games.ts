import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { getCurrentWeek } from '../../utils/weekUtils';
import type { 
  GamesResponse, 
  GameResponse, 
  TeamsResponse
} from '../../types';
import { queryKeys } from '../../types';

// API functions
const gamesApi = {
  getGames: async (params?: { 
    week?: number; 
    seasonYear?: number 
  }): Promise<GamesResponse> => {
    const response = await api.get('/games', { params });
    return response.data;
  },

  getGamesByWeek: async (week: number, seasonYear?: number): Promise<GamesResponse> => {
    const params = seasonYear ? { seasonYear } : {};
    const response = await api.get(`/games/week/${week}`, { params });
    return response.data;
  },

  getGame: async (id: number): Promise<GameResponse> => {
    const response = await api.get(`/games/${id}`);
    return response.data;
  },

  getTeams: async (): Promise<TeamsResponse> => {
    const response = await api.get('/games/teams/all');
    return response.data;
  },
};

// Custom hooks
export const useGames = (params?: { 
  week?: number; 
  seasonYear?: number 
}) => {
  // Default to current week if no week is specified
  const queryParams = {
    ...params,
    week: params?.week || getCurrentWeek()
  };
  
  return useQuery({
    queryKey: queryKeys.games.list(queryParams),
    queryFn: () => gamesApi.getGames(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes (games don't change often)
  });
};

export const useGamesByWeek = (week: number, seasonYear?: number) => {
  return useQuery({
    queryKey: queryKeys.games.byWeek(week, seasonYear),
    queryFn: () => gamesApi.getGamesByWeek(week, seasonYear),
    enabled: !!week,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGame = (id: number) => {
  return useQuery({
    queryKey: queryKeys.games.detail(id),
    queryFn: () => gamesApi.getGame(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTeams = () => {
  return useQuery({
    queryKey: queryKeys.games.teams,
    queryFn: gamesApi.getTeams,
    staleTime: 30 * 60 * 1000, // 30 minutes (teams rarely change)
  });
};
