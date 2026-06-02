import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/api.ts";

type BookingDetailsLocationState = {
  renterFullName?: string;
  renterEmail?: string;
};

const BookingDetails: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as BookingDetailsLocationState | null;
  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processed, setProcessed] = useState<"Accepted" | "Rejected" | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    const fetchBooking = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/bookings/${bookingId}`);
        setBooking(res.data?.data ?? res.data ?? res.data?.booking ?? res.data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Booking fetch error:", err);
        setError("Unable to load booking details.");
      } finally {
        setLoading(false);
      }
    };

    void fetchBooking();
  }, [bookingId]);

  const handleAction = async (action: "accept" | "reject") => {
    if (!bookingId) return;
    setProcessing(true);
    setError(null);
    try {
      await api.patch(`/api/bookings/${bookingId}/${action}`);
      setProcessed(action === "accept" ? "Accepted" : "Rejected");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Booking action error:", err);
      setError("Unable to perform action. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen flex justify-center bg-[#F9F8F3] px-4 py-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md border border-gray-200 p-6 sm:p-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 mb-4"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Booking details
        </h1>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-[#FEF3F2] p-4 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {!booking && !error && <div>No booking data available.</div>}

        {booking && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-[#F9F8F3] p-4">
              <p className="text-sm text-gray-500">Renter</p>
              <p className="text-base font-medium text-gray-900">
                {booking.user?.fullName ??
                  booking.userId?.fullName ??
                  booking.renter?.fullName ??
                  booking.renterId?.fullName ??
                  booking.requester?.fullName ??
                  booking.bookedBy?.fullName ??
                  booking.renterName ??
                  state?.renterFullName ??
                  "Unknown"}
              </p>
              <p className="text-xs text-gray-500">
                {booking.user?.email ??
                  booking.userId?.email ??
                  booking.renter?.email ??
                  booking.renterId?.email ??
                  state?.renterEmail ??
                  ""}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs text-gray-500">Start date</p>
                <p className="text-base font-medium text-gray-900">
                  {new Date(booking.startDate).toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs text-gray-500">End date</p>
                <p className="text-base font-medium text-gray-900">
                  {new Date(booking.endDate).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              {processed ? (
                <div className="rounded-2xl border border-gray-200 bg-[#F9F8F3] p-4 text-sm">
                  You {processed === "Accepted" ? "accepted" : "rejected"} the
                  renter request.
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => void handleAction("accept")}
                    disabled={processing}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${processing ? "bg-[#84b884] cursor-not-allowed" : "bg-[#389131] hover:bg-[#2f7a29]"}`}
                  >
                    {processing ? "Processing..." : "Accept"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleAction("reject")}
                    disabled={processing}
                    className={`rounded-lg border px-4 py-2 text-sm font-semibold ${processing ? "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" : "border-gray-300 bg-white text-gray-800 hover:bg-gray-100"}`}
                  >
                    {processing ? "Processing..." : "Reject"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetails;
