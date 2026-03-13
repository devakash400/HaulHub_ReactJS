import React from "react";
import { Star } from "lucide-react";

type Review = {
  avatar: string;
  name: string;
  stars: number;
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
  let displayReviews: Review[] = reviews.slice(0, 6);

  // If there are fewer than 6 reviews, repeat existing ones to fill the layout,
  // matching the Figma design that shows 6 cards.
  if (displayReviews.length > 0 && displayReviews.length < 6) {
    const extended: Review[] = [...displayReviews];
    let i = 0;
    while (extended.length < 6) {
      extended.push(displayReviews[i % displayReviews.length]);
      i += 1;
    }
    displayReviews = extended;
  }

  return (
    <section className="bg-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {displayReviews.map((review, i) => (
          <div key={i} className="min-w-0 overflow-hidden">
            <div className="flex gap-4 items-start">
              <div className="shrink-0 w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold overflow-hidden">
                {review.avatar ? (
                  <img
                    src={review.avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  review.name.charAt(0)
                )}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="font-semibold text-base text-gray-900 break-words m-0 leading-tight">
                  {review.name}
                </p>
                <p className="text-xs text-gray-600 font-normal m-0 mt-0.5 break-words leading-tight">
                  {[5, 11, 10, 5, 11, 5][i % 6]} years renting trailers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <div className="flex text-black gap-0.5 shrink-0">
                {Array.from({ length: review.stars }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs text-gray-600 break-words">{review.context}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mt-3 m-0">
              {review.text}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onShowAll}
          className="bg-[#389131] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Show all reviews
        </button>
      </div>
    </section>
  );
};

