import { AxiosError } from "axios";
import api from "./api.ts";

export type CreateBookingPayload = {
  trailerId: string;
  startDate: string;
  endDate: string;
};

export async function createBooking(
  payload: CreateBookingPayload,
): Promise<unknown> {
  const res = await api.post("/api/bookings", payload);
  return res.data;
}

export function getBookingErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as
      | { message?: string; error?: string; msg?: string }
      | undefined;
    const m = data?.message ?? data?.error ?? data?.msg;
    if (typeof m === "string" && m.trim()) return m.trim();
    if (err.response?.status === 401) return "Please sign in again to book.";
    if (err.response?.status === 404) return "Trailer or booking endpoint not found.";
  }
  if (err instanceof Error && err.message) return err.message;
  return "Could not complete booking. Please try again.";
}
