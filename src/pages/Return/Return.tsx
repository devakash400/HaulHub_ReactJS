import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ChevronLeft, Camera, Trash2, Info, CheckCircle } from "lucide-react";
import { images } from "../../assets/images/index.ts";
import { getBookingById, requestReturn } from "../../api/bookingsApi.ts";
import { resolveMediaUrl } from "../../api/media.ts";

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
  // Return request form state
  const [condition, setCondition] = useState<
    "no_damage" | "minor_scratch" | "damage_note"
  >("no_damage");
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<{ file: File; previewUrl: string }[]>(
    [],
  );
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bookingId = id ?? state.bookingId ?? "";

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
      if (!bookingId) {
        throw new Error("Missing booking ID for return request");
      }

      await requestReturn(bookingId, {
        condition,
        note: note.trim() || undefined,
        photos: photos.map((p) => p.file),
      });
      toast.success("Return request submitted successfully!");
      navigate("/booking");
    } catch (err) {
      console.error("Failed to submit return request:", err);
      toast.error("Failed to process return request. Please try again.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleSubmitAttempt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (photos.length === 0) {
      toast.error("Please select at least one current condition photo.");
      return;
    }
    await submitReturnRequest();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F8F3] font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#389131] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading return details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F8F3] font-sans px-4">
        <div className="max-w-md w-full text-center p-6 sm:p-8 bg-white rounded-2xl shadow-md border border-gray-200">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <Info className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 text-sm mb-6">
            {error || "Booking not found"}
          </p>
          <button
            onClick={() => navigate("/booking")}
            className="w-full px-4 py-2.5 bg-[#389131] text-white rounded-xl font-semibold hover:bg-[#2d7326] transition shadow-md shadow-[#389131]/10"
          >
            Go to Bookings
          </button>
        </div>
      </div>
    );
  }

  const rawImg =
    booking.trailerId?.images?.[0] || booking.trailerId?.profilePicture;
  const trailerImage = rawImg ? resolveMediaUrl(rawImg) : images.Catimg;
  const trailerModel =
    booking.trailerId?.model || booking.trailerId?.title || "Trailer";
  const trailerDesc =
    booking.trailerId?.description || TRAILER_DESCRIPTION_FALLBACK;
  const priceDisplay = booking.trailerId?.pricePerDay
    ? `$${booking.trailerId.pricePerDay.toLocaleString()}/day`
    : booking.totalPrice
      ? `$${booking.totalPrice}`
      : "$21,993.50";

  return (
    <div className="min-h-screen bg-[#F3F7FB] w-full max-w-[100vw] overflow-x-hidden font-sans">
      <div className="w-full px-3 sm:px-0 py-6 sm:py-10 max-w-full">
        {/* Back Button */}
        <div className="mb-6 max-w-full px-4 sm:px-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#389131] font-semibold hover:opacity-80 transition-opacity"
          >
            <ChevronLeft size={20} />
            Back
          </button>
        </div>

        <form
          onSubmit={handleSubmitAttempt}
          className="bg-white rounded-2xl sm:rounded-[32px] border border-slate-200 shadow-[0_24px_120px_rgba(15,23,42,0.08)] overflow-hidden"
        >
          {/* Card Header */}
          <div className="bg-white px-4 py-6 sm:px-8 sm:py-10 border-b border-slate-200">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#389131]">
                Return Request
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                Trailer Return Form
              </h1>
              <p className="max-w-3xl text-sm text-slate-600">
                Please review the trailer details and confirm its condition to complete the return process.
              </p>
            </div>
          </div>

          {/* Metadata / Booking ID Row */}
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-8 sm:py-6 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-[#389131]"></span>
              Booking ID: {bookingId}
            </div>
          </div>

          <main className="px-4 py-6 sm:px-10 sm:py-10">
            <div className="rounded-2xl sm:rounded-[28px] border border-slate-200 bg-slate-50 p-4 sm:p-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Trailer Details & Condition */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 mb-3">Trailer Details</h2>
                    {/* Trailer Details Card */}
                    <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
                      <div className="w-full h-44 overflow-hidden rounded-lg bg-gray-200 relative shadow-inner">
                        <img
                          src={trailerImage}
                          alt={trailerModel}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h3 className="text-base font-bold text-slate-900 truncate">
                          {trailerModel}
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                          {trailerDesc}
                        </p>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-500">Price:</span>
                          <span className="text-sm font-bold text-[#389131]">
                            {priceDisplay}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Current Trailer Condition
                    </label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/20 transition-all duration-200 cursor-pointer hover:border-slate-300 shadow-sm"
                    >
                      <option value="no_damage">No Damage Found</option>
                      <option value="minor_scratch">Minor Scratch</option>
                      <option value="damage_note">Damage Note / Other Dents</option>
                    </select>
                  </div>
                </div>

                {/* Right Column: Notes & Photos */}
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Describe any scratches, dents, or condition details..."
                      rows={6}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-gray-400 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/20 transition-all duration-200 resize-none hover:border-slate-300 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Condition Photos <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                    
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed border-[#D9D9D9] bg-white rounded-xl p-6 text-center cursor-pointer transition-all duration-200 hover:border-[#389131] hover:bg-[#F4FBF4]/40 flex flex-col items-center justify-center gap-2 group ${uploadingPhotos ? 'opacity-50 pointer-events-none' : ''} shadow-sm`}
                    >
                      <div className="p-3 rounded-full bg-slate-50 text-slate-500 group-hover:bg-[#E7F6E6] group-hover:text-[#389131] transition-all duration-200 shadow-sm">
                        <Camera size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {uploadingPhotos ? "Uploading Photos..." : "Upload Trailer Photos"}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          Select one or more current condition photos. JPG, PNG up to 10MB.
                        </p>
                      </div>
                    </div>

                    {photos.length > 0 && (
                      <div className="mt-5">
                        <p className="text-xs font-semibold text-slate-500 mb-2">
                          Selected Photos ({photos.length})
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          {photos.map(({ previewUrl }, index) => (
                            <div
                              key={previewUrl}
                              className="relative aspect-video w-full overflow-hidden rounded-xl bg-white border border-[#D9D9D9] group shadow-sm"
                            >
                              <img
                                src={previewUrl}
                                alt={`Condition ${index + 1}`}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white font-medium hover:bg-red-600 transition-colors shadow-md"
                                aria-label="Remove photo"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit actions */}
              <div className="pt-6 border-t border-slate-200 mt-8">
                <button
                  type="submit"
                  disabled={uploadingPhotos || submittingRequest}
                  className="w-full rounded-xl bg-[#389131] py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-[#2d7326] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-[#389131]/10 flex items-center justify-center gap-2"
                >
                  {submittingRequest ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting Request...
                    </>
                  ) : (
                    "Submit Return Request"
                  )}
                </button>
              </div>
            </div>
          </main>
        </form>
      </div>
    </div>
  );
};

export default Return;
