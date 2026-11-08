import axios, { AxiosError } from "axios";

const TOKEN_KEY = "daily-ledger-token";

export const tokenStore = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let onUnauthorized: (() => void) | null = null;

/** Lets the auth layer react when the server rejects the stored token. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isAuthCall = error.config?.url?.startsWith("/auth/login");
    if (error.response?.status === 401 && !isAuthCall) onUnauthorized?.();
    return Promise.reject(error);
  }
);

/** Turns any API failure into a sentence suitable for a toast. */
export function errorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (error instanceof AxiosError) {
    if (!error.response) return "Can't reach the server. Check your connection.";
    const detail = (error.response.data as { detail?: unknown })?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0]?.msg) {
      const field = detail[0].loc?.at(-1);
      return field ? `${field}: ${detail[0].msg}` : detail[0].msg;
    }
  }
  return fallback;
}
