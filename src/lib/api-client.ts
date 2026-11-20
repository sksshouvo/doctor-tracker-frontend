import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuth } from "@/features/auth/store";
import type { ApiSuccess, User } from "@/types/api";

export const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  timeout: 15_000,
});

type Session = { accessToken: string; user: User };
type Retriable = InternalAxiosRequestConfig & { _retry?: boolean };

// A bare instance (no interceptors) so a failing refresh cannot recurse.
const bare = axios.create({ baseURL: "/api/v1", withCredentials: true, timeout: 15_000 });

let refreshPromise: Promise<Session> | null = null;

/** Single-flight refresh: concurrent 401s share one request. */
export function refreshSession(): Promise<Session> {
  refreshPromise ??= bare
    .post<ApiSuccess<Session>>("/auth/refresh")
    .then((r) => {
      useAuth.getState().setSession(r.data.data.accessToken, r.data.data.user);
      return r.data.data;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = useAuth.getState().accessToken;
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as Retriable | undefined;
    const isAuthCall = original?.url?.startsWith("/auth/");
    if (error.response?.status !== 401 || !original || original._retry || isAuthCall) {
      return Promise.reject(error);
    }
    original._retry = true;
    try {
      const { accessToken } = await refreshSession();
      original.headers.set("Authorization", `Bearer ${accessToken}`);
      return api(original);
    } catch {
      useAuth.getState().clear();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        // Hard navigation on purpose: it also drops all in-memory state (query cache, tokens).
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign(`/login?next=${next}&expired=1`);
      }
      return Promise.reject(error);
    }
  },
);
