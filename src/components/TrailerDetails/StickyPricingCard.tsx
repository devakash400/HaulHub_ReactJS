import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export type TrailerBookingInfo = {
  title: string;
  subtitle: string;
  image: string;
  price: string;
};

type StickyPricingCardProps = {
  price: string;
  trailer?: TrailerBookingInfo;
};

export const StickyPricingCard: React.FC<StickyPricingCardProps> = ({
  price,
  trailer,
}) => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [dispatcher, setDispatcher] = useState("");

  const handleReserve = () => {
    const dates =
      checkIn && checkOut ? `${checkIn} – ${checkOut}` : "17-15 March 2026";
    navigate("/request-to-book", {
      state: {
        title: trailer?.title ?? "Gooseneck Trailer - Texas, USA",
        subtitle: trailer?.subtitle ?? "25FT Flatbed · Dual Axle · Industrial Steel Frame",
        image: trailer?.image ?? "",
        totalPrice: price,
        dates,
        checkIn,
        checkOut,
      },
    });
  };

  return (
    <div className="w-full min-w-0 self-start">
      <div className="bg-white rounded-2xl border border-gray-300 shadow-soft-lg p-5 space-y-5">
        <div className="border border-gray-300 rounded py-3 text-center text-sm text-black text-large tracking-wide">
          Frequently Ordered
        </div>
        <div>
          <p className="text-xl sm:text-2xl font-semibold text-gray-900">
            <span className="inline-block border-b-2 border-primary pb-0.5">
              {price}
            </span>
            <span className="ml-2 text-sm   font-medium font-bold ">
              per unit
            </span>
          </p>
        </div>

        <div className="mt-3 border border-gray-300 rounded-xl overflow-hidden bg-white">
          <div className="grid grid-cols-2 divide-x divide-gray-300">
            <div className="px-4 pt-3 pb-2.5">
              <p className="text-[10px] font-bold tracking-wide  uppercase">
                Check-in
              </p>
              <input
                type="text"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                placeholder="Add date"
                className="mt-1 w-full bg-transparent text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <div className="px-4 pt-3 pb-2.5">
              <p className="text-[10px] font-bold tracking-wide  uppercase">
                Checkout
              </p>
              <input
                type="text"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                placeholder="Add date"
                className="mt-1 w-full bg-transparent text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="border-t border-gray-300 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-[10px] font-bold tracking-wide  uppercase">
                Estimated dispatch:
              </p>
              <input
                type="text"
                value={dispatcher}
                onChange={(e) => setDispatcher(e.target.value)}
                placeholder="Add Time"
                className="mt-1 w-full bg-transparent text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <ChevronDown className="w-4 h-4 text-black" aria-hidden />
          </div>
        </div>

        <button
          type="button"
          onClick={handleReserve}
          className="mt-4 w-full bg-[#389131] text-white py-3 text-sm font-semibold tracking-wide shadow-soft-lg hover:opacity-90 transition-colors "
        >
          Reserve
        </button>
      </div>
    </div>
  );
};

export default StickyPricingCard;

