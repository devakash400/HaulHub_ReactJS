import React from "react";
import { images } from "../../assets/images/index.ts";

interface EmptyStateProps {
  line: string;
  subLine?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  line,
  subLine,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[240px] px-6 py-10 text-center">
      <img
        src={images.logowithouttext}
        alt="Empty state illustration"
        className="w-48 sm:w-72 md:w-96 lg:w-[450px] h-auto object-contain opacity-85 mb-8"
      />
      <p className="text-sm sm:text-base font-semibold text-gray-800 mb-1.5">
        {line}
      </p>
      {subLine && (
        <p className="text-xs sm:text-sm text-gray-500 max-w-[280px] leading-relaxed mb-5">
          {subLine}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-1 px-6 py-2.5 bg-[#389131] hover:bg-[#2f7a29] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;