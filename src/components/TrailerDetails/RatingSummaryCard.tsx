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
    <article className="bg-[#F6F1E8] rounded-2xl border border-black px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
      <div className="flex flex-col items-center gap-1 shrink-0">
        <p className="text-base sm:text-lg font-bold text-gray-900 leading-none">{rating}</p>
        <div className="flex text-yellow-400">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="w-4 h-4 fill-current" aria-hidden />
          ))}
        </div>
      </div>

      <p className="flex-1 text-xs sm:text-sm text-center sm:text-left min-w-0 w-full sm:w-auto">
        {description}
      </p>

      <div className="flex flex-col items-center gap-1 shrink-0">
        <p className="text-base sm:text-lg font-semibold text-gray-900 leading-none">{reviewCount}</p>
        <p className="text-xs font-bold leading-none">Reviews</p>
      </div>
    </article>
  );
};

