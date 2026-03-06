import React, { useEffect, useCallback, useState } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal.tsx";
import { lockScroll } from "../../utils/scrollLock.ts";

export interface WishlistItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
}

export interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: WishlistItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearAll,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string>("");
  const [isDeleteAll, setIsDeleteAll] = useState(false);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen || confirmOpen) return;
    document.addEventListener("keydown", handleEscape);
    const unlock = lockScroll();
    return () => {
      document.removeEventListener("keydown", handleEscape);
      unlock();
    };
  }, [isOpen, confirmOpen, handleEscape]);

  if (!isOpen) return null;

  const hasItems = items.length > 0;

  const openConfirmForAll = () => {
    setIsDeleteAll(true);
    setPendingDeleteId(null);
    setConfirmMessage("All wishlist items will be permanently deleted.");
    setConfirmOpen(true);
  };

  const openConfirmForItem = (item: WishlistItem) => {
    setIsDeleteAll(false);
    setPendingDeleteId(item.id);
    setConfirmMessage(`${item.title} will be permanently deleted.`);
    setConfirmOpen(true);
  };

  const handleConfirmCancel = () => {
    setConfirmOpen(false);
    setPendingDeleteId(null);
    setIsDeleteAll(false);
  };

  const handleConfirmDelete = () => {
    if (isDeleteAll) {
      onClearAll();
    } else if (pendingDeleteId) {
      onRemoveItem(pendingDeleteId);
    }
    setConfirmOpen(false);
    setPendingDeleteId(null);
    setIsDeleteAll(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wishlist-modal-title"
    >
      <div
        className="relative w-full max-w-[520px] bg-white rounded-2xl shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors shrink-0"
            aria-label="Close wishlist"
          >
            <span className="text-xl leading-none">&#215;</span>
          </button>

          <h2
            id="wishlist-modal-title"
            className="absolute left-1/2 -translate-x-1/2 text-xl sm:text-2xl font-semibold text-gray-900"
          >
            Wishlist
          </h2>

          <div className="w-10 flex items-center justify-end shrink-0">
            {hasItems && (
              <button
                type="button"
                onClick={openConfirmForAll}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                aria-label="Clear all wishlist items"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-6 py-5 max-h-[70vh] overflow-y-auto">
          {hasItems ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col w-[220px] rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white"
                >
                  <div className="relative">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-44 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => openConfirmForItem(item)}
                      className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <span className="text-lg leading-none">&#10084;</span>
                    </button>
                  </div>
                  <div className="px-4 py-3">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="mt-1 text-xs sm:text-sm text-gray-600">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                No items saved yet
              </p>
              <p className="text-sm text-gray-600 max-w-sm">
                Tap the heart on a trailer to save it to your wishlist and see it here.
              </p>
            </div>
          )}
        </div>
        <ConfirmDeleteModal
          isOpen={confirmOpen}
          title="Delete this wishlist?"
          message={confirmMessage}
          onCancel={handleConfirmCancel}
          onConfirm={handleConfirmDelete}
          cancelText="CANCEL"
          confirmText="DELETE"
        />
      </div>
    </div>
  );
};

