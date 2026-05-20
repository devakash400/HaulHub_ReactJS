import React, { useEffect, useCallback } from "react";
import { lockScroll } from "../../utils/scrollLock.ts";
import { ModalHeader } from "../ModalHeader.tsx";

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
        className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden"
        onClick={handleInnerClick}
      >
        <ModalHeader
          title="Sign out of your account?"
          onClose={onCancel}
          variant="close"
          closeOnRight
          titleId="logout-confirm-title"
        />
        <div className="px-6 py-6 sm:px-8 sm:py-7">
          <p className="mb-4 text-sm text-gray-600">
            You&apos;ll be logged out of HaulHub on this device. You can keep
            browsing trailers, but you&apos;ll need to log in again to manage
            bookings, your wishlist, or account settings.
          </p>

          <div className="mt-5 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 text-sm font-semibold">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-[#389131] text-white hover:bg-[#2f7a29] transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
