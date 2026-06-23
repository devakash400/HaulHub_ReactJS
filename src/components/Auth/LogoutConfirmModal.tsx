import React, { useEffect, useCallback } from "react";
import { lockScroll } from "../../utils/scrollLock.ts";

export interface LogoutConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    },
    [onCancel],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleEscape);
    const unlock = lockScroll();
    return () => {
      document.removeEventListener("keydown", handleEscape);
      unlock();
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const handleOverlayClick = () => {
    onCancel();
  };

  const handleInnerClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-confirm-title"
    >
      <div
        className="w-full max-w-[340px] rounded-[28px] bg-white p-6 shadow-xl text-center"
        onClick={handleInnerClick}
      >
        <div className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#f8f9fa]">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V4C3 3.46957 3.21071 2.96086 3.58579 2.58579C3.96086 2.21071 4.46957 2 5 2H10"
              stroke="#389131"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 17L21 12L16 7"
              stroke="#389131"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 12H9"
              stroke="#389131"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h3
          id="logout-confirm-title"
          className="mb-3 text-[22px] font-bold text-[#1f2937]"
        >
          Log Out
        </h3>

        <p className="mb-7 text-[15px] leading-relaxed text-[#6b7280]">
          Are you sure you want to log out of<br />your account?
        </p>

        <div className="flex items-center gap-3 text-[15px] font-semibold">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-2xl bg-[#f3f4f6] px-4 py-3.5 text-[#374151] hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-[#389131] px-4 py-3.5 text-white hover:bg-[#2f7a29] transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};
