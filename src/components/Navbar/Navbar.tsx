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
  const isOwner = user?.trailor === "Owner" && isAuthenticated;

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

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setIsSearchCompact(currentScrollY > 40);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F9F8F3] border-b border-gray-200 font-sans min-w-0 w-screen">
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
          <div
            className={`hidden sm:flex flex-1 items-center justify-center px-4 min-w-0 transition-all duration-300 ease-out ${
              isSearchCompact
                ? "translate-y-[-2px] scale-[0.98]"
                : "translate-y-0 scale-100"
            }`}
          >
            <div className="flex h-[46px] w-full max-w-[640px] items-center rounded-xl bg-white px-4 border border-gray-200 shadow-sm">
              <input
                type="text"
                placeholder="Search here..."
                className="flex-1 border-none bg-transparent text-[0.95rem] text-gray-700 placeholder:text-gray-400 outline-none"
              />
              <div className="ml-3 flex h-9 w-9 shrink-0 self-center items-center justify-center rounded-full bg-[#389131]">
                <Search className="w-5 h-5 text-white" aria-hidden />
              </div>
            </div>
          </div>
        )}

        {/* Right: dropdown toggle */}
        <div
          ref={dropdownRef}
          className="relative flex items-center gap-3 sm:gap-5 text-[0.95rem] text-black shrink-0 min-w-0"
        >
        <button
          type="button"
          onClick={toggleDrawer}
          aria-label="Toggle navigation dropdown"
          className="inline-flex items-center justify-center rounded-full border-0 bg-[#F9F8F3] cursor-pointer p-2"
        >
          <Menu className="h-5 w-5 text-black" aria-hidden />
        </button>

        {/* Dropdown menu */}
        {isDrawerOpen && (
          <div className="absolute top-11 right-0 z-[60] min-w-[180px] rounded-lg bg-white py-2 shadow-[0_10px_25px_rgba(15,23,42,0.15)]">
            <div className="p-0">
              <ul className="m-0 list-none p-0 text-[0.9rem] text-black font-normal">
                {/* Trailer page menu override */}
                {isTrailerScreen ? (
                  <>
                    <li
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
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
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
                      onClick={() => handleProtectedDrawerNavigate("/booking")}
                    >
                      <span className="text-inherit no-underline cursor-pointer">
                        Booking Screen
                      </span>
                    </li>
                    <li
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
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
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
                      onClick={() => handleProtectedDrawerNavigate("/profile")}
                    >
                      <span className="text-inherit no-underline cursor-pointer">
                        Profile
                      </span>
                    </li>
                    <li
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
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
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
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
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
                      onClick={handleDrawerLinkRowClick}
                    >
                      <Link
                        to="/list-trailer"
                        className="text-inherit no-underline cursor-pointer"
                      >
                        Book your Trailor
                      </Link>
                    </li>
                    <li
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
                      onClick={handleDrawerLinkRowClick}
                    >
                      <Link
                        to="/trailor-condition"
                        className="text-inherit no-underline cursor-pointer"
                      >
                        Trailor Condition Before
                      </Link>
                    </li>
                    <li
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
                      onClick={handleDrawerLinkRowClick}
                    >
                      <Link
                        to="/trailor-condition-after"
                        className="text-inherit no-underline cursor-pointer"
                      >
                        Trailor Condition After
                      </Link>
                    </li>
                    <li
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
                      onClick={handleDrawerLinkRowClick}
                    >
                      <Link
                        to="/return"
                        className="text-inherit no-underline cursor-pointer"
                      >
                        Return
                      </Link>
                    </li>
                    <li
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
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
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
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
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
                      onClick={() => setIsLogoutConfirmOpen(true)}
                    >
                      <span className="text-inherit no-underline cursor-pointer">
                        Logout
                      </span>
                    </li>
                  </>
                ) : (
                  <>
                    <li
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
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
                      className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
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
                      <>
                        <li
                          className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
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
                          className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
                          onClick={handleDrawerLinkRowClick}
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
                          className="px-5 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100"
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
          className={`sm:hidden overflow-hidden transition-all duration-300 ease-out ${
            isSearchCompact
              ? "max-h-24 opacity-100 -translate-y-1"
              : "max-h-24 opacity-100 translate-y-0"
          }`}
        >
          <div className="px-4 pb-2">
          <div className="flex h-[36px] w-full items-center rounded-lg bg-white px-3 border border-gray-200 shadow-sm">
            <input
              type="text"
              placeholder="Search here..."
              className="flex-1 border-none bg-transparent text-[0.78rem] text-gray-700 placeholder:text-gray-400 outline-none"
            />
            <div className="ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#389131]">
              <Search className="w-4 h-4 text-white" aria-hidden />
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
              signUpSuccess({
                user: {
                  firstName: firstName || undefined,
                  lastName,
                  email: res.user.email || data.email,
                },
                trailor: data.trailor,
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

