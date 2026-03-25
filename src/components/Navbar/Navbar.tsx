import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Menu, Search } from "lucide-react";
import { images } from "../../assets/images/index.ts";
import LoginModal from "../../pages/Auth/Login/Login.tsx";
import { SignUpModal, SignUpData } from "../TrailerDetails/SignUpModal.tsx";
import { RootState } from "../../store";
import { logout, signUpSuccess } from "../../store/authSlice.ts";
import { clearWishlist } from "../../store/wishlistSlice.ts";
import { logout as logoutApi, register } from "../../api/authApi.ts";
import { LogoutConfirmModal } from "../Auth/LogoutConfirmModal.tsx";

function profileInitial(user: { firstName?: string; lastName?: string; email?: string } | null): string {
  if (!user) return "U";
  const first = user.firstName?.trim();
  if (first) return first.charAt(0).toUpperCase();
  const last = user.lastName?.trim();
  if (last) return last.charAt(0).toUpperCase();
  const email = user.email?.trim();
  if (email) return email.charAt(0).toUpperCase();
  return "U";
}

const Navbar: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isSearchCompact, setIsSearchCompact] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const userType = useSelector((state: RootState) => state.auth.userType);
  const isOwner =
    (user?.trailor === "Owner" || userType === "Owner") && isAuthenticated;

  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);
  const closeDrawer = () => setIsDrawerOpen(false);
  const handleDrawerLinkRowClick = (event: React.MouseEvent<HTMLLIElement>) => {
    const anchor = event.currentTarget.querySelector("a");
    const href = anchor?.getAttribute("href");
    if (href) {
      navigate(href);
      closeDrawer();
      return;
    }
    closeDrawer();
  };

  const location = useLocation();
  const isTrailerScreen = location.pathname.startsWith("/trailer/");
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
    if (typeof window === "undefined") return;

    const isHome = location.pathname === "/";
    if (!isHome) {
      setIsSearchCompact(false);
      return;
    }

    const readScrollY = () =>
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    const onScroll = () => {
      setIsSearchCompact(readScrollY() > 20);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll, true);
    };
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
      dispatch(clearWishlist());
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("openLoginAfterLogout", "1");
      }
      navigate("/", { replace: true });
      toast.success("Logged out successfully");
    }
  };

  const handleProtectedDrawerNavigate = (path: string) => {
    closeDrawer();
    if (!isAuthenticated) {
      setIsSignUpOpen(false);
      setIsLoginOpen(true);
      return;
    }
    navigate(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F9F8F3] border-b border-gray-200 font-sans min-w-0 w-full">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 min-w-0 w-full">
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

        {/* Center: Search bar (Home only, desktop/tablet) */}
        {location.pathname === "/" && (
          <div className="hidden min-w-0 flex-1 items-center justify-center px-4 sm:flex">
            <div
              className={`flex items-center rounded-full border border-gray-200 bg-white shadow-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#389131]/40 hover:shadow-[0_10px_26px_rgba(56,145,49,0.22)] motion-reduce:transition-none ${
                isSearchCompact
                  ? "h-[38px] w-[min(100%,460px)] px-4"
                  : "h-[48px] w-[min(100%,640px)] px-5"
              }`}
            >
              <input
                type="text"
                placeholder="Search here..."
                className={`min-w-0 flex-1 border-none bg-transparent text-gray-700 placeholder:text-gray-400 outline-none transition-[font-size] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  isSearchCompact ? "text-[0.875rem]" : "text-[0.95rem]"
                }`}
              />
              <div
                className={`flex shrink-0 items-center justify-center rounded-full bg-[#389131] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  isSearchCompact ? "ml-2.5 h-8 w-8" : "ml-3 h-9 w-9"
                }`}
              >
                <Search
                  className={`text-white transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                    isSearchCompact ? "h-4 w-4" : "h-5 w-5"
                  }`}
                  aria-hidden
                />
              </div>
            </div>
          </div>
        )}

        {/* Right: dropdown toggle */}
        <div
          ref={dropdownRef}
          className="relative flex items-center gap-3 sm:gap-5 text-[0.95rem] text-black shrink-0 min-w-0"
        >
        {isAuthenticated ? (
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
            <Link
              to="/profile"
              onClick={closeDrawer}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-[0.9rem] font-semibold text-white no-underline hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#389131]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F9F8F3]"
              aria-label={
                user?.firstName
                  ? `Profile: ${user.firstName}`
                  : user?.email
                    ? `Profile: ${user.email}`
                    : "Profile"
              }
            >
              {profileInitial(user)}
            </Link>
            <button
              type="button"
              onClick={toggleDrawer}
              aria-label="Open menu"
              aria-expanded={isDrawerOpen}
              aria-haspopup="true"
              className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-neutral-100 text-neutral-900 transition-colors hover:bg-neutral-200/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#389131]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F9F8F3]"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={toggleDrawer}
            aria-label="Toggle navigation dropdown"
            className="inline-flex cursor-pointer items-center justify-center rounded-full border-0 bg-[#F9F8F3] p-2"
          >
            <Menu className="h-5 w-5 text-black" aria-hidden />
          </button>
        )}

        {/* Dropdown menu */}
        {isDrawerOpen && (
          <div className="absolute right-0 top-full z-[60] mt-2 min-w-[180px] rounded-lg bg-white py-2 shadow-[0_10px_25px_rgba(15,23,42,0.15)]">
            <div className="p-0">
              <ul className="m-0 list-none p-0 text-[0.9rem] text-black font-normal">
                {/* Trailer page menu override */}
                {isTrailerScreen ? (
                  <>
                    <li
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap text-neutral-900 transition-colors hover:bg-gray-100 hover:text-[#389131]"
                      onClick={handleDrawerLinkRowClick}
                    >
                      <Link
                        to="/"
                        className="text-inherit no-underline cursor-pointer"
                      >
                        Home
                      </Link>
                    </li>
                    <li
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap text-neutral-900 transition-colors hover:bg-gray-100 hover:text-[#389131]"
                      onClick={() => handleProtectedDrawerNavigate("/booking")}
                    >
                      <span className="text-inherit no-underline cursor-pointer">
                      Your Booked Trailers
                      </span>
                    </li>
                    <li
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap text-neutral-900 transition-colors hover:bg-gray-100 hover:text-[#389131]"
                      onClick={handleDrawerLinkRowClick}
                    >
                      <Link
                        to="/contact"
                        className="text-inherit no-underline cursor-pointer"
                      >
                        Contact
                      </Link>
                    </li>
                    <li
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap text-neutral-900 transition-colors hover:bg-gray-100 hover:text-[#389131]"
                      onClick={() => handleProtectedDrawerNavigate("/profile")}
                    >
                      <span className="text-inherit no-underline cursor-pointer">
                        Profile
                      </span>
                    </li>
                    <li
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap text-neutral-900 transition-colors hover:bg-gray-100 hover:text-[#389131]"
                      onClick={() => {
                        if (!isAuthenticated) {
                          closeDrawer();
                          setIsSignUpOpen(false);
                          setIsLoginOpen(true);
                          return;
                        }
                        setIsLogoutConfirmOpen(true);
                      }}
                    >
                      <span className="text-inherit no-underline cursor-pointer">
                        Logout
                      </span>
                    </li>
                  </>
                ) : isOwner ? (
                  <>
                    <li
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap text-neutral-900 transition-colors hover:bg-gray-100 hover:text-[#389131]"
                      onClick={handleDrawerLinkRowClick}
                    >
                      <Link
                        to="/"
                        className="text-inherit no-underline cursor-pointer"
                      >
                        Home
                      </Link>
                    </li>
                    <li
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap text-neutral-900 transition-colors hover:bg-gray-100 hover:text-[#389131]"
                      onClick={handleDrawerLinkRowClick}
                    >
                      <Link
                        to="/notifications"
                        className="text-inherit no-underline cursor-pointer"
                      >
                        Notification
                      </Link>
                    </li>
                    <li
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap text-neutral-900 transition-colors hover:bg-gray-100 hover:text-[#389131]"
                      onClick={() => handleProtectedDrawerNavigate("/booking")}
                    >
                      <span className="text-inherit no-underline cursor-pointer">
                        Booked Trailor
                      </span>
                    </li>
                    <li
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap text-neutral-900 transition-colors hover:bg-gray-100 hover:text-[#389131]"
                      onClick={handleDrawerLinkRowClick}
                    >
                      <Link
                        to="/profile"
                        className="text-inherit no-underline cursor-pointer"
                      >
                        Profile
                      </Link>
                    </li>
                    <li
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap text-neutral-900 transition-colors hover:bg-gray-100 hover:text-[#389131]"
                      onClick={() => setIsLogoutConfirmOpen(true)}
                    >
                      <span className="text-inherit no-underline cursor-pointer">
                        Log Out
                      </span>
                    </li>
                  </>
                ) : (
                  <>
                    <li
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap text-neutral-900 transition-colors hover:bg-gray-100 hover:text-[#389131]"
                      onClick={handleDrawerLinkRowClick}
                    >
                      <Link
                        to="/"
                        className="text-inherit no-underline cursor-pointer"
                      >
                        Home
                      </Link>
                    </li>
                    <li
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap text-neutral-900 transition-colors hover:bg-gray-100 hover:text-[#389131]"
                      onClick={handleDrawerLinkRowClick}
                    >
                      <Link
                        to="/contact"
                        className="text-inherit no-underline cursor-pointer"
                      >
                        Contact
                      </Link>
                    </li>
                    {!isAuthenticated ? (
                      <li
                        className="px-5 py-1.5 cursor-pointer whitespace-nowrap text-neutral-900 transition-colors hover:bg-gray-100 hover:text-[#389131]"
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
                      <>
                        <li
                          className="px-5 py-1.5 cursor-pointer whitespace-nowrap text-neutral-900 transition-colors hover:bg-gray-100 hover:text-[#389131]"
                          onClick={handleDrawerLinkRowClick}
                        >
                          <Link
                            to="/about"
                            className="text-inherit no-underline cursor-pointer"
                          >
                            About
                          </Link>
                        </li>
                        <li
                          className="px-5 py-1.5 cursor-pointer whitespace-nowrap text-neutral-900 transition-colors hover:bg-gray-100 hover:text-[#389131]"
                          onClick={handleDrawerLinkRowClick}
                        >
                          <Link
                            to="/booking"
                            className="text-inherit no-underline cursor-pointer"
                          >
                           Your Booked Trailers
                          </Link>
                        </li>
                        <li
                          className="px-5 py-1.5 cursor-pointer whitespace-nowrap text-neutral-900 transition-colors hover:bg-gray-100 hover:text-[#389131]"
                          onClick={handleDrawerLinkRowClick}
                        >
                          <Link
                            to="/profile"
                            className="text-inherit no-underline cursor-pointer"
                          >
                            Profile
                          </Link>
                        </li>
                        <li
                          className="px-5 py-1.5 cursor-pointer whitespace-nowrap text-neutral-900 transition-colors hover:bg-gray-100 hover:text-[#389131]"
                          onClick={() => setIsLogoutConfirmOpen(true)}
                        >
                          <span className="text-inherit no-underline cursor-pointer">
                            Logout
                          </span>
                        </li>
                      </>
                    )}
                  </>
                )}
              </ul>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Mobile search bar (Home only) */}
      {location.pathname === "/" && (
        <div
          className={`overflow-hidden transition-[max-height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:hidden ${
            isSearchCompact ? "max-h-[48px]" : "max-h-[90px]"
          }`}
        >
          <div
            className={`transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              isSearchCompact ? "px-3 pb-1" : "px-4 pb-2"
            }`}
          >
            <div
              className={`mx-auto flex items-center rounded-full border border-gray-200 bg-white shadow-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#389131]/40 hover:shadow-[0_10px_22px_rgba(56,145,49,0.2)] motion-reduce:transition-none ${
                isSearchCompact
                  ? "h-[32px] w-[min(100%,400px)] px-3"
                  : "h-[38px] w-[min(100%,560px)] px-3.5"
              }`}
            >
              <input
                type="text"
                placeholder="Search here..."
                className={`min-w-0 flex-1 border-none bg-transparent text-gray-700 placeholder:text-gray-400 outline-none transition-[font-size] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  isSearchCompact ? "text-[0.74rem]" : "text-[0.8rem]"
                }`}
              />
              <div
                className={`flex items-center justify-center rounded-full bg-[#389131] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  isSearchCompact ? "ml-2 h-6 w-6" : "ml-2 h-7 w-7"
                }`}
              >
                <Search
                  className={`text-white transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                    isSearchCompact ? "h-3.5 w-3.5" : "h-4 w-4"
                  }`}
                  aria-hidden
                />
              </div>
            </div>
          </div>
        </div>
      )}

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
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              phoneNumber: data.phoneNumber,
              password: data.password,
              trailor: data.trailor,
              gender: data.gender,
              dateOfBirth: data.dateOfBirth,
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
            const trailorFromApi = (res.user as { trailor?: string | string[] })
              .trailor;
            const normalizedTrailor = Array.isArray(trailorFromApi)
              ? trailorFromApi[0]
              : trailorFromApi;

            dispatch(
              signUpSuccess({
                user: {
                  firstName: firstName || undefined,
                  lastName,
                  email: res.user.email || data.email,
                  trailor: normalizedTrailor || data.trailor,
                },
                accessToken: res.accessToken,
                refreshToken: res.refreshToken,
                userType: normalizedTrailor || data.trailor,
              })
            );
            // eslint-disable-next-line no-console
            console.log("register api response:", res);
            setIsSignUpOpen(false);
            toast.success("Account created successfully");
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

