import { AxiosError } from "axios";
import api from "./api.ts";

export type CreateBookingPayload = {
  trailerId: string;
  startDate: string;
  endDate: string;
  // optional files (browser File objects)
  drivingLicenseDocuments?: File[] | null;
  proofOfInsuranceDocuments?: File[] | null;
};

export async function createBooking(
  payload: CreateBookingPayload,
): Promise<unknown> {
  const { drivingLicenseDocuments, proofOfInsuranceDocuments, ...rest } = payload;

  // If files are present, use multipart/form-data
  if (
    (Array.isArray(drivingLicenseDocuments) && drivingLicenseDocuments.length > 0) ||
    (Array.isArray(proofOfInsuranceDocuments) && proofOfInsuranceDocuments.length > 0)
  ) {
    const form = new FormData();
    Object.entries(rest).forEach(([k, v]) => {
      if (v != null) form.append(k, String(v));
    });
    if (Array.isArray(drivingLicenseDocuments)) {
      drivingLicenseDocuments.forEach((f) => form.append("drivingLicenseDocuments", f));
    }
    if (Array.isArray(proofOfInsuranceDocuments)) {
      proofOfInsuranceDocuments.forEach((f) => form.append("proofOfInsuranceDocuments", f));
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

export async function getRenterBookingHistory(): Promise<any> {
  const res = await api.get("/api/bookings/renter/history");
  return res.data;
}

export async function getOwnerManageBookings(trailerId?: string): Promise<any> {
  const url = trailerId
    ? `/api/owner/manage-bookings?trailerId=${encodeURIComponent(trailerId)}`
    : "/api/owner/manage-bookings";
  const res = await api.get(url);
  return res.data;
}

export async function getBookingById(bookingId: string): Promise<any> {
  const res = await api.get(`/api/bookings/${bookingId}`);
  return res.data;
}

export async function returnBooking(bookingId: string) {
  const res = await api.post(`/api/bookings/${bookingId}/return`);
  return res.data;
}

export async function markReadyForPickup(bookingId: string) {
  const res = await api.post(`/api/bookings/${bookingId}/ready-for-pickup`);
  return res.data;
}

export type ReturnRequestPayload = {
  condition: "no_damage" | "minor_scratch" | "damage_note";
  note?: string;
  photos: File[];
};

export async function requestReturn(bookingId: string, payload: ReturnRequestPayload) {
  const formData = new FormData();
  formData.append("condition", payload.condition);
  if (payload.note) {
    formData.append("note", payload.note);
  }
  if (Array.isArray(payload.photos)) {
    payload.photos.forEach((file) => {
      formData.append("photos", file);
    });
  }

  const res = await api.post(`/api/bookings/${bookingId}/return-request`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export type AcceptReturnPayload = {
  penaltyAmount?: number;
  penaltyReason?: string;
};

export async function acceptReturnBooking(bookingId: string, payload?: AcceptReturnPayload) {
  const res = await api.post(`/api/bookings/${bookingId}/return-accept`, payload);
  return res.data;
}

export async function getReturnReviewPhotos(bookingId: string) {
  const res = await api.get(`/api/condition-photos/${bookingId}/return-review`);
  return res.data?.data ?? null;
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
