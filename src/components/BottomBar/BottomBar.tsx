// import React from "react";
// import { Link } from "react-router-dom";
// import { images } from "../../assets/images/index.ts";
// import { useSelector } from "react-redux";
// import { RootState } from "../../store";

// const BottomBar: React.FC = () => {
//   const isAuthenticated = useSelector(
//     (state: RootState) => state.auth.isAuthenticated,
//   );
//   const user = useSelector((state: RootState) => state.auth.user);
//   const userType = useSelector((state: RootState) => state.auth.userType);
//   const isOwner =
//     (user?.trailor === "Owner" || userType === "Owner") && isAuthenticated;
//   const year = new Date().getFullYear();

//   return (
//     <footer className="bg-[#F9F7F0] pt-10 pb-0 px-10 font-sans w-full overflow-x-hidden mb-[10px]">      <div className="w-full px-10 mx-auto flex flex-wrap items-start justify-between gap-8 min-w-0 w-full">
//       {/* Left side: Explore & Company columns */}
//       <div className="flex flex-wrap gap-8 sm:gap-12
//       flex-1 min-w-0 sm:min-w-[260px]">
//         <div>
//           <h3 className="m-0 mb-8 text-[25px] font-medium leading-[100%] tracking-[0%] text-black font-['Lexend']">
//             Explore
//           </h3>
//           <ul className="list-none p-0 m-0 flex flex-col gap-[21px] text-[18px] font-normal leading-[100%] tracking-[0%] text-black font-['Lexend']">
//             <li>
//               <Link
//                 to="/wishlist"
//                 className="no-underline text-black text-[18px] font-normal leading-[100%] tracking-[0%] font-['Lexend'] transition-colors hover:text-[#389131]"
//               >
//                 Wishlist
//               </Link>
//             </li>

//             <li>
//               <Link
//                 to="/why-choose"
//                 className="no-underline text-black text-[18px] font-normal leading-[100%] tracking-[0%] font-['Lexend'] transition-colors hover:text-[#389131]"
//               >
//                 Why Choose HaulHub
//               </Link>
//             </li>

//             {isOwner && (
//               <li>
//                 <Link
//                   to="/list-trailer"
//                   className="no-underline text-black text-[18px] font-normal leading-[100%] tracking-[0%] font-['Lexend'] transition-colors hover:text-[#389131]"
//                 >
//                   List Trailer
//                 </Link>
//               </li>
//             )}

//             <li>
//               <Link
//                 to="/booking"
//                 className="no-underline text-black text-[18px] font-normal leading-[100%] tracking-[0%] font-['Lexend'] transition-colors hover:text-[#389131]"
//               >
//                 Your Booked Trailers
//               </Link>
//             </li>

//             <li>
//               <Link
//                 to="/trust-safety"
//                 className="no-underline text-black text-[18px] font-normal leading-[100%] tracking-[0%] font-['Lexend'] transition-colors hover:text-[#389131]"
//               >
//                 Trust &amp; Safety
//               </Link>
//             </li>

//             <li>
//               <Link
//                 to="/get-help"
//                 className="no-underline text-black text-[18px] font-normal leading-[100%] tracking-[0%] font-['Lexend'] transition-colors hover:text-[#389131]"
//               >
//                 Get Help
//               </Link>
//             </li>
//           </ul>
//         </div>

//         <div>
//           <h3 className="m-0 mb-8 text-[25px] font-medium leading-[100%] tracking-[0%] text-black font-['Lexend']">
//             Company
//           </h3>
//           <ul className="list-none p-0 m-0 flex flex-col gap-[21px] text-[18px] font-normal leading-[100%] tracking-[0%] text-black font-['Lexend']">
//             <li>
//               <Link
//                 to="/list-trailer"
//                 className="no-underline text-black text-[18px] font-normal leading-[100%] tracking-[0%] font-['Lexend'] transition-colors hover:text-[#389131]"
//               >
//                 List Trailer
//               </Link>
//             </li>

//             <li>
//               <Link
//                 to="/how-it-works"
//                 className="no-underline text-black text-[18px] font-normal leading-[100%] tracking-[0%] font-['Lexend'] transition-colors hover:text-[#389131]"
//               >
//                 How it works
//               </Link>
//             </li>

