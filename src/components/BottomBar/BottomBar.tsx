import React from "react";
import { Link } from "react-router-dom";
import { images } from "../../assets/images/index.ts";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const BottomBar: React.FC = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const userType = useSelector((state: RootState) => state.auth.userType);
  const isOwner =
    (user?.trailor === "Owner" || userType === "Owner") && isAuthenticated;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#F8F7F1] pt-10 pb-0 px-4 sm:px-6 font-sans w-full overflow-x-hidden mb-[10px]">
      <div className="max-w-[1120px] mx-auto flex flex-wrap items-start justify-between gap-8 min-w-0 w-full">
        {/* Left side: Explore & Company columns */}
        <div className="flex flex-wrap gap-8 sm:gap-12 flex-1 min-w-0 sm:min-w-[260px]">
          <div>
            <h3 className="m-0 mb-8 text-[25px] font-medium leading-[100%] tracking-[0%] text-black font-['Lexend']">
              Explore
            </h3>
            <ul className="list-none p-0 m-0 flex flex-col gap-[21px] text-[18px] font-normal leading-[100%] tracking-[0%] text-black font-['Lexend']">
              <li>
                <Link
                  to="/wishlist"
                  className="no-underline text-black text-[18px] font-normal leading-[100%] tracking-[0%] font-['Lexend'] transition-colors hover:text-[#389131]"
                >
                  Wishlist
                </Link>
              </li>

              <li>
                <Link
                  to="/why-choose"
                  className="no-underline text-black text-[18px] font-normal leading-[100%] tracking-[0%] font-['Lexend'] transition-colors hover:text-[#389131]"
                >
                  Why Choose HaulHub
                </Link>
              </li>

              {isOwner && (
                <li>
                  <Link
                    to="/list-trailer"
                    className="no-underline text-black text-[18px] font-normal leading-[100%] tracking-[0%] font-['Lexend'] transition-colors hover:text-[#389131]"
                  >
                    List Trailer
                  </Link>
                </li>
              )}

              <li>
                <Link
                  to="/booking"
                  className="no-underline text-black text-[18px] font-normal leading-[100%] tracking-[0%] font-['Lexend'] transition-colors hover:text-[#389131]"
                >
                  Your Booked Trailers
                </Link>
              </li>

              <li>
                <Link
                  to="/trust-safety"
                  className="no-underline text-black text-[18px] font-normal leading-[100%] tracking-[0%] font-['Lexend'] transition-colors hover:text-[#389131]"
                >
                  Trust &amp; Safety
                </Link>
              </li>

              <li>
                <Link
                  to="/get-help"
                  className="no-underline text-black text-[18px] font-normal leading-[100%] tracking-[0%] font-['Lexend'] transition-colors hover:text-[#389131]"
                >
                  Get Help
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="m-0 mb-8 text-[25px] font-medium leading-[100%] tracking-[0%] text-black font-['Lexend']">
              Company
            </h3>
            <ul className="list-none p-0 m-0 flex flex-col gap-[21px] text-[18px] font-normal leading-[100%] tracking-[0%] text-black font-['Lexend']">
              <li>
                <Link
                  to="/list-trailer"
                  className="no-underline text-black text-[18px] font-normal leading-[100%] tracking-[0%] font-['Lexend'] transition-colors hover:text-[#389131]"
                >
                  List Trailer
                </Link>
              </li>

              <li>
                <Link
                  to="/how-it-works"
                  className="no-underline text-black text-[18px] font-normal leading-[100%] tracking-[0%] font-['Lexend'] transition-colors hover:text-[#389131]"
                >
                  How it works
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="no-underline text-black text-[18px] font-normal leading-[100%] tracking-[0%] font-['Lexend'] transition-colors hover:text-[#389131]"
                >
                  About US
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="no-underline text-black text-[18px] font-normal leading-[100%] tracking-[0%] font-['Lexend'] transition-colors hover:text-[#389131]"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Right side: Logo above row of store buttons */}
        {/* Right side: Logo + store buttons */}
        <div
          className="flex flex-col items-center gap-4 
  w-full sm:w-auto shrink-0"
        >
          {/* Logo centered */}
          <div className="flex justify-center w-full">
            <img
              src={images.logo}
              alt="HaulHub app logo"
              className="w-[208px] h-[84px] object-contain"
            />
          </div>

          {/* Store buttons */}
          <div className="flex items-center justify-center gap-4 w-full">
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2
      bg-black text-white no-underline
      w-[207px] h-[68px] rounded-[3px]"
            >
              <img
                src={images.appStore}
                alt="App Store"
                className="w-[50px] h-[50px] object-contain"
              />

              <span className="flex flex-col leading-none">
                <span className="font-['Lexend'] font-normal text-[9px] leading-[100%] tracking-[0.06em] uppercase text-white">
                  Download on the
                </span>
                <span className="font-['Lexend'] font-normal text-[21px] leading-[100%] tracking-[0em] text-white">
                  App Store
                </span>
              </span>
            </a>

            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2
      bg-black text-white no-underline
      w-[207px] h-[68px] rounded-[3px]"
            >
              <img
                src={images.googlePlay}
                alt="Google Play"
                className="w-[50px] h-[50px] object-contain"
              />

              <span className="flex flex-col leading-none">
                <span className="font-['Lexend'] font-normal text-[9px] leading-[100%] tracking-[0.06em] uppercase text-white">
                  Get it on
                </span>
                <span className="font-['Lexend'] font-normal text-[21px] leading-[100%] tracking-[0em] text-white">
                  Google Play
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="max-w-[1120px] mx-auto pt-5 text-[0.95rem] text-[#4B5563]">
        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-3 sm:items-center">
          {/* Left spacer (keeps center truly centered on desktop) */}
          <div className="hidden sm:block" />

          {/* Center copyright */}
          <p className="m-0 text-center">
            @ {year} HaulHub,{" "}
            <Link
              to="/trust-safety"
              className="text-gray-700 transition-colors hover:text-[#389131] hover:underline"
            >
              Privacy
            </Link>{" "}
            <Link
              to="/trust-safety"
              className="text-gray-700 transition-colors hover:text-[#389131] hover:underline"
            >
              Terms
            </Link>{" "}
            &amp;{" "}
            <Link
              to="/about"
              className="text-gray-700 transition-colors hover:text-[#389131] hover:underline"
            >
              Company Details
            </Link>
          </p>

          {/* Right socials */}
          <div className="flex items-center justify-end gap-[3px] w-full">
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
                className="h-9 w-9 object-contain ml-[10px]"
              />
            </a>
            <a
              href="https://www.instagram.com"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center no-underline ml-[10px]"
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
