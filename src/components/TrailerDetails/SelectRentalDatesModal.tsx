import React, { useEffect, useCallback, useState } from "react";
import { lockScroll } from "../../utils/scrollLock.ts";
import { ModalHeader } from "../ModalHeader.tsx";

export interface SelectRentalDatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (pickupDate: string, returnDate: string) => void;
}

export const SelectRentalDatesModal: React.FC<SelectRentalDatesModalProps> = ({
  isOpen,
  onClose,
  onNext,
}) => {
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const isNextDisabled = !pickupDate.trim() || !returnDate.trim();

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
      setPickupDate("");
      setReturnDate("");
    }
  }, [isOpen]);

  const handleNext = () => {
    if (isNextDisabled) return;
    onNext(pickupDate, returnDate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="select-rental-dates-title"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          title="Select Rental Dates"
          onClose={onClose}
          variant="close"
          titleId="select-rental-dates-title"
        />
        <div className="p-6">
        <div className="space-y-4 mb-6">
          <div>
            <label
              htmlFor="pickup-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Pickup Date
            </label>
            <input
              id="pickup-date"
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#389131] focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="return-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Return Date
            </label>
            <input
              id="return-date"
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={pickupDate || undefined}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#389131] focus:border-transparent"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={isNextDisabled}
          aria-disabled={isNextDisabled}
          className={`w-full py-3 text-sm font-semibold rounded-lg transition-opacity focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2 ${
            isNextDisabled
              ? "bg-[#389131]/60 text-white cursor-not-allowed"
              : "bg-[#389131] text-white hover:opacity-90"
          }`}
        >
          Next
        </button>
        </div>
      </div>
    </div>
  );
};
