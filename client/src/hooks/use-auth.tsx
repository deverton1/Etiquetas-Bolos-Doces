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
  
  // Sempre usamos caminhos relativos para evitar problemas de CORS
  const apiUrl = '';

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

  // Login function com melhor tratamento de erros
  const login = async (credentials: LoginCredentials) => {
    try {
      // Tentativa direta de login usando fetch para mais controle
      const response = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });
      
      if (!response.ok) {
        // Se a resposta não for ok, tentamos obter a mensagem de erro
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Falha no login');
        } catch (jsonError) {
          // Se não conseguirmos interpretar o JSON, usamos um erro genérico
          throw new Error(`Erro ${response.status}: Falha na autenticação`);
        }
      }
      
      // Se o login for bem-sucedido, atualizamos o estado
      await refetchAuth();
      setError(null);
    } catch (err) {
      console.error('Login error details:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
      throw err;
    }
  };

  // Logout function com melhor tratamento de erros
  const logout = async () => {
    try {
      // Tentativa direta de logout usando fetch
      const response = await fetch(`${apiUrl}/api/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      // Independente da resposta, atualizamos o estado de autenticação
      await refetchAuth();
      setError(null);
    } catch (err) {
      console.error('Logout error details:', err);
      // Mesmo com erro, tentamos atualizar o estado
      await refetchAuth();
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