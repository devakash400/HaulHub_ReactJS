import api from "./api.ts";

export type PreScreeningPayload = {
  identityVerified: boolean;
  licenseVerified: boolean;
  agreementConfirmed: boolean;
};

export async function completePreScreening(id: string, payload: PreScreeningPayload) {
  const res = await api.post(`/api/pre-screening/${id}/complete`, payload);
  return res.data;
}
