import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Container from "./Container.tsx";
import { CategorySection } from "../../components/CategorySection.tsx";
import { getGooseneckListItems } from "../../assets/data/trailers.ts";
import { fetchTrailersList } from "../../api/trailersApi.ts";
import type { TrailerListItem } from "../../assets/data/trailers.ts";
import { RootState } from "../../store";
import { AddTrailerModal } from "../../components/TrailerDetails/AddTrailerModal.tsx";

type RevealBlockProps = {
  children: React.ReactNode;
  delayMs?: number;
};

const RevealBlock: React.FC<RevealBlockProps> = ({ children, delayMs = 0 }) => {
  const blockRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = blockRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={blockRef}
      className={`will-change-transform transition-all duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
        visible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-5 scale-[0.99]"
      }`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
};

const LoadingCategorySection: React.FC<{ title: string }> = ({ title }) => (
  <section aria-label={title} className="w-full bg-white pt-8">
    <div className="w-full px-[16px] sm:px-[24px] md:px-[40px]">
      <div className="mb-5 flex items-center justify-between">
        <div className="h-[32px] w-52 rounded-full bg-[#E5E7EB] animate-pulse" />
        <div className="hidden md:block h-9 w-28 rounded-full bg-[#E5E7EB] animate-pulse" />
      </div>

      <div className="flex overflow-x-auto gap-4 pb-5 no-scrollbar">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`${title}-skeleton-${index}`}
            className="shrink-0 w-[calc((100%-12px)/2)] md:w-[calc((100%-64px)/3)] lg:w-[calc((100%-96px)/4)] 2xl:w-[calc((100%-128px)/5)]"
          >
            <div className="aspect-square rounded-[18px] bg-[#E5E7EB] animate-pulse" />
            <div className="mt-3 space-y-2">
              <div className="h-4 w-3/4 rounded-full bg-[#E5E7EB] animate-pulse" />
              <div className="h-4 w-1/2 rounded-full bg-[#E5E7EB] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [addTrailerOpen, setAddTrailerOpen] = useState(false);
  const [renterListings, setRenterListings] = useState<{
    gooseneck: TrailerListItem[];
    bumperPull: TrailerListItem[];
    flatbed: TrailerListItem[];
    carHaulers: TrailerListItem[];
  } | null>(null);
  const [listingsLoadError, setListingsLoadError] = useState(false);
  const [ownerTrailers, setOwnerTrailers] = useState<TrailerListItem[] | null>(
    null,
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const userType = useSelector((state: RootState) => state.auth.userType);
  const ownerTrailersCount = useSelector(
    (state: RootState) => state.auth.ownerTrailersCount,
  );

  const isOwner = user?.trailor === "Owner" || userType === "Owner";

  // ownerTrailers is null while loading; once fetched it's an array (possibly empty).
  const ownerHasTrailers =
    ownerTrailersCount > 0 ||
    (ownerTrailers !== null && ownerTrailers.length > 0);
  const ownerHasNoTrailers =
    isOwner &&
    ownerTrailers !== null &&
    ownerTrailers.length === 0 &&
    ownerTrailersCount === 0;

  const showRenterCategories = !isOwner;

  useEffect(() => {
    if (!showRenterCategories) return;

    let cancelled = false;
    setListingsLoadError(false);

    (async () => {
      try {
        const grouped = await fetchTrailersList({ page: 1, limit: 100 });
        if (cancelled) return;
        setRenterListings({
          gooseneck: grouped.gooseneck,
          bumperPull: grouped.bumper_pull,
          flatbed: grouped.flatbed,
          carHaulers: grouped.car_hauler,
        });
      } catch {
        if (!cancelled) {
          setListingsLoadError(true);
          setRenterListings({
            gooseneck: [],
            bumperPull: [],
            flatbed: [],
            carHaulers: [],
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [showRenterCategories]);

  useEffect(() => {
    if (!isOwner) return;

    let cancelled = false;

    (async () => {
      try {
        const grouped = await fetchTrailersList({ page: 1, limit: 100 });
        if (cancelled) return;

        setOwnerTrailers([
          ...grouped.gooseneck,
          ...grouped.bumper_pull,
          ...grouped.flatbed,
          ...grouped.car_hauler,
        ]);
      } catch {
        if (!cancelled) {
          setOwnerTrailers([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOwner]);

  const gooseneckItems = getGooseneckListItems();
  const ownerTrailerCards =
    ownerTrailers !== null ? ownerTrailers : gooseneckItems;

  const gooseneckSectionItems = renterListings?.gooseneck ?? [];
  const bumperPullSectionItems = renterListings?.bumperPull ?? [];
  const flatbedSectionItems = renterListings?.flatbed ?? [];
  const carHaulersSectionItems = renterListings?.carHaulers ?? [];
  const listingsStillLoading = showRenterCategories && renterListings === null;
  const isBookedTrailer = (truckId: string | number) => {
    const numericId = typeof truckId === "number" ? truckId : Number(truckId);
    return (
      Number.isInteger(numericId) &&
      !Number.isNaN(numericId) &&
      numericId % 3 === 2
    );
  };
  const visibleOwnerTrailers = ownerTrailerCards.slice(0, 4);

  return (
    <div
      style={{
        background: "#FFFFFF",
        boxShadow: "0px 4px 4px 0px rgba(0,0,0,0.25)",
        marginBottom: "10px",
      }}
      className="min-h-screen w-full min-w-0 overflow-x-hidden"
    >
      <RevealBlock>
        <Container />
      </RevealBlock>

      {ownerHasNoTrailers ? (
        /* Empty state below container - no trailer listings shown */
        <RevealBlock delayMs={120}>
          <div
            className="flex flex-col items-center
           justify-center px-6 py-16 sm:py-24 text-center"
          >
            <div
              className="
    relative w-[calc(100%+32px)] sm:w-[calc(100%+48px)] lg:w-[calc(100%+64px)]
    -mx-4 sm:-mx-6 lg:-mx-8
    px-10 py-5
    bg-[#FFFFFF]
    border border-[#00000040]
    shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
    sm:w-[70%] sm:max-w-full
  "
            >
              <div className="flex flex-col items-center justify-center px-6 py-12 sm:py-16 text-center">
                <p
                  className="
    mb-2
    font-lexend
    text-[30px]
    font-medium
    leading-[100%]
    tracking-[0%]
    align-middle
    text-black
  "
                >
                  You haven&apos;t added any trailers yet.
                </p>
                <p
                  className=" mt-4
    mb-6
    max-w-sm
    text-center
    font-lexend
    text-[18px]
    font-normal
    leading-[100%]
    tracking-[0px]
    text-black
  "
                >
                  Start by adding your first trailer so renters can view and
                  book it.
                </p>
                <button
                  type="button"
                  onClick={() => setAddTrailerOpen(true)}
                  className="
    inline-flex items-center justify-center
    w-[213px] h-[56px]
    rounded-[5px]
    pt-[13px] pr-[67px] pb-[14px] pl-[68px]
    gap-[10px]
    bg-[#389131]
    font-lexend
    font-semibold
    text-white
    transition-all duration-300
    hover:opacity-90 hover:-translate-y-0.5
    active:translate-y-0
  "
                >
                  <span
                    className="
    font-lexend
    text-[23px]
    font-semibold
    leading-[100%]
    tracking-[0px]
    text-center
    text-white
  "
                  >
                    Add
                  </span>
                </button>
              </div>
            </div>
          </div>
        </RevealBlock>
      ) : ownerHasTrailers ? (
        <RevealBlock delayMs={120}>
          <div className="w-full px-10 pb-6 pt-1">
            <div className="w-full">
              <div className="mb-3 flex justify-end px-3 py-2">
                <button
                  type="button"
                  onClick={() => navigate("/owner/view-more-trucks")}
                  className="
    w-[80px]
    h-[25px]
    rounded-[2px]
    bg-[#E5FDE3]
    text-[#389131]
    font-lexend
    font-medium
    text-[10px]
    leading-[100%]
    flex items-center justify-center
    hover:bg-[#DDF2DA]
    transition-colors
  "
                >
                  View More
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-3 sm:grid-cols-3 lg:grid-cols-5">
                <button
                  type="button"
                  onClick={() => setAddTrailerOpen(true)}
                  className="
    w-[255px]
    h-[257px]
    rounded-[6px]
    border
    border-[#00000036]
    bg-white
    flex
    items-center
    justify-center
    shadow-sm
  "
                >
                  <span
                    className="
      w-[136px]
      h-[44px]
      rounded-[3px]
      bg-[#389131]
      text-white
      flex
      items-center
      justify-center
      px-[16px]
      pt-[10px]
      pb-[9px]
      whitespace-nowrap
      font-[Lexend]
      font-medium
      text-[20px]
      leading-[100%]
    "
                  >
                    Add Trailer
                  </span>
                </button>

                {visibleOwnerTrailers.map((item) => {
                  const booked = isBookedTrailer(Number(item.id));
                  const rawStatus = item.availabilityStatus?.toLowerCase();
                  const statusText = rawStatus
                    ? rawStatus === "available"
                      ? "Available"
                      : rawStatus === "unavailable"
                        ? "Unavailable"
                        : item.availabilityStatus
                    : booked
                      ? "Booked"
                      : "Available";
                  const statusClass = rawStatus
                    ? rawStatus === "available"
                      ? "bg-[#EBFFE9] text-[#389131]"
                      : rawStatus === "unavailable"
                        ? "bg-[#FEE2E2] text-[#B42318]"
                        : "bg-[#E5E7E5] text-[#929191]"
                    : booked
                      ? "bg-[#E5E5E5] text-[#929191]"
                      : "bg-[#EBFFE9] text-[#389131]";

                  return (
                    <div
                      key={item.id}
                      className="w-[240px] cursor-pointer"
                      onClick={() =>
                        navigate(`/owner/truck/${item.id}`, {
                          state: { isBooked: booked },
                        })
                      }
                    >
                      <div
                        className="overflow-hidden
                       rounded-[4px] bg-white"
                      >
                        {/* Image */}
                        <div className="h-[257px] w-[240px] overflow-hidden rounded-[4px]">
                          <img
                            src={item.image}
                            alt={item.modelLabel}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* Content */}
                        <div className="pt-2">
                          {/* Trailer Name */}
                          <p
                            className="
              font-[Lexend]
              text-[14px]
              font-semibold
              leading-[100%]
              text-black
            "
                          >
                            {item.titleLabel ?? item.modelLabel}
                          </p>

                          {/* Rating + Model */}
                          <div className="mt-1 flex items-center">
                            <span className="text-[12px] text-[#F5A623]">
                              ★
                            </span>

                            <span
                              className="
                ml-1
                font-[Lexend]
                text-[13px]
                font-normal
                leading-[100%]
                text-black
              "
                            >
                              4.9
                            </span>

                            <span
                              className="
                ml-1
                font-[Lexend]
                text-[13px]
                font-normal
                leading-[100%]
                text-black
              "
                            >
                              Model :
                            </span>

                            <span
                              className="
                ml-1
                font-[Lexend]
                text-[13px]
                font-light
                leading-[100%]
                text-black
              "
                            >
                              {item.modelLabel.replace(/^Model:\s*/i, "")}
                            </span>
                          </div>

                          {/* Price */}
                          <p
                            className="
              mt-1
              font-[Lexend]
              text-[13px]
              font-semibold
              leading-[100%]
              text-black
            "
                          >
                            {item.priceLabel}
                          </p>

                          <div className="mt-2">
                            <span
                              className={`
                inline-flex
                h-[20px]
                items-center
                justify-center
                rounded-[2px]
                px-3
                font-[Lexend]
                text-[9px]
                font-medium
                leading-[100%]
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
            </div>
          </div>
        </RevealBlock>
      ) : (
        <>
          {listingsStillLoading ? (
            <>
              <RevealBlock delayMs={80}>
                <LoadingCategorySection title="Gooseneck Trailers" />
              </RevealBlock>
              <RevealBlock delayMs={120}>
                <LoadingCategorySection title="Bumper Pull Trailers" />
              </RevealBlock>
              <RevealBlock delayMs={160}>
                <LoadingCategorySection title="Flatbed Trailers" />
              </RevealBlock>
              <RevealBlock delayMs={200}>
                <LoadingCategorySection title="Car Haulers" />
              </RevealBlock>
            </>
          ) : (
            <>
              <div
                style={{
                  background: "#FFFFFF",
                  boxShadow: "0px 4px 4px 0px #00000040",
                }}
              >
                {listingsLoadError && (
                  <RevealBlock delayMs={40}>
                    <div className="px-4 pt-4 text-center text-sm text-amber-800 bg-amber-50 border-b border-amber-100">
                      Could not load trailers. Check that the API is reachable
                      (set{" "}
                      <code className="text-xs bg-amber-100 px-1 rounded">
                        REACT_APP_API_URL
                      </code>{" "}
                      if your backend is not the default host).
                    </div>
                  </RevealBlock>
                )}
                {gooseneckSectionItems.length > 0 && (
                  <RevealBlock delayMs={80}>
                    <CategorySection
                      title="Gooseneck Trailers"
                      items={gooseneckSectionItems}
                    />
                  </RevealBlock>
                )}
                {bumperPullSectionItems.length > 0 && (
                  <RevealBlock delayMs={120}>
                    <CategorySection
                      title="Bumper Pull Trailers"
                      items={bumperPullSectionItems}
                    />
                  </RevealBlock>
                )}
                {flatbedSectionItems.length > 0 && (
                  <RevealBlock delayMs={160}>
                    <CategorySection
                      title="Flatbed Trailers"
                      items={flatbedSectionItems}
                    />
                  </RevealBlock>
                )}
                {carHaulersSectionItems.length > 0 && (
                  <RevealBlock delayMs={200}>
                    <CategorySection
                      title="Car Haulers"
                      items={carHaulersSectionItems}
                    />
                  </RevealBlock>
                )}
                {!listingsLoadError &&
                  renterListings &&
                  gooseneckSectionItems.length === 0 &&
                  bumperPullSectionItems.length === 0 &&
                  flatbedSectionItems.length === 0 &&
                  carHaulersSectionItems.length === 0 && (
                    <RevealBlock delayMs={80}>
                      <div className="px-4 py-12 text-center text-[15px] text-gray-500">
                        No trailers match the home categories yet.
                      </div>
                    </RevealBlock>
                  )}
              </div>{" "}
            </>
          )}
        </>
      )}

      <AddTrailerModal
        isOpen={addTrailerOpen}
        onClose={() => setAddTrailerOpen(false)}
        onSuccess={() => setAddTrailerOpen(false)}
      />
    </div>
  );
};

export default Home;
