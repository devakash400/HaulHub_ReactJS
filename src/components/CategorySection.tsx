import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useModalNavigate from "../hooks/useModalNavigate.ts";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { images } from "../assets/images/index.ts";
import { RootState } from "../store/index.ts";
import {
  toggleWishlistItem,
  removeWishlistItem as removeWishlistItemAction,
} from "../store/wishlistSlice.ts";
import { addWishlistItem, deleteWishlistItem } from "../api/wishlistApi.ts";

import { WishlistLoginModal } from "./TrailerDetails/WishlistLoginModal.tsx";
import { Heart } from "lucide-react";

type CategoryItem = {
  id: string | number;
  image: string;
  modelLabel: string;
  priceLabel: string;
  badgeLabel?: string;
  averageRating?: number;
  totalRatings?: number;
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
  const modalNavigate = useModalNavigate();
  const dispatch = useDispatch();

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

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

  const [cardsPerRow, setCardsPerRow] = useState(2);

  // RESPONSIVE CARD COUNT
  useEffect(() => {
    const updateCardsPerRow = () => {
      const width = window.innerWidth;

      if (width >= 1700) {
        setCardsPerRow(5);
      } else if (width >= 1100) {
        setCardsPerRow(4);
      } else if (width >= 768) {
        setCardsPerRow(3);
      } else {
        setCardsPerRow(2);
      }
    };

    updateCardsPerRow();

    window.addEventListener("resize", updateCardsPerRow);

    return () => {
      window.removeEventListener("resize", updateCardsPerRow);
    };
  }, []);

  // SYNC WISHLIST
  useEffect(() => {
    const ids = wishlistItems.map((w) => {
      const num = Number(w.id);
      return Number.isNaN(num) ? w.id : num;
    });

    setWishlistIds(new Set(ids));
  }, [wishlistItems]);

  // SECTION ANIMATION
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
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  // SCROLL BUTTONS
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

  const toggleWishlist = async (item: CategoryItem) => {
    if (!isAuthenticated) {
      setWishlistLoginOpen(true);
      return;
    }

    const id = item.id;
    const wishlisted = wishlistIds.has(id);

    try {
      if (wishlisted) {
        await deleteWishlistItem(String(id));
        dispatch(removeWishlistItemAction(id));
        toast.success("Removed from wishlist");
      } else {
        await addWishlistItem(String(id));
        dispatch(
          toggleWishlistItem({
            id,
            title: item.modelLabel,
            subtitle: item.priceLabel,
            imageUrl: item.image,
          }),
        );
        toast.success("Added to wishlist");
      }
    } catch (error) {
      toast.error(
        wishlisted
          ? "Could not remove item from wishlist."
          : "Could not add item to wishlist.",
      );
      return;
    }

    setWishlistIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
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

    const firstCard = container.firstElementChild as HTMLElement;

    const scrollAmount = (firstCard?.offsetWidth || 300) + 32;

    container.scrollTo({
      left:
        direction === "left"
          ? container.scrollLeft - scrollAmount
          : container.scrollLeft + scrollAmount,

      behavior: "smooth",
    });
  };

  const isMobileCompact = cardsPerRow === 2;

  return (
    <section
      ref={sectionRef}
      className={`
        w-full
        bg-white
        overflow-hidden
        pt-8

        transition-all
        duration-700

        ${
          isSectionVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-3"
        }
      `}
    >
      <div className="w-full px-[16px] sm:px-[24px] md:px-[40px]">
        {/* HEADER */}
        <header className="flex items-center justify-between mb-5">
          <h2
            className="
              
              font-['Lexend']
              font-semibold
              text-[30px]
              leading-[100%]
              text-[#389131]
            "
          >
            {title}
          </h2>

          {/* ARROWS */}
          {!isMobileCompact && (
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                className="transition-all duration-200"
                style={{
                  opacity: !canScrollLeft ? 0.4 : 1,
                  cursor: !canScrollLeft ? "not-allowed" : "pointer",
                }}
              >
                <img
                  src={images.ArrowRight}
                  alt="Previous"
                  className="w-[40px] h-[40px] rotate-180"
                />
              </button>

              <button
                type="button"
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                className="transition-all duration-200"
                style={{
                  opacity: !canScrollRight ? 0.4 : 1,
                  cursor: !canScrollRight ? "not-allowed" : "pointer",
                }}
              >
                <img
                  src={images.ArrowRight}
                  alt="Next"
                  className="w-[40px] h-[40px]"
                />
              </button>
            </div>
          )}
        </header>

        {/* CARDS */}
        <div
          ref={scrollContainerRef}
          className={`
            flex
            overflow-x-auto
            scroll-smooth
            no-scrollbar
            w-full

            ${isMobileCompact ? "gap-3 pb-4" : "gap-8 pb-5"}
          `}
        >
          {items.map((item) => {
            const isWishlisted = wishlistIds.has(item.id);

            return (
              <article
                key={item.id}
                onClick={() => navigate(`/trailer/${item.id}`)}
                className={`
                  group
                  shrink-0
                  cursor-pointer

                  w-[calc((100%-12px)/2)]
                  md:w-[calc((100%-64px)/3)]
                  lg:w-[calc((100%-96px)/4)]
                  2xl:w-[calc((100%-128px)/5)]
                `}
              >
                {/* IMAGE */}
                <div
                  className="relative w-full
                 aspect-square rounded-[18px] overflow-hidden"
                >
                  <img
                    src={item.image}
                    alt={item.modelLabel}
                    className="
                      w-full
                      h-full
                      object-cover
                      transition-transform
                      duration-700
                      group-hover:scale-[1.04]
                    "
                  />

                  {/* BADGE */}
                  {item.averageRating !== undefined && item.averageRating > 0 && (
                    <span
                      className="
      absolute
      top-3
      left-3
      px-3
      py-1
      rounded-[9px]
      bg-white
      text-[11px]
      font-medium
      text-black
      shadow
    "
                    >
                      {item.averageRating.toFixed(1)} {!isAuthenticated ? "Guest favourite" : "Favourite"}
                    </span>
                  )}

                  {!isAuthenticated && (!item.averageRating || item.averageRating === 0) && (
                    <span
                      className="
      absolute
      top-3
      left-3
      px-3
      py-1
      rounded-[9px]
      bg-white
      text-[11px]
      font-medium
      text-black
      shadow
    "
                    >
                      Guest favourite
                    </span>
                  )}

                  {isAuthenticated && (!item.averageRating || item.averageRating === 0) && (
                    <span
                      className="
      absolute
      top-3
      left-3
      px-3
      py-1
      rounded-[9px]
      bg-white
      text-[11px]
      font-medium
      text-black
      shadow
    "
                    >
                      Favourite
                    </span>
                  )}

                  {/* WISHLIST */}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleWishlist(item);
                    }}
                    aria-pressed={isWishlisted}
                    aria-label={
                      isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                    }
                    className="
                      absolute
                      top-3
                      right-3
                      w-9
                      h-9
                      rounded-full
                      bg-white
                      border
                      border-[#E6E6E6]
                      shadow-md
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Heart
                      size={18}
                      strokeWidth={2.2}
                      color={isWishlisted ? "#E03A3A" : "#8B8B8B"}
                      fill={isWishlisted ? "#E03A3A" : "none"}
                    />
                  </button>
                </div>

                {/* TEXT */}
                <div className="pt-3 px-1">
                  <p
                    style={{
                      fontFamily: "Lexend",
                      fontWeight: 700,
                      fontSize: "15px",
                      lineHeight: "100%",
                      color: "#000000",
                    }}
                  >
                    {item.modelLabel}
                  </p>

                  <p
                    style={{
                      fontFamily: "Lexend",
                      fontWeight: 400,
                      fontSize: "16px",
                      lineHeight: "100%",
                      color: "#9B989E",
                      marginTop: "8px",
                    }}
                  >
                    {item.priceLabel}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* LOGIN MODAL */}
      <WishlistLoginModal
        isOpen={wishlistLoginOpen}
        onClose={() => setWishlistLoginOpen(false)}
        onLoginClick={() => {
          modalNavigate("/login");
        }}
      />
    </section>
  );
};
