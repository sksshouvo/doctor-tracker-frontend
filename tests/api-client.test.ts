import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { useAuth } from "@/features/auth/store";
import { api } from "@/lib/api-client";
import { server } from "./msw";

const user = { id: "1", name: "Admin", email: "a@b.co", role: "admin" };

describe("api-client token refresh", () => {
  beforeEach(() => useAuth.getState().setSession("expired-token", user));

  it("two parallel 401s trigger ONE refresh and both requests are retried", async () => {
    let refreshCalls = 0;
    const seen: string[] = [];
    server.use(
      http.post("*/api/v1/auth/refresh", async () => {
        refreshCalls++;
        await new Promise((r) => setTimeout(r, 30));
        return HttpResponse.json({ success: true, data: { accessToken: "fresh-token", user } });
      }),
      http.get("*/api/v1/doctors", ({ request }) => {
        const auth = request.headers.get("authorization");
        seen.push(`doctors:${auth}`);
        return auth === "Bearer fresh-token"
          ? HttpResponse.json({ success: true, data: [] })
          : HttpResponse.json(
              { success: false, error: { code: "UNAUTHORIZED", message: "x" } },
              { status: 401 },
            );
      }),
      http.get("*/api/v1/patients", ({ request }) => {
        const auth = request.headers.get("authorization");
        seen.push(`patients:${auth}`);
        return auth === "Bearer fresh-token"
          ? HttpResponse.json({ success: true, data: [] })
          : HttpResponse.json(
              { success: false, error: { code: "UNAUTHORIZED", message: "x" } },
              { status: 401 },
            );
      }),
    );

    const [a, b] = await Promise.all([api.get("/doctors"), api.get("/patients")]);
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(refreshCalls).toBe(1);
    expect(useAuth.getState().accessToken).toBe("fresh-token");
    expect(seen.filter((s) => s.endsWith("fresh-token"))).toHaveLength(2); // both retried with the new token
  });

  it("does not try to refresh /auth/* calls", async () => {
    let refreshCalls = 0;
    server.use(
      http.post("*/api/v1/auth/refresh", () => {
        refreshCalls++;
        return HttpResponse.json({}, { status: 401 });
      }),
      http.post("*/api/v1/auth/login", () =>
        HttpResponse.json(
          { success: false, error: { code: "INVALID_CREDENTIALS", message: "bad" } },
          { status: 401 },
        ),
      ),
    );
    await expect(api.post("/auth/login", {})).rejects.toMatchObject({ response: { status: 401 } });
    expect(refreshCalls).toBe(0);
  });
});