//             <li>
//               <Link
//                 to="/about"
//                 className="no-underline text-black text-[18px] font-normal leading-[100%] tracking-[0%] font-['Lexend'] transition-colors hover:text-[#389131]"
//               >
//                 About US
//               </Link>
//             </li>

//             <li>
//               <Link
//                 to="/contact"
//                 className="no-underline text-black text-[18px] font-normal leading-[100%] tracking-[0%] font-['Lexend'] transition-colors hover:text-[#389131]"
//               >
//                 Contact Us
//               </Link>
//             </li>
//           </ul>
//         </div>
//       </div>

//       {/* Right side: Logo above row of store buttons */}
//       {/* Right side: Logo + store buttons */}
//       <div
//         className="flex flex-col items-center gap-4
//   w-full sm:w-auto shrink-0"
//       >
//         {/* Logo centered */}
//         <div className="flex justify-center w-full">
//           <img
//             src={images.logo}
//             alt="HaulHub app logo"
//             className="w-[208px] h-[84px] object-contain"
//           />
//         </div>

//         {/* Store buttons */}
//         <div className="flex items-center justify-center gap-4 w-full">
//           <a
//             href="https://www.apple.com/app-store/"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="flex items-center justify-center gap-2
//       bg-black text-white no-underline
//       w-[207px] h-[68px] rounded-[3px]"
//           >
//             <img
//               src={images.appStore}
//               alt="App Store"
//               className="w-[50px] h-[50px] object-contain"
//             />

//             <span className="flex flex-col leading-none">
//               <span className="font-['Lexend'] font-normal text-[9px] leading-[100%] tracking-[0.06em] uppercase text-white">
//                 Download on the
//               </span>
//               <span className="font-['Lexend'] font-normal text-[21px] leading-[100%] tracking-[0em] text-white">
//                 App Store
//               </span>
//             </span>
//           </a>

//           <a
//             href="https://play.google.com/store"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="flex items-center justify-center gap-2
//       bg-black text-white no-underline
//       w-[207px] h-[68px] rounded-[3px]"
//           >
//             <img
//               src={images.googlePlay}
//               alt="Google Play"
//               className="w-[50px] h-[50px] object-contain"
//             />

//             <span className="flex flex-col leading-none">
//               <span className="font-['Lexend'] font-normal text-[9px] leading-[100%] tracking-[0.06em] uppercase text-white">
//                 Get it on
//               </span>
//               <span className="font-['Lexend'] font-normal text-[21px] leading-[100%] tracking-[0em] text-white">
//                 Google Play
//               </span>
//             </span>
//           </a>
//         </div>
//       </div>
//     </div>

//       {/* Bottom strip — Figma: compact legal row + Join Us / socials */}
//       <div className="mt-10 max-w-full mx-auto w-full min-w-0">
//         <div
//           className="
//             flex flex-col items-center gap-4
//             py-1 sm:py-1
//             sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]
//              sm:items-center sm:gap-x-6
//           "
//         >
//           <div className="hidden sm:block min-w-[88px]" aria-hidden />

//           <p
//             className="
//               m-0 max-w-[min(100%,42rem)] text-center font-['Lexend'] font-normal
//               text-[18px] sm:text-[18px] leading-[150%] tracking-[0.01em]
//               text-[#504E4E]
//             "
//           >
//             @ {year} HaulHub,{" "}
//             <Link
//               className="text-inherit no-underline decoration-inherit hover:text-[#389131] hover:underline"
//               to="/trust-safety"
//             >
//               Privacy
//             </Link>
//             {", "}
//             <Link
//               className="text-inherit no-underline decoration-inherit hover:text-[#389131] hover:underline"
//               to="/trust-safety"
//             >
//               Terms
//             </Link>
//             {" & "}
//             <Link
//               className="text-inherit no-underline decoration-inherit hover:text-[#389131] hover:underline"
//               to="/about"
//             >
//               Company Details
//             </Link>
//           </p>

