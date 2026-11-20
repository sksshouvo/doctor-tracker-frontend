export type PageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};
export type ApiSuccess<T> = { success: true; data: T };
export type ApiList<T> = { success: true; data: T[]; meta: PageMeta };
export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: { path: string; message: string }[];
    requestId?: string;
  };
};

export type Condition = "stable" | "critical" | "recovering" | "under_observation" | "discharged";
export type Gender = "male" | "female" | "other";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type User = { id: string; name: string; email: string; role: string };
