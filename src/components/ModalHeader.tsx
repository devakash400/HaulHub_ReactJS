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
    <div className="flex items-center gap-3 px-3 sm:px-5 py-4 sm:py-5 bg-[#389131] text-white rounded-t-2xl sm:rounded-t-2xl">
      <button
        type="button"
        onClick={onClose}
        aria-label={variant === "back" ? "Back" : "Close"}
        className={`flex items-center justify-center shrink-0 ${
          variant === "back"
            ? "w-8 h-8 text-white hover:bg-white/10 rounded-full"
            : "rounded-full bg-white/15 text-white hover:bg-white/25"
        } transition-colors`}
        style={
          variant === "close" ? { width: "19px", height: "19px" } : undefined
        }
      >
        {variant === "back" ? (
          <ArrowLeft className="w-5 h-5" aria-hidden />
        ) : (
          <X className="w-4 h-4" aria-hidden />
        )}
      </button>

      <h2
        id={titleId}
        className="flex-1 text-center text-white m-0 px-2"
        style={{
          fontFamily: "Lexend",
          fontWeight: 700,
          fontSize: "23px",
          lineHeight: "100%",
          letterSpacing: "0px",
        }}
      >
        {title}
      </h2>
      <div className="w-10 h-10 flex items-center justify-end shrink-0">
        {rightSlot ?? null}
      </div>
    </div>
  );
};
