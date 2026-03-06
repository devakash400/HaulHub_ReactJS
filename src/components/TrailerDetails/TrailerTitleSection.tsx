import React from "react";
import { Share2 } from "lucide-react";
import { images } from "../../assets/images/index.ts";

type TrailerTitleSectionProps = {
  title: string;
  location: string;
  specs: string;
  onShareClick?: () => void;
  onSaveClick?: () => void;
};

export const TrailerTitleSection: React.FC<TrailerTitleSectionProps> = ({
  title,
  onShareClick,
  onSaveClick,
}) => {
  return (
    <section className="flex flex-row flex-wrap items-start justify-between gap-4 mb-3 min-w-0">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-[#389131] mb-2 break-words">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <button
          type="button"
          onClick={onShareClick}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:underline"
          aria-label="Share"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
<button
        type="button"
        onClick={onSaveClick}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:underline"
        aria-label="Save"
      >
        <img
          src={images.Wishlist}
          alt=""
          className="w-4 h-4 object-contain"
        />
        <span>Save</span>
      </button>
      </div>
    </section>
  );
};

