import React from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronRight, Settings, User, Shield, LogOut, Pencil } from "lucide-react";

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isLoggedIn");
    }
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-white w-full min-w-0 overflow-x-hidden">
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6">
        <header className="relative py-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-gray-100 text-gray-900 inline-flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
          <h1 className="text-center text-xl font-semibold text-gray-900">
            Profile
          </h1>
        </header>

        <section className="mt-6 border border-gray-200 rounded-md shadow-sm bg-white px-4 py-6 flex flex-col items-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              <span className="text-xs text-gray-600">Photo</span>
            </div>
            <button
              type="button"
              onClick={() => navigate("/edit-profile")}
              className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-[#389131] text-white inline-flex items-center justify-center shadow-sm"
              aria-label="Edit profile"
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden />
            </button>
          </div>
          <p className="mt-3 text-sm font-semibold text-gray-900">Demo</p>
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
                  <Shield className="w-5 h-5 text-gray-700" aria-hidden />
                  <span className="text-sm font-medium">Privacy</span>
                </span>
                <ChevronRight className="w-5 h-5 text-gray-600" aria-hidden />
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={handleLogout}
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
      </div>
    </div>
  );
};

export default Profile;

