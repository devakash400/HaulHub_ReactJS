// import React from "react";
// import { CheckCircle2, ShieldCheck, Truck, Clock, Headphones } from "lucide-react";

// const WhyChooseHaulHub: React.FC = () => {
//   return (
//     <div className="min-h-screen bg-white w-full min-w-0 overflow-x-hidden">
//       <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
//         {/* Hero section */}
//         <section className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] items-center">
//           <div>
//             <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#389131] mb-3">
//               Why choose HaulHub
//             </p>
//             <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight">
//               The easier way to{" "}
//               <span className="text-[#389131]">find, book, and manage</span>{" "}
//               trailers.
//             </h1>
//             <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-xl">
//               HaulHub connects contractors, logistics teams, and owners with the right
//               trailers—on demand. Transparent pricing, verified equipment, and
//               support from first click to final drop‑off.
//             </p>

//             <div className="mt-6 grid gap-4 sm:grid-cols-2 max-w-lg">
//               <div className="flex items-start gap-3">
//                 <div className="mt-1 h-7 w-7 rounded-full bg-[#E5F4E4] flex items-center justify-center">
//                   <CheckCircle2 className="w-4 h-4 text-[#389131]" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-semibold text-gray-900">
//                     Trusted, verified fleet
//                   </p>
//                   <p className="text-xs text-gray-600">
//                     Each listing is reviewed for safety, specs, and documentation.
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-3">
//                 <div className="mt-1 h-7 w-7 rounded-full bg-[#E5F4E4] flex items-center justify-center">
//                   <Clock className="w-4 h-4 text-[#389131]" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-semibold text-gray-900">
//                     Minutes, not days
//                   </p>
//                   <p className="text-xs text-gray-600">
//                     Search availability, confirm, and get on the road without back‑and‑forth calls.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-7 flex flex-wrap items-center gap-3">
//               <button
//                 type="button"
//                 className="inline-flex items-center justify-center rounded-full bg-[#389131] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition"
//               >
//                 Browse trailers
//               </button>
//               <button
//                 type="button"
//                 className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
//               >
//                 List your trailer
//               </button>
//               <p className="w-full text-[11px] text-gray-500">
//                 No hidden fees. Cancel‑friendly options on most rentals.
//               </p>
//             </div>
//           </div>

//           {/* Right: stats / card */}
//           <div className="space-y-4">
//             <div className="rounded-2xl border border-gray-200 shadow-[0_16px_40px_rgba(15,23,42,0.12)] p-6 bg-gradient-to-br from-[#f8fff7] via-white to-[#e6f6ff]">
//               <p className="text-xs font-semibold text-gray-600 uppercase tracking-[0.16em] mb-2">
//                 HaulHub at a glance
//               </p>
//               <div className="grid grid-cols-3 gap-4">
//                 <div>
//                   <p className="text-2xl font-semibold text-gray-900">3k+</p>
//                   <p className="mt-1 text-[11px] text-gray-600">Active trailers</p>
//                 </div>
//                 <div>
//                   <p className="text-2xl font-semibold text-gray-900">4.9</p>
//                   <p className="mt-1 text-[11px] text-gray-600">Avg. renter rating</p>
//                 </div>
//                 <div>
//                   <p className="text-2xl font-semibold text-gray-900">24/7</p>
//                   <p className="mt-1 text-[11px] text-gray-600">Support coverage</p>
//                 </div>
//               </div>

