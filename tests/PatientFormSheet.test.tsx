import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { PatientFormSheet } from "@/features/patients/components/PatientFormSheet";
import { patientSchema } from "@/features/patients/schemas";
import type { Patient } from "@/features/patients/types";
import { toYmd } from "@/lib/format";
import { server } from "./msw";
import { renderWithProviders } from "./utils";

const valid = {
  name: "Karim Hossain",
  age: 54,
  gender: "male" as const,
  phone: "+8801711000000",
  doctorId: "507f1f77bcf86cd799439011",
  diagnosis: "Hypertension",
  condition: "stable" as const,
  visitDate: toYmd(new Date()),
};

describe("patientSchema", () => {
  it("accepts a valid patient", () => expect(patientSchema.safeParse(valid).success).toBe(true));

  it("rejects ages outside 0..130 and non-integers", () => {
    for (const age of [-1, 131, 3.5, NaN])
      expect(patientSchema.safeParse({ ...valid, age }).success).toBe(false);
    for (const age of [0, 130])
      expect(patientSchema.safeParse({ ...valid, age }).success).toBe(true);
  });

  it("rejects a future visit date", () => {
    const tomorrow = new Date(Date.now() + 2 * 86_400_000);
    const r = patientSchema.safeParse({ ...valid, visitDate: toYmd(tomorrow) });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe("Visit date cannot be in the future");
  });

  it("allows empty optional email but rejects a malformed one", () => {
    expect(patientSchema.safeParse({ ...valid, email: "" }).success).toBe(true);
    expect(patientSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });
});

const existing: Patient = {
  id: "p1",
  name: "Karim Hossain",
  age: 54,
  gender: "male",
  phone: "+8801711000000",
  email: null,
  address: null,
  bloodGroup: null,
  diagnosis: "Hypertension",
  condition: "stable",
  visitDate: "2026-10-02T00:00:00.000Z",
  notes: null,
  doctor: { id: "507f1f77bcf86cd799439011", name: "Dr. Test", specialization: "Cardiology" },
  createdAt: "2026-10-02T00:00:00.000Z",
  updatedAt: "2026-10-02T00:00:00.000Z",
};

describe("PatientFormSheet", () => {
  it("shows validation errors for an empty create form and does not call the API", async () => {
    let called = false;
    server.use(
      http.post(
        "*/api/v1/patients",
        () => ((called = true), HttpResponse.json({}, { status: 201 })),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<PatientFormSheet open onOpenChange={() => {}} />);
    await user.click(await screen.findByRole("button", { name: "Add patient" }));
    expect(await screen.findByText("Name must be at least 2 characters")).toBeInTheDocument();
    expect(screen.getByText("Age is required")).toBeInTheDocument();
    expect(screen.getByText("Select a doctor")).toBeInTheDocument();
    expect(called).toBe(false);
  });

  it("edit mode PATCHes only the dirty fields", async () => {
    let body: unknown;
    server.use(
      http.patch("*/api/v1/patients/p1", async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({
          success: true,
          data: { ...existing, name: "Karim H. Hossain" },
        });
      }),
    );
    const user = userEvent.setup();
    const { client } = renderWithProviders(
      <PatientFormSheet open onOpenChange={() => {}} patient={existing} />,
    );
    client.setQueryData(["noop"], 1);
    const dialog = await screen.findByRole("dialog");
    const name = within(dialog).getByDisplayValue("Karim Hossain");
    await user.clear(name);
    await user.type(name, "Karim H. Hossain");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(body).toEqual({ name: "Karim H. Hossain" }));
  });

  it("edit mode with no changes closes without calling the API", async () => {
    let called = false;
    server.use(http.patch("*/api/v1/patients/p1", () => ((called = true), HttpResponse.json({}))));
    let closed = false;
    const user = userEvent.setup();
    renderWithProviders(
      <PatientFormSheet open onOpenChange={(o) => (closed = !o)} patient={existing} />,
    );
    await user.click(await screen.findByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(closed).toBe(true));
    expect(called).toBe(false);
  });

  it("asks before discarding unsaved changes", async () => {
    let closed = false;
    const user = userEvent.setup();
    renderWithProviders(
      <PatientFormSheet open onOpenChange={(o) => (closed = !o)} patient={existing} />,
    );
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByDisplayValue("Karim Hossain"), "x");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(await screen.findByText("Discard changes?")).toBeInTheDocument();
    expect(closed).toBe(false);
    await user.click(screen.getByRole("button", { name: "Discard" }));
    await waitFor(() => expect(closed).toBe(true));
  });
});
