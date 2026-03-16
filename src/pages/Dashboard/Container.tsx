import React from "react";
import { Search } from "lucide-react";
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

        {/* Search bar overlay */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[620px] sm:max-w-[720px] px-4 flex items-center justify-center">
          <div className="flex h-[56px] w-full items-center rounded-3xl bg-white px-4 shadow-[0_18px_35px_rgba(15,23,42,0.25)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#929191] mr-3">
              <Search className="w-5 h-5 text-white" />
            </div>
            <input
              type="text"
              placeholder="Search here..."
              className="flex-1 border-none bg-transparent text-[0.95rem] text-gray-700 placeholder:text-gray-400 outline-none text-center"
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Container;
