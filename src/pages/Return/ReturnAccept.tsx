import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api.ts";
import {
  acceptReturnBooking,
  getReturnReviewPhotos,
} from "../../api/bookingsApi.ts";
import { resolveMediaUrl } from "../../api/media.ts";

const normalizePhotos = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string") return [value];
  return [];
};

const ReturnAccept: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [reviewData, setReviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError("Booking ID is required.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const data = await getReturnReviewPhotos(bookingId);
        setReviewData(data);
      } catch (err) {
        console.error("Failed to load booking details:", err);
        setError("Unable to load booking details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    void fetchBooking();
  }, [bookingId]);

  const beforePhotos = normalizePhotos(
    reviewData?.pickup?.images?.map((item: any) => item.url),
  );
  const afterPhotos = normalizePhotos(
    reviewData?.returnRequest?.photos?.map((item: any) => item.url),
  );

  const mappedBeforePhotos = beforePhotos.map((photo) =>
    resolveMediaUrl(photo),
  );
  const mappedAfterPhotos = afterPhotos.map((photo) => resolveMediaUrl(photo));

  const handleAccept = async () => {
    if (!bookingId) return;
    setSubmitting(true);
    setError(null);

    try {
      await acceptReturnBooking(bookingId);
      navigate("/booking");
    } catch (err) {
      console.error("Accept return error:", err);
      setError("Unable to accept return request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!bookingId) return;
    setSubmitting(true);
    setError(null);

    try {
      await api.patch(`/api/bookings/${bookingId}/reject`);
      navigate("/booking");
    } catch (err) {
      console.error("Reject return error:", err);
      setError("Unable to reject return request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F8F3] px-4 py-10">
        <div className="rounded-2xl bg-white p-6 shadow-md text-center">
          <p className="text-gray-600">Loading return approval details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#F9F8F3] font-sans px-4 py-10">
      <div className="mx-auto w-full max-w-4xl rounded-3xl bg-white p-6 shadow-md sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Return Request Review
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Review before and after photos before accepting or rejecting this
              return request.
            </p>
          </div>
          <span className="rounded-full bg-[#E7F6E6] px-3 py-1 text-sm font-semibold text-[#2F7A29]">
            Booking ID: {bookingId}
          </span>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-[#FEF3F2] p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-3xl border border-gray-200 bg-[#F9FAF7] p-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Before photos
            </h2>
            {mappedBeforePhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {mappedBeforePhotos.map((src, index) => (
                  <img
                    key={`before-${index}`}
                    src={src}
                    alt={`Before photo ${index + 1}`}
                    className="h-40 w-full rounded-2xl object-cover"
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No before photos available.
              </p>
            )}
          </div>

          <div className="space-y-4 rounded-3xl border border-gray-200 bg-[#F9FAF7] p-5">
            <h2 className="text-lg font-semibold text-gray-900">
              After photos
            </h2>
            {mappedAfterPhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {mappedAfterPhotos.map((src, index) => (
                  <img
                    key={`after-${index}`}
                    src={src}
                    alt={`After photo ${index + 1}`}
                    className="h-40 w-full rounded-2xl object-cover"
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No after photos available.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-[#fff] p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Return request details
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            Condition:{" "}
            <span className="font-medium text-gray-900">
              {reviewData?.returnRequest?.condition ?? "Not provided"}
            </span>
          </p>
          <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">
            {reviewData?.returnRequest?.note ?? "No notes provided."}
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Requested at:{" "}
            <span className="font-medium text-gray-900">
              {new Date(
                reviewData?.returnRequest?.requestedAt || "",
              ).toLocaleString() || "-"}
            </span>
          </p>
        </div>

        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={handleReject}
            disabled={submitting}
            className="inline-flex h-[52px] items-center justify-center rounded-2xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={handleAccept}
            disabled={submitting}
            className="inline-flex h-[52px] items-center justify-center rounded-2xl bg-[#389131] px-5 text-sm font-semibold text-white transition hover:bg-[#2d7326] disabled:opacity-50"
          >
            {submitting ? "Processing..." : "Accept Return"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnAccept;
