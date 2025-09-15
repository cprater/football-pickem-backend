import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import type { 
  LeaguesResponse, 
  LeagueResponse, 
  LeagueParticipantsResponse,
  LeaguePicksResponse,
  LeagueStandingsResponse,
  LeagueAdminUpdateRequest,
  LeagueAdminRemoveParticipantRequest
} from '../../types';
import { queryKeys } from '../../types';

// API functions
const leaguesApi = {
  getLeagues: async (params?: { 
    page?: number; 
    limit?: number; 
    seasonYear?: number 
  }): Promise<LeaguesResponse> => {
    const response = await api.get('/leagues', { params });
    return response.data;
  },

  getLeague: async (id: number): Promise<LeagueResponse> => {
    const response = await api.get(`/leagues/${id}`);
    return response.data;
  },

  createLeague: async (leagueData: {
    name: string;
    description?: string;
    maxParticipants?: number;
    entryFee?: number;
    scoringType?: 'confidence' | 'straight' | 'survivor';
    seasonYear: number;
    isPublic?: boolean;
  }): Promise<LeagueResponse> => {
    const response = await api.post('/leagues', leagueData);
    return response.data;
  },

  joinLeague: async (id: number): Promise<LeagueResponse> => {
    const response = await api.post(`/leagues/${id}/join`);
    return response.data;
  },

  leaveLeague: async (id: number): Promise<{ message: string }> => {
    const response = await api.post(`/leagues/${id}/leave`);
    return response.data;
  },

  getParticipants: async (id: number): Promise<LeagueParticipantsResponse> => {
    const response = await api.get(`/leagues/${id}/participants`);
    return response.data;
  },

  getStandings: async (id: number, week?: number): Promise<LeagueStandingsResponse> => {
    const params = week ? { week } : {};
    const response = await api.get(`/leagues/${id}/standings`, { params });
    return response.data;
  },

  getLeaguePicks: async (id: number, week?: number): Promise<LeaguePicksResponse> => {
    const params = week ? { week } : {};
    const response = await api.get(`/leagues/${id}/picks`, { params });
    return response.data;
  },

  updateLeagueSettings: async (id: number, data: LeagueAdminUpdateRequest): Promise<LeagueResponse> => {
    const response = await api.put(`/leagues/${id}/admin/update-settings`, data);
    return response.data;
  },

  removeParticipant: async (id: number, data: LeagueAdminRemoveParticipantRequest): Promise<{ message: string }> => {
    const response = await api.post(`/leagues/${id}/admin/remove-participant`, data);
    return response.data;
  },
};

// Custom hooks
export const useLeagues = (params?: { 
  page?: number; 
  limit?: number; 
  seasonYear?: number 
}) => {
  return useQuery({
    queryKey: queryKeys.leagues.list(params),
    queryFn: () => leaguesApi.getLeagues(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useLeague = (id: number) => {
  return useQuery({
    queryKey: queryKeys.leagues.detail(id),
    queryFn: () => leaguesApi.getLeague(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateLeague = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaguesApi.createLeague,
    onSuccess: (data) => {
      // Invalidate leagues list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.all });
      
      // Add the new league to cache
      queryClient.setQueryData(
        queryKeys.leagues.detail(data.league.id),
        data
      );
    },
    onError: (error: any) => {
      console.error('Failed to create league:', error);
    },
  });
};

export const useJoinLeague = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaguesApi.joinLeague,
    onMutate: async (leagueId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.leagues.all });

      // Snapshot the previous value
      const previousLeagues = queryClient.getQueriesData({ queryKey: queryKeys.leagues.all });

      // Optimistically update the league in cache
      queryClient.setQueryData(
        queryKeys.leagues.detail(leagueId),
        (old: LeagueResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            league: {
              ...old.league,
              currentParticipants: old.league.currentParticipants + 1,
            },
          };
        }
      );

      // Return context with the previous value
      return { previousLeagues };
    },
    onError: (error, _leagueId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousLeagues) {
        context.previousLeagues.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('Failed to join league:', error);
    },
    onSuccess: (data, leagueId) => {
      // Invalidate leagues list
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.all });
      
      // Update the specific league in cache
      queryClient.setQueryData(
        queryKeys.leagues.detail(leagueId),
        data
      );
      
      // Invalidate participants for this league
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.leagues.participants(leagueId) 
      });
    },
  });
};

export const useLeaveLeague = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaguesApi.leaveLeague,
    onMutate: async (leagueId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.leagues.all });

      // Snapshot the previous value
      const previousLeagues = queryClient.getQueriesData({ queryKey: queryKeys.leagues.all });

      // Optimistically update the league in cache
      queryClient.setQueryData(
        queryKeys.leagues.detail(leagueId),
        (old: LeagueResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            league: {
              ...old.league,
              currentParticipants: Math.max(0, old.league.currentParticipants - 1),
            },
          };
        }
      );

      // Return context with the previous value
      return { previousLeagues };
    },
    onError: (error, _leagueId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousLeagues) {
        context.previousLeagues.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('Failed to leave league:', error);
    },
    onSuccess: (_, leagueId) => {
      // Invalidate leagues list
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.all });
      
      // Invalidate the specific league
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.leagues.detail(leagueId) 
      });
      
      // Invalidate participants for this league
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.leagues.participants(leagueId) 
      });
    },
  });
};

export const useLeagueParticipants = (id: number) => {
  return useQuery({
    queryKey: queryKeys.leagues.participants(id),
    queryFn: () => leaguesApi.getParticipants(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useLeagueStandings = (id: number, week?: number) => {
  return useQuery({
    queryKey: queryKeys.leagues.standings(id, week),
    queryFn: () => leaguesApi.getStandings(id, week),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute (standings change frequently)
  });
};

export const useLeaguePicks = (id: number, week?: number) => {
  return useQuery({
    queryKey: queryKeys.leagues.picks(id, week),
    queryFn: () => leaguesApi.getLeaguePicks(id, week),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUpdateLeagueSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: LeagueAdminUpdateRequest }) => 
      leaguesApi.updateLeagueSettings(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch league data
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.all });
    },
  });
};

export const useRemoveParticipant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: LeagueAdminRemoveParticipantRequest }) => 
      leaguesApi.removeParticipant(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch league participants
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.participants(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.detail(variables.id) });
    },
  });
};
