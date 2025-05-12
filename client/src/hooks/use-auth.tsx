import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Tipo para o usuário
type User = {
  id: number;
  email: string;
  isAdmin: boolean;
};

// Tipo para as credenciais de login
type LoginCredentials = {
  email: string;
  password: string;
};

// Tipo para o contexto de autenticação
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
};

// Criação do contexto
const AuthContext = createContext<AuthContextType | null>(null);

// Provider para o contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Query para verificar o status da autenticação
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/status"],
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao realizar login");
      }

      return await response.json();
    },
    onSuccess: () => {
      setError(null);
      refetch();
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Mutation para logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao realizar logout");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/status"] });
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Função para realizar login
  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  // Função para realizar logout
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const user = data?.authenticated ? data.user : null;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
        isAuthenticated,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para utilizar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}