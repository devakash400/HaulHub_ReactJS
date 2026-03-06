import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { images } from "../../assets/images/index.ts";

const Navbar: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);
  const closeDrawer = () => setIsDrawerOpen(false);

  const location = useLocation();
  useEffect(() => {
    setIsDrawerOpen(false);
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

      {/* Right: List Your Trailer + dropdown toggle */}
      <div ref={dropdownRef} className="relative flex items-center gap-3 sm:gap-5 text-[0.95rem] text-black shrink-0 min-w-0">
        <Link
          to="/list-trailer"
          className="text-sm sm:text-[15px] font-medium text-inherit no-underline cursor-pointer whitespace-nowrap"
        >
          List Your Trailer
        </Link>
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
                    to="/list-trailer"
                    className="text-inherit no-underline cursor-pointer"
                  >
                    List Your Trailer
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
                    to="/login"
                    className="text-inherit no-underline cursor-pointer"
                  >
                    Login / Signup
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

