import React from "react";
import { Star } from "lucide-react";

type Review = {
  avatar: string;
  name: string;
  years: string;
  context: string;
  text: string;
};

type ReviewsSectionProps = {
  reviews: Review[];
  onShowAll?: () => void;
};

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  onShowAll,
}) => {
  let displayReviews = reviews.slice(0, 6);

  // Fill 6 cards if less reviews
  if (displayReviews.length > 0 && displayReviews.length < 6) {
    const extra = [...displayReviews];
    let i = 0;

    while (extra.length < 6) {
      extra.push(displayReviews[i % displayReviews.length]);
      i++;
    }

    displayReviews = extra;
  }

  return (
    <section
      className="
        w-full
      
        px-6 py-5
      "
    >
      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        {displayReviews.map((review, i) => (
          <div key={i}>
            {/* Top */}
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div
                className="
                  w-[42px] h-[42px]
                  rounded-full
                  overflow-hidden
                  bg-gray-200
                  shrink-0
                "
              >
                {review.avatar ? (
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="
                      w-full h-full
                      flex items-center justify-center
                      text-sm font-semibold
                    "
                  >
                    {review.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="min-w-0">
                <h4 className="text-[17px] font-semibold text-[#222] leading-none m-0">
                  {review.name}
                </h4>

                <p className="mt-[4px] text-[11px] text-[#8A8A8A] leading-none">
                  {review.years}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-[2px]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-[12px] h-[12px] fill-black text-black"
                  />
                ))}
              </div>

              <p className="text-[11px] text-[#666] m-0">{review.context}</p>
            </div>

            {/* Review Text */}
            <p
              className="
                mt-3
                text-[12px]
                leading-[1.55]
                text-[#444]
                m-0
              "
            >
              {review.text}
            </p>
          </div>
        ))}
      </div>

      {/* Button */}
      <div className="flex justify-end mt-8">
        <button
          type="button"
          onClick={onShowAll}
          className="
            h-[38px]
            px-5
            rounded-[6px]
            bg-[#389131]
            text-white
            text-[13px]
            font-medium
            hover:opacity-90
            transition
          "
        >
          Show all reviews
        </button>
      </div>
    </section>
  );
};
