import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { images } from "../../assets/images/index.ts";

const SLIDES = [
  { src: images.Container, alt: "HaulHub trailer hero" },
  { src: images.Container, alt: "HaulHub trailer hero" },
  { src: images.Container, alt: "HaulHub trailer hero" },
];

const AUTO_PLAY_MS = 5000;

const Container: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const goTo = useCallback((i: number) => {
    setIndex((prev) => {
      if (i < 0) return SLIDES.length - 1;
      if (i >= SLIDES.length) return 0;
      return i;
    });
  }, []);

  const goPrev = () => goTo(index - 1);
  const goNext = () => goTo(index + 1);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, AUTO_PLAY_MS);
    return () => clearInterval(id);
  }, []);

  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (touchStart == null || touchEnd == null) return;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <main className="w-full min-w-0 m-0 p-0 font-sans overflow-x-hidden">
      <section
        className="relative w-full min-w-0 overflow-hidden rounded-none shadow-none mb-0 flex items-center justify-center bg-white sm:bg-black h-[220px] sm:h-[380px] lg:h-[560px]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex h-full w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className="h-full w-full flex-shrink-0 flex items-center justify-center"
            >
              <img
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-contain block"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous slide"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next slide"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === index ? "bg-[#389131] scale-125" : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Container;
