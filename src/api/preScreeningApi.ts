import api from "./api.ts";

export type PreScreeningPayload = {
  identityVerified: boolean;
  licenseVerified: boolean;
  agreementConfirmed: boolean;
  agreementSignature?: string;
};

export type PreScreeningStatus = {
  _id: string;
  bookingId: string;
  renterId: string;
  identityVerified: boolean;
  licenseVerified: boolean;
  agreementConfirmed: boolean;
  agreementSignature?: string;
  agreementSignedAt?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  completedAt?: string;
};

export type PreScreeningStatusResponse = {
  success: boolean;
  data: PreScreeningStatus;
};

export async function getPreScreeningStatus(id: string) {
  const res = await api.get<PreScreeningStatusResponse>(`/api/pre-screening/${id}`);
  return res.data;
}

export type ConditionPhotoImage = {
  url: string;
  label: string;
  uploadedAt: string;
};

export type ConditionPhotoRecord = {
  _id: string;
  bookingId: string;
  phase: string;
  uploadedBy: {
    _id: string;
    fullName: string;
  };
  images: ConditionPhotoImage[];
  reviewConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type ConditionPhotoResponse = {
  success: boolean;
  data: ConditionPhotoRecord[];
};

export async function getConditionPhotos(id: string) {
  const res = await api.get<ConditionPhotoResponse>(`/api/condition-photos/${id}`);
  return res.data;
}

export async function completePreScreening(id: string, payload: PreScreeningPayload) {
  const res = await api.post(`/api/pre-screening/${id}/complete`, payload);
  return res.data;
}
