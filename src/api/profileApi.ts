import api from "../api/api.ts";

export type ProfileUpdateBody = {
  legalName: string;
  preferredFirstName: string;
  email?: string;
  phoneNumber?: string;
  profilePicture?: string; // publicId
};

export type ProfileUpdateResponse = {
  success: boolean;
  data: any;
};

export async function updateUserProfile(
  body: ProfileUpdateBody
): Promise<ProfileUpdateResponse> {
  const res = await api.patch(`/api/user/profile`, body, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data as ProfileUpdateResponse;
}

export default updateUserProfile;
