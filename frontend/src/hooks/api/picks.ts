import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import type { 
  Pick, 
  PicksResponse, 
  PickResponse
} from '../../types';
import { queryKeys } from '../../types';

// API functions
const picksApi = {
  getPicks: async (params?: { 
    week?: number; 
    leagueId?: number 
  }): Promise<PicksResponse> => {
    const response = await api.get('/picks', { params });
    return response.data;
  },

  createPick: async (pickData: {
    gameId: number;
    pickedTeamId: number;
    pickType: 'spread' | 'over_under' | 'straight';
    confidencePoints?: number;
    leagueId: number;
  }): Promise<PickResponse> => {
    const response = await api.post('/picks', pickData);
    return response.data;
  },

  updatePick: async (id: number, pickData: {
    pickedTeamId: number;
    confidencePoints?: number;
  }): Promise<PickResponse> => {
    const response = await api.put(`/picks/${id}`, pickData);
    return response.data;
  },

  deletePick: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/picks/${id}`);
    return response.data;
  },
};

// Custom hooks
export const usePicks = (params?: { 
  week?: number; 
  leagueId?: number 
}) => {
  return useQuery({
    queryKey: queryKeys.picks.list(params),
    queryFn: () => picksApi.getPicks(params),
    staleTime: 1 * 60 * 1000, // 1 minute (picks change frequently)
  });
};

export const useCreatePick = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: picksApi.createPick,
    onMutate: async (newPick) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.picks.all });

      // Snapshot the previous value
      const previousPicks = queryClient.getQueriesData({ queryKey: queryKeys.picks.all });

      // Optimistically update the cache
      const optimisticPick: Pick = {
        id: Date.now(), // Temporary ID
        userId: 0, // Will be set by server
        gameId: newPick.gameId,
        pickedTeamId: newPick.pickedTeamId,
        leagueId: newPick.leagueId,
        pickType: newPick.pickType,
        confidencePoints: newPick.confidencePoints,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Update all relevant queries
      queryClient.setQueriesData(
        { queryKey: queryKeys.picks.list({ leagueId: newPick.leagueId }) },
        (old: PicksResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            picks: [...old.picks, optimisticPick],
          };
        }
      );

      // Return context with the previous value
      return { previousPicks };
    },
    onError: (error, _newPick, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPicks) {
        context.previousPicks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('Failed to create pick:', error);
    },
    onSuccess: (data, _variables) => {
      // Invalidate picks list to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: queryKeys.picks.all });
      
      // Add the new pick to cache with the real data
      queryClient.setQueryData(
        queryKeys.picks.detail(data.pick.id),
        data
      );
    },
  });
};

export const useUpdatePick = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...pickData }: { id: number } & Parameters<typeof picksApi.updatePick>[1]) => 
      picksApi.updatePick(id, pickData),
    onMutate: async ({ id, ...pickData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.picks.all });

      // Snapshot the previous value
      const previousPicks = queryClient.getQueriesData({ queryKey: queryKeys.picks.all });

      // Optimistically update the cache
      queryClient.setQueriesData(
        { queryKey: queryKeys.picks.all },
        (old: PicksResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            picks: old.picks.map(pick => 
              pick.id === id 
                ? { ...pick, ...pickData, updatedAt: new Date().toISOString() }
                : pick
            ),
          };
        }
      );

      // Return context with the previous value
      return { previousPicks };
    },
    onError: (error, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPicks) {
        context.previousPicks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('Failed to update pick:', error);
    },
    onSuccess: (data, variables) => {
      // Invalidate picks list to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: queryKeys.picks.all });
      
      // Update the specific pick in cache
      queryClient.setQueryData(
        queryKeys.picks.detail(variables.id),
        data
      );
    },
  });
};

export const useDeletePick = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: picksApi.deletePick,
    onMutate: async (pickId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.picks.all });

      // Snapshot the previous value
      const previousPicks = queryClient.getQueriesData({ queryKey: queryKeys.picks.all });

      // Optimistically update the cache
      queryClient.setQueriesData(
        { queryKey: queryKeys.picks.all },
        (old: PicksResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            picks: old.picks.filter(pick => pick.id !== pickId),
          };
        }
      );

      // Return context with the previous value
      return { previousPicks };
    },
    onError: (error, _pickId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPicks) {
        context.previousPicks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('Failed to delete pick:', error);
    },
    onSuccess: (_, pickId) => {
      // Invalidate picks list to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: queryKeys.picks.all });
      
      // Remove the pick from cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.picks.detail(pickId) 
      });
    },
  });
};

// Helper hook to get picks for a specific game
export const usePicksForGame = (gameId: number, leagueId?: number) => {
  const { data: picksData, ...rest } = usePicks({ leagueId });
  
  const picksForGame = picksData?.picks?.filter(pick => pick.gameId === gameId) || [];
  
  return {
    picks: picksForGame,
    ...rest,
  };
};

// Helper hook to get picks for a specific week and league
export const usePicksForWeek = (week: number, leagueId: number) => {
  return usePicks({ week, leagueId });
};
