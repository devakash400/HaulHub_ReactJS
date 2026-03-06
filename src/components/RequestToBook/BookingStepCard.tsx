import React from "react";

export type BookingStepCardProps = {
  title: string;
  showContinueButton?: boolean;
  onContinue?: () => void;
};

export const BookingStepCard: React.FC<BookingStepCardProps> = ({
  title,
  showContinueButton = false,
  onContinue,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 min-w-0">
      <h3 className="text-sm sm:text-base font-semibold text-gray-900 m-0 flex-1 min-w-0 truncate">
        {title}
      </h3>
      {showContinueButton && (
        <button
          type="button"
          onClick={onContinue}
          className="shrink-0 bg-[#389131] hover:bg-[#2d7528] text-white px-4 sm:px-6 py-2 rounded-md text-xs sm:text-sm font-semibold transition-colors"
        >
          Continue
        </button>
      )}
    </div>
  );
};
