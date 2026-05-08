import React, { useEffect, useCallback, useState } from "react";
import { X, Link2 } from "lucide-react";
import { lockScroll } from "../../utils/scrollLock.ts";

export interface ShareTrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerTitle: string;
  trailerImage: string;
  trailerDescription: string;
  trailerLink: string;
}

export const ShareTrailerModal: React.FC<ShareTrailerModalProps> = ({
  isOpen,
  onClose,
  trailerTitle,
  trailerImage,
  trailerDescription,
  trailerLink,
}) => {
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
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
    if (!isOpen) setShowCopiedToast(false);
  }, [isOpen]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trailerLink).then(() => {
      setShowCopiedToast(true);

      setTimeout(() => {
        setShowCopiedToast(false);
      }, 2500);
    });
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(trailerLink)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40
        px-4
      "
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full max-w-[610px]
          bg-white
          rounded-[18px]
          overflow-hidden
          shadow-[0px_8px_20px_rgba(0,0,0,0.18)]
        "
      >
        {/* Header */}
        <div
          className="
            relative
            h-[106px]
            bg-[#2F8F2F]
            flex items-center justify-center
            px-6
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="
              absolute left-6
              text-white
              hover:opacity-80
              transition
            "
          >
            <X className="w-8 h-8" />
          </button>

          <h2
            className="
              text-white
              text-[22px]
              font-semibold
              tracking-[0.2px]
            "
          >
            Share This Trailer
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Trailer */}
          <div className="flex items-center gap-5">
            <img
              src={trailerImage}
              alt={trailerTitle}
              className="
                w-[82px] h-[58px]
                rounded-[4px]
                object-cover
                shrink-0
              "
            />

            <div className="min-w-0">
              <h3
                className="
                  text-[18px]
                  font-semibold
                  text-[#222]
                  leading-tight
                  m-0
                "
              >
                {trailerTitle}
              </h3>

              <p
                className="
                  mt-[4px]
                  text-[14px]
                  text-[#8A8A8A]
                  leading-none
                  m-0
                "
              >
                {trailerDescription}
              </p>
            </div>
          </div>

          {/* Toast */}
          {showCopiedToast && (
            <div
              className="
                mt-4
                bg-[#EAF8EA]
                text-[#2F8F2F]
                text-sm
                font-medium
                rounded-lg
                px-4 py-2
                text-center
              "
            >
              Link copied successfully
            </div>
          )}

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-6 mt-7">
            {/* Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="
                h-[58px]
                border border-[#D7D7D7]
                rounded-[8px]
                bg-white

                flex items-center justify-center gap-3

                text-[16px]
                font-medium
                text-[#222]

                hover:bg-gray-50
                transition
              "
            >
              <Link2 className="w-5 h-5" />

              <span>Copy Link</span>
            </button>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsApp}
              className="
                h-[58px]
                border border-[#D7D7D7]
                rounded-[8px]
                bg-white

                flex items-center justify-center gap-3

                text-[16px]
                font-medium
                text-[#222]

                hover:bg-gray-50
                transition
              "
            >
              <WhatsAppIcon className="w-5 h-5" />

              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
    </svg>
  );
}
