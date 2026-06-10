import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  getTrailerById,
  trailersData,
  type TrailerDetail,
  type TrailerType,
} from "../../assets/data/trailers.ts";
import {
  fetchTrailerById,
  mapApiTrailerDetailToTrailerDetail,
  setTrailerUnavailability,
  updateTrailer,
} from "../../api/trailersApi.ts";
import { toast } from "react-toastify";
import { X } from "lucide-react";

type BookingStatus = "Upcoming" | "Ongoing" | "Completed";

type OwnerBooking = {
  id: string;
  renterName: string;
  dates: string;
  amount: string;
  status: BookingStatus;
};

type EditableTruckDetails = {
  title: string;
  location: string;
  specs: string;
  price: string;
  type: TrailerType;
};

const demoBookings: OwnerBooking[] = [
  {
    id: "#BK-24091",
    renterName: "James Walker",
    dates: "02 Apr - 05 Apr",
    amount: "$420.00",
    status: "Upcoming",
  },
  {
    id: "#BK-24066",
    renterName: "Sophia Carter",
    dates: "26 Mar - 29 Mar",
    amount: "$510.00",
    status: "Ongoing",
  },
  {
    id: "#BK-23990",
    renterName: "Noah Cooper",
    dates: "18 Mar - 22 Mar",
    amount: "$680.00",
    status: "Completed",
  },
];

const statusClassMap: Record<BookingStatus, string> = {
  Upcoming: "bg-[#EEF4FF] text-[#1D4ED8]",
  Ongoing: "bg-[#E7F6E6] text-[#2F7A29]",
  Completed: "bg-[#F3F4F6] text-[#374151]",
};

