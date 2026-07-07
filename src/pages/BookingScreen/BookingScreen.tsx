import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Star, CheckCircle } from "lucide-react";
import { images } from "../../assets/images/index.ts";
import { getMyBookings, returnBooking } from "../../api/bookingsApi.ts";
import {
  createTrailerReview,
  fetchTrailerReviews,
} from "../../api/trailersApi.ts";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import EmptyState from "../../components/common/EmptyState.tsx";

function getBookingDateText(createdAtString?: string) {
  if (!createdAtString) return null;
  const createdAt = new Date(createdAtString);
  const now = new Date();

  // Set times to midnight to calculate calendar days difference accurately
  const createdDate = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = nowDate.getTime() - createdDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Booked today";
  } else if (diffDays === 1) {
    return "Booked 1 day ago";
  } else if (diffDays <= 7) {
    return `Booked ${diffDays} days ago`;
  } else {
    return `Booked on ${createdAt.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  }
}

export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "active"
  | "in_use"
  | "overdue"
  | "return"
  | "returned"
  | "pre_screening"
  | "pre-screening"
  | "owner_photos_uploaded"
  | "waiting_for_pickup_approval"
  | "pre_screening_completed"
  | "payment_completed"
  | "pickup_ready";
export type FilterStatus =
  | "all"
  | "pending"
  | "accepted"
  | "rejected"
  | "active"
  | "overdue"
  | "return"
  | "payment_completed"
  | "pickup_ready";

export type BookingItem = {
  id: string;
  itemName: string;
  model?: string;
  price?: string;
  pickupDate?: string;
  returnDate?: string;
  rentalDate?: string;
  lastDate?: string;
  image?: string;
  status: BookingStatus | string;
};

type ApiBooking = {
  _id: string;
  trailerId?: {
    _id?: string;
    title?: string;
    pricePerDay?: number;
    images?: string[];
  } | null;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  status?: string;
  totalPrice?: number;
};

const statusStyles: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  accepted: { label: "Accepted", className: "bg-[#389131] text-white" },
  rejected: { label: "Rejected", className: "bg-red-500 text-white" },
  active: { label: "Active", className: "bg-[#389131] text-white" },
  in_use: { label: "Active", className: "bg-[#389131] text-white" },
  overdue: { label: "Overdue", className: "bg-gray-500 text-white" },
  return: { label: "Returned", className: "bg-red-500 text-white" },
  returned: { label: "Returned", className: "bg-red-500 text-white" },
  pre_screening: {
    label: "Pre-Screened • Awaiting Pickup",
    className: "bg-blue-100 text-blue-800",
  },
  "pre-screening": {
    label: "Pre-Screened • Awaiting Pickup",
    className: "bg-blue-100 text-blue-800",
  },
  waiting_for_pickup_approval: {
    label: "Waiting for Pickup Approval",
    className: "bg-blue-100 text-blue-800",
  },
  pre_screening_completed: {
    label: "Waiting for Pickup Approval",
    className: "bg-blue-100 text-blue-800",
  },
  payment_completed: {
    label: "Payment Completed",
    className: "bg-[#389131] text-white",
  },
  pickup_ready: {
    label: "Pickup Ready",
    className: "bg-blue-100 text-blue-800",
  },
};

const FILTER_LABELS: Record<FilterStatus, string> = {
  all: "All",
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  active: "Active",
  overdue: "Overdue",
  return: "Returned",
  payment_completed: "Payment Completed",
  pickup_ready: "Pickup Ready",
};

const BookingScreen: React.FC = () => {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [returnError, setReturnError] = useState<string | null>(null);
  const [returnSubmitting, setReturnSubmitting] = useState<
    Record<string, boolean>
  >({});
  const [reviewModalBooking, setReviewModalBooking] = useState<{
    bookingId: string;
    trailerId: string;
    title: string;
  } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [reviewedBookings, setReviewedBookings] = useState<
    Record<string, boolean>
  >({});
  const navigate = useNavigate();
  const location = useLocation();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  const user = useSelector((state: RootState) => state.auth.user);
  const userType = useSelector((state: RootState) => state.auth.userType);
  const isOwner = user?.trailor === "Owner" || userType === "Owner";
  const isRenter = !isOwner;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredBookings = (() => {
    if (filterStatus === "all") return bookings;
    if (filterStatus === "active") {
      return bookings.filter(
        (b) => b.status === "active" || b.status === "in_use",
      );
    }
    if (filterStatus === "return") {
      // For returned view, only show bookings that came from backend (have a real trailer id)
      return bookings.filter(
        (b) =>
          (b.status === "return" || b.status === "returned") &&
          Boolean(b.trailerId && (b.trailerId as any)._id),
      );
    }
    return bookings.filter((b) => b.status === filterStatus);
  })();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getMyBookings();
        if (!mounted) return;
        // API may return an array or an object containing the array under different keys
        if (Array.isArray(res)) {
          setBookings(res as ApiBooking[]);
        } else if (res && Array.isArray((res as any).bookings)) {
          setBookings((res as any).bookings as ApiBooking[]);
        } else if (res && Array.isArray((res as any).data)) {
          setBookings((res as any).data as ApiBooking[]);
        } else if (res && Array.isArray((res as any).results)) {
          setBookings((res as any).results as ApiBooking[]);
        } else {
          setBookings([]);
        }
      } catch (err: any) {
        setError(err?.message ?? "Could not load bookings.");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [location.pathname]); // Refresh bookings when location changes (e.g., returning from pre-screening)

  useEffect(() => {
    const loadReviewedBookings = async () => {
      const returnedBookings = bookings.filter((booking) =>
        ["returned", "return"].includes(String(booking.status).toLowerCase()),
      );
      const trailerIds = Array.from(
        new Set(
          returnedBookings
            .map((booking) => booking.trailerId?._id)
            .filter((id): id is string => Boolean(id)),
        ),
      );
      if (trailerIds.length === 0) return;

      const reviewed: Record<string, boolean> = {};
      await Promise.all(
        trailerIds.map(async (trailerId) => {
          const reviews = await fetchTrailerReviews(trailerId);
          if (!reviews) return;
          reviews.forEach((review) => {
            if (review.bookingId) {
              reviewed[review.bookingId] = true;
            }
          });
        }),
      );

      setReviewedBookings((prev) => ({ ...prev, ...reviewed }));
    };

    loadReviewedBookings();
  }, [bookings]);

  const handleFilterSelect = (status: FilterStatus) => {
    setFilterStatus(status);
    setFilterOpen(false);
  };

  const openReviewModal = (
    bookingId: string,
    trailerId: string,
    title: string,
  ) => {
    setReviewModalBooking({ bookingId, trailerId, title });
    setReviewRating(5);
    setReviewMessage("");
    setReviewError(null);
    setReviewSuccess(null);
  };

  const closeReviewModal = () => {
    setReviewModalBooking(null);
    setReviewError(null);
    setReviewSuccess(null);
  };

  const handleReturnBooking = async (bookingId: string) => {
    setReturnError(null);
    setReturnSubmitting((prev) => ({ ...prev, [bookingId]: true }));

    try {
      await returnBooking(bookingId);
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "return" }
            : booking,
        ),
      );
    } catch (err: any) {
      console.error("Return booking error:", err);
      setReturnError(
        err?.response?.data?.message ||
        err?.message ||
        "Unable to return the trailer. Please try again.",
      );
    } finally {
      setReturnSubmitting((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewModalBooking) return;
    setReviewSubmitting(true);
    setReviewError(null);
    setReviewSuccess(null);

    try {
      await createTrailerReview({
        trailerId: reviewModalBooking.trailerId,
        bookingId: reviewModalBooking.bookingId,
        rating: reviewRating,
        message: reviewMessage.trim(),
      });
      setReviewSuccess("Review submitted successfully.");
      setReviewedBookings((prev) => ({
        ...prev,
        [reviewModalBooking.bookingId]: true,
      }));
    } catch (err: any) {
      console.error("Review submit error:", err);
      setReviewError(
        err?.response?.data?.message ||
        err?.message ||
        "Unable to submit review.",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white w-full min-w-0">
      <main className="flex-1 min-h-0 min-w-0 max-w-3xl mx-auto w-full px-4 sm:px-6 py-4">
        {/* Page title */}
        <h1 className="text-xl sm:text-2xl font-bold text-black text-center mb-4 mt-2">
          Your Booked Trailers
        </h1>

        {/* Filter button */}
        <div className="flex justify-end mb-4">
          <div className="relative" ref={filterDropdownRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-800 text-sm font-medium transition-colors hover:bg-gray-200 hover:text-[#389131]"
            >
              {FILTER_LABELS[filterStatus]}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${filterOpen ? "rotate-180" : ""}`}
              />
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 py-2 w-48 rounded-lg bg-white border border-gray-200 shadow-lg z-50">
                {(Object.keys(FILTER_LABELS) as FilterStatus[]).map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleFilterSelect(status)}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-100 hover:text-[#389131] ${filterStatus === status
                          ? "bg-gray-100 font-medium text-gray-900"
                          : "text-gray-700"
                        }`}
                    >
                      {FILTER_LABELS[status]}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        </div>

        {returnError && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-[#FEF3F2] p-4 text-sm text-red-700">
            {returnError}
          </div>
        )}

        {reviewModalBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Review</p>
                  <h2 className="text-xl font-semibold text-black">
                    {reviewModalBooking.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="text-gray-500 hover:text-gray-900"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setReviewRating(value)}
                        className="rounded-full p-2"
                      >
                        <Star
                          className={`w-6 h-6 ${value <= reviewRating
                              ? "text-yellow-400"
                              : "text-gray-300"
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review
                  </label>
                  <textarea
                    value={reviewMessage}
                    onChange={(e) => setReviewMessage(e.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none transition focus:border-[#389131] focus:ring-2 focus:ring-[#389131]/20"
                    placeholder="Share your experience with this trailer..."
                  />
                </div>

                {reviewError && (
                  <div className="rounded-2xl border border-red-200 bg-[#FEF3F2] p-3 text-sm text-red-700">
                    {reviewError}
                  </div>
                )}
                {reviewSuccess && (
                  <div className="rounded-2xl border border-green-200 bg-[#ECFDF5] p-3 text-sm text-green-700">
                    {reviewSuccess}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeReviewModal}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={reviewSubmitting || !reviewMessage.trim()}
                    onClick={handleSubmitReview}
                    className="rounded-lg bg-[#389131] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2e6f26] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking cards */}
        <ul className="list-none p-0 m-0 space-y-4">
          {loading ? (
            <li className="text-center py-8 text-gray-500">Loading...</li>
          ) : error ? (
            <li className="text-center py-8 text-red-500">{error}</li>
          ) : filteredBookings.length === 0 ? (
            <li>
              <EmptyState
                line="No bookings found"
                subLine="Your upcoming bookings will appear here."
              />
            </li>
          ) : (
            filteredBookings.map((booking) => {
              const statusKey = (booking.status ?? "pending") as
                | BookingStatus
                | string;
              const isReturnedBooking =
                statusKey === "returned" || statusKey === "return";
              const alreadyReviewed = Boolean(reviewedBookings[booking._id]);
              const status = (statusStyles as any)[
                statusKey as BookingStatus
              ] ?? {
                label: String(statusKey).replace(/^[a-z]/, (s) =>
                  s.toUpperCase(),
                ),
                className: "bg-gray-300 text-gray-800",
              };

              const image = booking.trailerId?.images?.[0] ?? images.Catimg;
              const title = booking.trailerId?.title ?? "Trailer";
              const price = booking.trailerId?.pricePerDay
                ? `$${booking.trailerId.pricePerDay}/day`
                : booking.totalPrice
                  ? `$${booking.totalPrice}`
                  : "--";

              const pickup = booking.startDate
                ? new Date(booking.startDate).toLocaleDateString()
                : undefined;
              const returnDate = booking.endDate
                ? new Date(booking.endDate).toLocaleDateString()
                : undefined;

              const bookingDateText = getBookingDateText(booking.createdAt);

              const trailerId = booking.trailerId?._id;
              const trailerUrl = trailerId
                ? `/trailer/${trailerId}`
                : undefined;
              const bookingStatusKey = String(statusKey).toLowerCase();
              const isReturnable =
                statusKey === "active" || statusKey === "in_use";
              const isReturnLoading = Boolean(returnSubmitting[booking._id]);
              const isAccepted = statusKey === "accepted";

              return (
                <li key={booking._id}>
                  <article
                    onClick={() => {
                      if (trailerUrl) {
                        navigate(trailerUrl, {
                          state: {
                            bookingId: booking._id,
                            status: statusKey,
                            startDate: booking.startDate ? new Date(booking.startDate).toISOString().split('T')[0] : undefined,
                            endDate: booking.endDate ? new Date(booking.endDate).toISOString().split('T')[0] : undefined,
                          }
                        });
                      }
                    }}
                    className="cursor-pointer flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow"
                  >
                    <div className="flex gap-3 sm:gap-4 w-full sm:w-auto sm:flex-1 min-w-0">
                      {/* Thumbnail */}
                      <img
                        src={image}
                        alt={title}
                        className="w-24 h-24 sm:w-40 sm:h-40 shrink-0 rounded-lg object-cover"
                      />
                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-black m-0 mb-1 truncate">
                          {title}
                        </h3>
                        <p className="text-sm text-gray-700 font-medium m-0 mt-0.5">
                          {price}
                        </p>
                        <div className="mt-2 space-y-0.5 text-sm text-gray-600">
                          {pickup && (
                            <p className="m-0 truncate">Pickup Date : {pickup}</p>
                          )}
                          {returnDate && (
                            <p className="m-0 truncate">Return Date : {returnDate}</p>
                          )}
                          {bookingDateText && (
                            <p className="m-0 font-medium text-black mt-2 text-[15px]">{bookingDateText}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Status / action button */}
                    <div className="flex flex-row flex-wrap sm:flex-col items-center sm:items-end shrink-0 gap-2 w-full sm:w-auto justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-normal sm:whitespace-nowrap text-center ${status.className}`}
                      >
                        {status.label}
                      </span>
                      {isRenter && isReturnable && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            // handleReturnBooking(booking._id);
                            navigate(`/return/${booking._id}`)
                          }}
                          disabled={isReturnLoading}
                          className="px-3 py-1.5 rounded-lg bg-[#F97316] text-white text-xs sm:text-sm font-medium hover:bg-[#dd6b14] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isReturnLoading ? "Returning..." : "Return Trailer"}
                        </button>
                      )}
                      {isAccepted && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/prescreening?bookingId=${encodeURIComponent(booking._id)}`,
                              {
                                state: {
                                  bookingId: booking._id,
                                  backgroundLocation: location,
                                },
                              },
                            );
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#389131] text-white text-xs sm:text-sm font-medium hover:bg-[#2f7a29]"
                        >
                          Start Pre-Screening
                        </button>
                      )}
                      {isRenter && isReturnedBooking &&
                        (alreadyReviewed ? (
                          <span className="inline-flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs sm:text-sm font-medium text-green-700">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            Review Added
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (booking.trailerId?._id) {
                                openReviewModal(
                                  booking._id,
                                  booking.trailerId._id,
                                  title,
                                );
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg border border-[#389131] bg-white text-[#389131] text-xs sm:text-sm font-medium hover:bg-[#F5FBF5]"
                          >
                            Review
                          </button>
                        ))}
                    </div>
                  </article>
                </li>
              );
            })
          )}
        </ul>
      </main>
    </div>
  );
};

export default BookingScreen;
