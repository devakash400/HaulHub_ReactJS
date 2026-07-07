// import React from "react";
// import { Star } from "lucide-react";
// import type { TrailerReview } from "../../assets/data/trailers.ts";

// type ReviewsSectionProps = {
//   reviews: TrailerReview[];
//   onShowAll?: () => void;
// };

// export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
//   reviews,
//   onShowAll,
// }) => {
//   let displayReviews = reviews.slice(0, 6);

//   // Fill 6 cards only when there is more than one review
//   if (displayReviews.length > 1 && displayReviews.length < 6) {
//     const extra = [...displayReviews];
//     let i = 0;

//     while (extra.length < 6) {
//       extra.push(displayReviews[i % displayReviews.length]);
//       i++;
//     }

//     displayReviews = extra;
//   }

//   return (
//     <section
//       className="
//         w-full

//         px-6 py-5
//       "
//     >
//       {/* Reviews Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
//         {displayReviews.map((review, i) => (
//           <div key={i}>
//             {/* Top */}
//             <div className="flex items-start gap-3">
//               {/* Avatar */}
//               <div
//                 className="
//                   w-[42px] h-[42px]
//                   rounded-full
//                   overflow-hidden
//                   bg-gray-200
//                   shrink-0
//                 "
//               >
//                 {review.avatar ? (
//                   <img
//                     src={review.avatar}
//                     alt={review.name}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div
//                     className="
//                       w-full h-full
//                       flex items-center justify-center
//                       text-sm font-semibold
//                     "
//                   >
//                     {review.name.charAt(0)}
//                   </div>
//                 )}
//               </div>

//               {/* Name */}
//               <div className="min-w-0">
//                 <h4 className="text-[17px] font-semibold text-[#222] leading-none m-0">
//                   {review.name}
//                 </h4>

//                 <p className="mt-[4px] text-[11px] text-[#8A8A8A] leading-none">
//                   HaulHub renter
//                 </p>
//               </div>
//             </div>

//             {/* Rating */}
//             <div className="flex items-center gap-2 mt-3">
//               <div className="flex items-center gap-[2px]">
//                 {[1, 2, 3, 4, 5].map((star) => (
//                   <Star
//                     key={star}
//                     className="w-[12px] h-[12px] fill-black text-black"
//                   />
//                 ))}
//               </div>

//               <p className="text-[11px] text-[#666] m-0">{review.context}</p>
//             </div>

//             {/* Review Text */}
//             <p
//               className="
//                 mt-3
//                 text-[12px]
//                 leading-[1.55]
//                 text-[#444]
//                 m-0
//               "
//             >
//               {review.text}
//             </p>
//           </div>
//         ))}
//       </div>

//       {/* Button */}
//       <div className="flex justify-end mt-8">
//         <button
//           type="button"
//           onClick={onShowAll}
//           className="
//             h-[38px]
//             px-5
//             rounded-[6px]
//             bg-[#389131]
//             text-white
//             text-[13px]
//             font-medium
//             hover:opacity-90
//             transition
//           "
//         >
//           Show all reviews
//         </button>
//       </div>
//     </section>
//   );
// };

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import type { TrailerReview } from "../../assets/data/trailers.ts";
import {
  fetchTrailerReviews,
  type ApiTrailerReview,
} from "../../api/trailersApi.ts";
import { resolveMediaUrl } from "../../api/media.ts";

