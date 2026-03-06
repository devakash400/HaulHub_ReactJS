import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { images } from "../assets/images/index.ts";
import type { WishlistItem } from "./TrailerDetails/WishlistModal.tsx";

type CategoryItem = {
  id: string | number;
  image: string;
  modelLabel: string;
  priceLabel: string;
  badgeLabel?: string;
};

type CategorySectionProps = {
  title: string;
  items: CategoryItem[];
};

export const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  items,
}) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [cardsPerRow, setCardsPerRow] = useState(1);
  const [lastClickedDirection, setLastClickedDirection] = useState<
    "left" | "right" | null
  >(null);
  const [wishlistIds, setWishlistIds] = useState<Set<string | number>>(
    () => new Set()
  );

  useEffect(() => {
    // sync initial wishlist ids from localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("wishlistItems");
        if (stored) {
          const parsed = JSON.parse(stored) as WishlistItem[];
          const normalized = Array.isArray(parsed)
            ? parsed.map((w) => ({ ...w, id: String(w.id) }))
            : [];
          localStorage.setItem("wishlistItems", JSON.stringify(normalized));
          const ids = normalized.map((w) => {
            const num = Number(w.id);
            return Number.isNaN(num) ? w.id : num;
          });
          setWishlistIds(new Set(ids));
        }
      } catch {
        // ignore parse errors
      }
    }

    const updateCardsPerRow = () => {
      const width = window.innerWidth;

      if (width >= 1200) {
        setCardsPerRow(4); // PC
      } else if (width >= 768) {
        setCardsPerRow(3); // Tablet
      } else {
        setCardsPerRow(1); // Phone (auto)
      }
    };

    updateCardsPerRow();
    window.addEventListener("resize", updateCardsPerRow);

    return () => {
      window.removeEventListener("resize", updateCardsPerRow);
    };
  }, []);

  const cardWidth = 255;
  const gap = 32; // 2rem
  const sectionContentWidth =
    cardsPerRow * cardWidth + (cardsPerRow - 1) * gap;

  const toggleWishlist = (item: CategoryItem) => {
    const id = item.id;

    setWishlistIds((prev) => {
      const next = new Set(prev);

      let current: WishlistItem[] = [];
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("wishlistItems");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              current = parsed as WishlistItem[];
            }
          }
        } catch {
          // ignore parse errors
        }
      }

      const idString = String(id);
      const existsInWishlist = current.some(
        (w) => String(w.id) === idString
      );

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      let nextWishlist: WishlistItem[];
      if (existsInWishlist) {
        nextWishlist = current.filter(
          (w) => String(w.id) !== idString
        );
      } else {
        nextWishlist = [
          ...current,
          {
            id: idString,
            title: item.modelLabel,
            subtitle: item.priceLabel,
            imageUrl: item.image,
          },
        ];
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("wishlistItems", JSON.stringify(nextWishlist));
        } catch {
          // ignore quota errors
        }
      }

      return next;
    });
  };

  const handleScroll = (direction: "left" | "right") => {
    setLastClickedDirection(direction);
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = container.firstElementChild
      ? (container.firstElementChild as HTMLElement).offsetWidth + 32
      : 282; // 250 card + ~32 gap (2rem)
    const scrollAmount = cardWidth; // slide by exactly one card

    container.scrollTo({
      left:
        direction === "left"
          ? container.scrollLeft - scrollAmount
          : container.scrollLeft + scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full min-w-0 pt-6 bg-white self-center overflow-x-hidden">
      <div className="max-w-full mx-auto px-4 box-border w-full min-w-0">
        <div
          className="mx-auto"
          style={{ maxWidth: `${sectionContentWidth}px` }}
        >
          <header className="flex items-center justify-between mb-4">
            <h2 className="m-0 text-[1.15rem] font-semibold text-[#389131]">
              {title}
            </h2>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                aria-label="Scroll left"
                className={`flex items-center justify-center rounded-full p-1 border-0 cursor-pointer transition-colors ${
                  lastClickedDirection === "left"
                    ? "bg-gray-200"
                    : "bg-white active:bg-gray-200"
                }`}
              >
                <img
                  src={images.ArrowRight}
                  alt="Previous"
                  className="w-[30px] h-[30px] object-contain rotate-180"
                />
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                aria-label="Scroll right"
                className={`flex items-center justify-center rounded-full p-1 border-0 cursor-pointer transition-colors ${
                  lastClickedDirection === "right"
                    ? "bg-gray-200"
                    : "bg-white active:bg-gray-200"
                }`}
              >
                <img
                  src={images.ArrowRight}
                  alt="Next"
                  className="w-[30px] h-[30px] object-contain"
                />
              </button>
            </div>
          </header>

          <div
            ref={scrollContainerRef}
            className="flex gap-8 overflow-x-auto pb-6 scroll-smooth"
            style={{
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            {items.map((item) => {
              const isWishlisted = wishlistIds.has(item.id);

              return (
                <article
                  key={item.id}
                  onClick={() => navigate(`/trailer/${item.id}`)}
                  className="w-[250px] min-w-[250px] max-w-[250px] bg-white rounded-[16px] shadow-[0_10px_25px_rgba(15,23,42,0.1)] overflow-hidden shrink-0 cursor-pointer"
                >
                  <div className="relative w-full h-[250px] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.modelLabel}
                      className="w-full h-full object-cover block"
                    />

                    {item.badgeLabel && (
                      <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-white text-[0.7rem] text-gray-900 shadow-[0_6px_12px_rgba(15,23,42,0.22)]">
                        {item.badgeLabel}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleWishlist(item);
                      }}
                      aria-label="Save to favourites"
                      className="absolute top-3 right-3 w-7 h-7 rounded-full border-0 bg-white/90 flex items-center justify-center cursor-pointer p-0"
                    >
                      <img
                        src={images.Wishlist}
                        alt="Wishlist"
                        className="w-[18px] h-[18px] object-contain"
                        style={{
                          // keep the red tint when wishlisted
                          filter: isWishlisted
                            ? "invert(25%) sepia(93%) saturate(7480%) hue-rotate(357deg) brightness(99%) contrast(115%)"
                            : "none",
                        }}
                      />
                    </button>
                  </div>

                  <div className="px-[0.9rem] pt-[0.85rem] pb-4 flex flex-col gap-1">
                    <p className="m-0 text-[0.85rem] font-bold text-black">
                      {item.modelLabel}
                    </p>
                    <p className="m-0 text-[0.9rem] text-gray-500">
                      {item.priceLabel}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

