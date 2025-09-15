# React Query Integration Guide

This document explains how React Query (TanStack Query) has been integrated into the Football Pickem frontend application.

## 🚀 Overview

React Query provides powerful data fetching, caching, and synchronization capabilities for React applications. It eliminates the need for complex state management libraries for server state and provides excellent developer experience with automatic loading states, error handling, and background updates.

## 📁 File Structure

```
frontend/src/
├── hooks/
│   ├── api/
│   │   ├── auth.ts          # Authentication hooks
│   │   ├── leagues.ts       # League management hooks
│   │   ├── games.ts         # Game and team hooks
│   │   ├── picks.ts         # Pick management hooks
│   │   └── index.ts         # Export all API hooks
│   └── index.ts             # Export all hooks
├── services/
│   ├── api.ts               # Axios configuration
│   └── queryClient.ts       # React Query client setup
├── types/
│   └── index.ts             # TypeScript types and query keys
├── utils/
│   └── cacheUtils.ts        # Cache invalidation utilities
├── components/
│   ├── ErrorBoundary.tsx    # Error boundary component
│   ├── QueryErrorBoundary.tsx # React Query error boundary
│   └── ReactQueryExample.tsx # Example usage component
└── App.tsx                  # Main app with QueryClientProvider
```

## 🔧 Configuration

### QueryClient Setup

The QueryClient is configured with optimal defaults in `src/services/queryClient.ts`:

- **Stale Time**: 5 minutes (data stays fresh)
- **Garbage Collection Time**: 10 minutes (unused data cleanup)
- **Retry Logic**: Smart retry with exponential backoff
- **Error Handling**: Global error handlers for different mutation types

### Error Boundaries

Two error boundary components are provided:
- `ErrorBoundary`: General error boundary for React errors
- `QueryErrorBoundary`: Specialized for React Query errors with reset functionality

## 🎣 Available Hooks

### Authentication Hooks

```typescript
import { useAuth, useLogin, useRegister, useLogout } from '../hooks';

// Check authentication status
const { user, isAuthenticated, isLoading } = useAuth();

// Login mutation
const loginMutation = useLogin();
await loginMutation.mutateAsync({ email, password });

// Register mutation
const registerMutation = useRegister();
await registerMutation.mutateAsync({ username, email, password });

// Logout mutation
const logoutMutation = useLogout();
await logoutMutation.mutateAsync();
```

### League Hooks

```typescript
import { 
  useLeagues, 
  useLeague, 
  useCreateLeague, 
  useJoinLeague, 
  useLeaveLeague 
} from '../hooks';

// Fetch leagues with pagination
const { data: leaguesData, isLoading } = useLeagues({ 
  page: 1, 
  limit: 10, 
  seasonYear: 2024 
});

// Fetch single league
const { data: leagueData } = useLeague(leagueId);

// Create league mutation
const createLeagueMutation = useCreateLeague();
await createLeagueMutation.mutateAsync({
  name: 'My League',
  seasonYear: 2024,
  maxParticipants: 12
});

// Join/leave league mutations
const joinLeagueMutation = useJoinLeague();
const leaveLeagueMutation = useLeaveLeague();
```

### Game Hooks

```typescript
import { useGames, useGamesByWeek, useGame, useTeams } from '../hooks';

// Fetch games with filters
const { data: gamesData } = useGames({ week: 1, seasonYear: 2024 });

// Fetch games for specific week
const { data: weekGames } = useGamesByWeek(1, 2024);

// Fetch single game
const { data: gameData } = useGame(gameId);

// Fetch all teams
const { data: teamsData } = useTeams();
```

### Pick Hooks

```typescript
import { 
  usePicks, 
  useCreatePick, 
  useUpdatePick, 
  useDeletePick,
  usePicksForGame,
  usePicksForWeek 
} from '../hooks';

// Fetch picks with filters
const { data: picksData } = usePicks({ week: 1, leagueId: 123 });

// Create pick mutation (with optimistic updates)
const createPickMutation = useCreatePick();
await createPickMutation.mutateAsync({
  gameId: 1,
  pickedTeamId: 2,
  leagueId: 123,
  pickType: 'spread',
  confidencePoints: 10
});

// Update pick mutation
const updatePickMutation = useUpdatePick();
await updatePickMutation.mutateAsync({
  id: pickId,
  confidencePoints: 12
});

// Delete pick mutation
const deletePickMutation = useDeletePick();
await deletePickMutation.mutateAsync(pickId);

// Helper hooks
const { picks } = usePicksForGame(gameId, leagueId);
const { picks: weekPicks } = usePicksForWeek(week, leagueId);
```

## ⚡ Optimistic Updates

The integration includes optimistic updates for better user experience:

