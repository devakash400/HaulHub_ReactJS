import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CheckCircle, AlertCircle } from "lucide-react";
import api from "../../api/api.ts";

type BookingDetail = {
  _id: string;
  renter?: {
    _id: string;
    fullName: string;
    email: string;
  };
  trailer?: {
    _id: string;
    title: string;
    images?: string[];
  };
  startDate: string;
  endDate: string;
  totalPrice?: number;
  status?: string;
  trailerId?: {
    _id: string;
    title: string;
    images?: string[];
  };
};

type PreScreeningDetail = {
  _id: string;
  bookingId: string;
  identityVerified: boolean;
  licenseVerified: boolean;
  agreementConfirmed: boolean;
  currentPhotosVerified: boolean;
  completedAt?: string;
  createdAt: string;
};

const PickUpComplete: React.FC = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [preScreening, setPreScreening] = useState<PreScreeningDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!bookingId) {
        setError("Booking ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch booking details
        const bookingRes = await api.get<any>(`/api/bookings/${bookingId}`);
        console.log("[DEBUG] Booking Response:", bookingRes.data);

        if (bookingRes.data) {
          const bookingData = bookingRes.data.data || bookingRes.data;
          setBooking(bookingData);
          console.log("[DEBUG] Booking Set:", bookingData);
        }

        // Fetch pre-screening details
        const preScreeningRes = await api.get<any>(`/api/pre-screening/${bookingId}`);
        console.log("[DEBUG] Pre-Screening Response:", preScreeningRes.data);

        if (preScreeningRes.data) {
          const preScreeningData = preScreeningRes.data.data || preScreeningRes.data;
          setPreScreening(preScreeningData);
          console.log("[DEBUG] Pre-Screening Set:", preScreeningData);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching details:", err);
        setError("Unable to load booking and pre-screening details");
      } finally {
        setLoading(false);
      }
    };

    void fetchDetails();
  }, [bookingId]);

  const handleConfirmPickup = async () => {
    const trailerId = booking?.trailer?._id || booking?.trailerId?._id;
    if (!bookingId || !trailerId) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      await api.patch(`/api/bookings/${bookingId}/status`, {
        status: "in_use",
      });

      setSuccessMessage("✓ Pick up confirmed! Trailer is now with the renter.");
      setTimeout(() => {
        navigate("/booking");
      }, 2000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Pickup confirmation error:", err);
      setError("Unable to process the request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F8F3] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#389131] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pre-screening details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking || !preScreening) {
    return (
      <div className="min-h-screen bg-[#F9F8F3] px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#389131] font-medium mb-6 hover:opacity-80 transition"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={24} className="text-red-600" />
              <p className="text-lg font-semibold text-gray-900">
                {error || "Unable to load pre-screening details"}
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Please try again or contact support if the problem persists.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const trailerImage = booking?.trailer?.images?.[0] || booking?.trailerId?.images?.[0];
  const trailerTitle = booking?.trailer?.title || booking?.trailerId?.title || "Trailer";
  const renterName = booking?.renter?.fullName || "Renter";
  const renterEmail = booking?.renter?.email || "N/A";

  console.log("[DEBUG] Trailer Image:", trailerImage);
  console.log("[DEBUG] Trailer Title:", trailerTitle);
  console.log("[DEBUG] Booking Data:", booking);

  return (
    <div className="min-h-screen bg-[#F9F8F3] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#389131] font-medium mb-6 hover:opacity-80 transition"
        >
          <ChevronLeft size={20} />
          Back
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
            <CheckCircle size={28} className="text-[#389131]" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pre-Screening Completed
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                All verification steps have been completed
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-[#FEE2E2] border border-red-200 p-4 flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-lg bg-[#E7F6E6] border border-green-200 p-4 flex gap-3">
              <CheckCircle size={20} className="text-[#2F7A29] flex-shrink-0" />
              <p className="text-sm text-[#2F7A29]">{successMessage}</p>
            </div>
          )}

          {/* Pickup Details */}
          {booking && booking.startDate && booking.endDate && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Pickup Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F9F8F3] rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                    Start Date
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(booking.startDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="bg-[#F9F8F3] rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                    End Date
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(booking.endDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pre-Screening Details */}
          {preScreening && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Verification Status
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-[#E7F6E6] rounded-lg">
                  <CheckCircle size={20} className="text-[#2F7A29]" />
                  <span className="text-sm text-gray-900">
                    Identity Verified
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#E7F6E6] rounded-lg">
                  <CheckCircle size={20} className="text-[#2F7A29]" />
                  <span className="text-sm text-gray-900">
                    License Verified
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#E7F6E6] rounded-lg">
                  <CheckCircle size={20} className="text-[#2F7A29]" />
                  <span className="text-sm text-gray-900">
                    Agreement Confirmed
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#E7F6E6] rounded-lg">
                  <CheckCircle size={20} className="text-[#2F7A29]" />
                  <span className="text-sm text-gray-900">
                    Photos Verified
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Pickup Button */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={handleConfirmPickup}
              disabled={submitting || !booking || !preScreening}
              className="w-full py-3 px-4 rounded-lg bg-[#389131] text-white font-semibold hover:bg-[#2f7a29] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? "Processing..." : "Confirm Renter Pick Up"}
            </button>
            <p className="text-xs text-gray-600 text-center mt-3">
              Confirm that the renter has picked up the trailer. This will mark it as unavailable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickUpComplete;
