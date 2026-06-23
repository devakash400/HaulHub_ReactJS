import React from "react";
import { Star } from "lucide-react";

type RatingSummaryCardProps = {
  rating: number;
  description: string;
  reviewCount: number;
};

export const RatingSummaryCard: React.FC<RatingSummaryCardProps> = ({
  rating,
  description,
  reviewCount,
}) => {
  return (
    <article
      className="
        w-full max-w-[682px] min-h-[82px]
        bg-white border border-[#8D8D8D] rounded-[10px]
        flex items-center justify-between
        px-3 md:px-[22px] py-[14px] gap-2 md:gap-7
        box-border
      "
    >
      {/* Left */}
      <div className="flex flex-col items-center shrink-0">
        <p
          className="m-0 text-center font-normal leading-[100%] text-black text-[20px] md:text-[24px]"
          style={{
            fontFamily: "Lexend",
            fontStyle: "normal",
            letterSpacing: "0%",
            verticalAlign: "middle",
          }}
        >
          {rating}
        </p>
        <div className="flex items-center gap-[2px] mt-[6px]">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`w-[15px] h-[15px] ${
                i <= Math.round(rating)
                  ? "text-[#FFC107] fill-[#FFC107]"
                  : "text-[#FFC107] fill-transparent"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Center */}
      <p
        className="
    flex-1 max-w-[360px]
    m-0
    text-center
    text-[11px] md:text-[14px] font-normal leading-[100%]
    text-[#1D1D1D]
  "
        style={{
          fontFamily: "Lexend",
          fontStyle: "normal",
          letterSpacing: "0%",
          verticalAlign: "middle",
        }}
      >
        {description}
      </p>

      {/* Right */}
      <div className="flex flex-col items-center shrink-0">
        <p
          className="m-0 text-center align-middle font-normal leading-[100%] tracking-[0%] text-[#111111] text-[20px] md:text-[24px]"
          style={{
            fontFamily: "Lexend",
            fontStyle: "normal",
          }}
        >
          {reviewCount}
        </p>

        <p className="mt-1 text-[12px] md:text-[16px] font-semibold leading-none text-[#444444]">
          Reviews
        </p>
      </div>
    </article>
  );
};
