import React, { useState, useEffect, useRef } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  type Location,
} from "react-router-dom";
import useModalNavigate from "../../hooks/useModalNavigate.ts";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Menu, Search } from "lucide-react";
import { images } from "../../assets/images/index.ts";
import { resolveMediaUrl } from "../../api/media.ts";
import { RootState } from "../../store";
import { logout } from "../../store/authSlice.ts";
import { clearWishlist } from "../../store/wishlistSlice.ts";
import { logout as logoutApi } from "../../api/authApi.ts";
import { LogoutConfirmModal } from "../Auth/LogoutConfirmModal.tsx";

function profileInitial(
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profilePicture?: string;
  } | null,
): string {
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
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isSearchCompact, setIsSearchCompact] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const modalNavigate = useModalNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const userType = useSelector((state: RootState) => state.auth.userType);
  const isOwner =
    (user?.trailor === "Owner" || userType === "Owner") && isAuthenticated;
  const profilePictureUrl = resolveMediaUrl(
    user?.profilePicture ?? undefined,
    "",
  );

  const toggleDrawer = () => setIsDrawerOpen((p) => !p);
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
  const backgroundLocation =
    (location.state as { backgroundLocation?: Location })?.backgroundLocation ??
    location;
  const isTrailerScreen = backgroundLocation.pathname.startsWith("/trailer/");

  useEffect(() => setIsDrawerOpen(false), [backgroundLocation.pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const shouldOpen = window.sessionStorage.getItem("openLoginAfterLogout");
    if (shouldOpen === "1") {
      window.sessionStorage.removeItem("openLoginAfterLogout");
      modalNavigate("/login");
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isHome = backgroundLocation.pathname === "/";
    if (!isHome) {
      setIsSearchCompact(false);
      return;
    }

    const readScrollY = () =>
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    const onScroll = () => setIsSearchCompact(readScrollY() > 20);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll, true);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        closeDrawer();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDrawerOpen]);

  // Listen for global auth modal open events (openAuthModal) — navigate to routes
  useEffect(() => {
    const handler = (e: Event) => {
      // @ts-ignore
      const type = (e as CustomEvent).detail as "login" | "signup" | string;
      if (type === "signup") modalNavigate("/signup");
      else if (type === "login") modalNavigate("/login");
    };

    window.addEventListener("openAuthModal", handler as EventListener);
    return () =>
      window.removeEventListener("openAuthModal", handler as EventListener);
  }, [modalNavigate]);

  const handleLogout = async () => {
    closeDrawer();
    try {
      await logoutApi();
    } finally {
      dispatch(logout());
      dispatch(clearWishlist());
      if (typeof window !== "undefined")
        window.sessionStorage.setItem("openLoginAfterLogout", "1");
      navigate("/", { replace: true });
      toast.success("Logged out successfully");
    }
  };

  const handleProtectedDrawerNavigate = (path: string) => {
    closeDrawer();
    if (!isAuthenticated) {
      modalNavigate("/login");
      return;
    }
    navigate(path);
  };

  const navbarMenuBarStyles =
    ".navbar-menu-bar a, .navbar-menu-bar span { font-family: Inter, sans-serif; font-weight: 500; font-style: normal; font-size: 14px; line-height: 100%; letter-spacing: 0; vertical-align: middle; color: #000000; }";

  return (
    <>
      <style>{navbarMenuBarStyles}</style>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F6F3E9] border-b border-gray-200 font-sans min-w-0 w-full">
        <div className="flex items-center justify-between gap-3 px-10 py-3 min-w-0 w-full">
          <Link
            to="/"
            onClick={closeDrawer}
            className="inline-flex items-center shrink-0 text-inherit no-underline cursor-pointer"
          >
            <img
              src={images.logo}
              alt="HaulHub logo"
              className="h-10 sm:h-[57px] object-contain"
            />
          </Link>

          {backgroundLocation.pathname === "/" && (
            <div className="hidden min-w-0 flex-1 items-center justify-center px-4 sm:flex">
              <div
                className={`flex items-center border border-gray-200 bg-[#FEFEFE] shadow-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#389131]/40 hover:shadow-[0_10px_26px_rgba(56,145,49,0.22)] motion-reduce:transition-none w-[549px] h-[73px] rounded-[21px] px-5`}
              >
                <input
                  type="text"
                  placeholder="Search here..."
                  className={`min-w-0 flex-1 border-none bg-transparent font-[Lexend] font-normal text-[23px] leading-[100%] tracking-normal text-[#929191] placeholder:text-[#929191] outline-none transition-[font-size] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isSearchCompact ? "text-[18px]" : "text-[23px]"}`}
                />
                <div className="flex shrink-0 items-center justify-center rounded-full bg-[#389131] h-[51px] w-[51px]">
                  <Search
                    className="text-white h-[23.3px] w-[23.3px]"
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          )}

          <div
            ref={dropdownRef}
            className="relative flex items-center gap-3 sm:gap-5 text-[0.95rem] text-black shrink-0 min-w-0"
          >
            {isAuthenticated ? (
              <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
                <Link
                  to="/profile"
                  onClick={closeDrawer}
                  className="flex w-[41px] h-[41px] rounded-[20.5px] overflow-hidden bg-[#585858] text-white font-['Myriad_Pro'] font-normal text-[32px] leading-[100%] tracking-[0em] items-center justify-center no-underline hover:opacity-90 focus-visible:outline-none"
                  aria-label={
                    user?.firstName
                      ? `Profile: ${user.firstName}`
                      : user?.email
                        ? `Profile: ${user.email}`
                        : "Profile"
                  }
                >
                  {profilePictureUrl ? (
                    <img
                      src={profilePictureUrl}
                      alt={
                        user?.firstName
                          ? `${user.firstName} profile photo`
                          : user?.email
                            ? `${user.email} profile photo`
                            : "Profile photo"
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    profileInitial(user)
                  )}
                </Link>
                <button
                  type="button"
                  onClick={toggleDrawer}
                  aria-label="Open menu"
                  aria-expanded={isDrawerOpen}
                  aria-haspopup="true"
                  className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-900 transition-colors focus-visible:outline-none"
                >
                  <Menu
                    className="w-[35px] h-[35px] text-black opacity-100"
                    aria-hidden
                  />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={toggleDrawer}
                aria-label="Toggle navigation dropdown"
                className="inline-flex cursor-pointer items-center justify-center rounded-full border-0 p-2"
              >
                <Menu
                  className="w-[35px] h-[35px] text-black opacity-100"
                  aria-hidden
                />
              </button>
            )}

            {isDrawerOpen && (
              <div
                className="absolute right-0 
                top-full z-[60] 
                mt-2 rounded-lg 
                bg-white py-2 
                
                max-h-[calc(100vh-140px)] overflow-y-auto"
                style={{
                  width: "161px",
                  opacity: 1,
                  border: "1px solid #00000033",
                }}
              >
                <div className="p-0">
                  <ul className="m-0 list-none p-0 flex flex-col gap-[12px] text-[14px] text-black font-medium leading-none font-[Inter] navbar-menu-bar">
                    {isTrailerScreen ? (
                      <>
                        <li
                          className="px-7 py-1.5 cursor-pointer whitespace-nowrap transition-colors hover:bg-gray-100 hover:text-[#389131]"
                          onClick={handleDrawerLinkRowClick}
                        >
                          <Link
                            to="/"
                            className="text-inherit no-underline cursor-pointer block w-full"
                          >
                            Home
                          </Link>
                        </li>
                        <li
                          className="px-7 py-1.5 cursor-pointer whitespace-nowrap transition-colors hover:bg-gray-100 hover:text-[#389131]"
                          onClick={handleDrawerLinkRowClick}
                        >
                          <Link
                            to="/booking"
                            className="text-inherit no-underline cursor-pointer block w-full"
                          >
                            Booking Screen
                          </Link>
                        </li>
                        <li
                          className="px-7 py-1.5 cursor-pointer whitespace-nowrap transition-colors hover:bg-gray-100 hover:text-[#389131]"
                          onClick={handleDrawerLinkRowClick}
                        >
                          <Link
                            to="/contact"
                            className="text-inherit no-underline cursor-pointer block w-full"
                          >
                            Contact
                          </Link>
                        </li>
                        <li
                          className="px-7 py-1.5 cursor-pointer whitespace-nowrap transition-colors hover:bg-gray-100 hover:text-[#389131]"
                          onClick={handleDrawerLinkRowClick}
                        >
                          <Link
                            to="/profile"
                            className="text-inherit no-underline cursor-pointer block w-full"
                          >
                            Profile
                          </Link>
                        </li>
                        {isAuthenticated ? (
                          <>
                            <li
                              className="px-7 py-1.5 cursor-pointer whitespace-nowrap transition-colors hover:bg-gray-100 hover:text-[#389131]"
                              onClick={handleDrawerLinkRowClick}
                            >
                              <Link
                                to="/notifications"
                                className="text-inherit no-underline cursor-pointer block w-full"
                              >
                                Notifications
                              </Link>
                            </li>
                            <li
                              className="px-7 py-1.5 cursor-pointer whitespace-nowrap transition-colors hover:bg-gray-100 hover:text-[#389131]"
                              onClick={() => setIsLogoutConfirmOpen(true)}
                            >
                              <span className="text-inherit no-underline cursor-pointer block w-full">
                                Logout
                              </span>
                            </li>
                          </>
                        ) : (
                          <li
                            className="px-7 py-1.5 cursor-pointer whitespace-nowrap transition-colors hover:bg-gray-100 hover:text-[#389131]"
                            onClick={() => {
                              closeDrawer();
                              modalNavigate("/login");
                            }}
                          >
                            <span className="text-inherit no-underline cursor-pointer block w-full">
                              Login / Sign Up
                            </span>
                          </li>
                        )}
                      </>
                    ) : isOwner ? (
                      <>
                        <li
                          className="px-5 py-1.5 cursor-pointer whitespace-nowrap text-neutral-900 transition-colors hover:bg-gray-100 hover:text-[#389131]"
                          onClick={handleDrawerLinkRowClick}
                        >
                          <Link to="/">Home</Link>
                        </li>
                        <li
                          className="px-5 py-1.5 cursor-pointer whitespace-nowrap text-neutral-900 transition-colors hover:bg-gray-100 hover:text-[#389131]"
                          onClick={handleDrawerLinkRowClick}
                        >
                          <Link to="/notifications">Notification</Link>
                        </li>
                        <li
                          className="px-5 py-1.5 cursor-pointer whitespace-nowrap text-neutral-900 transition-colors hover:bg-gray-100 hover:text-[#389131]"
                          onClick={handleDrawerLinkRowClick}
                        >
                          <Link to="/profile">Profile</Link>
                        </li>
                        <li
                          className="px-5 py-1.5 cursor-pointer whitespace-nowrap text-neutral-900 transition-colors hover:bg-gray-100 hover:text-[#389131]"
                          onClick={() => setIsLogoutConfirmOpen(true)}
                        >
                          <span>Log Out</span>
                        </li>
                      </>
                    ) : !isAuthenticated ? (
                      <>
                        <li
                          className="px-7 py-1.5 cursor-pointer whitespace-nowrap transition-colors hover:bg-gray-100"
                          onClick={handleDrawerLinkRowClick}
                        >
                          <Link to="/">Home</Link>
                        </li>
                        <li
                          className="px-7 py-1.5 cursor-pointer whitespace-nowrap transition-colors hover:bg-gray-100"
                          onClick={() =>
                            handleProtectedDrawerNavigate("/booking")
                          }
                        >
                          <span>Booked Trailor</span>
                        </li>
                        <li
                          className="px-7 py-1.5 cursor-pointer whitespace-nowrap transition-colors hover:bg-gray-100"
                          onClick={handleDrawerLinkRowClick}
                        >
                          <Link to="/contact">Contact</Link>
                        </li>
                        <li
                          className="px-7 py-1.5 cursor-pointer whitespace-nowrap transition-colors hover:bg-gray-100"
                          onClick={() =>
                            handleProtectedDrawerNavigate("/profile")
                          }
                        >
                          <span>Profile</span>
                        </li>
                        <li
                          className="px-7 py-1.5 cursor-pointer whitespace-nowrap transition-colors hover:bg-gray-100"
                          onClick={() => {
                            closeDrawer();
                            modalNavigate("/login");
                          }}
                        >
                          <span>Login / Sign Up</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li
                          className="px-7 py-1.5 cursor-pointer whitespace-nowrap transition-colors hover:bg-gray-100"
                          onClick={handleDrawerLinkRowClick}
                        >
                          <Link to="/">Home</Link>
                        </li>
                        <li
                          className="px-7 py-1.5 cursor-pointer whitespace-nowrap transition-colors hover:bg-gray-100"
                          onClick={handleDrawerLinkRowClick}
                        >
                          <Link to="/booking">Booking Screen</Link>
                        </li>
                        <li
                          className="px-7 py-1.5 cursor-pointer whitespace-nowrap transition-colors hover:bg-gray-100"
                          onClick={handleDrawerLinkRowClick}
                        >
                          <Link to="/notifications">Notifications</Link>
                        </li>
                        <li
                          className="px-7 py-1.5 cursor-pointer whitespace-nowrap transition-colors hover:bg-gray-100"
                          onClick={handleDrawerLinkRowClick}
                        >
                          <Link to="/contact">Contact</Link>
                        </li>
                        <li
                          className="px-7 py-1.5 cursor-pointer whitespace-nowrap transition-colors hover:bg-gray-100"
                          onClick={handleDrawerLinkRowClick}
                        >
                          <Link to="/profile">Profile</Link>
                        </li>
                        <li
                          className="px-7 py-1.5 cursor-pointer whitespace-nowrap transition-colors hover:bg-gray-100"
                          onClick={() => setIsLogoutConfirmOpen(true)}
                        >
                          <span>Logout</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {location.pathname === "/" && (
          <div
            className={`overflow-hidden transition-[max-height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:hidden ${isSearchCompact ? "max-h-[48px]" : "max-h-[90px]"}`}
          >
            <div
              className={`transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isSearchCompact ? "px-3 pb-1" : "px-4 pb-2"}`}
            >
              <div
                className={`mx-auto flex items-center rounded-full border border-gray-200 bg-white shadow-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#389131]/40 hover:shadow-[0_10px_22px_rgba(56,145,49,0.2)] motion-reduce:transition-none ${isSearchCompact ? "h-[32px] w-[min(100%,400px)] px-3" : "h-[38px] w-[min(100%,560px)] px-3.5"}`}
              >
                <input
                  type="text"
                  placeholder="Search here..."
                  className={`min-w-0 flex-1 border-none bg-transparent text-gray-700 placeholder:text-gray-400 outline-none transition-[font-size] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isSearchCompact ? "text-[0.74rem]" : "text-[0.8rem]"}`}
                />
                <div
                  className={`flex items-center justify-center rounded-full bg-[#389131] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isSearchCompact ? "ml-2 h-6 w-6" : "ml-2 h-7 w-7"}`}
                >
                  <Search
                    className={`text-white transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isSearchCompact ? "h-3.5 w-3.5" : "h-4 w-4"}`}
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <LogoutConfirmModal
          isOpen={isLogoutConfirmOpen}
          onCancel={() => setIsLogoutConfirmOpen(false)}
          onConfirm={() => {
            setIsLogoutConfirmOpen(false);
            void handleLogout();
          }}
        />
      </nav>
    </>
  );
};

export default Navbar;
