import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User
} from '../../types';
import { queryKeys } from '../../types';

// API functions
const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    // The API doesn't have a logout endpoint, so we just clear local storage
  },
};

// Custom hooks
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Set user data in cache
      queryClient.setQueryData(queryKeys.auth.me, { user: data.user });
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
      // Clear any existing token on error
      localStorage.removeItem('token');
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Set user data in cache
      queryClient.setQueryData(queryKeys.auth.me, { user: data.user });
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
      // Clear any existing token on error
      localStorage.removeItem('token');
    },
  });
};

export const useMe = () => {
  const [hasToken, setHasToken] = React.useState(false);

  React.useEffect(() => {
    setHasToken(!!localStorage.getItem('token'));
  }, []);

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.getMe,
    enabled: hasToken, // Only run if token exists
    retry: (failureCount, error: any) => {
      // Don't retry on 401 (unauthorized) - user needs to login
      if (error?.response?.status === 401) {
        localStorage.removeItem('token');
        setHasToken(false);
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      // Invalidate auth queries to trigger re-authentication check
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
    onError: (error: any) => {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local data
      queryClient.clear();
      localStorage.removeItem('token');
      
      // Invalidate auth queries to trigger re-authentication check
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
};

// Helper hook to check if user is authenticated
export const useAuth = () => {
  const [hasToken, setHasToken] = React.useState(false);
  const { data, isLoading, error } = useMe();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    setHasToken(!!token);
  }, []);

  // Update token state when localStorage changes (e.g., after logout)
  React.useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      setHasToken(!!token);
    };

    // Listen for storage changes (useful for logout from other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for token changes
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      setHasToken(prev => prev !== !!token ? !!token : prev);
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return {
    user: data?.user,
    isAuthenticated: hasToken && !!data?.user && !isLoading,
    isLoading: isLoading || !hasToken,
    error,
  };
};
