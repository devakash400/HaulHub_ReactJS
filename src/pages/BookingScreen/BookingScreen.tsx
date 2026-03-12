import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { images } from "../../assets/images/index.ts";

export type BookingStatus = "active" | "overdue" | "return";
export type FilterStatus = "all" | BookingStatus;

export type BookingItem = {
  id: string;
  itemName: string;
  model: string;
  price: string;
  pickupDate?: string;
  returnDate?: string;
  rentalDate?: string;
  lastDate?: string;
  image: string;
  status: BookingStatus;
};

const MOCK_BOOKINGS: BookingItem[] = [
  {
    id: "1",
    itemName: "Gooseneck Trailor",
    model: "FMAX208",
    price: "$ 21,4353",
    pickupDate: "11/01/2026",
    returnDate: "21/01/2026",
    image: images.Catimg,
    status: "active",
  },
  {
    id: "2",
    itemName: "Gooseneck Trailor",
    model: "FMAX208",
    price: "$ 21,4353",
    rentalDate: "11/01/2026",
    image: images.Catimg,
    status: "overdue",
  },
  {
    id: "3",
    itemName: "Gooseneck Trailor",
    model: "FMAX208",
    price: "$ 21,4353",
    lastDate: "21/01/2026",
    returnDate: "29/01/2026",
    image: images.Catimg,
    status: "return",
  },
];

const statusStyles: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  active: { label: "Active", className: "bg-[#389131] text-white" },
  overdue: { label: "Overdue", className: "bg-gray-500 text-white" },
  return: { label: "Return", className: "bg-red-500 text-white" },
};

const FILTER_LABELS: Record<FilterStatus, string> = {
  all: "All",
  active: "Active",
  overdue: "Overdue",
  return: "Return",
};

const BookingScreen: React.FC = () => {
  const [bookings] = useState<BookingItem[]>(MOCK_BOOKINGS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const filteredBookings =
    filterStatus === "all"
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  const handleFilterSelect = (status: FilterStatus) => {
    setFilterStatus(status);
    setFilterOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white w-full min-w-0 overflow-x-hidden">
      <main className="flex-1 min-h-0 min-w-0 overflow-y-auto max-w-3xl mx-auto w-full px-4 sm:px-6 py-4">
        {/* Page title */}
        <h1 className="text-xl sm:text-2xl font-bold text-black text-center mb-4 mt-2">
          Booking Screen
        </h1>

        {/* Filter button */}
        <div className="flex justify-end mb-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-800 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              {FILTER_LABELS[filterStatus]}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${filterOpen ? "rotate-180" : ""}`}
              />
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 py-2 w-48 rounded-lg bg-white border border-gray-200 shadow-lg z-20">
                {(Object.keys(FILTER_LABELS) as FilterStatus[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleFilterSelect(status)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      filterStatus === status ? "bg-gray-100 font-medium text-gray-900" : "text-gray-700"
                    }`}
                  >
                    {FILTER_LABELS[status]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking cards */}
        <ul className="list-none p-0 m-0 space-y-4">
          {filteredBookings.length === 0 ? (
            <li className="text-center py-8 text-gray-500">
              No bookings match this filter.
            </li>
          ) : (
          filteredBookings.map((booking) => {
            const status = statusStyles[booking.status];
            return (
              <li key={booking.id}>
                <article className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
                  {/* Thumbnail */}
                  <img
                    src={booking.image}
                    alt={booking.itemName}
                    className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-lg object-cover"
                  />
                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-black m-0 mb-1 truncate">
                      {booking.itemName}
                    </h3>
                    <p className="text-sm text-gray-600 m-0">
                      Model : {booking.model}
                    </p>
                    <p className="text-sm text-gray-700 font-medium m-0 mt-0.5">
                      {booking.price}
                    </p>
                    <div className="mt-2 space-y-0.5 text-sm text-gray-600">
                      {booking.pickupDate && (
                        <p className="m-0">
                          Pickup Date : {booking.pickupDate}
                        </p>
                      )}
                      {booking.returnDate && (
                        <p className="m-0">
                          Return Date : {booking.returnDate}
                        </p>
                      )}
                      {booking.rentalDate && (
                        <p className="m-0">
                          Rental Date : {booking.rentalDate}
                        </p>
                      )}
                      {booking.lastDate && (
                        <p className="m-0">Last Date : {booking.lastDate}</p>
                      )}
                    </div>
                  </div>
                  {/* Status / action button */}
                  <div className="flex items-center shrink-0">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium whitespace-nowrap ${status.className}`}
                    >
                      {status.label}
                    </span>
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
