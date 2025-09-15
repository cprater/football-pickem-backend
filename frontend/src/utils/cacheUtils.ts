import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '../types';

/**
 * Cache invalidation utilities for React Query
 * These functions help maintain cache consistency across the application
 */

export const cacheUtils = {
  /**
   * Invalidate all auth-related queries
   */
  invalidateAuth: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
  },

  /**
   * Invalidate all league-related queries
   */
  invalidateLeagues: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.leagues.all });
  },

  /**
   * Invalidate specific league queries
   */
  invalidateLeague: (queryClient: QueryClient, leagueId: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.leagues.detail(leagueId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.leagues.participants(leagueId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.leagues.standings(leagueId) });
  },

  /**
   * Invalidate all game-related queries
   */
  invalidateGames: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.games.all });
  },

  /**
   * Invalidate games for a specific week
   */
  invalidateGamesForWeek: (queryClient: QueryClient, week: number, seasonYear?: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.games.byWeek(week, seasonYear) });
  },

  /**
   * Invalidate all pick-related queries
   */
  invalidatePicks: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.picks.all });
  },

  /**
   * Invalidate picks for a specific league
   */
  invalidatePicksForLeague: (queryClient: QueryClient, leagueId: number) => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.picks.list({ leagueId }) 
    });
  },

  /**
   * Invalidate picks for a specific week
   */
  invalidatePicksForWeek: (queryClient: QueryClient, week: number) => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.picks.list({ week }) 
    });
  },

  /**
   * Invalidate picks for a specific week and league
   */
  invalidatePicksForWeekAndLeague: (queryClient: QueryClient, week: number, leagueId: number) => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.picks.list({ week, leagueId }) 
    });
  },

  /**
   * Clear all cached data (useful for logout)
   */
  clearAll: (queryClient: QueryClient) => {
    queryClient.clear();
  },

  /**
   * Prefetch data for better UX
   */
  prefetchLeague: async (queryClient: QueryClient, leagueId: number) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.leagues.detail(leagueId),
      queryFn: async () => {
        const response = await fetch(`/api/v1/leagues/${leagueId}`);
        return response.json();
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  },

  /**
   * Prefetch games for a specific week
   */
  prefetchGamesForWeek: async (queryClient: QueryClient, week: number, seasonYear?: number) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.games.byWeek(week, seasonYear),
      queryFn: async () => {
        const params = seasonYear ? `?seasonYear=${seasonYear}` : '';
        const response = await fetch(`/api/v1/games/week/${week}${params}`);
        return response.json();
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },
};

/**
 * Hook to get cache utilities with the current query client
 */
export const useCacheUtils = () => {
  // This would typically be used with useQueryClient hook
  // but we're exporting the utilities directly for flexibility
  return cacheUtils;
};
