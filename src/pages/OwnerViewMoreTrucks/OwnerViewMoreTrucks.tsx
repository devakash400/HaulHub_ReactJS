import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTrailersList } from "../../api/trailersApi.ts";
import type { TrailerListItem } from "../../assets/data/trailers.ts";

const OwnerViewMoreTrucks: React.FC = () => {
  const navigate = useNavigate();
  const [ownerTrucks, setOwnerTrucks] = useState<TrailerListItem[] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);

    (async () => {
      try {
        const grouped = await fetchTrailersList({ page: 1, limit: 100 });
        if (cancelled) return;

        setOwnerTrucks([
          ...grouped.gooseneck,
          ...grouped.bumper_pull,
          ...grouped.flatbed,
          ...grouped.car_hauler,
        ]);
      } catch {
        if (!cancelled) {
          setLoadError(true);
          setOwnerTrucks([]);
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
  }, []);

  const allOwnerTrucks = ownerTrucks ?? [];

  const isBookedTrailer = (truckId: string | number) => {
    const numericId = typeof truckId === "number" ? truckId : Number(truckId);
    return (
      Number.isInteger(numericId) &&
      !Number.isNaN(numericId) &&
      numericId % 3 === 2
    );
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="mx-auto w-full max-w-[1320px]">
        {loading ? (
          <div className="text-center text-sm text-gray-500 py-20">
            Loading trailers…
          </div>
        ) : loadError ? (
          <div className="text-center text-sm text-red-600 py-20">
            Unable to load trailers. Please try again later.
          </div>
        ) : allOwnerTrucks.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-20">
            No trailers found.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {allOwnerTrucks.map((item) => {
              const booked = isBookedTrailer(Number(item.id));
              const rawStatus = item.availabilityStatus?.toLowerCase();
              const statusText = rawStatus
                ? rawStatus === "available"
                  ? "Available"
                  : rawStatus === "unavailable"
                    ? "Unavailable"
                    : rawStatus === "booked"
                      ? "Booked"
                      : item.availabilityStatus
                : booked
                  ? "Booked"
                  : "Available";
              const statusClass = rawStatus
                ? rawStatus === "available"
                  ? "bg-[#EBFFE9] text-[#389131]"
                  : rawStatus === "unavailable"
                    ? "bg-[#FEE2E2] text-[#B42318]"
                    : rawStatus === "booked"
                      ? "bg-[#E5E5E5] text-[#929191]"
                      : "bg-[#E5E7E5] text-[#929191]"
                : booked
                  ? "bg-[#E5E5E5] text-[#929191]"
                  : "bg-[#EBFFE9] text-[#389131]";
              const isActuallyBooked = rawStatus === "booked" || booked;

              return (
                <div
                  key={`owner-more-${item.id}`}
                  className="w-full cursor-pointer"
                  onClick={() =>
                    navigate(`/owner/truck/${item.id}`, {
                      state: { isBooked: isActuallyBooked },
                    })
                  }
                >
                  <div className="overflow-hidden rounded-[8px] bg-white border border-[#E5E7EB] shadow-sm flex flex-col h-full">
                    {/* Image */}
                    <div className="aspect-[240/200] w-full overflow-hidden border-b border-[#E5E7EB]">
                      <img
                        src={item.image}
                        alt={item.modelLabel}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-grow p-3 sm:p-4">
                      {/* Trailer Name */}
                      <p
                        className="
                          font-[Lexend]
                          text-[15px]
                          font-semibold
                          leading-[1.2]
                          text-black
                          truncate
                          mb-1.5
                        "
                      >
                        {item.titleLabel ?? item.modelLabel}
                      </p>

                      {/* Rating + Model */}
                      <div className="flex items-center whitespace-nowrap mb-1.5">
                        <span className="text-[13px] text-[#F5A623] shrink-0">★</span>

                        <span
                          className="
                            ml-1
                            font-[Lexend]
                            text-[13px]
                            font-normal
                            text-black
                            shrink-0
                          "
                        >
                          4.9
                        </span>

                        <span
                          className="
                            ml-1.5
                            font-[Lexend]
                            text-[13px]
                            font-normal
                            text-gray-500
                            shrink-0
                          "
                        >
                          Model:
                        </span>

                        <span
                          className="
                            ml-1
                            font-[Lexend]
                            text-[13px]
                            font-light
                            text-black
                            truncate
                          "
                        >
                          {item.modelLabel.replace(/^Model:\s*/i, "")}
                        </span>
                      </div>

                      {/* Price */}
                      <p
                        className="
                          font-[Lexend]
                          text-[15px]
                          font-bold
                          text-[#389131]
                          mb-3
                        "
                      >
                        {item.priceLabel}
                      </p>

                      {/* Status */}
                      <div className="mt-auto">
                        <span
                          className={`
                            inline-flex
                            h-[24px]
                            items-center
                            justify-center
                            rounded-[4px]
                            px-3
                            font-[Lexend]
                            text-[11px]
                            font-medium
                            ${statusClass}
                          `}
                        >
                          {statusText}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerViewMoreTrucks;
