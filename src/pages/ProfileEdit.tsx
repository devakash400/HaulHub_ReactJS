import React, { useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import uploadProfilePhoto, { UploadResponse } from "../api/uploadApi";
import updateUserProfile from "../api/profileApi";

type FormState = {
  legalName: string;
  preferredFirstName: string;
  email: string;
  phoneNumber: string;
};

const ProfileEdit: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    legalName: "",
    preferredFirstName: "",
    email: "",
    phoneNumber: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const onFileChange = (file?: File) => {
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setLocalPreview(url);
    setUploadedUrl(null);
  };

  const handleChoose = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name as keyof FormState;
    setForm((s) => ({ ...s, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let publicId: string | undefined = profilePicture ?? undefined;

      if (selectedFile) {
        const uploadResp: UploadResponse =
          await uploadProfilePhoto(selectedFile);
        if (!uploadResp || !uploadResp.success) {
          throw new Error("Upload failed");
        }
        // Show uploaded image URL from response
        setUploadedUrl(uploadResp.data.url);
        publicId = uploadResp.data.publicId;
        setProfilePicture(publicId);
        toast.success("Profile image uploaded");
      }

      const payload = {
        legalName: form.legalName,
        preferredFirstName: form.preferredFirstName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        profilePicture: publicId,
      };

      await updateUserProfile(payload);

      toast.success("Profile updated successfully");
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ?? err?.message ?? "Update failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const displayImage =
    uploadedUrl ?? localPreview ?? "/images/default-avatar.png";

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8">
      <ToastContainer position="top-right" />

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Edit Profile</h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
            <img
              src={displayImage}
              alt="Profile"
              className="w-full h-full object-cover rounded-full border"
            />

            <button
              type="button"
              onClick={handleChoose}
              className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border hover:bg-gray-50"
              aria-label="Edit profile image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 w-full">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Legal name
                  </label>
                  <input
                    name="legalName"
                    value={form.legalName}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Jane Customer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred first name
                  </label>
                  <input
                    name="preferredFirstName"
                    value={form.preferredFirstName}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Jane"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    type="email"
                    className="w-full border rounded px-3 py-2"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    placeholder="+1 555 555 5555"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-white px-4 py-2 rounded disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save changes"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setLocalPreview(null);
                    setUploadedUrl(null);
                  }}
                  className="text-sm text-gray-600"
                >
                  Reset image
                </button>
              </div>
            </form>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0])}
        />
      </div>
    </div>
  );
};

export default ProfileEdit;
