import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { loginSchema, insertUserSchema, type LoginData, type InsertUser } from "@shared/schema";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: number;
  username: string;
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  token: string | null;
  loginMutation: UseMutationResult<{ token: string; user: User }, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<{ token: string; user: User }, Error, InsertUser>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  const {
    data: authData,
    error,
    isLoading,
  } = useQuery<{ user: User } | undefined, Error>({
    queryKey: ["/api/auth/profile"],
    queryFn: async () => {
      if (!token) return undefined;
      
      const response = await fetch("/api/auth/profile", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          setToken(null);
          return undefined;
        }
        throw new Error("Failed to fetch profile");
      }
      
      return response.json();
    },
    enabled: !!token,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }
      
      return res.json();
    },
    onSuccess: (data: { token: string; user: User }) => {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      queryClient.setQueryData(["/api/auth/profile"], { user: data.user });
      toast({
        title: "Welcome back!",
        description: `Logged in as ${data.user.name}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registration failed");
      }
      
      return res.json();
    },
    onSuccess: (data: { token: string; user: User }) => {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      queryClient.setQueryData(["/api/auth/profile"], { user: data.user });
      toast({
        title: "Account created!",
        description: `Welcome ${data.user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Just clear local storage for JWT-based auth
      return Promise.resolve();
    },
    onSuccess: () => {
      localStorage.removeItem("token");
      setToken(null);
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "See you next time!",
      });
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  // Update API requests to include token
  useEffect(() => {
    if (token) {
      // Set default authorization header for all requests
      queryClient.setDefaultOptions({
        queries: {
          retry: (failureCount, error: any) => {
            if (error?.status === 401 || error?.status === 403) {
              logout();
              return false;
            }
            return failureCount < 3;
          },
        },
      });
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user: authData?.user ?? null,
        isLoading,
        error,
        token,
        loginMutation,
        logoutMutation,
        registerMutation,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}