//           <div className="flex w-full shrink-0 items-center justify-center gap-2.5 sm:w-auto sm:justify-self-end sm:justify-end">
//             <span
//               className="font-['Lexend']
//             font-normal text-[18px] leading-[1.1] text-[#504E4E]"
//             >
//               Join Us
//             </span>
//             <div className="flex items-center gap-2">
//               <a
//                 href="https://www.facebook.com"
//                 aria-label="Facebook"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="inline-flex h-[28px] w-[28px] shrink-0 items-center justify-center no-underline transition-opacity hover:opacity-90"
//               >
//                 <img
//                   src={images.Facebook}
//                   alt=""
//                   className="h-[28px] w-[28px] object-contain"
//                   aria-hidden
//                 />
//               </a>
//               <a
//                 href="https://www.instagram.com"
//                 aria-label="Instagram"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="inline-flex h-[28px] w-[28px] shrink-0 items-center justify-center no-underline transition-opacity hover:opacity-90"
//               >
//                 <img
//                   src={images.Instagram}
//                   alt=""
//                   className="h-[28px] w-[28px] object-contain"
//                   aria-hidden
//                 />
//               </a>
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default BottomBar;
import React from "react";
import { Link } from "react-router-dom";
import { images } from "../../assets/images/index.ts";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import useModalNavigate from "../../hooks/useModalNavigate.ts";

