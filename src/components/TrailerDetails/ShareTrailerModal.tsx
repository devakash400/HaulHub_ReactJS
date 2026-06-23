import React, { useEffect, useCallback, useState } from "react";
import { X, Link } from "lucide-react";
import { lockScroll } from "../../utils/scrollLock.ts";
import whatsappIcon from "../../assets/icons/whatsapp.png";
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
    font-normal
    text-[24px] sm:text-[28px] md:text-[32px]
    leading-[100%]
    tracking-[0%]
    align-middle
    font-['Lexend']
    ml-10 sm:ml-0
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
      w-[99px]
      h-[67px]
      rounded-[4px]
      object-contain
      shrink-0
      opacity-100
    "
            />

            <div className="min-w-0">
              <h3
                className="
    font-['Lexend']
    font-normal
    text-[18px] sm:text-[21px]
    leading-[100%]
    tracking-[0%]
    text-left sm:text-center
    align-middle
    text-black
    m-0
  "
              >
                {trailerTitle}
              </h3>

              <p
                className="
    mt-[8px]
    font-['Lexend']
    font-normal
    text-[12px] sm:text-[14px]
    leading-[100%]
    tracking-[0%]
    align-middle
    text-[#929191]
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-7">
            {/* Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="
      w-full sm:w-[278px]
      h-[50px]
      border
      border-[#00000066]
      rounded-[7px]
      bg-white
      opacity-100

      flex items-center justify-center gap-3

      font-['Lexend']
      font-normal
      text-[16px] sm:text-[19px]
      leading-[100%]
      tracking-[0%]
      align-middle
      text-black

      transition
      hover:bg-gray-50
    "
            >
              <Link
                className="
    w-[21.56px]
    h-[21.67px]
    text-black
    opacity-100
    shrink-0
  "
              />

              <span className="flex items-center justify-center">
                Copy Link
              </span>
            </button>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsApp}
              className="
      w-full sm:w-[278px]
      h-[50px]
      border
      border-[#00000066]
      rounded-[7px]
      bg-white
      opacity-100

      flex items-center justify-center gap-3

      font-['Lexend']
      font-normal
      text-[16px] sm:text-[19px]
      leading-[100%]
      tracking-[0%]
      align-middle
      text-black

      transition
      hover:bg-gray-50
    "
            >
              <img
                src={whatsappIcon}
                alt="WhatsApp"
                className="w-[21.56px] h-[21.67px] shrink-0"
              />

              <span className="flex items-center justify-center">WhatsApp</span>
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
