import React, { useEffect, useCallback } from "react";
import { lockScroll } from "../../utils/scrollLock.ts";

export interface WishlistLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export const WishlistLoginModal: React.FC<WishlistLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginClick,
}) => {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
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

  const handleLogin = () => {
    onClose();
    onLoginClick();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wishlist-modal-title"
    >
      <div
        className="relative w-full max-w-[500px] bg-white rounded-t-2xl sm:rounded-2xl shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: close left, title center */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors shrink-0"
            aria-label="Close"
          >
            <span className="text-xl leading-none">&#215;</span>
          </button>
          <h2
            id="wishlist-modal-title"
            className="absolute left-1/2 -translate-x-1/2 text-xl font-semibold text-gray-900"
          >
            Wishlist
          </h2>
          <div className="w-10 shrink-0" aria-hidden />
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 text-left">
            Log in to view your Wishlists
          </h3>
          <p className="text-sm text-gray-600 mb-6 text-left">
            You can create, view, or edit Wishlists once you&apos;ve logged in.
          </p>

          <button
            type="button"
            onClick={handleLogin}
            className="w-full py-3 rounded-lg  bg-[#389131]  text-white font-medium transition-colors"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
};
