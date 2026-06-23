import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { lockScroll } from "../../utils/scrollLock.ts";
import { ModalHeader } from "../ModalHeader.tsx";

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

  const modal = (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wishlist-modal-title"
    >
      <div
        className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          title="Wishlist"
          onClose={onClose}
          variant="close"
          titleId="wishlist-modal-title"
        />

        {/* Content */}
        <div className="px-4 sm:px-6 py-6">
          <h3 className="text-[20px] sm:text-[24px] md:text-[28px] font-semibold text-gray-900 mb-2 text-left">
            Log in to view your Wishlists
          </h3>
          <p className="text-[14px] sm:text-[16px] text-gray-600 mb-6 text-left">
            You can create, view, or edit Wishlists once you&apos;ve logged in.
          </p>

          <button
            type="button"
            onClick={handleLogin}
            className="w-full py-3 rounded-lg bg-[#389131] text-[16px] sm:text-[18px] text-white font-medium transition-colors"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return modal;
  return createPortal(modal, document.body);
};
