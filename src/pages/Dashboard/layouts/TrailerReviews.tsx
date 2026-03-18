import React, { useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Star } from "lucide-react";
import { getTrailerById } from "../../../assets/data/trailers.ts";

const TrailerReviews: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const trailerId = id ? Number(id) : NaN;
  const trailer = Number.isNaN(trailerId) ? undefined : getTrailerById(trailerId);

  const pageSize = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const allReviews = useMemo(() => trailer?.reviews ?? [], [trailer?.reviews]);
  const totalPages = Math.max(1, Math.ceil(allReviews.length / pageSize));

  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allReviews.slice(start, start + pageSize);
  }, [currentPage, pageSize, allReviews]);

  if (!trailer) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-white w-full min-w-0 overflow-x-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">
            All Review
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            {allReviews.length} reviews
          </p>
        </header>

        {/* Reviews list */}
        <section className="space-y-6 pb-6">
          {paginatedReviews.map((review, index) => (
            <article key={`${review.name}-${index + (currentPage - 1) * pageSize}`} className="border-b border-gray-200 pb-6 last:border-b-0">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-2 pb-4">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-full text-sm font-medium border ${
                currentPage === 1
                  ? "border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              Previous
            </button>

            <div className="flex items-center gap-1 text-sm text-gray-700">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center ${
                      isActive
                        ? "bg-[#389131] text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-full text-sm font-medium border ${
                currentPage === totalPages
                  ? "border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrailerReviews;

