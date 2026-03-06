import React from "react";
import Container from "./Container.tsx";
import { CategorySection } from "../../components/CategorySection.tsx";
import { getGooseneckListItems, getBumperPullListItems, getFlatbedListItems, getCarHaulersListItems } from "../../assets/data/trailers.ts";

const Home: React.FC = () => {
  const gooseneckItems = getGooseneckListItems();
  const bumperPullItems = getBumperPullListItems();
  const flatbedItems = getFlatbedListItems();
  const carHaulersItems = getCarHaulersListItems();

  return (
    <div className="min-h-screen bg-white w-full min-w-0 overflow-x-hidden">
      <Container />

      <CategorySection title="Gooseneck Trailers" items={gooseneckItems} />

      <CategorySection title="Bumper Pull Trailers" items={bumperPullItems} />

      <CategorySection title="Flatbed Trailers" items={flatbedItems} />

      <CategorySection title="Car Haulers" items={carHaulersItems} />
    </div>
  );
};

export default Home;