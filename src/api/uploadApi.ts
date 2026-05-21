import api from "../api/api.ts";

export type UploadResponse = {
  success: boolean;
  data: {
    url: string;
    publicId: string;
    fileName: string;
  };
};

/**
 * Uploads a profile photo to the server.
 * Expects the backend to return { success, data: { url, publicId, fileName } }
 */
export async function uploadProfilePhoto(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("fileName", "profile-photo");
  form.append("photo", file);

  const res = await api.post("/api/uploads/photo", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data as UploadResponse;
}

export default uploadProfilePhoto;
