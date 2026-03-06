import React from "react";
import type { BookingSummary } from "./types.ts";

export type BookingSummaryCardProps = {
  data: BookingSummary;
};

export const BookingSummaryCard: React.FC<BookingSummaryCardProps> = ({
  data,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] p-4 sm:p-5 w-full min-w-0">
      {/* Top: image + title */}
      <div className="flex gap-3 mb-4 min-w-0">
        <img
          src={data.image}
          alt={data.title}
          className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 m-0 mb-1 truncate">
            {data.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 m-0 line-clamp-2">{data.subtitle}</p>
        </div>
      </div>

      {/* Dates row */}
      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 min-w-0">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-700 m-0">Dates</p>
          <p className="text-sm text-gray-600 m-0 mt-0.5">{data.dates}</p>
        </div>
        <button
          type="button"
          className="shrink-0 text-xs sm:text-sm font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 px-2 sm:px-3 py-1.5 rounded-md transition-colors"
        >
          Change
        </button>
      </div>

      {/* Total Price row */}
      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 min-w-0 flex-wrap sm:flex-nowrap">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-700 m-0">Total Price</p>
          <p className="text-sm text-gray-600 m-0 mt-0.5">{data.totalPrice}</p>
        </div>
        <button
          type="button"
          className="shrink-0 text-xs sm:text-sm font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 px-2 sm:px-3 py-1.5 rounded-md transition-colors"
        >
          Details
        </button>
      </div>

      {/* Cancellation */}
      <p className="text-sm text-gray-700 m-0 mb-4">
        {data.cancellationPreview}{" "}
        <a
          href="#"
          className="underline text-gray-800 hover:text-[#2F5D3A]"
        >
          {data.policyLinkText}
        </a>
      </p>

      {/* Price details - no line */}
      <div className="pt-4">
        <h4 className="text-base font-semibold text-gray-900 m-0 mb-4">
          Price details
        </h4>
        <div className="flex justify-between items-center text-sm text-gray-700 mb-2">
          <span>Total USA</span>
          <span>{data.totalPrice}</span>
        </div>
        <a
          href="#"
          className="text-xs text-gray-600 underline hover:text-[#2F5D3A]"
        >
          Price breakdown
        </a>
      </div>
    </div>
  );
};
