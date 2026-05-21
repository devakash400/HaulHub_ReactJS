import React, { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Star } from "lucide-react";
import { type TrailerDetail } from "../../../assets/data/trailers.ts";
import {
  resolveTrailerForRoute,
  fetchTrailerReviews,
  type ApiTrailerReview,
} from "../../../api/trailersApi.ts";
import { resolveMediaUrl } from "../../../api/media.ts";
import {
  getUserProfile,
  type UserProfileApiData,
} from "../../../api/userApi.ts";
import { RootState } from "../../../store";

const TrailerReviews: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trailer, setTrailer] = useState<TrailerDetail | null>(null);
  const [reviews, setReviews] = useState<ApiTrailerReview[]>([]);
  const [reviewLoadState, setReviewLoadState] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const pageSize = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const [currentUserProfile, setCurrentUserProfile] =
    useState<UserProfileApiData | null>(null);

  useEffect(() => {
    if (!id) {
      setTrailer(null);
      setLoadState("error");
      return;
    }
    let cancelled = false;
    setLoadState("loading");
    setTrailer(null);
    void (async () => {
      const resolved = await resolveTrailerForRoute(id);
      if (cancelled) return;
      if (resolved) {
        setTrailer(resolved);
        setLoadState("ready");
      } else {
        setTrailer(null);
        setLoadState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) {
      setReviews([]);
      setReviewLoadState("error");
      return;
    }
    let cancelled = false;
    setReviewLoadState("loading");
    setReviews([]);
    void (async () => {
      const result = await fetchTrailerReviews(id);
      if (cancelled) return;
      if (result) {
        setReviews(result);
        setReviewLoadState("ready");
      } else {
        setReviews([]);
        setReviewLoadState("ready");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentUserProfile(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const profile = await getUserProfile();
        if (cancelled) return;
        setCurrentUserProfile(profile);
      } catch {
        if (!cancelled) {
          setCurrentUserProfile(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    setCurrentPage(1);
  }, [id]);

  type ReviewView = {
    id: string;
    name: string;
    avatar?: string;
    context: string;
    text: string;
    rating: number;
  };

  const resolveAvatarUrl = (path?: string) => {
    if (!path?.trim()) return undefined;
    return resolveMediaUrl(path, "") || undefined;
  };

  const normalizeName = (value?: string): string =>
    value?.trim().toLowerCase() ?? "";

  const currentUserNameVariants = [
    normalizeName(currentUserProfile?.fullName),
    normalizeName(currentUserProfile?.legalName),
    normalizeName(currentUserProfile?.preferredFirstName),
  ].filter(Boolean);

  const resolveReviewAvatar = (
    review: ApiTrailerReview,
  ): string | undefined => {
    const currentUserId = currentUserProfile?._id ?? null;
    const reviewUserId = review.userId._id ?? null;
    const ownProfilePicture = currentUserProfile?.profilePicture;
    const reviewName = normalizeName(review.userId.fullName);

    if (
      currentUserId &&
      reviewUserId &&
      String(currentUserId) === String(reviewUserId)
    ) {
      return resolveAvatarUrl(
        ownProfilePicture ?? review.userId.profilePicture,
      );
    }

    if (reviewName && currentUserNameVariants.includes(reviewName)) {
      return resolveAvatarUrl(
        ownProfilePicture ?? review.userId.profilePicture,
      );
    }

    return resolveAvatarUrl(review.userId.profilePicture);
  };

  const displayReviews = useMemo<ReviewView[]>(() => {
    return reviews.map((review) => ({
      id: review._id,
      name: review.userId.fullName || "Guest",
      avatar: resolveReviewAvatar(review),
      context: new Date(review.createdAt).toLocaleDateString(),
      text: review.message,
      rating: review.rating ?? 5,
    }));
  }, [reviews, currentUserProfile]);

  const allReviews = displayReviews;
  const totalPages = Math.max(1, Math.ceil(allReviews.length / pageSize));

  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allReviews.slice(start, start + pageSize);
  }, [currentPage, pageSize, allReviews]);

  if (loadState === "loading") {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 px-4">
        <p className="text-gray-600 text-sm">Loading trailer details…</p>
      </div>
    );
  }

  if (loadState === "error" || !trailer) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-gray-800 font-medium">
          We couldn&apos;t load this trailer.
        </p>
        <Link
          to="/"
          className="text-[#389131] font-medium underline hover:no-underline"
        >
          Back to home
        </Link>
      </div>
    );
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

        {allReviews.length === 0 ? (
          <p className="text-sm text-gray-600 py-8 text-center">
            No reviews yet for &ldquo;{trailer.title}&rdquo;. Reviews will
            appear here after renters complete trips.
          </p>
        ) : (
          <section className="space-y-6 pb-6">
            {paginatedReviews.map((review, index) => (
              <article
                key={`${review.name}-${index + (currentPage - 1) * pageSize}`}
                className="border-b border-gray-200 pb-6 last:border-b-0"
              >
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
        )}

        {/* Pagination */}
        {allReviews.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-2 pb-4">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-full text-sm font-medium border text-gray-700 ${
                currentPage === 1
                  ? "cursor-not-allowed"
                  : "bg-white hover:bg-gray-50"
              }`}
              style={{
                borderColor: currentPage === 1 ? "#929191" : "#d1d5db",
                color: currentPage === 1 ? "#929191" : undefined,
                backgroundColor: currentPage === 1 ? "#f5f5f5" : undefined,
              }}
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
              className={`px-3 py-1 rounded-full text-sm font-medium border text-gray-700 ${
                currentPage === totalPages
                  ? "cursor-not-allowed"
                  : "bg-white hover:bg-gray-50"
              }`}
              style={{
                borderColor: currentPage === totalPages ? "#929191" : "#d1d5db",
                color: currentPage === totalPages ? "#929191" : undefined,
                backgroundColor:
                  currentPage === totalPages ? "#f5f5f5" : undefined,
              }}
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
