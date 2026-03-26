import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Container from "./Container.tsx";
import { CategorySection } from "../../components/CategorySection.tsx";
import { getGooseneckListItems, getBumperPullListItems, getFlatbedListItems, getCarHaulersListItems } from "../../assets/data/trailers.ts";
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={blockRef}
      className={`will-change-transform transition-all duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-5 scale-[0.99]"
      }`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [addTrailerOpen, setAddTrailerOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const userType = useSelector((state: RootState) => state.auth.userType);
  const ownerTrailersCount = useSelector(
    (state: RootState) => state.auth.ownerTrailersCount
  );

  const isOwnerWithNoTrailers =
    (user?.trailor === "Owner" || userType === "Owner") &&
    ownerTrailersCount === 0;
  const isOwnerWithTrailers =
    (user?.trailor === "Owner" || userType === "Owner") &&
    ownerTrailersCount > 0;

  const gooseneckItems = getGooseneckListItems();
  const bumperPullItems = getBumperPullListItems();
  const flatbedItems = getFlatbedListItems();
  const carHaulersItems = getCarHaulersListItems();
  const ownerTrailerCards = gooseneckItems;
  const isBookedTrailer = (truckId: number) => truckId % 3 === 2;
  const visibleOwnerTrailers = ownerTrailerCards.slice(0, 4);

  return (
    <div className="min-h-screen bg-white w-full min-w-0 overflow-x-hidden">
      <RevealBlock>
        <Container />
      </RevealBlock>

      {isOwnerWithNoTrailers ? (
        /* Empty state below container - no trailer listings shown */
        <RevealBlock delayMs={120}>
          <div className="flex flex-col items-center justify-center px-6 py-16 sm:py-24 text-center">
            <div className="relative w-full rounded-xl bg-white shadow-lg border border-gray-200 border-l-0 sm:w-[70%] sm:max-w-[920px]">
              <div className="flex flex-col items-center justify-center px-6 py-12 sm:py-16 text-center">
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  You haven&apos;t added any trailers yet.
                </p>
                <p className="text-base text-gray-700 mb-6 max-w-sm leading-relaxed">
                  Start by adding your first trailer so renters can view and book it.
                </p>
                <button
                  type="button"
                  onClick={() => setAddTrailerOpen(true)}
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg bg-[#389131] text-white font-semibold hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </RevealBlock>
      ) : isOwnerWithTrailers ? (
        <RevealBlock delayMs={120}>
          <div className="w-full px-4 pb-6 pt-1">
            <div className="w-full">
              <div className="mb-3 flex items-center justify-between px-3 py-2">
                <p className="text-2xl font-bold tracking-tight text-[#1F2937]">
                  Your Trailers
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/owner/view-more-trucks")}
                  className="rounded-md border border-[#8CCB85] bg-[#EAF7E8] px-3 py-1 text-xs font-semibold text-[#2F7A29] hover:bg-[#DDF2DA] transition-colors"
                >
                  View More
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-3 sm:grid-cols-3 lg:grid-cols-5">
                <button
                  type="button"
                  onClick={() => setAddTrailerOpen(true)}
                  className="h-[190px] w-full rounded-lg border border-gray-300 bg-[#F8F8F8] shadow-sm flex items-center justify-center"
                >
                  <span className="rounded-md bg-[#389131] px-4 py-2 text-white font-semibold text-sm">
                    Add Trailor
                  </span>
                </button>

                {visibleOwnerTrailers.map((item) => (
                  <div
                    key={item.id}
                    className="w-full cursor-pointer"
                    onClick={() =>
                      navigate(`/owner/truck/${item.id}`, {
                        state: { isBooked: isBookedTrailer(Number(item.id)) },
                      })
                    }
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-md border border-gray-200 bg-white">
                      <img
                        src={item.image}
                        alt={item.modelLabel}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <p className="mt-1 text-[14px] font-semibold leading-tight text-black">
                      Gooseneck Trailor
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-700 leading-tight">
                      <span className="text-[#F59E0B]">★</span> 4.9 Model : FMAX208
                    </p>
                    <p className="mt-0.5 text-[12px] font-semibold leading-tight text-black">
                      {item.priceLabel}
                    </p>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-[2px] text-[9px] font-medium ${
                          isBookedTrailer(Number(item.id))
                            ? "bg-gray-200 text-gray-700"
                            : "bg-[#E7F6E6] text-[#2F7A29]"
                        }`}
                      >
                        {isBookedTrailer(Number(item.id)) ? "Booked" : "Available"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealBlock>
      ) : (
        <>
          <RevealBlock delayMs={80}>
            <CategorySection title="Gooseneck Trailers" items={gooseneckItems} />
          </RevealBlock>

          <RevealBlock delayMs={120}>
            <CategorySection title="Bumper Pull Trailers" items={bumperPullItems} />
          </RevealBlock>

          <RevealBlock delayMs={160}>
            <CategorySection title="Flatbed Trailers" items={flatbedItems} />
          </RevealBlock>

          <RevealBlock delayMs={200}>
            <CategorySection title="Car Haulers" items={carHaulersItems} />
          </RevealBlock>
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