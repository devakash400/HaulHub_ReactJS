import React, { useState } from "react";
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
import { toast } from "react-toastify";
import { logout } from "../../store/authSlice.ts";
import { clearWishlist } from "../../store/wishlistSlice.ts";
import { logout as logoutApi } from "../../api/authApi.ts";
import { LogoutConfirmModal } from "../../components/Auth/LogoutConfirmModal.tsx";
import { RootState } from "../../store";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const displayName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Demo";
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
      icon: ShieldCheck,
      onClick: () => navigate("/trust-safety"),
    },
    {
      label: "Terms & Conditions",
      icon: FileText,
      onClick: () => navigate("/trust-safety"),
    },
    {
      label: "Transaction History",
      icon: CircleDollarSign,
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
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#F3F1E9]">
      <div className="mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-6">
        <header className="py-0.5">
          <h1 className="text-left text-[40px] leading-tight font-semibold text-black">
            Profile
          </h1>
        </header>

        <section className="mt-2 flex flex-col items-center border-b border-[#CFCFCF] pb-8">
          <div className="relative h-28 w-28 rounded-full bg-[#D6D6D6] flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.25)]">
            <span className="text-[34px] font-semibold tracking-tight text-gray-700">
              {initials || "D"}
            </span>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-[#389131] flex items-center justify-center border-2 border-[#F3F1E9]"
              aria-label="Change profile photo"
            >
              <Camera className="w-4 h-4 text-white" aria-hidden />
            </button>
          </div>
          <p className="mt-3 text-[36px] leading-none font-semibold text-black">
            {displayName}
          </p>
        </section>

        <nav className="mt-4">
          <ul className="m-0 w-full list-none space-y-2.5 p-0">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="group flex h-[52px] w-full items-center justify-between rounded-[2px] border border-[#CFCFCF] bg-white px-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.22)] transition-all duration-200 hover:border-[#389131]/55 hover:bg-[#f6fbf4] hover:shadow-[0_8px_18px_rgba(56,145,49,0.18)]"
                  >
                    <span className="inline-flex items-center gap-4 text-gray-900 transition-colors duration-200 group-hover:text-[#2f7a2a]">
                      <Icon className="h-6 w-6 text-gray-900 transition-colors duration-200 group-hover:text-[#389131]" aria-hidden />
                      <span className="text-[14px] leading-none font-medium transition-colors duration-200 group-hover:text-[#2f7a2a]">
                        {item.label}
                      </span>
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-700 transition-colors duration-200 group-hover:text-[#389131]" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
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

