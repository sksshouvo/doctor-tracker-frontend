import { api, refreshSession } from "@/lib/api-client";
import type { ApiSuccess, User } from "@/types/api";

export const authApi = {
  login: (body: { email: string; password: string }) =>
    api
      .post<ApiSuccess<{ accessToken: string; user: User }>>("/auth/login", body)
      .then((r) => r.data.data),
  refresh: refreshSession,
  logout: () => api.post("/auth/logout"),
};