//               <div className="mt-5 flex items-center gap-3 rounded-xl bg-white/80 px-4 py-3">
//                 <div className="h-9 w-9 rounded-full bg-[#E5F4E4] flex items-center justify-center">
//                   <Truck className="w-5 h-5 text-[#389131]" />
//                 </div>
//                 <div className="min-w-0">
//                   <p className="text-xs font-semibold text-gray-900">
//                     Built for heavy‑duty work
//                   </p>
//                   <p className="text-[11px] text-gray-600">
//                     Flatbeds, goosenecks, car haulers and more—matched to your load and route.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="grid gap-3 sm:grid-cols-2">
//               <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-start gap-3">
//                 <div className="mt-0.5 h-7 w-7 rounded-full bg-[#EFF6FF] flex items-center justify-center">
//                   <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
//                 </div>
//                 <div>
//                   <p className="text-xs font-semibold text-gray-900">
//                     Safety first
//                   </p>
//                   <p className="text-[11px] text-gray-600">
//                     ID verification, liability agreements, and guided checklists keep both sides protected.
//                   </p>
//                 </div>
//               </div>
//               <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-start gap-3">
//                 <div className="mt-0.5 h-7 w-7 rounded-full bg-[#FDF2E9] flex items-center justify-center">
//                   <Headphones className="w-4 h-4 text-[#C05621]" />
//                 </div>
//                 <div>
//                   <p className="text-xs font-semibold text-gray-900">
//                     People who pick up
//                   </p>
//                   <p className="text-[11px] text-gray-600">
//                     Talk to real support when plans change, routes shift, or loads run late.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Three-column feature row */}
//         <section className="mt-12 border-t border-gray-100 pt-8">
//           <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
//             Why teams rely on HaulHub
//           </h2>
//           <p className="mt-2 text-sm text-gray-600 max-w-2xl">
//             From owner‑operators to nationwide fleets, HaulHub reduces friction in every haul.
//           </p>

//           <div className="mt-6 grid gap-6 md:grid-cols-3">
//             <div className="rounded-xl border border-gray-200 bg-white p-5">
//               <p className="text-sm font-semibold text-gray-900">
//                 Clear, upfront pricing
//               </p>
//               <p className="mt-2 text-xs text-gray-600">
//                 See rate, fees, and terms before you book—no surprise invoices or last‑minute add‑ons.
//               </p>
//             </div>
//             <div className="rounded-xl border border-gray-200 bg-white p-5">
//               <p className="text-sm font-semibold text-gray-900">
//                 Flexible rental windows
//               </p>
//               <p className="mt-2 text-xs text-gray-600">
//                 Hourly, daily, or project‑based bookings so you only pay for what you actually use.
//               </p>
//             </div>
//             <div className="rounded-xl border border-gray-200 bg-white p-5">
//               <p className="text-sm font-semibold text-gray-900">
//                 Designed for field teams
//               </p>
//               <p className="mt-2 text-xs text-gray-600">
//                 Mobile‑friendly flows, quick ID checks, and simple review tools built for busy job sites.
//               </p>
//             </div>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// };

// export default WhyChooseHaulHub;

import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import useModalNavigate from "../../hooks/useModalNavigate.ts";
import { CheckCircle2, ShieldCheck, Truck, Headphones } from "lucide-react";

