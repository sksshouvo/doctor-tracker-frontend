import type { Condition } from "@/types/api";

export type Doctor = {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  patientCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type DoctorDetail = Doctor & {
  stats: { totalPatients: number; byCondition: Record<Condition, number> };
};

export type DoctorOption = { id: string; name: string; specialization: string };
export type DoctorFacets = { specializations: string[]; hospitals: string[] };
export type DoctorInput = {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
};

export type DoctorListParams = {
  q: string;
  page: number;
  limit: number;
  sort: string;
  specialization: string[];
  hospital: string[];
  from: string | null;
  to: string | null;
};
