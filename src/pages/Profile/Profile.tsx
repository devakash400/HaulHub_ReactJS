import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Settings,
  CircleHelp,
  ShieldCheck,
  LogOut,
  CircleDollarSign,
  Camera,
  FileText,
  Pencil
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import privacyicon from "../../assets/images/privacypolicy.png";
import termsicon from "../../assets/images/termscondition.png";
import transactionicon from "../../assets/images/transactionhistory.png";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

import { logout, updateUser } from "../../store/authSlice.ts";
import { clearWishlist } from "../../store/wishlistSlice.ts";
import { logout as logoutApi } from "../../api/authApi.ts";
import { LogoutConfirmModal } from "../../components/Auth/LogoutConfirmModal.tsx";
import { RootState } from "../../store";

import {
  getUserProfile,
  type UserProfileApiData,
  updateUserProfile,
} from "../../api/userApi.ts";
import uploadProfilePhoto from "../../api/uploadApi.ts";

type ProfileUpdateErrorBody = {
  message?: string;
  errors?: Array<{ msg?: string; message?: string }>;
};

const formatProfileSaveError = (err: unknown): string => {
  const ax = err as AxiosError<ProfileUpdateErrorBody>;

  const list = ax.response?.data?.errors;

  if (Array.isArray(list) && list.length > 0) {
    const parts = list
      .map((e) => e.msg || e.message)
      .filter((s): s is string => Boolean(s && String(s).trim()));

    if (parts.length > 0) return parts.join(" ");
  }

  return (
    ax.response?.data?.message ||
    ax.message ||
    "Could not update profile photo."
  );
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  const user = useSelector((state: RootState) => state.auth.user);

  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const [profile, setProfile] = useState<UserProfileApiData | null>(null);
  const [profilePicturePath, setProfilePicturePath] = useState<string | null>(
    null,
  );

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProfilePicture = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      setProfilePicturePath(null);
      return;
    }

    try {
      const data = await getUserProfile();
      setProfile(data);
      setProfilePicturePath(data.profilePicture ?? null);
      // If the last uploaded publicId matches this profile's publicId, prefer its URL
      try {
        const last = getLastUpload();
        const lastId = sanitizePublicId(last?.publicId ?? null);
        const dataId = sanitizePublicId(data.profilePicture ?? null);
        if (lastId && dataId && lastId === dataId) {
          setUploadedPreviewUrl(last?.url ?? null);
        }
      } catch {
        // ignore
      }
    } catch {
      setProfile(null);
      setProfilePicturePath(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadProfilePicture();
  }, [loadProfilePicture]);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(
    null,
  );

  const LAST_UPLOAD_KEY = "haulhub_profile_image_last";

  const getLastUpload = (): {
    publicId?: string;
    url?: string;
    ts?: number;
  } | null => {
    try {
      const raw = localStorage.getItem(LAST_UPLOAD_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as {
        publicId?: string;
        url?: string;
        ts?: number;
      };
    } catch {
      return null;
    }
  };

  const setLastUpload = (publicId?: string | null, url?: string | null) => {
    try {
      if (!publicId || !url) {
        localStorage.removeItem(LAST_UPLOAD_KEY);
        return;
      }
      const cleanId = sanitizePublicId(publicId) ?? String(publicId);
      const data = { publicId: cleanId, url, ts: Date.now() };
      localStorage.setItem(LAST_UPLOAD_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  };

  const sanitizePublicId = (p?: string | null): string | null => {
    if (!p) return null;
    let s = String(p).trim();
    // Remove surrounding quotes and common encoding residues like %22
    s = s.replace(/^\s*["']+|["']+\s*$/g, "");
    s = s.replace(/%22/g, "");
    s = s.replace(/^\/+|\/+$/g, "");
    return s || null;
  };

  const cloudinaryBase = "https://res.cloudinary.com/dpsy0wq7d/image/upload";

  const sanitizedProfilePicture = sanitizePublicId(
    profile?.profilePicture ?? profilePicturePath,
  );

  const defaultProfileDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="#E6EEF5"/><text x="50%" y="52%" font-size="120" text-anchor="middle" fill="#2F4A6D" font-family="Arial, Helvetica, sans-serif" dy=".35em">?</text></svg>',
  )}`;

  let profilePictureUrl: string | null = null;
  if (uploadedPreviewUrl) {
    profilePictureUrl = uploadedPreviewUrl;
  } else if (sanitizedProfilePicture) {
    if (
      /^https?:\/\//i.test(sanitizedProfilePicture) ||
      /^data:/i.test(sanitizedProfilePicture)
    ) {
      profilePictureUrl = sanitizedProfilePicture;
    } else {
      profilePictureUrl = `${cloudinaryBase}/${sanitizedProfilePicture}.jpg`;
    }
  }

  const hasProfilePicture = Boolean(profilePictureUrl);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    e.target.value = "";

    if (!file?.type.startsWith("image/")) return;

    setUploadingPhoto(true);

    try {
      // First upload the photo to the uploads API
      const uploadResp = await uploadProfilePhoto(file);
      if (!uploadResp || !uploadResp.success)
        throw new Error("Image upload failed");

      const publicId = uploadResp.data.publicId;
      const uploadedUrl = uploadResp.data.url;

      // Immediately show the uploaded (versioned) URL so the user sees the new image right away
      setUploadedPreviewUrl(uploadedUrl);
      // persist last upload mapping so it survives refreshes
      try {
        setLastUpload(publicId, uploadedUrl);
      } catch {
        // ignore
      }
      setImgError(false);
      setImgLoaded(false);

      // Then PATCH the profile with the Cloudinary URL
      const updated = await updateUserProfile({ profilePicture: uploadedUrl });

      setProfile(updated);
      setProfilePicturePath(updated.profilePicture ?? null);
      dispatch(
        updateUser({ profilePicture: updated.profilePicture ?? undefined }),
      );

      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(formatProfileSaveError(err));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const fallbackFirstName =
    profile?.firstName?.trim() ||
    profile?.legalName?.trim()?.split(" ").filter(Boolean)[0] ||
    profile?.fullName?.trim()?.split(" ").filter(Boolean)[0] ||
    "";

  const fallbackLastName =
    profile?.lastName?.trim() ||
    profile?.preferredFirstName?.trim() ||
    (() => {
      const full = profile?.fullName?.trim();
      if (!full) return "";
      const parts = full.split(/\s+/).filter(Boolean);
      return parts.length > 1 ? parts.slice(1).join(" ") : "";
    })();

  const displayName =
    [fallbackFirstName, fallbackLastName].filter(Boolean).join(" ").trim() ||
    profile?.legalName?.trim() ||
    profile?.fullName?.trim() ||
    "";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const firstName = fallbackFirstName || displayName.split(" ")[0] || "";
  const firstNameInitial = firstName ? firstName.charAt(0).toUpperCase() : "";

  const menuItems = [
    {
      label: "Personal Profile",
      icon: Settings,
      onClick: () => navigate("/personal-profile"),
    },
    {
      label: "About US",
      icon: CircleHelp,
      onClick: () => navigate("/about"),
    },
    {
      label: "Privacy Policy",
      icon: privacyicon,
      onClick: () => navigate("/trust-safety"),
    },
    {
      label: "Terms & Conditions",
      icon: termsicon,
      onClick: () => navigate("/terms"),
    },
    {
      label: "Transaction History",
      icon: transactionicon,
      onClick: () => navigate("/transaction-history"),
    },
    {
      label: "Log Out",
      icon: LogOut,
      onClick: () => setIsLogoutConfirmOpen(true),
    },
  ] as const;

  const handleLogout = async () => {
    try {
      await logoutApi();
    } finally {
      dispatch(logout());
      dispatch(clearWishlist());

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("openLoginAfterLogout", "1");
      }

      navigate("/", { replace: true });

      toast.success("Logged out successfully");
    }
  };

  return (
    <div
      className="w-full bg-white overflow-x-hidden flex flex-col min-h-[calc(100vh-160px)]"
      style={{
        boxShadow: "0px 4px 4px 0px rgba(0,0,0,0.25)",
        marginBottom: "10px",
      }}
    >
      <div className="w-full px-[32px]">
        <header className="pt-6 pb-2">
          <h1 className="text-[42px] leading-[100%] font-medium text-black tracking-[0px] font-['Lexend']">
            Profile
          </h1>
        </header>

        {/* Profile Section */}
        {/* Profile Section */}
        {/* Profile Section */}
        <section className="mt-3 flex flex-col items-center pb-8">
          {/* Avatar Wrapper */}
          <div className="relative w-[156px] h-[156px]">
            {/* Profile Circle */}
            <div className="w-full h-full rounded-full bg-[#D9D9D9] shadow-md overflow-hidden flex items-center justify-center relative">
              {hasProfilePicture && !imgLoaded && !imgError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/60">
                  <svg
                    className="animate-spin h-8 w-8 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                </div>
              )}

              {imgError || !hasProfilePicture ? (
                <span className="text-[48px] font-semibold text-[#2F4A6D] leading-none">
                  {firstNameInitial || initials}
                </span>
              ) : (
                <img
                  src={profilePictureUrl ?? undefined}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onLoad={() => setImgLoaded(true)}
                  onError={() => {
                    setImgError(true);
                    setImgLoaded(false);
                  }}
                />
              )}
            </div>

            {/* Camera Button */}
            {/* <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              aria-label="Change profile photo"
              className="
        absolute
        bottom-2
        right-0
        w-[44px]
        h-[44px]
        rounded-full
        bg-[#4A9B3D]
        flex
        items-center
        justify-center
        shadow-lg
      
      "
              /// The button is intentinally
            >
              <Camera className="w-5 h-5 text-white" />
            </button> */}

            {/* <button
              type="button"
              onClick={() => navigate("/edit-profile")}
              disabled={uploadingPhoto}
              aria-label="Change profile photo"
              className="
        absolute
        bottom-2
        right-0
        w-[44px]
        h-[44px]
        rounded-full
        bg-[#4A9B3D]
        flex
        items-center
        justify-center
        shadow-lg
      
      "
              /// The button is intentinally
            >
              <Pencil className="w-5 h-5 text-white" />
            </button> */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(ev) => void handlePhotoChange(ev)}
              disabled={uploadingPhoto}
            />
          </div>

          {/* Name */}
          <p
            className="
    mt-5
    text-[20px]
    font-semibold
    text-black
    text-center
    max-w-[30ch]
    mx-auto
    overflow-hidden
    text-ellipsis
    whitespace-nowrap
  "
          >
            {displayName}
          </p>
        </section>
      </div>

      {/* Cream Divider */}
      <div className="w-full h-[14px] bg-[#F4F0EC] shadow-[inset_0_3px_4px_rgba(0,0,0,0.04)] border-y border-[#EBE6E0]"></div>

      <div className="mb-5 w-full px-[32px] pb-12 flex-grow">
        {/* Menu Items */}
        <nav className="px-3 pt-6">
          <ul className="space-y-3">
            {menuItems.map((item) => {
              const Icon = item.icon as any;

              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="flex items-center justify-between w-full min-h-[71px] py-3 sm:py-0 sm:h-[71px] bg-white border border-[#00000042] px-5 shadow-[0px_4px_4px_0px_#00000040] hover:bg-[#fafafa] transition text-left"
                  >
                    <div className="flex items-center gap-4">
                      {typeof Icon === "string" ? (
                        <img
                          src={Icon}
                          alt={item.label}
                          className="w-[25px] h-[25px] shrink-0 object-contain"
                        />
                      ) : (
                        <Icon className="w-[25px] h-[25px] shrink-0 text-black" />
                      )}

                      <span className="text-[18px] sm:text-[24px] leading-[1.2] sm:leading-[100%] font-normal text-black tracking-[0px] font-['Lexend']">
                        {item.label}
                      </span>
                    </div>

                    <ChevronRight className="w-5 h-5 text-[#666] shrink-0" />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Modal */}
        <LogoutConfirmModal
          isOpen={isLogoutConfirmOpen}
          onCancel={() => setIsLogoutConfirmOpen(false)}
          onConfirm={() => {
            setIsLogoutConfirmOpen(false);
            void handleLogout();
          }}
        />
      </div>

    </div>
  );
};

export default Profile;

