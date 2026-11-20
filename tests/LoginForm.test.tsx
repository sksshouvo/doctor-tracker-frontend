import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/features/auth/LoginForm";
import { useAuth } from "@/features/auth/store";
import { server } from "./msw";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams("next=/patients"),
}));

describe("LoginForm", () => {
  it("validates email and password before calling the API", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/^email/i), "not-an-email");
    await user.type(document.querySelector<HTMLInputElement>("input[name=password]")!, "short");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Enter a valid email")).toBeInTheDocument();
    expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
  });

  it("shows 'Invalid email or password', clears and focuses the password on 401", async () => {
    server.use(
      http.post("*/api/v1/auth/login", () =>
        HttpResponse.json(
          {
            success: false,
            error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
          },
          { status: 401 },
        ),
      ),
    );
    const user = userEvent.setup();
    render(<LoginForm />);
    const pw = document.querySelector<HTMLInputElement>("input[name=password]")!;
    await user.type(screen.getByLabelText(/^email/i), "admin@doctortracker.dev");
    await user.type(pw, "WrongPassword1");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
    await waitFor(() => expect(pw).toHaveValue(""));
    expect(pw).toHaveFocus();
  });

  it("stores the session and redirects to a safe `next` on success", async () => {
    server.use(
      http.post("*/api/v1/auth/login", () =>
        HttpResponse.json({
          success: true,
          data: {
            accessToken: "tok",
            user: { id: "1", name: "Admin", email: "a@b.co", role: "admin" },
          },
        }),
      ),
    );
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/^email/i), "admin@doctortracker.dev");
    await user.type(
      document.querySelector<HTMLInputElement>("input[name=password]")!,
      "Admin@12345",
    );
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/patients"));
    expect(useAuth.getState().accessToken).toBe("tok");
  });

  it("shows the rate-limit message on 429", async () => {
    server.use(
      http.post("*/api/v1/auth/login", () =>
        HttpResponse.json(
          {
            success: false,
            error: { code: "RATE_LIMITED", message: "Too many attempts, try again later" },
          },
          { status: 429 },
        ),
      ),
    );
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/^email/i), "admin@doctortracker.dev");
    await user.type(
      document.querySelector<HTMLInputElement>("input[name=password]")!,
      "Admin@12345",
    );
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Too many attempts, try again later",
    );
  });
});
