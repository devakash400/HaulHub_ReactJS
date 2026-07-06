import React, { useEffect, useCallback, useState } from "react";
import { X, Star, Loader2 } from "lucide-react";
import { lockScroll } from "../../utils/scrollLock.ts";
import { createTrailerReview } from "../../api/trailersApi.ts";
import { toast } from "react-toastify";

export interface RateTrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
  trailerId?: string;
  onSubmit?: (rating: number) => void;
}

export const RateTrailerModal: React.FC<RateTrailerModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  trailerId,
  onSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [message, setMessage] = useState("Great trailer and smooth rental experience.");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setMessage("Great trailer and smooth rental experience.");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.warning("Please select a rating before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Only call the backend API if valid bookingId and trailerId are provided.
      // We skip if they are mock IDs (like starting with '#') or missing.
      const hasRealIds =
        bookingId &&
        trailerId &&
        !bookingId.startsWith("#") &&
        !trailerId.startsWith("#");

      if (hasRealIds) {
        await createTrailerReview({
          bookingId,
          trailerId,
          rating,
          message,
        });
        toast.success(`Thank you! Your ${rating}-star review has been submitted.`);
      } else {
        // Fallback for mocked/unlinked views
        toast.success(`Mock rating submitted: ${rating}-stars with message "${message}"`);
      }

      onSubmit?.(rating);
      onClose();
    } catch (err: any) {
      console.error("Failed to submit rating/review:", err);
      toast.error(
        err?.response?.data?.message || "Failed to submit review. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/60 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rate-modal-title"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-6 pt-10 pb-8">
          <div className="flex justify-center mb-2">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-[#389131]">
              <Star className="h-6 w-6 fill-current" />
            </span>
          </div>

          <h2
            id="rate-modal-title"
            className="text-center text-xl font-bold text-gray-900 tracking-tight"
          >
            Rate Our Trailer
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500 max-w-xs mx-auto">
            How was your experience with this trailer? We'd love to hear your feedback.
          </p>

          {/* Interactive Star Rating */}
          <div className="mt-6 flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = (hovered || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="p-1 focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2 rounded-full transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Star
                    className={`h-10 w-10 transition-all duration-200 ${
                      isFilled
                        ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                        : "text-gray-200 hover:text-gray-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Review Message Textarea */}
          <div className="mt-6">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Share your thoughts
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
              placeholder="Tell us about the trailer and smooth rental experience..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#389131] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#389131]/20 transition-all duration-200 resize-none disabled:opacity-60"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#389131] py-3 text-sm font-semibold text-white hover:bg-[#2d7326] active:bg-[#235b1d] transition-all focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Review</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

