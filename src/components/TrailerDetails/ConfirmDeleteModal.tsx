import React, { useEffect, useCallback } from "react";
import { lockScroll } from "../../utils/scrollLock.ts";

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = "Delete this wishlist?",
  message,
  onCancel,
  onConfirm,
  confirmText = "DELETE",
  cancelText = "CANCEL",
}) => {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    },
    [onCancel]
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div
        className="w-full max-w-xs sm:max-w-sm rounded-xl bg-white shadow-lg px-5 py-4 text-center"
        onClick={handleInnerClick}
      >
        <h2
          id="confirm-delete-title"
          className="mb-2 text-[15px] font-semibold text-gray-900"
        >
          {title}
        </h2>
        <p className="mb-4 text-[13px] text-gray-600">{message}</p>

        <div className="mt-3 flex items-center justify-end gap-3 text-sm font-semibold">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-black bg-white text-black hover:bg-gray-50 transition-colors"
            aria-label="Cancel delete"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            aria-label="Confirm delete"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

