import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const formatDateString = (dateStr: string) => {
  if (!dateStr) return "";
  const dateRegex = /(\d{4})[-/](\d{1,2})[-/](\d{1,2})/g;
  return String(dateStr).replace(dateRegex, (match, year, month, day) => {
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return match;
  });
};

const BookingSent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = (location.state ?? {}) as Record<string, unknown>;

  return (
    <div className="min-h-screen bg-[#f6f8f7] ">
      <div className="w-full mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-[28px] shadow-md p-8 md:p-14">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-[90px] h-[90px] rounded-full bg-[#EAF7EE] flex items-center justify-center">
              <div className="w-[60px] h-[60px] rounded-full bg-[#389131] flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mt-6">
            <h1
              className="text-[30px] font-bold text-black 
              leading-[100%] align-middle tracking-[0.1em]"
              style={{ fontFamily: "Lexend" }}
            >
              Booking Sent!
            </h1>

            <p
              className="mt-4 text-[22px] font-light leading-normal md:leading-[20px] tracking-[0px] text-black align-middle"
              style={{ fontFamily: "Lexend" }}
            >
              Your booking request has been submitted successfully.
            </p>
            <p
              className="mt-4 text-[22px] font-light leading-normal md:leading-[20px] tracking-[0px] text-black align-middle"
              style={{ fontFamily: "Lexend" }}
            >
              The owner will review and respond shortly.
            </p>
            <p className="text-gray-500 text-lg"></p>
          </div>

          {/* Details Card */}
          <div className="max-w-3xl mx-auto mt-12 border border-gray-200 rounded-2xl p-8 bg-[#fafafa]">
            <div className="flex justify-between items-center py-4 border-b gap-4 md:gap-0">
              <span className="text-gray-500 text-lg whitespace-nowrap md:whitespace-normal">Dates</span>

              <span className="font-semibold text-lg text-right md:text-left">
                {formatDateString(String(state.dates || "2026-05-14 - 2026-05-26"))}
              </span>
            </div>

            <div className="flex justify-between items-center py-4 border-b gap-4 md:gap-0">
              <span className="text-gray-500 text-lg whitespace-nowrap md:whitespace-normal">Total Price</span>

              <span className="font-semibold text-lg text-right md:text-left">
                {String(state.totalPrice || "320")}
              </span>
            </div>

            <div className="flex justify-between items-center pt-4 gap-4 md:gap-0">
              <span className="text-gray-500 text-lg whitespace-nowrap md:whitespace-normal">Status</span>

              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700 whitespace-nowrap md:whitespace-normal text-right md:text-left">
                Pending Confirmation
              </span>
            </div>
          </div>

          {/* Payment Notice */}
          <div className="max-w-3xl mx-auto mt-8 bg-[#EFFAF2] border border-[#d7f0de] rounded-2xl p-5 flex items-center gap-4">
            <div className="w-7 h-7 rounded-full bg-[#389131] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">✓</span>
            </div>

            <p className="text-gray-600">
              Your payment will be secure. You'll only be charged once the owner
              confirms your booking.
            </p>
          </div>

          {/* Buttons */}
          <div className="max-w-3xl mx-auto mt-10">
            <button
              onClick={() => navigate("/")}
              className="w-full h-[60px] rounded-xl bg-[#389131] hover:bg-[#2f7a28] text-white font-semibold text-xl transition"
            >
              Back to Home
            </button>

            <button
              onClick={() => navigate("/booking")}
              className="w-full mt-6 text-[#389131]
               font-semibold text-1xl"
            >
              View My Bookings →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSent;
