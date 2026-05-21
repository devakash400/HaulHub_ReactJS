import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { images } from "../../assets/images/index.ts";
import { getMyBookings } from "../../api/bookingsApi.ts";
import { useLocation, useNavigate } from "react-router-dom";

export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "active"
  | "in_use"
  | "overdue"
  | "return";
export type FilterStatus =
  | "all"
  | "pending"
  | "accepted"
  | "rejected"
  | "active"
  | "overdue"
  | "return";

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
  return: { label: "Return", className: "bg-red-500 text-white" },
};

const FILTER_LABELS: Record<FilterStatus, string> = {
  all: "All",
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  active: "Active",
  overdue: "Overdue",
  return: "Return",
};

const BookingScreen: React.FC = () => {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const filteredBookings =
    filterStatus === "all"
      ? bookings
      : bookings.filter((b) =>
          filterStatus === "active"
            ? b.status === "active" || b.status === "in_use"
            : b.status === filterStatus,
        );

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
  }, []);

  const handleFilterSelect = (status: FilterStatus) => {
    setFilterStatus(status);
    setFilterOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white w-full min-w-0 overflow-x-hidden">
      <main className="flex-1 min-h-0 min-w-0 overflow-y-auto max-w-3xl mx-auto w-full px-4 sm:px-6 py-4">
        {/* Page title */}
        <h1 className="text-xl sm:text-2xl font-bold text-black text-center mb-4 mt-2">
          Your Booked Trailers
        </h1>

        {/* Filter button */}
        <div className="flex justify-end mb-4">
          <div className="relative">
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
              <div className="absolute right-0 top-full mt-1 py-2 w-48 rounded-lg bg-white border border-gray-200 shadow-lg z-20">
                {(Object.keys(FILTER_LABELS) as FilterStatus[]).map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleFilterSelect(status)}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-100 hover:text-[#389131] ${
                        filterStatus === status
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

        {/* Booking cards */}
        <ul className="list-none p-0 m-0 space-y-4">
          {loading ? (
            <li className="text-center py-8 text-gray-500">Loading...</li>
          ) : error ? (
            <li className="text-center py-8 text-red-500">{error}</li>
          ) : filteredBookings.length === 0 ? (
            <li className="text-center py-8 text-gray-500">
              No bookings found.
            </li>
          ) : (
            filteredBookings.map((booking) => {
              const statusKey = (booking.status ?? "pending") as
                | BookingStatus
                | string;
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

              return (
                <li key={booking._id}>
                  <article className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
                    {/* Thumbnail */}
                    <img
                      src={image}
                      alt={title}
                      className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-lg object-cover"
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
                          <p className="m-0">Pickup Date : {pickup}</p>
                        )}
                        {returnDate && (
                          <p className="m-0">Return Date : {returnDate}</p>
                        )}
                      </div>
                    </div>
                    {/* Status / action button */}
                    <div className="flex flex-col items-end shrink-0 gap-2">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium whitespace-nowrap ${status.className}`}
                      >
                        {status.label}
                      </span>
                      {String(booking.status).toLowerCase() === "accepted" && (
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/prescreening?bookingId=${encodeURIComponent(
                                booking._id,
                              )}`,
                              {
                                state: {
                                  bookingId: booking._id,
                                  backgroundLocation: location,
                                },
                              },
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-[#389131] text-white text-sm font-medium hover:bg-[#2e6f26]"
                        >
                          Start Pre Screening
                        </button>
                      )}
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
