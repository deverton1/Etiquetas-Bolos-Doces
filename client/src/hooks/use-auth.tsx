import { createContext, useContext, useState, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

// Define types
interface User {
  id: number;
  email: string;
  isAdmin: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  
  // Em produção, use caminhos relativos para evitar CORS
  // Em desenvolvimento, use a URL da API configurada
  const isProduction = import.meta.env.PROD;
  const apiUrl = isProduction ? '' : (import.meta.env.VITE_API_URL || '');

  // Auth status query
  const { 
    data: authData, 
    isLoading: authLoading,
    refetch: refetchAuth 
  } = useQuery({
    queryKey: ['authStatus'],
    queryFn: async () => {
      try {
        const res = await fetch(`${apiUrl}/api/auth/status`, {
          credentials: 'include',
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        if (!res.ok) {
          console.log('Auth status response not ok:', res.status);
          return { authenticated: false, user: null };
        }
        
        return await res.json();
      } catch (error) {
        console.error('Error fetching auth status:', error);
        return { authenticated: false, user: null };
      }
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  // Login mutation
  const { mutateAsync: loginMutate, isPending: loginLoading } = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        const response = await fetch(`${apiUrl}/api/login`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(credentials),
          credentials: 'include',
          mode: 'cors'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Erro na rede' }));
          throw new Error(errorData.message || 'Falha no login');
        }
        
        return response.json();
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    }
  });

  // Logout mutation
  const { mutateAsync: logoutMutate, isPending: logoutLoading } = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`${apiUrl}/api/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Erro na rede' }));
          throw new Error(errorData.message || 'Falha no logout');
        }
        
        return response.json();
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      }
    }
  });

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      await loginMutate(credentials);
      await refetchAuth();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
      throw err;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutMutate();
      await refetchAuth();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer logout');
      throw err;
    }
  };

  // Get auth status values
  const isAuthenticated = authData?.authenticated || false;
  const user = authData?.user || null;
  const isLoading = authLoading || loginLoading || logoutLoading;

  // Return the provider
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        error,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}