import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Settings,
  User,
  ShieldAlert,
  LogOut,
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
    <div className="min-h-screen bg-white w-full min-w-0 overflow-x-hidden">
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6">
        <header className="py-2">
          <h1 className="text-center text-xl font-semibold text-gray-900">
            Profile
          </h1>
        </header>

        <section className="mt-6 border border-gray-200 rounded-md shadow-sm bg-white px-4 py-6 flex flex-col items-center">
          <div className="relative h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm text-gray-600">Photo</span>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-[#389131] flex items-center justify-center border-2 border-white"
            >
              <Camera className="w-4 h-4 text-white" aria-hidden />
            </button>
          </div>
          <p className="mt-3 text-base font-semibold text-gray-900">Demo</p>
        </section>

        <nav className="mt-6">
          <ul className="m-0 p-0 list-none divide-y divide-gray-200">
            <li>
              <button
                type="button"
                onClick={() => navigate("/account-settings")}
                className="w-full py-4 flex items-center justify-between text-left"
              >
                <span className="inline-flex items-center gap-3 text-gray-900">
                  <Settings className="w-5 h-5 text-gray-700" aria-hidden />
                  <span className="text-sm font-medium">Account setting</span>
                </span>
                <ChevronRight className="w-5 h-5 text-gray-600" aria-hidden />
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigate("/notifications")}
                className="w-full py-4 flex items-center justify-between text-left"
              >
                <span className="inline-flex items-center gap-3 text-gray-900">
                  <ShieldAlert className="w-5 h-5 text-gray-700" aria-hidden />
                  <span className="text-sm font-medium">Notifications</span>
                </span>
                <ChevronRight className="w-5 h-5 text-gray-600" aria-hidden />
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigate("/edit-profile")}
                className="w-full py-4 flex items-center justify-between text-left"
              >
                <span className="inline-flex items-center gap-3 text-gray-900">
                  <User className="w-5 h-5 text-gray-700" aria-hidden />
                  <span className="text-sm font-medium">View profile</span>
                </span>
                <ChevronRight className="w-5 h-5 text-gray-600" aria-hidden />
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigate("/privacy")}
                className="w-full py-4 flex items-center justify-between text-left"
              >
                <span className="inline-flex items-center gap-3 text-gray-900">
                  <ShieldAlert className="w-5 h-5 text-gray-700" aria-hidden />
                  <span className="text-sm font-medium">Privacy</span>
                </span>
                <ChevronRight className="w-5 h-5 text-gray-600" aria-hidden />
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="w-full py-4 flex items-center justify-between text-left"
              >
                <span className="inline-flex items-center gap-3 text-gray-900">
                  <LogOut className="w-5 h-5 text-gray-700" aria-hidden />
                  <span className="text-sm font-medium">Logout</span>
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

