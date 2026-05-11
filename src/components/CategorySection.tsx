import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { images } from "../assets/images/index.ts";
import { RootState } from "../store/index.ts";
import { toggleWishlistItem } from "../store/wishlistSlice.ts";
import { WishlistLoginModal } from "./TrailerDetails/WishlistLoginModal.tsx";

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
  const dispatch = useDispatch();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [cardsPerRow, setCardsPerRow] = useState(1);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const [wishlistIds, setWishlistIds] = useState<Set<string | number>>(() => {
    const ids = wishlistItems.map((w) => {
      const num = Number(w.id);
      return Number.isNaN(num) ? w.id : num;
    });
    return new Set(ids);
  });
  const [wishlistLoginOpen, setWishlistLoginOpen] = useState(false);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // sync initial wishlist ids from redux
    const ids = wishlistItems.map((w) => {
      const num = Number(w.id);
      return Number.isNaN(num) ? w.id : num;
    });
    setWishlistIds(new Set(ids));

    const updateCardsPerRow = () => {
      const width = window.innerWidth;

      if (width >= 1200) {
        setCardsPerRow(4); // PC
      } else if (width >= 768) {
        setCardsPerRow(3); // Tablet
      } else {
        setCardsPerRow(2); // Phone: 2 cards per row
      }
    };

    updateCardsPerRow();
    window.addEventListener("resize", updateCardsPerRow);

    return () => {
      window.removeEventListener("resize", updateCardsPerRow);
    };
  }, [wishlistItems]);

  useEffect(() => {
    const target = sectionRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      setIsSectionVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsSectionVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateScrollButtons = () => {
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      const epsilon = 2;
      setCanScrollLeft(container.scrollLeft > epsilon);
      setCanScrollRight(container.scrollLeft < maxScrollLeft - epsilon);
    };

    updateScrollButtons();
    container.addEventListener("scroll", updateScrollButtons, {
      passive: true,
    });
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [items.length, cardsPerRow]);

  const cardWidth = 288;
  const gap = 32; // 2rem
  const sectionContentWidth = cardsPerRow * cardWidth + (cardsPerRow - 1) * gap;
  const isMobileCompact = cardsPerRow === 2;

  const toggleWishlist = (item: CategoryItem) => {
    if (!isAuthenticated) {
      setWishlistLoginOpen(true);
      return;
    }

    const id = item.id;

    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    dispatch(
      toggleWishlistItem({
        id,
        title: item.modelLabel,
        subtitle: item.priceLabel,
        imageUrl: item.image,
      }),
    );
  };

  const handleScroll = (direction: "left" | "right") => {
    if (
      (direction === "left" && !canScrollLeft) ||
      (direction === "right" && !canScrollRight)
    ) {
      return;
    }
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.firstElementChild
      ? (container.firstElementChild as HTMLElement).offsetWidth + gap
      : cardWidth + gap; // slide by exactly one card

    container.scrollTo({
      left:
        direction === "left"
          ? container.scrollLeft - scrollAmount
          : container.scrollLeft + scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={sectionRef}
      className={`w-full min-w-0 pt-6 bg-white self-center overflow-x-hidden transition-all duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
        isSectionVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3"
      }`}
    >
      <div className="max-w-full box-border w-full min-w-0">
        <div
          className="mx-auto"
          style={{
            maxWidth: isMobileCompact ? "100%" : `${sectionContentWidth}px`,
          }}
        >
          <header className="flex items-center justify-between mb-4">
            <h2 className="m-0 font-['Lexend'] font-semibold text-[30px] leading-[100%] text-[#389131]">
              {title}
            </h2>

            <div
              className={`items-center gap-[2px] ${isMobileCompact ? "hidden" : "flex"}`}
            >
              <button
                type="button"
                onClick={() => handleScroll("left")}
                aria-label="Scroll left"
                disabled={!canScrollLeft}
                className={`flex items-center justify-center rounded-full p-1 border-0 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 bg-white active:bg-gray-200`}
                style={{
                  opacity: !canScrollLeft ? 0.4 : 1,
                  cursor: !canScrollLeft ? "not-allowed" : "pointer",
                  pointerEvents: !canScrollLeft ? "none" : "auto",
                }}
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
                disabled={!canScrollRight}
                className={`flex items-center justify-center rounded-full p-1 border-0 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 bg-white active:bg-gray-200`}
                style={{
                  opacity: !canScrollRight ? 0.4 : 1,
                  cursor: !canScrollRight ? "not-allowed" : "pointer",
                  pointerEvents: !canScrollRight ? "none" : "auto",
                }}
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
            className={
              isMobileCompact
                ? "flex gap-3 overflow-x-auto pb-4 scroll-smooth"
                : "flex gap-8 overflow-x-auto pb-6 scroll-smooth"
            }
            style={{
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            {items.map((item, index) => {
              const isWishlisted = wishlistIds.has(item.id);

              return (
                <article
                  key={item.id}
                  onClick={() => navigate(`/trailer/${item.id}`)}
                  className="group w-[288px] shrink-0 cursor-pointer"
                >
                  {/* IMAGE BOX */}
                  <div className="relative w-full h-[283px] rounded-[18px] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.modelLabel}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />

                    {/* BADGE */}
                    {item.badgeLabel && (
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-[9px] bg-white text-[11px] font-medium text-black shadow">
                        {item.badgeLabel}
                      </span>
                    )}

                    {/* WISHLIST */}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleWishlist(item);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full  flex items-center justify-center"
                    >
                      <img
                        src={images.Wishlist}
                        alt="Wishlist"
                        className="w-[18px] h-[18px]"
                      />
                    </button>
                  </div>

                  {/* TEXT BELOW IMAGE */}
                  <div className="pt-2 px-1">
                    <p className="text-black font-bold text-[16px] leading-tight">
                      {item.modelLabel}
                    </p>

                    <p className="text-[#9CA3AF] font-semibold text-[15px] mt-1">
                      {item.priceLabel}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <WishlistLoginModal
        isOpen={wishlistLoginOpen}
        onClose={() => setWishlistLoginOpen(false)}
        onLoginClick={() => navigate("/login")}
      />
    </section>
  );
};
