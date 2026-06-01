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
import React from "react";
import { Star } from "lucide-react";
import type { TrailerReview } from "../../assets/data/trailers.ts";

type ReviewsSectionProps = {
  onShowAll?: () => void;
};

const staticReviews: TrailerReview[] = [
  {
    avatar: "",
    name: "Jason",
    stars: 5,
    context: "Excellent condition",
    text: "Outstanding trailer. The ZSFT flatbed was perfect for hauling my heavy equipment and the dual axle setup made towing very stable even on long highways. The industrial steel frame feels extremely strong and is lasted. Highly recommend this gooseneck trailer in Texas.",
  },
  {
    avatar: "",
    name: "Anthony",
    stars: 5,
    context: "Excellent condition",
    text: "This trailer exceeded expectations. Strong build quality and very well maintained. I was hauling construction materials, and it handled the weight without any concerns. Trucos.",
  },
  {
    avatar: "",
    name: "Robert",
    stars: 5,
    context: "5 years renting trailers",
    text: "The Gooseneck trailer had plenty of space for my equipment, and the dual axle setup made towing very stable even on long highways. The industrial steel frame feels extremely strong and is lasted. Highly recommend this gooseneck trailer in Texas.",
  },
  {
    avatar: "",
    name: "Chris",
    stars: 5,
    context: "10 years renting trailers",
    text: "One of the best trailers. The dual axle setup makes a big difference in stability, especially on longer routes. The ZSFT flatbed is spacious and practical. Everything was clean, functional, and ready to go. Will definitely book again.",
  },
  {
    avatar: "",
    name: "Mark",
    stars: 5,
    context: "5 years renting trailers",
    text: "Excellent gooseneck trailer. The ZSFT flatbed gave me more than enough room for transporting equipment. Dual axle setup kept everything balanced and secure during towing. The industrial steel frame feels heavy-duty and built for serious work. Very smooth rental experience.",
  },
  {
    avatar: "",
    name: "Brian",
    stars: 5,
    context: "5 years renting trailers",
    text: "Fantastic experience from start to finish. The ZSFT flatbed was perfect for transport and the dual axle provided excellent balance and control while towing the farm equipment, and the dual axle provided excellent balance and control while towing my farm equipment. Will definitely book again for heavy duty use.",
  },
];

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  onShowAll,
}) => {
  let displayReviews = staticReviews.slice(0, 6);

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
          <div key={i}>
            {/* Top - Avatar and Name with Date/Context on right */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className="
    w-[59px] h-[59px]
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
                  <h4
                    style={{
                      fontFamily: "Lexend",
                      fontWeight: 400,
                      fontSize: "24px",
                      lineHeight: "100%",
                      letterSpacing: "0%",
                      color: "#000000",
                      margin: 0,
                      marginTop: "20px",
                    }}
                  >
                    {review.name}
                  </h4>
                </div>
              </div>

              {/* Date/Duration on right */}
              <p className="text-[11px] text-[#8A8A8A] leading-none whitespace-nowrap text-right">
                {review.context}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-[2px]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-[12px] h-[12px] fill-black text-black"
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
      <div
        style={{ paddingBottom: "20px" }}
        className="px-10 flex justify-end mt-8"
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
    </section>
  );
};
