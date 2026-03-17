import React from "react";
import { ArrowLeft, X } from "lucide-react";

export interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  /** "back" shows arrow (e.g. Login), "close" shows X */
  variant?: "back" | "close";
  /** Optional right slot (e.g. trash icon). When not provided, nothing is shown. */
  rightSlot?: React.ReactNode;
  /** Optional id for aria-labelledby */
  titleId?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  onClose,
  variant = "close",
  rightSlot,
  titleId,
}) => {
  return (
    <div className="flex items-center gap-3 px-3 sm:px-5 py-3 bg-[#389131] text-white rounded-t-2xl sm:rounded-t-2xl">
      <button
        type="button"
        onClick={onClose}
        aria-label={variant === "back" ? "Back" : "Close"}
        className={`flex items-center justify-center shrink-0 ${
          variant === "back"
            ? "w-7 h-7 text-white hover:bg-white/10 rounded-full"
            : "w-9 h-9 rounded-full bg-white/15 text-white hover:bg-white/25"
        } transition-colors`}
      >
        {variant === "back" ? (
          <ArrowLeft className="w-5 h-5" aria-hidden />
        ) : (
          <X className="w-5 h-5" aria-hidden />
        )}
      </button>
      <h2
        id={titleId}
        className="flex-1 text-center text-lg sm:text-2xl font-semibold text-white m-0 leading-tight px-2"
      >
        {title}
      </h2>
      <div className="w-10 h-10 flex items-center justify-end shrink-0">
        {rightSlot ?? null}
      </div>
    </div>
  );
};