const BottomBar: React.FC = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  const user = useSelector((state: RootState) => state.auth.user);

  const userType = useSelector((state: RootState) => state.auth.userType);
  //Bottom Bar
  const isOwner =
    (user?.trailor === "Owner" || userType === "Owner") && isAuthenticated;

  const isRenter =
    isAuthenticated && (user?.trailor === "Renter" || userType === "Renter");

  const modalNavigate = useModalNavigate();

  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#F9F7F0] pt-8 sm:pt-10 pb-6 sm:pb-0 px-5 sm:px-10 font-sans w-full overflow-x-hidden mb-[10px]">
      {/* TOP SECTION */}
      <div className="w-full flex flex-wrap items-start justify-between gap-8 min-w-0">
        {/* LEFT SIDE */}
        <div
          className="
            flex flex-col sm:flex-row sm:flex-wrap gap-8 sm:gap-12
            flex-1 min-w-0 sm:min-w-[260px]
          "
        >
          <div>
            <h3 className="m-0 mb-4 sm:mb-8 text-[22px] sm:text-[25px] font-medium leading-[100%] tracking-[0%] text-black font-['Lexend']">
              Explore
            </h3>

            <ul className="list-none p-0 m-0 flex flex-col gap-4 sm:gap-[21px] text-[16px] sm:text-[18px] font-normal leading-[100%] tracking-[0%] text-black font-['Lexend']">
              {isRenter && (
                <li>
                  <Link
                    to="/wishlist"
                    className="no-underline text-black transition-colors hover:text-[#389131]"
                  >
                    Wishlist
                  </Link>
                </li>
              )}

              <li>
                <Link
                  to="/why-choose"
                  className="no-underline text-black transition-colors hover:text-[#389131]"
                >
                  Why Choose HaulHub
                </Link>
              </li>

              {isOwner && (
                <li>
                  <Link
                    to="/list-trailer"
                    className="no-underline text-black transition-colors hover:text-[#389131]"
                  >
                    List Trailer
                  </Link>
                </li>
              )}

              {isRenter && (
                <li>
                  {isAuthenticated ? (
                    <Link
                      to="/booking"
                      className="no-underline text-black transition-colors hover:text-[#389131]"
                    >
                      Your Booked Trailers
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        modalNavigate("/login", {
                          state: { returnTo: "/booking" },
                        })
                      }
                      className="no-underline text-black transition-colors hover:text-[#389131] text-left"
                    >
                      Your Booked Trailers
                    </button>
                  )}
                </li>
              )}

              <li>
                <Link
                  to="/trust-safety"
                  className="no-underline text-black transition-colors hover:text-[#389131]"
                >
                  Trust &amp; Safety
                </Link>
              </li>

              <li>
                <Link
                  to="/get-help"
                  className="no-underline text-black transition-colors hover:text-[#389131]"
                >
                  Get Help
                </Link>
              </li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="m-0 mb-4 sm:mb-8 text-[22px] sm:text-[25px] font-medium leading-[100%] tracking-[0%] text-black font-['Lexend']">
              Company
            </h3>

            <ul className="list-none p-0 m-0 flex flex-col gap-4 sm:gap-[21px] text-[16px] sm:text-[18px] font-normal leading-[100%] tracking-[0%] text-black font-['Lexend']">
              <li>
                <Link
                  to="/how-it-works"
                  className="no-underline text-black transition-colors hover:text-[#389131]"
                >
                  How it works
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="no-underline text-black transition-colors hover:text-[#389131]"
                >
                  About US
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="no-underline text-black transition-colors hover:text-[#389131]"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          className="
            flex flex-col items-center gap-4
            w-full sm:w-auto shrink-0
          "
        >
          {/* LOGO */}
          <div className="flex justify-center w-full">
            <img
              src={images.logo}
              alt="HaulHub app logo"
              className="w-[150px] sm:w-[208px] h-auto sm:h-[84px] object-contain"
            />
          </div>

          {/* STORE BUTTONS */}
          <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 w-full mt-2 sm:mt-0">
            {/* APP STORE */}
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex items-center justify-center gap-1.5 sm:gap-2
                bg-black text-white no-underline
                w-[150px] sm:w-[207px] h-[50px] sm:h-[68px] rounded-[3px]
              "
            >
              <img
                src={images.appStore}
                alt="App Store"
                className="w-[34px] sm:w-[50px] h-[34px] sm:h-[50px] object-contain"
              />

              <span className="flex flex-col leading-none">
                <span className="font-['Lexend'] text-[7px] sm:text-[9px] uppercase text-white">
                  Download on the
                </span>

                <span className="font-['Lexend'] text-[15px] sm:text-[21px] text-white">
                  App Store
                </span>
              </span>
            </a>

            {/* GOOGLE PLAY */}
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex items-center justify-center gap-1.5 sm:gap-2
                bg-black text-white no-underline
                w-[150px] sm:w-[207px] h-[50px] sm:h-[68px] rounded-[3px]
              "
            >
              <img
                src={images.googlePlay}
                alt="Google Play"
                className="w-[34px] sm:w-[50px] h-[34px] sm:h-[50px] object-contain"
              />

              <span className="flex flex-col leading-none">
                <span className="font-['Lexend'] text-[7px] sm:text-[9px] uppercase text-white">
                  Get it on
                </span>

                <span className="font-['Lexend'] text-[15px] sm:text-[21px] text-white">
                  Google Play
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* BOTTOM STRIP */}
      <div className="mt-10 w-full min-w-0">
        <div
          className="
            flex flex-col items-center gap-4
            py-1
            sm:grid
            sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]
            sm:items-center
            sm:gap-x-6
          "
        >
          <div className="hidden sm:block min-w-[88px]" aria-hidden />

          {/* COPYRIGHT */}
          <p
            className="
              m-0
              max-w-[min(100%,42rem)]
              text-center
              font-['Lexend']
              font-normal
              text-[14px]
              sm:text-[18px]
              leading-[150%]
              tracking-[0.01em]
              text-[#504E4E]
            "
          >
            @ {year} HaulHub,{" "}
            <Link
              className="text-inherit no-underline hover:text-[#389131] hover:underline"
              to="/trust-safety"
            >
              Privacy
            </Link>
            {", "}
            <Link
              className="text-inherit no-underline hover:text-[#389131] hover:underline"
              to="/trust-safety"
            >
              Terms
            </Link>
            {" & "}
            <Link
              className="text-inherit no-underline hover:text-[#389131] hover:underline"
              to="/about"
            >
              Company Details
            </Link>
          </p>

          {/* SOCIALS */}
          <div className="flex w-full shrink-0 items-center justify-center gap-2.5 sm:w-auto sm:justify-self-end sm:justify-end mt-4 sm:mt-0">
            <span className="font-['Lexend'] text-[15px] sm:text-[18px] leading-[1.1] text-[#504E4E]">
              Join Us
            </span>

            <div className="flex items-center gap-2">
              <a
                href="https://www.facebook.com"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[28px] w-[28px] items-center justify-center"
              >
                <img
                  src={images.Facebook}
                  alt=""
                  className="h-[28px] w-[28px] object-contain"
                />
              </a>

              <a
                href="https://www.instagram.com"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[28px] w-[28px] items-center justify-center"
              >
                <img
                  src={images.Instagram}
                  alt=""
                  className="h-[28px] w-[28px] object-contain"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BottomBar;
