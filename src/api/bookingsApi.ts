import { AxiosError } from "axios";
import api from "./api.ts";

export type CreateBookingPayload = {
  trailerId: string;
  startDate: string;
  endDate: string;
  // optional files (browser File objects)
  drivingLicenseDocuments?: File[] | null;
  passportDocuments?: File[] | null;
};

export async function createBooking(
  payload: CreateBookingPayload,
): Promise<unknown> {
  const { drivingLicenseDocuments, passportDocuments, ...rest } = payload;

  // If files are present, use multipart/form-data
  if (
    (Array.isArray(drivingLicenseDocuments) && drivingLicenseDocuments.length > 0) ||
    (Array.isArray(passportDocuments) && passportDocuments.length > 0)
  ) {
    const form = new FormData();
    Object.entries(rest).forEach(([k, v]) => {
      if (v != null) form.append(k, String(v));
    });
    if (Array.isArray(drivingLicenseDocuments)) {
      drivingLicenseDocuments.forEach((f) => form.append("drivingLicenseDocuments", f));
    }
    if (Array.isArray(passportDocuments)) {
      passportDocuments.forEach((f) => form.append("passportDocuments", f));
    }
    const res = await api.post("/api/bookings", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  const res = await api.post("/api/bookings", rest);
  return res.data;
}

export async function getMyBookings(): Promise<unknown[]> {
  const res = await api.get("/api/bookings/me");
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
