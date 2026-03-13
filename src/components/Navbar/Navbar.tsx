import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { images } from "../../assets/images/index.ts";
import LoginModal from "../../pages/Auth/Login/Login.tsx";
import { SignUpModal, SignUpData } from "../TrailerDetails/SignUpModal.tsx";
import { RootState } from "../../store";
import { loginSuccess, logout } from "../../store/authSlice.ts";
import { logout as logoutApi, register } from "../../api/authApi.ts";
import { LogoutConfirmModal } from "../Auth/LogoutConfirmModal.tsx";

const Navbar: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);
  const closeDrawer = () => setIsDrawerOpen(false);

  const location = useLocation();
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const shouldOpen = window.sessionStorage.getItem("openLoginAfterLogout");
    if (shouldOpen === "1") {
      window.sessionStorage.removeItem("openLoginAfterLogout");
      setIsSignUpOpen(false);
      setIsLoginOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        closeDrawer();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDrawerOpen]);

  const handleLogout = async () => {
    closeDrawer();
    try {
      await logoutApi();
    } finally {
      dispatch(logout());
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("openLoginAfterLogout", "1");
      }
      navigate("/", { replace: true });
      toast.success("Logged out successfully");
    }
  };

  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-[#F9F8F3] border-b border-gray-200 font-sans min-w-0 w-full">
      {/* Left: Logo */}
      <Link
        to="/"
        onClick={closeDrawer}
        className="inline-flex items-center shrink-0 text-inherit no-underline cursor-pointer"
      >
        <img
          src={images.logo}
          alt="HaulHub logo"
          className="h-10 sm:h-[50px] object-contain"
        />
      </Link>

      {/* Right: dropdown toggle */}
      <div ref={dropdownRef} className="relative flex items-center gap-3 sm:gap-5 text-[0.95rem] text-black shrink-0 min-w-0">
        <button
          type="button"
          onClick={toggleDrawer}
          aria-label="Toggle navigation dropdown"
          className="inline-flex items-center justify-center px-3 py-1 rounded-full border-0 bg-[#F9F8F3] cursor-pointer"
        >
          <span className="inline-flex flex-col gap-[3px]">
            <span className="w-4 h-[2px] rounded-full bg-black" />
            <span className="w-4 h-[2px] rounded-full bg-black" />
            <span className="w-4 h-[2px] rounded-full bg-black" />
          </span>
        </button>

        {/* Dropdown menu */}
        {isDrawerOpen && (
          <div className="absolute top-11 right-0 z-30 min-w-[180px] rounded-lg bg-white py-2 shadow-[0_10px_25px_rgba(15,23,42,0.15)]">
            <div className="p-0">
              <ul className="m-0 list-none p-0 text-[0.9rem] text-black font-normal">
                <li
                  className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
                  onClick={closeDrawer}
                >
                  <Link
                    to="/"
                    className="text-inherit no-underline cursor-pointer"
                  >
                    Home
                  </Link>
                </li>
                <li
                  className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
                  onClick={closeDrawer}
                >
                  <Link
                    to="/about"
                    className="text-inherit no-underline cursor-pointer"
                  >
                    About
                  </Link>
                </li>
                <li
                  className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
                  onClick={closeDrawer}
                >
                  <Link
                    to="/contact"
                    className="text-inherit no-underline cursor-pointer"
                  >
                    Contact
                  </Link>
                </li>
                <li
                  className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
                  onClick={closeDrawer}
                >
                  <Link
                    to="/booking"
                    className="text-inherit no-underline cursor-pointer"
                  >
                    Booking Screen
                  </Link>
                </li>
                <li
                  className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
                  onClick={closeDrawer}
                >
                  <Link
                    to="/profile"
                    className="text-inherit no-underline cursor-pointer"
                  >
                    Profile
                  </Link>
                </li>
                {!isAuthenticated ? (
                  <li
                    className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
                    onClick={() => {
                      closeDrawer();
                      setIsSignUpOpen(false);
                      setIsLoginOpen(true);
                    }}
                  >
                    <span className="text-inherit no-underline cursor-pointer">
                      Login / Signup
                    </span>
                  </li>
                ) : (
                  <li
                    className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
                    onClick={() => setIsLogoutConfirmOpen(true)}
                  >
                    <span className="text-inherit no-underline cursor-pointer">
                      Logout
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Auth modals */}
      {isLoginOpen && (
        <LoginModal
          isOpen={isLoginOpen && !isSignUpOpen}
          onClose={() => setIsLoginOpen(false)}
          onSuccess={() => {
            setIsLoginOpen(false);
            setIsSignUpOpen(false);
            navigate("/");
          }}
          onOpenSignUp={() => {
            setIsLoginOpen(false);
            setIsSignUpOpen(true);
          }}
        />
      )}
      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSubmit={async (data: SignUpData) => {
          try {
            const res = await register({
              fullName: `${data.firstName} ${data.lastName}`.trim(),
              email: data.email,
              password: data.password,
            });

            const fullName =
              typeof res.user.fullName === "string"
                ? res.user.fullName.trim()
                : `${data.firstName} ${data.lastName}`.trim();
            const [firstName, ...restName] = fullName
              .split(" ")
              .filter(Boolean);
            const lastName =
              restName.length > 0 ? restName.join(" ") : undefined;

            dispatch(
              loginSuccess({
                firstName: firstName || undefined,
                lastName,
                email: res.user.email || data.email,
              })
            );
            // eslint-disable-next-line no-console
            console.log("register api response:", res);
            setIsSignUpOpen(false);
            navigate("/");
          } catch (err: any) {
            const message =
              err?.response?.data?.message ||
              err?.message ||
              "Unable to create account. Please try again.";
            // eslint-disable-next-line no-console
            console.error("register api error:", err?.response?.data ?? err);
            toast.error(message);
          }
        }}
      />

      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onCancel={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => {
          setIsLogoutConfirmOpen(false);
          void handleLogout();
        }}
      />
    </nav>
  );
};

export default Navbar;

