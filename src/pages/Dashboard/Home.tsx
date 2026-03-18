import React, { useState } from "react";
import { useSelector } from "react-redux";
import Container from "./Container.tsx";
import { CategorySection } from "../../components/CategorySection.tsx";
import { getGooseneckListItems, getBumperPullListItems, getFlatbedListItems, getCarHaulersListItems } from "../../assets/data/trailers.ts";
import { RootState } from "../../store";
import { AddTrailerModal } from "../../components/TrailerDetails/AddTrailerModal.tsx";

const Home: React.FC = () => {
  const [addTrailerOpen, setAddTrailerOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const ownerTrailersCount = useSelector(
    (state: RootState) => state.auth.ownerTrailersCount
  );

  const isOwnerWithNoTrailers =
    user?.trailor === "Owner" && ownerTrailersCount === 0;

  const gooseneckItems = getGooseneckListItems();
  const bumperPullItems = getBumperPullListItems();
  const flatbedItems = getFlatbedListItems();
  const carHaulersItems = getCarHaulersListItems();

  return (
    <div className="min-h-screen bg-white w-full min-w-0 overflow-x-hidden">
      <Container />

      {isOwnerWithNoTrailers ? (
        /* Empty state below container - no trailer listings shown */
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
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg bg-[#389131] text-white font-semibold hover:opacity-90 transition-opacity"
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
      ) : (
        <>
          <CategorySection title="Gooseneck Trailers" items={gooseneckItems} />

          <CategorySection title="Bumper Pull Trailers" items={bumperPullItems} />

          <CategorySection title="Flatbed Trailers" items={flatbedItems} />

          <CategorySection title="Car Haulers" items={carHaulersItems} />
        </>
      )}
    </div>
  );
};

export default Home;