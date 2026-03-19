import React from "react";
import { Link } from "react-router-dom";
import { images } from "../../assets/images/index.ts";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const BottomBar: React.FC = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const isOwner = user?.trailor === "Owner" && isAuthenticated;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-gray-200 py-8 px-4 sm:px-6 font-sans w-full overflow-x-hidden">
      <div className="max-w-[1120px] mx-auto flex flex-wrap items-start justify-between gap-8 min-w-0 w-full">
        {/* Left side: Explore & Company columns */}
        <div className="flex flex-wrap gap-8 sm:gap-12 flex-1 min-w-0 sm:min-w-[260px]">
          <div>
            <h3 className="m-0 mb-3 text-[1.25rem] font-medium tracking-[0.03em] text-bold">
              Explore
            </h3>
            <ul className="list-none font-medium p-0 m-0 flex flex-col gap-1.5 text-[0.9rem] text-black">
              <li>
                <Link
                  to="/wishlist"
                  className="no-underline text-black text-[0.9rem]"
                >
                  Wishlist
                </Link>
              </li>
              <li>
                <Link
                  to="/why-choose"
                  className="no-underline text-black text-[0.9rem]"
                >
                  Why Choose HaulHub
                </Link>
              </li>
              {isOwner && (
                <li>
                  <Link
                    to="/list-trailer"
                    className="no-underline text-black text-[0.9rem]"
                  >
                    List Trailer
                  </Link>
                </li>
              )}
              <li>
                <Link
                  to="/booking"
                  className="no-underline text-black text-[0.9rem]"
                >
                  Booking Screen
                </Link>
              </li>
              <li>
                <Link
                  to="/trust-safety"
                  className="no-underline text-black text-[0.9rem]"
                >
                  Trust &amp; Safety
                </Link>
              </li>
              <li>
                <Link
                  to="/get-help"
                  className="no-underline text-black text-[0.9rem]"
                >
                  Get Help
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="m-0 mb-3 text-[1.25rem] font-medium tracking-[0.03em] text-bold">
              Company
            </h3>
            <ul className="list-none font-medium p-0 m-0 flex flex-col gap-1.5 text-[0.9rem] text-black">
              {isOwner && (
                <li>
                  <Link
                    to="/list-trailer"
                    className="no-underline text-black text-[0.9rem]"
                  >
                    List Trailer
                  </Link>
                </li>
              )}
              <li>
                <Link
                  to="/how-it-works"
                  className="no-underline text-black text-[0.9rem]"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="no-underline text-black text-[0.9rem]"
                >
                  About US
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="no-underline text-black text-[0.9rem]"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Right side: Logo above row of store buttons */}
        <div className="flex flex-col items-center gap-3 min-w-0 sm:min-w-[260px] shrink-0 w-full sm:w-auto">
          <img
            src={images.logo}
            alt="HaulHub app logo"
            className="h-[52px] object-contain"
          />

          <div className="flex flex-row flex-nowrap justify-center gap-2 sm:gap-3 mt-1 w-full sm:w-auto">
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-[0.2rem] py-[0.1rem] rounded-[2px] bg-black text-[#f9fafb] no-underline w-[calc(50%-0.25rem)] sm:w-[160px] h-[55px]"
            >
              <img
                src={images.appStore}
                alt="App Store"
                className="w-8 h-8 object-contain"
              />
              <span className="flex flex-col leading-[1.1]">
                <span className="text-[8px] uppercase">Download on the</span>
                <span className="text-[1rem]">App Store</span>
              </span>
            </a>

            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-[0.2rem] py-[0.1rem] rounded-[2px] bg-black text-[#f9fafb] no-underline w-[calc(50%-0.25rem)] sm:w-[160px] h-[55px]"
            >
              <img
                src={images.googlePlay}
                alt="Google Play"
                className="w-8 h-8 object-contain"
              />
              <span className="flex flex-col leading-[1.1]">
                <span className="text-[8px] uppercase">Get it on</span>
                <span className="text-[1rem]">Google Play</span>
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="max-w-[1120px] mx-auto mt-8 pt-5 border-t border-gray-200 text-[0.95rem] text-gray-700">
        <div className="flex flex-col items-center gap-4 sm:grid sm:grid-cols-3 sm:items-center">
          {/* Left spacer (keeps center truly centered on desktop) */}
          <div className="hidden sm:block" />

          {/* Center copyright */}
          <p className="m-0 text-center">
            @ {year} HaulHub,{" "}
            <Link to="/trust-safety" className="text-gray-700 hover:underline">
              Privacy
            </Link>{" "}
            <Link to="/trust-safety" className="text-gray-700 hover:underline">
              Terms
            </Link>{" "}
            &amp;{" "}
            <Link to="/about" className="text-gray-700 hover:underline">
              Company Details
            </Link>
          </p>

          {/* Right socials */}
          <div className="flex items-center justify-center gap-3 sm:justify-end">
          <span className="text-gray-700 font-medium">Join Us</span>
          <a
            href="https://www.facebook.com"
            aria-label="Facebook"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center no-underline"
          >
            <img
              src={images.Facebook}
              alt="Facebook"
              className="h-9 w-9 object-contain"
            />
          </a>
          <a
            href="https://www.instagram.com"
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center no-underline"
          >
            <img
              src={images.Instagram}
              alt="Instagram"
              className="h-9 w-9 object-contain"
            />
          </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BottomBar;

