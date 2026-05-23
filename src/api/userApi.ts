import api, { API_BASE_URL } from "./api.ts";

/** Resolves stored profile picture path or URL for display. */
export const resolveProfilePictureUrl = (path?: string | null): string | null => {
  if (!path?.trim()) return null;
  const p = path.trim();
  if (/^https?:\/\//i.test(p) || /^data:image\//i.test(p)) return p;
  return `${API_BASE_URL}/${p.replace(/^\//, "")}`;
};

export type EmergencyContactPayload = {
  name: string;
  email: string;
  phoneNumber: string;
};

export type UserProfileApiData = {
  _id?: string;
  fullName?: string;
  legalName?: string;
  preferredFirstName?: string;
  email?: string;
  phoneNumber?: string;
  profilePicture?: string;
  address?: string;
  residentialAddress?: string;
  country?: string;
  state?: string;
  emergencyContact?: EmergencyContactPayload | null;
  addresses?: unknown[];
  role?: string;
  rating?: number;
  totalReviews?: number;
  rentalHistory?: string[];
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateUserProfilePayload = {
  profilePicture?: string;
  fullName?: string;
  legalName?: string;
  preferredFirstName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  residentialAddress?: string;
  country?: string;
  state?: string;
  emergencyContact?: EmergencyContactPayload;
};

type ProfileResponse = {
  success: boolean;
  data?: UserProfileApiData;
};

export const getUserProfile = async (): Promise<UserProfileApiData> => {
  const res = await api.get<ProfileResponse>("/api/user/profile");
  if (!res.data?.success || res.data.data == null) {
    throw new Error("Unable to load profile");
  }
  return res.data.data;
};

export const updateUserProfile = async (
  payload: UpdateUserProfilePayload
): Promise<UserProfileApiData> => {
  const res = await api.patch<ProfileResponse>("/api/user/profile", payload);
  if (!res.data?.success) {
    throw new Error("Unable to update profile");
  }
  if (res.data.data) return res.data.data;
  return getUserProfile();
};

/** Upload profile image via PATCH multipart (profile picture field only). */
export const updateUserProfilePicture = async (
  file: File
): Promise<UserProfileApiData> => {
  const formData = new FormData();
  formData.append("profilePicture", file);
  // Do not set the Content-Type header manually; let the browser set the
  // multipart boundary automatically so the server can parse the form data.
  const res = await api.patch<ProfileResponse>("/api/user/profile", formData);
  if (!res.data?.success) {
    throw new Error("Unable to update profile picture");
  }
  if (res.data.data) return res.data.data;
  return getUserProfile();
};
