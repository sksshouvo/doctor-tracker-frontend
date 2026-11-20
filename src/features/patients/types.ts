import type { BloodGroup, Condition, Gender } from "@/types/api";

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email: string | null;
  address: string | null;
  bloodGroup: BloodGroup | null;
  diagnosis: string;
  condition: Condition;
  visitDate: string;
  notes: string | null;
  doctor: { id: string; name: string | null; specialization: string | null };
  createdAt: string;
  updatedAt: string;
};

export type PatientListParams = {
  q: string;
  page: number;
  limit: number;
  sort: string;
  condition: string[];
  doctorId: string | null;
  gender: string | null;
  dateField: "visitDate" | "createdAt";
  from: string | null;
  to: string | null;
};

export type PatientInput = {
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string;
  address?: string;
  bloodGroup?: BloodGroup;
  diagnosis: string;
  condition: Condition;
  visitDate: string;
  notes?: string;
  doctorId: string;
};
