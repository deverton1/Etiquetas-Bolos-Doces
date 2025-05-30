// use-auth.tsx

import { createContext, useContext, useState, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // ADICIONADO useQueryClient

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
  login: (credentials: LoginCredentials) => Promise<User | undefined>; // Retorna User ou undefined
  logout: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient(); // INSTANCIA O QUERY CLIENT

  // apiUrl continua vazia para usar o proxy do Vite
  const apiUrl = ''; 

  // Auth status query
  const { 
    data: authData, 
    isLoading: authLoading,
    refetch: refetchAuth // refetchAuth é usado após login/logout
  } = useQuery({
    queryKey: ['authStatus'],
    queryFn: async () => {
      try {
        const res = await fetch(`${apiUrl}/api/auth/status`, {
          credentials: 'include',
          // REMOVIDO: mode: 'cors', // Não é necessário para same-origin
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
    refetchOnWindowFocus: false // Evita refetch desnecessário ao focar
  });

  // Login mutation - CORRIGIDO PARA SER A ÚNICA LÓGICA DE LOGIN
  const { mutateAsync: loginMutate, isPending: loginLoading } = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
        // REMOVIDO: mode: 'cors' // Não é necessário para same-origin
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro na rede' }));
        throw new Error(errorData.message || `Erro ${response.status}: Falha na autenticação`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Após sucesso da mutação, invalida e refetch a query de authStatus
      // Isso garante que o estado isAuthenticated e user seja atualizado.
      queryClient.invalidateQueries({ queryKey: ['authStatus'] });
      setError(null);
      console.log("Login successful, authStatus query invalidated.");
    },
    onError: (err) => {
      console.error('Login error details:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    }
  });

  // Logout mutation - CORRIGIDO PARA SER A ÚNICA LÓGICA DE LOGOUT
  const { mutateAsync: logoutMutate, isPending: logoutLoading } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${apiUrl}/api/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // REMOVIDO: mode: 'cors' // Não é necessário para same-origin
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro na rede' }));
        throw new Error(errorData.message || `Erro ${response.status}: Falha no logout`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Após sucesso da mutação, invalida e refetch a query de authStatus
      // Isso garante que o estado isAuthenticated e user seja atualizado para deslogado.
      queryClient.invalidateQueries({ queryKey: ['authStatus'] });
      setError(null);
      console.log("Logout successful, authStatus query invalidated.");
    },
    onError: (err) => {
      console.error('Logout error details:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer logout');
    }
  });

  // Funções expostas que utilizam as mutações do react-query
  const login = async (credentials: LoginCredentials) => {
    // Retornamos o dado da mutação para o componente de login usar se quiser
    return loginMutate(credentials);
  };

  const logout = async () => {
    await logoutMutate();
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