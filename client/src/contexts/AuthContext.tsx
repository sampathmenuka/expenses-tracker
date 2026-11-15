import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, setUnauthorizedHandler, tokenStore } from "@/lib/api";
import type { AuthResponse, User } from "@/types/api";
import { setCurrency } from "@/utils/format";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  /** Swaps in a newly issued token, e.g. after a password change revokes the old ones. */
  replaceSession: (response: AuthResponse) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const ME_KEY = ["auth", "me"] as const;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(tokenStore.get);

  const logout = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const { data: user, isLoading } = useQuery({
    queryKey: ME_KEY,
    queryFn: async () => (await api.get<User>("/auth/me")).data,
    enabled: Boolean(token),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (user) setCurrency(user.currency);
  }, [user]);

  const acceptSession = useCallback(
    (response: AuthResponse) => {
      tokenStore.set(response.accessToken);
      queryClient.clear();
      queryClient.setQueryData(ME_KEY, response.user);
      setToken(response.accessToken);
    },
    [queryClient]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: token ? (user ?? null) : null,
      isLoading: Boolean(token) && isLoading,
      login: async (email, password) => {
        const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
        acceptSession(data);
      },
      register: async (name, email, password) => {
        const { data } = await api.post<AuthResponse>("/auth/register", {
          name,
          email,
          password,
        });
        acceptSession(data);
      },
      logout,
      replaceSession: (response) => {
        tokenStore.set(response.accessToken);
        setToken(response.accessToken);
        queryClient.setQueryData(ME_KEY, response.user);
      },
    }),
    [token, user, isLoading, acceptSession, logout, queryClient]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

/** The signed-in user; only call inside the authenticated app shell. */
export function useUser(): User {
  const { user } = useAuth();
  if (!user) throw new Error("useUser called without a signed-in user");
  return user;
}