const OwnerTruckDescription: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [trailer, setTrailer] = useState<TrailerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const isBookedFromState = Boolean(
    (location.state as { isBooked?: boolean } | null)?.isBooked,
  );
  const parsedId = id ? Number(id) : NaN;
  const isNumericId = Number.isInteger(parsedId) && !Number.isNaN(parsedId);
  const isTruckBooked =
    isBookedFromState || (isNumericId && parsedId % 3 === 2);
  const [isAvailable, setIsAvailable] = useState(!isTruckBooked);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPhotosOpen, setIsPhotosOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [truckDetails, setTruckDetails] = useState<EditableTruckDetails | null>(
    null,
  );
  const [draftDetails, setDraftDetails] = useState<EditableTruckDetails | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    if (!id) {
      setLoadError(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(false);

    (async () => {
      try {
        const apiTrailer = await fetchTrailerById(id);
        if (cancelled) return;

        let resolvedTrailer: TrailerDetail | null = null;
        if (apiTrailer) {
          resolvedTrailer = mapApiTrailerDetailToTrailerDetail(apiTrailer);
        } else if (isNumericId) {
          resolvedTrailer = getTrailerById(parsedId) ?? null;
        }

        if (resolvedTrailer) {
          setTrailer(resolvedTrailer);
          setIsAvailable(
            isTruckBooked ? false : (resolvedTrailer.isAvailable ?? true),
          );
          const initialDetails = {
            title: resolvedTrailer.title,
            location: resolvedTrailer.location,
            specs: resolvedTrailer.specs,
            price: resolvedTrailer.price,
            type: resolvedTrailer.type,
          };
          setTruckDetails(initialDetails);
          setDraftDetails(initialDetails);
        } else {
          setLoadError(true);
        }
      } catch {
        if (!cancelled) {
          setLoadError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isNumericId, parsedId]);

  const earnings = useMemo(() => {
    return {
      thisMonth: "$2,740.00",
      totalEarnings: "$18,930.00",
      pendingPayout: "$620.00",
    };
  }, []);
  const galleryImages = useMemo(() => {
    if (!trailer) return [];

    const primaryImages = trailer.images.filter(Boolean);
    const fallbackImages = trailersData
      .flatMap((item) => item.images)
      .filter((img) => Boolean(img));
    const combined = [...primaryImages, ...fallbackImages];
    const unique = Array.from(new Set(combined));

    // Keep gallery rich even if current truck has limited photos.
    return unique.slice(0, 9);
  }, [trailer]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F8F3] px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white border border-gray-200 p-8 text-center">
          <p className="text-xl font-semibold text-gray-900">
            Loading truck details...
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we fetch the latest trailer information.
          </p>
        </div>
      </div>
    );
  }

  if (loadError || !trailer) {
    return (
      <div className="min-h-screen bg-[#F9F8F3] px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white border border-gray-200 p-8 text-center">
          <p className="text-xl font-semibold text-gray-900">Truck not found</p>
          <p className="mt-2 text-sm text-gray-600">
            The truck you are trying to open does not exist.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex rounded-lg bg-[#389131] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const openEditModal = () => {
    if (isTruckBooked) {
      toast.info("Booked truck details cannot be edited right now.");
      return;
    }
    if (!truckDetails) return;
    setDraftDetails({ ...truckDetails });
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
  };

  const parsePricePerDay = (price: string) => {
    const cleaned = String(price).replace(/[^0-9.]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const handleSaveDetails = async () => {
    if (!draftDetails || !id) return;
    if (!draftDetails.title.trim() || !draftDetails.location.trim()) {
      toast.error("Title and location are required");
      return;
    }

    const payload: Record<string, unknown> = {
      title: draftDetails.title.trim(),
      trailerType: draftDetails.type.trim(),
    };

    const pricePerDay = parsePricePerDay(draftDetails.price);
    if (pricePerDay !== undefined) {
      payload.pricePerDay = pricePerDay;
    }

    if (draftDetails.specs.trim()) {
      payload.description = draftDetails.specs.trim();
    }

    const success = await updateTrailer(id, payload);
    if (!success) {
      toast.error("Unable to update trailer details. Please try again.");
      return;
    }

    setTruckDetails(draftDetails);
    setTrailer((prev) =>
      prev
        ? {
            ...prev,
            title: draftDetails.title,
            location: draftDetails.location,
            specs: draftDetails.specs,
            price: draftDetails.price,
            type: draftDetails.type as TrailerType,
          }
        : prev,
    );
    setIsEditOpen(false);
    toast.success("Truck details updated");
  };

  return (
    <div className="min-h-screen bg-[#F9F8F3] px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Truck Owner Description
            </h1>
            <p className="text-sm text-gray-600">
              View truck details, manage bookings, track earnings, and update
              availability.
            </p>
          </div>
          <Link
            to="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
          <div className="grid gap-5 md:grid-cols-[360px_1fr]">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <img
                src={trailer.images[0]}
                alt={trailer.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {truckDetails?.title}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {truckDetails?.location} - {truckDetails?.specs}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-[#F8FAFC] p-3">
                  <p className="text-xs text-gray-500">Rating</p>
                  <p className="text-base font-semibold text-gray-900">
                    {trailer.rating} ({trailer.reviewCount})
                  </p>
                </div>
                <div className="rounded-xl bg-[#F8FAFC] p-3">
                  <p className="text-xs text-gray-500">Daily Price</p>
                  <p className="text-base font-semibold text-gray-900">
                    {truckDetails?.price}
                  </p>
                </div>
                <div className="rounded-xl bg-[#F8FAFC] p-3">
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-base font-semibold text-gray-900">
                    {truckDetails?.type}
                  </p>
                </div>
                <div className="rounded-xl bg-[#F8FAFC] p-3">
                  <p className="text-xs text-gray-500">Status</p>
                  <p
                    className={`text-base font-semibold ${
                      isTruckBooked
                        ? "text-[#6B7280]"
                        : isAvailable
                          ? "text-[#2F7A29]"
                          : "text-[#B42318]"
                    }`}
                  >
                    {isTruckBooked
                      ? "Booked"
                      : isAvailable
                        ? "Available"
                        : "Unavailable"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    if (isTruckBooked) {
                      toast.info(
                        "Availability cannot be changed while truck is booked.",
                      );
                      return;
                    }
                    if (!id?.trim()) {
                      toast.error("Invalid trailer ID.");
                      return;
                    }

                    const nextIsAvailable = !isAvailable;
                    const newIsUnavailable = !nextIsAvailable;
                    const success = await setTrailerUnavailability(
                      id,
                      newIsUnavailable,
                    );

                    if (!success) {
                      toast.error(
                        "Unable to update trailer availability. Please try again.",
                      );
                      return;
                    }

                    setIsAvailable(nextIsAvailable);
                    setTrailer((prev) =>
                      prev ? { ...prev, isAvailable: nextIsAvailable } : prev,
                    );
                    toast.success(
                      newIsUnavailable
                        ? "Trailer marked unavailable."
                        : "Trailer marked available.",
                    );
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                    isTruckBooked
                      ? "cursor-not-allowed"
                      : isAvailable
                        ? "bg-[#B42318] hover:bg-[#912018]"
                        : "bg-[#389131] hover:bg-[#2f7a29]"
                  }`}
                  style={{
                    backgroundColor: isTruckBooked ? "#929191" : undefined,
                  }}
                >
                  {isTruckBooked
                    ? "Booked - Availability Locked"
                    : `Mark as ${isAvailable ? "Unavailable" : "Available"}`}
                </button>
                <button
                  type="button"
                  onClick={openEditModal}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                    isTruckBooked
                      ? "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  {isTruckBooked
                    ? "Edit Disabled (Booked)"
                    : "Edit Truck Details"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPhotoIndex(0);
                    setIsPhotosOpen(true);
                  }}
                  className="rounded-lg border border-[#8CCB85] bg-[#EAF7E8] px-4 py-2 text-sm font-semibold text-[#2F7A29] hover:bg-[#DDF2DA] transition-colors"
                >
                  View All Photos
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">This Month</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {earnings.thisMonth}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Total Earnings</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {earnings.totalEarnings}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Pending Payout</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {earnings.pendingPayout}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Manage Bookings
            </h2>
            <button
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              View All Bookings
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2">Booking ID</th>
                  <th className="px-3 py-2">Renter</th>
                  <th className="px-3 py-2">Dates</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {demoBookings.map((booking) => (
                  <tr key={booking.id} className="bg-[#F9FAFB]">
                    <td className="rounded-l-lg px-3 py-3 text-sm font-medium text-gray-900">
                      {booking.id}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700">
                      {booking.renterName}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700">
                      {booking.dates}
                    </td>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900">
                      {booking.amount}
                    </td>
                    <td className="rounded-r-lg px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          statusClassMap[booking.status]
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {isEditOpen && draftDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-gray-200 p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Truck Details
              </h3>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700"
              >
                Close
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-gray-700">
                Title
                <input
                  type="text"
                  value={draftDetails.title}
                  onChange={(event) =>
                    setDraftDetails((prev) =>
                      prev ? { ...prev, title: event.target.value } : prev,
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="text-sm text-gray-700">
                Type
                <input
                  type="text"
                  value={draftDetails.type}
                  onChange={(event) =>
                    setDraftDetails((prev) =>
                      prev
                        ? { ...prev, type: event.target.value as TrailerType }
                        : prev,
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="text-sm text-gray-700 sm:col-span-2">
                Location
                <input
                  type="text"
                  value={draftDetails.location}
                  onChange={(event) =>
                    setDraftDetails((prev) =>
                      prev ? { ...prev, location: event.target.value } : prev,
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="text-sm text-gray-700 sm:col-span-2">
                Specs
                <input
                  type="text"
                  value={draftDetails.specs}
                  onChange={(event) =>
                    setDraftDetails((prev) =>
                      prev ? { ...prev, specs: event.target.value } : prev,
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="text-sm text-gray-700">
                Daily Price
                <input
                  type="text"
                  value={draftDetails.price}
                  onChange={(event) =>
                    setDraftDetails((prev) =>
                      prev ? { ...prev, price: event.target.value } : prev,
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDetails}
                className="rounded-lg bg-[#389131] px-4 py-2 text-sm font-semibold text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animated photo gallery modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isPhotosOpen
            ? "pointer-events-auto bg-black/55 opacity-100"
            : "pointer-events-none bg-black/0 opacity-0"
        }`}
      >
        <div
          className={`w-full max-w-5xl rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 transition-all duration-300 ${
            isPhotosOpen
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-6 scale-95 opacity-0"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              All Truck Photos
            </h3>
            <button
              type="button"
              onClick={() => setIsPhotosOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <X className="h-3.5 w-3.5" />
              Close
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.65fr_1fr]">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#F8FAFC] shadow-sm">
              <img
                src={galleryImages[selectedPhotoIndex] || trailer.images[0]}
                alt={`${trailer.title} featured`}
                className="h-[420px] w-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {galleryImages.slice(0, 5).map((imageUrl, imageIndex) => (
                <button
                  key={`${imageUrl}-${imageIndex}`}
                  type="button"
                  onClick={() => setSelectedPhotoIndex(imageIndex)}
                  className={`overflow-hidden rounded-lg bg-white transition-all ${
                    selectedPhotoIndex === imageIndex
                      ? "ring-2 ring-[#389131]/20"
                      : ""
                  } ${
                    imageIndex === 0
                      ? "col-span-2"
                      : imageIndex === 3
                        ? "row-span-2"
                        : ""
                  }`}
                >
                  <img
                    src={imageUrl}
                    alt={`${trailer.title} thumb ${imageIndex + 1}`}
                    className={`w-full object-cover ${
                      imageIndex === 0
                        ? "h-40"
                        : imageIndex === 3
                          ? "h-[196px]"
                          : "h-[94px]"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-gray-800">
              More Photos ({galleryImages.length})
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {galleryImages.map((imageUrl, imageIndex) => (
                <div
                  key={`extra-${imageUrl}-${imageIndex}`}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white"
                >
                  <img
                    src={imageUrl}
                    alt={`${trailer.title} extra ${imageIndex + 1}`}
                    className="h-24 w-full object-cover transition-transform duration-500 hover:scale-[1.04]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerTruckDescription;
