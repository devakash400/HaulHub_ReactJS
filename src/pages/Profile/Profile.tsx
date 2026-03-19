import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Settings,
  User,
  ShieldAlert,
  LogOut,
  CircleDollarSign,
  Camera,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { logout } from "../../store/authSlice.ts";
import { clearWishlist } from "../../store/wishlistSlice.ts";
import { logout as logoutApi } from "../../api/authApi.ts";
import { LogoutConfirmModal } from "../../components/Auth/LogoutConfirmModal.tsx";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

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
    <div className="min-h-screen bg-background w-full min-w-0 overflow-x-hidden">
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
        <header className="py-1">
          <h1 className="text-left text-[40px] leading-tight font-semibold text-black">
            Profile
          </h1>
        </header>

        <section className="mt-4 border border-gray-300 bg-white px-4 py-8 flex flex-col items-center">
          <div className="relative h-24 w-24 rounded-full bg-[#D9D9D9] flex items-center justify-center">
            <User className="h-12 w-12 text-gray-600" aria-hidden />
            <button
              type="button"
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-[#389131] flex items-center justify-center border-2 border-white"
            >
              <Camera className="w-4 h-4 text-white" aria-hidden />
            </button>
          </div>
          <p className="mt-3 text-[36px] leading-none font-semibold text-black">Demo</p>
        </section>

        <nav className="mt-4">
          <ul className="m-0 p-0 list-none rounded-[12px] border border-[#D8D8D8] bg-white overflow-hidden">
            <li className="border-b border-[#E3E3E3]">
              <button
                type="button"
                onClick={() => navigate("/account-settings")}
                className="w-full h-[58px] px-4 bg-white flex items-center justify-between text-left"
              >
                <span className="inline-flex items-center gap-3 text-gray-900">
                  <Settings className="w-5 h-5 text-gray-700" aria-hidden />
                  <span className="text-[14px] font-medium">Account Setting</span>
                </span>
                <ChevronRight className="w-5 h-5 text-gray-600" aria-hidden />
              </button>
            </li>
            <li className="border-b border-[#E3E3E3]">
              <button
                type="button"
                onClick={() => navigate("/about")}
                className="w-full h-[58px] px-4 bg-white flex items-center justify-between text-left"
              >
                <span className="inline-flex items-center gap-3 text-gray-900">
                  <User className="w-5 h-5 text-gray-700" aria-hidden />
                  <span className="text-[14px] font-medium">About US</span>
                </span>
                <ChevronRight className="w-5 h-5 text-gray-600" aria-hidden />
              </button>
            </li>
            <li className="border-b border-[#E3E3E3]">
              <button
                type="button"
                onClick={() => navigate("/privacy")}
                className="w-full h-[58px] px-4 bg-white flex items-center justify-between text-left"
              >
                <span className="inline-flex items-center gap-3 text-gray-900">
                  <ShieldAlert className="w-5 h-5 text-gray-700" aria-hidden />
                  <span className="text-[14px] font-medium">Privacy</span>
                </span>
                <ChevronRight className="w-5 h-5 text-gray-600" aria-hidden />
              </button>
            </li>
            <li className="border-b border-[#E3E3E3]">
              <button
                type="button"
                onClick={() => navigate("/booking")}
                className="w-full h-[58px] px-4 bg-white flex items-center justify-between text-left"
              >
                <span className="inline-flex items-center gap-3 text-gray-900">
                  <CircleDollarSign className="w-5 h-5 text-gray-700" aria-hidden />
                  <span className="text-[14px] font-medium">Transaction History</span>
                </span>
                <ChevronRight className="w-5 h-5 text-gray-600" aria-hidden />
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="w-full h-[58px] px-4 bg-white flex items-center justify-between text-left"
              >
                <span className="inline-flex items-center gap-3 text-gray-900">
                  <LogOut className="w-5 h-5 text-gray-700" aria-hidden />
                  <span className="text-[14px] font-medium">Log Out</span>
                </span>
                <ChevronRight className="w-5 h-5 text-gray-600" aria-hidden />
              </button>
            </li>
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

