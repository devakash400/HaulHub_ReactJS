import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RateTrailerModal } from "../../components/TrailerDetails/RateTrailerModal.tsx";
import { images } from "../../assets/images/index.ts";
import { getBookingById, requestReturn } from "../../api/bookingsApi.ts";
import { resolveMediaUrl } from "../../api/media.ts";
import uploadProfilePhoto from "../../api/uploadApi.ts";

const TRAILER_DESCRIPTION_FALLBACK =
  "A gooseneck Trailer is attached to the truck via a ball and hitch in the bed of the truck as opposed to other types of trailers that are attached to the bumper";

const Return: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const state = (location.state ?? {}) as { bookingId?: string };

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rateModalOpen, setRateModalOpen] = useState(false);

  // Return request form state
  const [condition, setCondition] = useState<"no_damage" | "minor_scratch" | "damage_note">("no_damage");
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<{ file: File; previewUrl: string }[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bookingId = id ?? state.bookingId ?? "#TR-2026-45821";

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) {
        setError("No booking ID provided");
        setLoading(false);
        return;
      }
      try {
        const response = await getBookingById(id);
        if (response?.success && response?.data) {
          setBooking(response.data);
        } else if (response?.data) {
          setBooking(response.data);
        } else {
          setError("Failed to fetch booking details");
        }
      } catch (err) {
        console.error("Failed to fetch booking details:", err);
        setError("Error loading booking details");
      } finally {
        setLoading(false);
      }
    };
    void fetchBooking();
  }, [id]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const newPhotos: { file: File; previewUrl: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        const previewUrl = URL.createObjectURL(file);
        newPhotos.push({ file, previewUrl });
      }
    }

    if (newPhotos.length > 0) {
      setPhotos((prev) => [...prev, ...newPhotos]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    const photoToRemove = photos[index];
    if (photoToRemove) {
      URL.revokeObjectURL(photoToRemove.previewUrl);
    }
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const submitReturnRequest = async () => {
    setSubmittingRequest(true);
    try {
      if (id) {
        await requestReturn(id, {
          condition: note.trim() ? "damage_note" : "no_damage",
          note: note.trim() || undefined,
          photos: photos.map((p) => p.file),
        });
        toast.success("Return request submitted successfully!");
        navigate("/booking");
      }
    } catch (err) {
      console.error("Failed to submit return request:", err);
      toast.error("Failed to process return request. Please try again.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleSubmitAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (photos.length === 0) {
      toast.error("Please select at least one current condition photo.");
      return;
    }
    // Open rating modal first
    setRateModalOpen(true);
  };

  const handleRateSubmit = async (rating: number) => {
    setRateModalOpen(false);
    await submitReturnRequest();
  };

  const handleRateCancel = () => {
    setRateModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#389131] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading return details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 font-sans">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <p className="text-red-600 text-lg font-semibold">{error || "Booking not found"}</p>
          <button
            onClick={() => navigate("/booking")}
            className="mt-4 px-4 py-2 bg-[#389131] text-white rounded-lg"
          >
            Go to Bookings
          </button>
        </div>
      </div>
    );
  }

  const rawImg = booking.trailerId?.images?.[0] || booking.trailerId?.profilePicture;
  const trailerImage = rawImg ? resolveMediaUrl(rawImg) : images.Catimg;
  const trailerModel = booking.trailerId?.model || booking.trailerId?.title || "Trailer";
  const trailerDesc = booking.trailerId?.description || TRAILER_DESCRIPTION_FALLBACK;
  const priceDisplay = booking.trailerId?.pricePerDay
    ? `$${booking.trailerId.pricePerDay.toLocaleString()}/day`
    : booking.totalPrice
      ? `$${booking.totalPrice}`
      : "$21,993.50";

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-gray-100 font-sans">
      <main className="mx-auto max-w-[640px] px-4 py-6 sm:px-6 sm:py-8">
        <form onSubmit={handleSubmitAttempt} className="space-y-0 overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-lg">
          <div className="border-b border-gray-200/80 px-4 py-3 text-sm text-gray-600 sm:px-6">
            Booking ID: <span className="font-semibold text-gray-900">{bookingId}</span>
          </div>
          {/* Trailer header: image, description, model, price */}
          <div className="relative">
            <div className="h-48 sm:h-56 w-full overflow-hidden bg-gray-200">
              <img
                src={trailerImage}
                alt={trailerModel}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-4 sm:p-6">
              <p className="text-sm text-gray-800">{trailerDesc}</p>
              <p className="mt-2 text-sm font-medium text-gray-900">
                Model: {trailerModel}
              </p>
              <p className="mt-0.5 text-sm text-gray-500">{priceDisplay}</p>
            </div>
          </div>

          {/* Return request inputs */}
          <div className="border-t border-gray-200/80 p-4 sm:p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">
              Return Request Details:
            </h2>

            {/*
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Current Trailer Condition:
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/20"
              >
                <option value="no_damage">No Damage Found</option>
                <option value="minor_scratch">Minor Scratch</option>
                <option value="damage_note">Damage Note / Other Dents</option>
              </select>
            </div>
            */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Additional Notes (Optional):
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Describe any scratches, dents, or condition details..."
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-500 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/20"
              />
            </div>

            <div className="pt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhotos}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#389131] px-4 py-4 text-white font-medium transition-colors hover:bg-[#2d7326] disabled:opacity-50"
              >
                <span className="text-lg">📷</span>
                {uploadingPhotos ? "Uploading Photos..." : "Upload Current Condition Photos"}
              </button>

              {photos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {photos.map(({ previewUrl }, index) => (
                    <div key={previewUrl} className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                      <img
                        src={previewUrl}
                        alt={`Condition ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white font-bold hover:bg-black/85"
                        aria-label="Remove photo"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit / Done actions */}
          <div className="border-t border-gray-200/80 p-4 sm:p-6">
            <button
              type="submit"
              disabled={uploadingPhotos || submittingRequest}
              className="w-full rounded-lg bg-[#389131] py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#2d7326] focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2 disabled:opacity-50"
            >
              {submittingRequest ? "Submitting Request..." : "Submit Return Request"}
            </button>
          </div>
        </form>
        <RateTrailerModal
          isOpen={rateModalOpen}
          bookingId={id}
          trailerId={booking?.trailerId?._id || (typeof booking?.trailerId === "string" ? booking.trailerId : undefined)}
          onClose={handleRateCancel}
          onSubmit={handleRateSubmit}
        />
      </main>
    </div>
  );
};

export default Return;
