import api from "./api.ts";

export type PreScreeningPayload = {
  identityVerified: boolean;
  licenseVerified: boolean;
  agreementConfirmed: boolean;
};

export type PreScreeningStatus = {
  _id: string;
  bookingId: string;
  renterId: string;
  identityVerified: boolean;
  licenseVerified: boolean;
  agreementConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  completedAt: string;
};

export type PreScreeningStatusResponse = {
  success: boolean;
  data: PreScreeningStatus;
};

export async function getPreScreeningStatus(id: string) {
  const res = await api.get<PreScreeningStatusResponse>(`/api/pre-screening/${id}`);
  return res.data;
}

export async function completePreScreening(id: string, payload: PreScreeningPayload) {
  const res = await api.post(`/api/pre-screening/${id}/complete`, payload);
  return res.data;
}