### Pick Operations
- **Create Pick**: Immediately shows the pick in the UI
- **Update Pick**: Instantly reflects changes
- **Delete Pick**: Immediately removes from UI

### League Operations
- **Join League**: Instantly updates participant count
- **Leave League**: Immediately decreases participant count

All optimistic updates include proper rollback on error.

## 🗂️ Cache Management

### Query Keys

Centralized query keys in `src/types/index.ts` ensure consistent caching:

```typescript
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  leagues: {
    all: ['leagues'] as const,
    list: (filters) => ['leagues', 'list', filters] as const,
    detail: (id) => ['leagues', 'detail', id] as const,
    // ... more keys
  },
  // ... other resources
};
```

### Cache Invalidation

Utility functions in `src/utils/cacheUtils.ts` provide easy cache management:

```typescript
import { cacheUtils } from '../utils/cacheUtils';
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Invalidate specific data
cacheUtils.invalidateLeagues(queryClient);
cacheUtils.invalidateLeague(queryClient, leagueId);
cacheUtils.invalidatePicksForWeek(queryClient, week);

// Clear all cache (useful for logout)
cacheUtils.clearAll(queryClient);
```

## 🔄 Automatic Features

### Background Refetching
- Data automatically refetches when it becomes stale
- Refetch on window focus (disabled by default for better UX)
- Refetch on network reconnection

### Error Handling
- Automatic retry with exponential backoff
- Smart retry logic (no retry on 4xx errors)
- Global error boundaries for graceful error handling

### Loading States
- Built-in loading states for all queries and mutations
- Pending states for mutations
- Error states with error messages

## 🛠️ Development Tools

### React Query DevTools
Development tools are included and can be toggled:
- Query inspection
- Cache visualization
- Mutation tracking
- Performance monitoring

### TypeScript Support
Full TypeScript support with:
- Type-safe API calls
- IntelliSense for all hooks
- Compile-time error checking
- Auto-completion for query keys

## 📝 Usage Examples

### Basic Data Fetching
```typescript
function LeaguesList() {
  const { data, isLoading, error } = useLeagues();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {data?.leagues.map(league => (
        <li key={league.id}>{league.name}</li>
      ))}
    </ul>
  );
}
```

### Mutation with Loading State
```typescript
function CreateLeagueForm() {
  const createLeagueMutation = useCreateLeague();
  
  const handleSubmit = async (formData) => {
    try {
      await createLeagueMutation.mutateAsync(formData);
      // Success handling
    } catch (error) {
      // Error handling
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <button disabled={createLeagueMutation.isPending}>
        {createLeagueMutation.isPending ? 'Creating...' : 'Create League'}
      </button>
      {createLeagueMutation.isError && (
        <div>Error: {createLeagueMutation.error?.message}</div>
      )}
    </form>
  );
}
```

### Conditional Queries
```typescript
function UserProfile() {
  const { user, isAuthenticated } = useAuth();
  const { data: picks } = usePicks(
    { leagueId: user?.id }, 
    { enabled: isAuthenticated } // Only run if authenticated
  );
  
  if (!isAuthenticated) return <div>Please login</div>;
  
  return <div>Your picks: {picks?.length}</div>;
}
```

## 🚀 Performance Benefits

1. **Reduced API Calls**: Intelligent caching prevents unnecessary requests
2. **Background Updates**: Data stays fresh without blocking UI
3. **Optimistic Updates**: Instant UI feedback for better UX
4. **Automatic Retries**: Resilient to network issues
5. **Memory Management**: Automatic cleanup of unused data

## 🔧 Customization

### Stale Time Configuration
Adjust stale times based on data volatility:
- Games: 5 minutes (rarely change)
- Picks: 1 minute (change frequently)
- Teams: 30 minutes (very stable)

### Retry Configuration
Customize retry behavior:
- Auth mutations: 1 retry
- Data queries: 3 retries with exponential backoff
- No retry on 4xx errors (client errors)

### Error Handling
Customize error handling per mutation type:
- Auth errors: Clear token and redirect
- League errors: Show user-friendly messages
- Pick errors: Rollback optimistic updates

## 📚 Additional Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [Query Key Factory Pattern](https://tkdodo.eu/blog/effective-react-query-keys)

## 🐛 Troubleshooting

### Common Issues

1. **Stale Data**: Check stale time configuration
2. **Infinite Loops**: Verify query key dependencies
3. **Memory Leaks**: Ensure proper cleanup in useEffect
4. **Type Errors**: Update TypeScript types when API changes

### Debug Tools

1. **React Query DevTools**: Visualize cache and queries
2. **Browser DevTools**: Network tab for API calls
3. **Console Logs**: Built-in error logging
4. **Error Boundaries**: Graceful error handling

This integration provides a robust, type-safe, and performant data layer for the Football Pickem application.
