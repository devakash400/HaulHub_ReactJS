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
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import privacyicon from "../../assets/images/privacypolicy.png";
import termsicon from "../../assets/images/termscondition.png";
import transactionicon from "../../assets/images/transactionhistory.png";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

import { logout } from "../../store/authSlice.ts";
import { clearWishlist } from "../../store/wishlistSlice.ts";
import { logout as logoutApi } from "../../api/authApi.ts";
import { LogoutConfirmModal } from "../../components/Auth/LogoutConfirmModal.tsx";
import { RootState } from "../../store";

import {
  getUserProfile,
  resolveProfilePictureUrl,
  updateUserProfilePicture,
  type UserProfileApiData,
} from "../../api/userApi.ts";

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
    } catch {
      setProfile(null);
      setProfilePicturePath(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadProfilePicture();
  }, [loadProfilePicture]);

  const profilePictureUrl = resolveProfilePictureUrl(profilePicturePath);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    e.target.value = "";

    if (!file?.type.startsWith("image/")) return;

    setUploadingPhoto(true);

    try {
      const next = await updateUserProfilePicture(file);

      setProfilePicturePath(next.profilePicture ?? null);

      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(formatProfileSaveError(err));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const displayName =
    profile?.fullName?.trim() ||
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const menuItems = [
    {
      label: "Account Setting",
      icon: Settings,
      onClick: () => navigate("/account-settings"),
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
      onClick: () => navigate("/trust-safety"),
    },
    {
      label: "Transaction History",
      icon: transactionicon,
      onClick: () => navigate("/booking"),
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
    <div className="min-h-screen w-full bg-white overflow-x-hidden">
      <div className="mb-5 w-full px-[32px]">
        <header className="pt-6 pb-2">
          <h1 className="text-[42px] leading-[100%] font-medium text-black tracking-[0px] font-['Lexend']">
            Profile
          </h1>
        </header>

        {/* Profile Section */}
        {/* Profile Section */}
        {/* Profile Section */}
        <section className="mt-3 flex flex-col items-center border-b border-[#D9D9D9] pb-8">
          {/* Profile Image Wrapper */}
          <div className="relative flex flex-col items-center">
            {/* Profile Circle */}
            <div
              className="rounded-full bg-[#D9D9D9] shadow-md flex items-center justify-center overflow-hidden"
              style={{
                width: "156px",
                height: "156px",
              }}
            >
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 600,
                    fontSize: "48px",
                    lineHeight: "100%",
                    color: "#2F4A6D",
                  }}
                >
                  {initials}
                </span>
              )}
            </div>

            {/* Camera Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute flex items-center justify-center rounded-full shadow-md"
              style={{
                width: "42px",
                height: "42px",
                background: "#4A9B3D",
                right: "-6px",
                bottom: "42px",
              }}
              aria-label="Change profile photo"
            >
              <Camera className="w-[20px] h-[20px] text-white" />
            </button>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(ev) => void handlePhotoChange(ev)}
              disabled={uploadingPhoto}
            />

            {/* Name */}
            <p
              className="mt-4"
              style={{
                fontFamily: "Lexend",
                fontWeight: 600,
                fontSize: "20px",
                lineHeight: "100%",
                color: "#000000",
              }}
            >
              {displayName}
            </p>
          </div>
        </section>

        {/* Menu Items */}
        <nav className="px-3 pt-5">
          <ul className="space-y-3">
            {menuItems.map((item) => {
              const Icon = item.icon as any;

              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="flex items-center justify-between w-full h-[71px] bg-white border border-[#00000042] px-5 shadow-[0px_4px_4px_0px_#00000040] hover:bg-[#fafafa] transition"
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

                      <span className="text-[24px] leading-[100%] font-normal text-black tracking-[0px] font-['Lexend']">
                        {item.label}
                      </span>
                    </div>

                    <ChevronRight className="w-5 h-5 text-[#666]" />
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
