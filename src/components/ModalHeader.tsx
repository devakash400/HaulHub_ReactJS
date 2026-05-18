import React from "react";
import { ArrowLeft, X } from "lucide-react";

export interface ModalHeaderProps {
  title: React.ReactNode;
  onClose: () => void;
  /** "back" shows arrow, "close" shows X, "none" shows no button */
  variant?: "back" | "close" | "none";
  /** Optional right slot (e.g. trash icon). When not provided, nothing is shown. */
  rightSlot?: React.ReactNode;
  /** Optional id for aria-labelledby */
  titleId?: string;
  /** When variant is "close", render X on the top-right (parent should use overflow-hidden + rounded corners). */
  closeOnRight?: boolean;
  /** Close button width/height in px (close variant only). Defaults to 19. */
  closeSizePx?: number;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  onClose,
  variant = "close",
  rightSlot,
  titleId,
  closeOnRight = false,
  closeSizePx = 19,
}) => {
  const showCloseLeading =
    variant !== "none" && !(variant === "close" && closeOnRight);
  const showCloseTrailing = variant === "close" && closeOnRight;
  const closeDim = `${closeSizePx}px`;

  return (
    <div
      className={`flex items-center gap-3 px-3 sm:px-5 py-4 sm:py-5 bg-[#389131] text-white [transform:translateZ(0)] ${
        showCloseTrailing ? "relative" : ""
      }`}
    >
      {showCloseLeading && (
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
            variant === "close" ? { width: closeDim, height: closeDim } : undefined
          }
        >
          {variant === "back" ? (
            <ArrowLeft className="w-5 h-5" aria-hidden />
          ) : (
            <X className="4-4 h-4" aria-hidden />
          )}
        </button>
      )}

      <h2
        id={titleId}
        className={`flex-1 text-center text-white m-0 ${
          showCloseTrailing ? "px-10 sm:px-11" : "px-2"
        }`}
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

      {showCloseTrailing ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute z-10 flex items-center justify-center rounded-full bg-white text-[#389131] shadow-[0_1px_3px_rgba(0,0,0,0.12)] hover:bg-[#f5f5f5] active:bg-[#ebebeb] 
          transition-colors right-3 top-3 sm:right-5 sm:top-4"
          style={{ width: closeDim, height: closeDim }}
        >
          <X className="w-[14px] h-[14px]" strokeWidth={2.25} aria-hidden />
        </button>
      ) : (
        <div className="w-10 h-10 flex items-center justify-end shrink-0">
          {rightSlot ?? null}
        </div>
      )}
    </div>
  );
};
