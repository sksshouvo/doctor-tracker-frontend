import { z } from "zod";
import { phoneRegex } from "@/features/doctors/schemas";

export const patientSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  age: z
    .number({ error: "Age is required" })
    .int("Age must be a whole number")
    .min(0, "Age can't be negative")
    .max(130, "Age must be 130 or less"),
  gender: z.enum(["male", "female", "other"], { error: "Select a gender" }),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number"),
  email: z
    .union([z.literal(""), z.string().trim().toLowerCase().email("Enter a valid email")])
    .optional(),
  address: z.string().trim().max(250, "Keep the address under 250 characters").optional(),
  doctorId: z.string().min(1, "Select a doctor"),
  diagnosis: z.string().trim().min(2, "Diagnosis is required").max(200),
  condition: z.enum(["stable", "critical", "recovering", "under_observation", "discharged"], {
    error: "Select a condition",
  }),
  visitDate: z
    .string()
    .min(1, "Visit date is required")
    .refine((d) => d <= localToday(), "Visit date cannot be in the future"),
  notes: z.string().trim().max(1000, "Keep notes under 1000 characters").optional(),
});
export type PatientFormValues = z.infer<typeof patientSchema>;

function localToday() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
