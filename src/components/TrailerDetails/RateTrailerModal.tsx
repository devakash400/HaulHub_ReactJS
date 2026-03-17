import React, { useEffect, useCallback, useState } from "react";
import { X, Star } from "lucide-react";
import { lockScroll } from "../../utils/scrollLock.ts";

export interface RateTrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (rating: number) => void;
}

export const RateTrailerModal: React.FC<RateTrailerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

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

  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setHovered(0);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    onSubmit?.(rating);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rate-modal-title"
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-6 pt-12 pb-6">
          <h2
            id="rate-modal-title"
            className="text-center text-lg font-bold text-gray-900"
          >
            Rate Our Trailor
          </h2>
          <p className="mt-3 text-center text-sm text-gray-600">
            How was your experience with this trailer?
          </p>

          <div className="mt-6 flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = (hovered || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="p-0.5 focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2 rounded"
                >
                  <Star
                    className={`h-9 w-9 transition-colors ${
                      isFilled ? "fill-amber-400 text-amber-400" : "text-gray-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-400 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 rounded-lg bg-[#389131] py-2.5 text-sm font-semibold text-white hover:bg-[#2d7326]"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
