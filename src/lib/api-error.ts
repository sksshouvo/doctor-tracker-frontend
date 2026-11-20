import { isAxiosError } from "axios";
import type { ApiErrorBody } from "@/types/api";

export type AppError = {
  status: number;
  code: string;
  message: string;
  details: { path: string; message: string }[];
  requestId?: string;
  isNetwork: boolean;
};

export function toApiError(err: unknown): AppError {
  if (isAxiosError<ApiErrorBody>(err)) {
    const body = err.response?.data;
    if (body && typeof body === "object" && "error" in body && body.error) {
      return {
        status: err.response!.status,
        code: body.error.code,
        message: body.error.message,
        details: body.error.details ?? [],
        requestId: body.error.requestId,
        isNetwork: false,
      };
    }
    if (!err.response) {
      return {
        status: 0,
        code: "NETWORK_ERROR",
        message: "Can't reach the server. Check your connection.",
        details: [],
        isNetwork: true,
      };
    }
    return {
      status: err.response.status,
      code: "HTTP_ERROR",
      message: "Something went wrong. Please try again.",
      details: [],
      isNetwork: false,
    };
  }
  return {
    status: 0,
    code: "UNKNOWN",
    message: err instanceof Error ? err.message : "Something went wrong. Please try again.",
    details: [],
    isNetwork: false,
  };
}
