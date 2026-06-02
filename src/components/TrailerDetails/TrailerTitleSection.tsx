import React from "react";
import { Heart, Share2 } from "lucide-react";
import shareIcon from "../../assets/icons/Share_icon.png";
import saveIcon from "../../assets/icons/Save_icon.png";
type TrailerTitleSectionProps = {
  title: string;
  location: string;
  specs: string;
  onShareClick?: () => void;
  onSaveClick?: () => void;
  isSaved?: boolean;
};

export const TrailerTitleSection: React.FC<TrailerTitleSectionProps> = ({
  title,
  onShareClick,
  onSaveClick,
  isSaved = false,
}) => {
  return (
    <section className="flex flex-row flex-wrap items-start justify-between gap-4 mb-3 min-w-0">
      <div className="min-w-0 flex-1">
        <h1
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-[#389131] mb-2 break-words"
          style={{
            fontFamily: "Lexend",
            fontWeight: 600,
            fontStyle: "normal",
            fontSize: "40px",
            lineHeight: "100%",
            letterSpacing: "0%",
            verticalAlign: "middle",
            color: "#389131",
          }}
        >
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <button
          type="button"
          onClick={onShareClick}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-[#389131] hover:underline"
          aria-label="Share"
        >
          <img
            src={shareIcon}
            alt="Share"
            className="w-[16.5px] h-[18px] object-contain"
          />
          <span
            className="font-normal text-[16px] leading-[100%] tracking-[0%] underline text-black"
            style={{ fontFamily: "Lexend", verticalAlign: "middle" }}
          >
            Share
          </span>
        </button>
        <button
          type="button"
          onClick={onSaveClick}
          className="flex items-center gap-2 text-sm font-medium transition-colors hover:underline"
          aria-label={isSaved ? "Unsave" : "Save"}
        >
          <Heart
            size={18}
            strokeWidth={2.2}
            color={isSaved ? "#E03A3A" : "#8B8B8B"}
            fill={isSaved ? "#E03A3A" : "none"}
          />
          <span
            className="font-normal text-[16px] leading-[100%] tracking-[0%] underline text-black"
            style={{ fontFamily: "Lexend", verticalAlign: "middle" }}
          >
            {isSaved ? "Unsave" : "Save"}
          </span>
        </button>
      </div>
    </section>
  );
};
