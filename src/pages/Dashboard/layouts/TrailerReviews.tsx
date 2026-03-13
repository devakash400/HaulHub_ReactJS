import React from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Star } from "lucide-react";
import { getTrailerById } from "../../../assets/data/trailers.ts";

const TrailerReviews: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const trailerId = id ? Number(id) : NaN;
  const trailer = Number.isNaN(trailerId) ? undefined : getTrailerById(trailerId);
  const navigate = useNavigate();

  if (!trailer) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F9F6ED] w-full min-w-0 overflow-x-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="h-9 w-9 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-sm border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
          </button>
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">
            All Review
          </h1>
          <button
            type="button"
            className="h-9 w-9 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-sm border border-gray-200"
            aria-label="Search reviews"
          >
            <Search className="w-4 h-4" aria-hidden />
          </button>
        </header>

        {/* Rating badge */}
        <section className="flex flex-col items-center text-center mb-8">
          <div className="w-40 h-40 rounded-full border-[10px] border-[#F4D56A] flex items-center justify-center bg-[#FFF9E6] shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
            <span className="text-4xl font-semibold text-gray-900">
              {trailer.guestFavouriteRating.toFixed(2)}
            </span>
          </div>
          <p className="mt-4 text-lg font-semibold text-gray-900">
            Guest Favourite
          </p>
        </section>

        {/* Reviews list */}
        <section className="space-y-6 pb-8">
          {trailer.reviews.map((review, index) => (
            <article key={`${review.name}-${index}`} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700 overflow-hidden">
                  {review.avatar ? (
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    review.name.charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {review.name}
                  </p>
                  <p className="text-[11px] text-gray-600">
                    11 years renting trailers
                  </p>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs text-gray-700 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[#F4B000]">
                  <Star className="w-3 h-3 fill-current" aria-hidden />
                  <span>★★★★★</span>
                </span>
                <span className="text-gray-500">·</span>
                <span>{review.context}</span>
              </div>

              <p className="mt-3 text-sm text-gray-800 leading-relaxed">
                {review.text}
              </p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default TrailerReviews;

