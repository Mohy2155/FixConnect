import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import type { User } from "../../../shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AuthUser extends Omit<User, 'password'> {}

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query to get current user
  const { data: user, isLoading, error } = useQuery<AuthUser | null>({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        if (response.status === 401) {
          return null;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        return await response.json();
      } catch (error) {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(['/api/auth/user'], userData);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
      role: 'homeowner' | 'company';
    }) => {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      return response.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(['/api/auth/user'], userData);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Logout failed');
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/user'], null);
      queryClient.clear();
      window.location.href = '/';
    },
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    loginMutation,
    registerMutation,
    logoutMutation,
  };
}