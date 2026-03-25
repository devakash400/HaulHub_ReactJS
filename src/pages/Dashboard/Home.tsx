import React, { useEffect, useRef, useState } from "react";
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
  const [addTrailerOpen, setAddTrailerOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const userType = useSelector((state: RootState) => state.auth.userType);
  const ownerTrailersCount = useSelector(
    (state: RootState) => state.auth.ownerTrailersCount
  );

  const isOwnerWithNoTrailers =
    (user?.trailor === "Owner" || userType === "Owner") &&
    ownerTrailersCount === 0;

  const gooseneckItems = getGooseneckListItems();
  const bumperPullItems = getBumperPullListItems();
  const flatbedItems = getFlatbedListItems();
  const carHaulersItems = getCarHaulersListItems();

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
            <AddTrailerModal
              isOpen={addTrailerOpen}
              onClose={() => setAddTrailerOpen(false)}
              onSuccess={() => setAddTrailerOpen(false)}
            />
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
    </div>
  );
};

export default Home;