const WhyChooseHaulHub: React.FC = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  const userType = useSelector((state: RootState) => state.auth.userType);

  const isRenter = isAuthenticated && userType === "Renter";
  const isOwner = isAuthenticated && userType === "Owner";
  const modalNavigate = useModalNavigate();

  const handleGuestLogin = () => {
    modalNavigate("/login");
  };

  return (
    <div className="w-full bg-[#F6F3EB] overflow-hidden">
      <main className="w-full px-10 mx-auto py-10 md:py-14">
        {/* Top Section */}
        <section className="grid lg:grid-cols-[1.15fr,0.85fr] gap-10 items-start">
          {/* Left Content */}
          <div>
            <p className="mb-7 text-[#389131] font-normal text-[24px] leading-none tracking-normal">
              Why choose HaulHub
            </p>

            <h1
              className="text-[40px] font-normal leading-none tracking-normal
 text-black "
            >
              The easier way to{" "}
              <span className="text-[#389131]">find, book, and manage</span>{" "}
              trailers.
            </h1>

            <p
              className="mt-5 text-[20px] font-light leading-[120%] tracking-normal 
text-black max-w-[770px]"
            >
              HaulHub connects contractors, logistics teams, and owners with the
              right trailers — on demand. Transparent pricing, verified
              equipment, and support from first click to final drop-off.
            </p>
            {/* Features */}
            <div className="mt-8 flex flex-col sm:flex-row gap-7">
              {/* Item */}
              <div className="flex items-start gap-3 max-w-[280px]">
                <div className="min-w-[24px] h-[24px] rounded-full bg-[#E5F4E4] flex items-center justify-center mt-[2px]">
                  <CheckCircle2 className="w-[24px] h-[24px] text-[#389131]" />
                </div>

                <div>
                  <h3 className="font-medium text-[16px] leading-none tracking-normal text-[#389131]">
                    Trusted, verified fleet
                  </h3>

                  <p className="font-light text-[14px] leading-[12%$] tracking-normal text-black">
                    Each listing is reviewed for safety, specs, and
                    documentation.
                  </p>
                </div>
              </div>

              {/* Item */}
              <div className="flex items-start gap-3 max-w-[320px]">
                <div className="min-w-[22px] h-[22px] rounded-full bg-[#E5F4E4] flex items-center justify-center mt-[2px]">
                  <CheckCircle2 className="w-[14px] h-[14px] text-[#389131]" />
                </div>

                <div>
                  <h3
                    className="font-medium text-[16px] leading-none t
                  racking-normal text-[#389131]"
                  >
                    Minutes, not days
                  </h3>

                  <p className="font-light text-[14px] leading-[120%] tracking-normal text-black mt-1">
                    Search availability, confirm, and get on the road without
                    back-and-forth calls.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {(!isAuthenticated || isRenter) &&
                (isRenter ? (
                  <Link
                    to="/"
                    className="inline-flex h-[42px] items-center justify-center w-[151px] px-6 rounded-[10px] bg-[#4D9A45] text-white text-[15px] font-medium hover:opacity-90 transition whitespace-nowrap"
                  >
                    Browse Trailer
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="inline-flex h-[42px] items-center justify-center w-[151px] px-6 rounded-[10px] bg-[#4D9A45] text-white text-[15px] font-medium hover:opacity-90 transition whitespace-nowrap"
                  >
                    Browse Trailer
                  </button>
                ))}

              {(!isAuthenticated || isOwner) &&
                (isOwner ? (
                  <Link
                    to="/list-trailer"
                    className="inline-flex h-[42px] items-center justify-center px-6 rounded-[10px] border border-[#D7D7D7] bg-white text-black text-[14px] font-medium hover:bg-[#FAFAFA] transition whitespace-nowrap"
                  >
                    List your Trailer
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="inline-flex h-[42px] items-center justify-center px-6 rounded-[10px] border border-[#D7D7D7] bg-white text-black text-[14px] font-medium hover:bg-[#FAFAFA] transition whitespace-nowrap"
                  >
                    List your Trailer
                  </button>
                ))}
            </div>
          </div>

          {/* Right Box */}
          <div className="w-full">
            <div
              className="
    bg-white
    border
    border-[#0000003D]
    rounded-[18px]
    shadow-[0px_4px_4px_rgba(0,0,0,0.15)]
    overflow-hidden
  "
            >
              {/* Top Stats */}
              <div className="px-7 py-6">
                <p
                  className="font-light text-[16px] leading-none
               tracking-normal uppercase text-black mb-6"
                >
                  HaulHub at a glance
                </p>

                <div className="grid grid-cols-3 gap-5">
                  <div>
                    <h3
                      className="font-medium text-[16px] leading-none 
                    tracking-normal text-black  uppercase mb-2"
                    >
                      3k+
                    </h3>
                    <p className="font-light text-[12px] leading-none tracking-normal text-black capitalize">
                      Active trailers
                    </p>
                  </div>

                  <div>
                    <h3
                      className="font-medium text-[16px] leading-none 
                    tracking-normal text-black  uppercase mb-2"
                    >
                      4.9
                    </h3>
                    <p className="font-light text-[12px] leading-none tracking-normal text-black capitalize">
                      Avg. Renter Rating
                    </p>
                  </div>

                  <div>
                    <h3
                      className="font-medium text-[16px] leading-none tracking-normal
                     text-black  uppercase mb-2"
                    >
                      24/7
                    </h3>
                    <p className="font-light text-[12px] leading-none tracking-normal text-black capitalize">
                      Support Coverage
                    </p>
                  </div>
                </div>

                {/* Inner Card */}
                <div
                  className="mt-6 rounded-[14px]
                 border border-[#ECECEC] bg-[#FAFAFA]
                  px-4 py-4 flex items-start gap-3"
                >
                  <div className="min-w-[38px] h-[38px] rounded-full bg-[#E5F4E4] flex items-center justify-center">
                    <Truck className="w-[18px] h-[18px] text-[#389131]" />
                  </div>

                  <div>
                    <h4 className="text-[13px] font-semibold text-[#111111]">
                      Built for heavy-duty work
                    </h4>

                    <p className="text-[11px] leading-[150%] text-[#666666] mt-1">
                      Flatbeds, goosenecks, car haulers and more — matched to
                      your load and route.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Small Cards */}
            <div className="grid sm:grid-cols-2 gap-30 mt-5">
              {/* Card */}
              <div
                className="
    bg-white
    border
    border-[#0000003D]
    rounded-[14px]
    px-4
    py-4
    flex
    items-start
    gap-3
    shadow-[0px_4px_4px_0px_#00000026]
  "
              >
                <div className="min-w-[34px] h-[34px] rounded-full bg-[#EEF5FF] flex items-center justify-center">
                  <ShieldCheck className="w-[16px] h-[16px] text-[#3B82F6]" />
                </div>

                <div>
                  <h4 className="text-[12px] font-semibold text-[#111111]">
                    Safety First
                  </h4>

                  <p className="text-[11px] leading-[150%] text-[#666666] mt-1">
                    ID verification, liability agreements, and guided checklists
                    keep both sides protected.
                  </p>
                </div>
              </div>

              {/* Card */}
              <div
                className="
    bg-white
    border
    border-[#0000003D]
    rounded-[14px]
    px-4
    py-4
    flex
    items-start
    gap-3
    shadow-[0px_4px_4px_0px_#00000026]
  "
              >
                <div className="min-w-[34px] h-[34px] rounded-full bg-[#FFF3E8] flex items-center justify-center">
                  <Headphones className="w-[16px] h-[16px] text-[#E07A2F]" />
                </div>

                <div>
                  <h4 className="text-[12px] font-semibold text-[#111111]">
                    People who pick up
                  </h4>

                  <p className="text-[11px] leading-[150%] text-[#666666] mt-1">
                    Talk to real support when plans change, routes shift, or
                    loads run late.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Section */}
        <section className="mt-12">
          <div className="bg-white border border-[#0000003D] rounded-[20px] px-6 md:px-8 py-7 shadow-[0px_4px_4px_0px_#00000026]">
            <h2 className="font-normal text-[40px] leading-none tracking-normal text-black">
              Why teams rely on HaulHub
            </h2>

            <p
              className="mt-3 font-light text-[20px] leading-none tracking-normal 
text-black "
            >
              From owner-operators to nationwide fleets, HaulHub reduces
              friction in every haul.
            </p>
            <div className="mt-8 grid md:grid-cols-3 gap-5">
              {/* Box */}
              <div className="border border-[#0000003D] rounded-[14px] p-5 bg-white shadow-[0px_4px_4px_0px_#00000026]">
                <h3 className="font-normal text-[15px] leading-none tracking-normal text-black">
                  Clear, upfront pricing
                </h3>

                <p className="mt-3 font-light text-[15px] leading-none tracking-normal text-black">
                  See rate, fees, and terms before you book no surprise invoices
                  or last-minute add-ons.
                </p>
              </div>

              {/* Box */}
              <div className="border border-[#0000003D] rounded-[14px] p-5 bg-white shadow-[0px_4px_4px_0px_#00000026]">
                <h3 className="font-normal text-[15px] leading-none tracking-normal text-black">
                  Flexible rental windows
                </h3>

                <p className="mt-3 font-light text-[15px] leading-none tracking-normal text-black">
                  Hourly, daily, or project-based bookings so you only pay for
                  what you actually use.
                </p>
              </div>

              {/* Box */}
              <div className="border border-[#0000003D] rounded-[14px] p-5 bg-white shadow-[0px_4px_4px_0px_#00000026]">
                <h3 className="font-normal text-[15px] leading-none tracking-normal text-black">
                  Designed for field teams
                </h3>
                <p className="mt-3 font-light text-[15px]  tracking-normal text-black">
                  Mobile-friendly flows, quick ID checks, and simple review
                  tools built for busy job sites.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default WhyChooseHaulHub;
