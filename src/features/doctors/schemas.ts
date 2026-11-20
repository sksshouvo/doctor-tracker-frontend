import { z } from "zod";

export const phoneRegex = /^[+]?[0-9\s\-()]{7,20}$/;

export const doctorSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  specialization: z.string().trim().min(2, "Specialization is required").max(80),
  hospital: z.string().trim().min(2, "Hospital is required").max(120),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});
export type DoctorFormValues = z.infer<typeof doctorSchema>;
