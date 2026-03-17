import React from "react";
import { images } from "../../assets/images/index.ts";

const Container: React.FC = () => {
  return (
    <main className="w-full min-w-0 m-0 p-0 font-sans overflow-x-hidden">
      {/* Hero with background image and search bar */}
      <section className="relative w-full min-w-0 overflow-hidden rounded-none shadow-none mb-0 flex items-center justify-center bg-white sm:bg-black h-[220px] sm:h-[380px] lg:h-[560px]">
        <img
          src={images.Container}
          alt="HaulHub trailer hero"
          className="w-full h-full object-contain block"
        />
      </section>
    </main>
  );
};

export default Container;