type ReviewsSectionProps = {
  trailerId: string;
  onShowAll?: () => void;
};

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  trailerId,
  onShowAll,
}) => {
  const [reviews, setReviews] = useState<TrailerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiReviews = await fetchTrailerReviews(trailerId);

        if (!apiReviews || apiReviews.length === 0) {
          setReviews([]);
          return;
        }

        // Transform API reviews to component format
        const transformedReviews: TrailerReview[] = apiReviews.map(
          (review: ApiTrailerReview) => ({
            avatar: review.userId.profilePicture
              ? resolveMediaUrl(review.userId.profilePicture)
              : "",
            name: review.userId.fullName,
            stars: review.rating,
            context: new Date(review.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            }),
            text: review.message,
          }),
        );

        setReviews(transformedReviews);
      } catch (err) {
        console.error("Failed to load reviews:", err);
        setError("Failed to load reviews");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    if (trailerId) {
      loadReviews();
    }
  }, [trailerId]);

  // Handle loading state
  if (loading) {
    return (
      <section className="w-[calc(100%+32px)] sm:w-[calc(100%+48px)] lg:w-[calc(100%+64px)] -mx-4 sm:-mx-6 lg:-mx-8 px-10 py-5 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
        <div className="px-10 py-8 text-center text-gray-500">
          Loading reviews...
        </div>
      </section>
    );
  }

  // Handle error state
  if (error) {
    return (
      <section className="w-[calc(100%+32px)] sm:w-[calc(100%+48px)] lg:w-[calc(100%+64px)] -mx-4 sm:-mx-6 lg:-mx-8 px-10 py-5 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
        <div className="px-10 py-8 text-center text-red-500">{error}</div>
      </section>
    );
  }

  // Handle empty reviews
  if (reviews.length === 0) {
    return (
      <section className="w-[calc(100%+32px)] sm:w-[calc(100%+48px)] lg:w-[calc(100%+64px)] -mx-4 sm:-mx-6 lg:-mx-8 px-10 py-5 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
        <div className="px-10 py-8 text-center text-gray-500">
          No reviews yet
        </div>
      </section>
    );
  }

  let displayReviews = reviews.slice(0, 6);

  // Fill 6 cards only when there is more than one review
  if (displayReviews.length > 1 && displayReviews.length < 6) {
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
        w-[calc(100%+32px)] sm:w-[calc(100%+48px)] lg:w-[calc(100%+64px)]
        -mx-4 sm:-mx-6 lg:-mx-8
      px-10 py-5
        shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
      "
    >
      {/* Reviews Grid */}
      <div className="px-10 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        {displayReviews.map((review, i) => (
          <div key={i} className={i >= 3 ? "hidden md:block" : ""}>
            {/* Top - Avatar and Name with Date/Context on right */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="
    w-[48px] h-[48px]
    rounded-full
    overflow-hidden
    bg-[#EBFFE9]
    border border-[#389131]/20
    shrink-0
    flex
    items-center
    justify-center
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
                        text-base font-semibold text-[#389131]
                      "
                    >
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="min-w-0">
                  <h4
                    style={{
                      fontFamily: "Lexend",
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "120%",
                      letterSpacing: "0%",
                      color: "#000000",
                      margin: 0,
                    }}
                  >
                    {review.name}
                  </h4>
                </div>
              </div>

              {/* Date/Duration on right (hidden on mobile, visible from sm) */}
              <p className="text-[11px] text-[#8A8A8A] leading-none whitespace-nowrap text-right hidden sm:block">
                {review.context}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-[2px]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-[12px] h-[12px] ${
                      star <= review.stars
                        ? "fill-black text-black"
                        : "fill-transparent text-black"
                    }`}
                  />
                ))}
              </div>

              <p
                style={{
                  fontFamily: "Lexend",
                  fontWeight: 300,
                  fontSize: "11px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  color: "#000000",
                  margin: 0,
                }}
              >
                {review.context}
              </p>
            </div>

            {/* Review Text */}
            <p
              style={{
                fontFamily: "Lexend",
                fontWeight: 300,
                fontSize: "14px",
                lineHeight: "120%",
                letterSpacing: "0%",
                color: "#000000",
                margin: 0,
              }}
            >
              {review.text}
            </p>
          </div>
        ))}
      </div>

      {/* Button */}
      {reviews.length > 3 && (
        <div
          style={{ paddingBottom: "20px" }}
          className={`px-10 justify-end mt-8 ${
            reviews.length <= 6 ? "flex md:hidden" : "flex"
          }`}
        >
          <button
            type="button"
            onClick={onShowAll}
            className="
    w-[160px]
    h-[49px]
    rounded-[9px]
    bg-[#389131]
    text-white
    hover:opacity-90
    transition
    flex
    items-center
    justify-center
    gap-[10px]
  "
            style={{
              paddingTop: "14px",
              paddingRight: "8px",
              paddingBottom: "14px",
              paddingLeft: "8px",
              fontFamily: "Lexend",
              fontWeight: 500,
              fontSize: "16px",
              lineHeight: "100%",
              letterSpacing: "0%",
            }}
          >
            Show all reviews
          </button>
        </div>
      )}
    </section>
  );
};
