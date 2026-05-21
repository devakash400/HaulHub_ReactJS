import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getTrailerTypeLabel,
  type TrailerDetail,
  type TrailerReview,
} from "../../../assets/data/trailers.ts";
import {
  resolveTrailerForRoute,
  fetchTrailerReviews,
} from "../../../api/trailersApi.ts";
import { API_BASE_URL } from "../../../api/api.ts";
import { resolveMediaUrl } from "../../../api/media.ts";
import { openAuthModal } from "../../../app/authModal.ts";
import {
  TrailerTitleSection,
  TrailerImageGallery,
  RatingSummaryCard,
  FeatureIconsSection,
  StickyPricingCard,
  GuestFavouriteSection,
  ReviewsSection,
  PolicySection,
  ShareTrailerModal,
  WishlistLoginModal,
  WishlistModal,
  WishlistItem,
} from "../../../components/TrailerDetails/index.ts";
import { RootState } from "../../../store";
import {
  addWishlistItem,
  deleteWishlistItem,
} from "../../../api/wishlistApi.ts";

type RevealSectionProps = {
  children: React.ReactNode;
  delayMs?: number;
  variant?: "default" | "soft";
};

const RevealSection: React.FC<RevealSectionProps> = ({
  children,
  delayMs = 0,
  variant = "default",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  useEffect(() => {
    const target = sectionRef.current;
    if (
      !target ||
      typeof IntersectionObserver === "undefined" ||
      reduceMotion
    ) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -70px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [reduceMotion]);

  return (
    <div
      ref={sectionRef}
      className={`will-change-transform transition-all duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100 blur-0"
          : variant === "soft"
            ? "opacity-0 translate-y-3 scale-[0.995] blur-[1px]"
            : "opacity-0 translate-y-5 scale-[0.99] blur-[1px]"
      }`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
};

const Trailer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trailer, setTrailer] = useState<TrailerDetail | null>(null);
  const [backendReviews, setBackendReviews] = useState<TrailerReview[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [wishlistLoginOpen, setWishlistLoginOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [heroParallaxY, setHeroParallaxY] = useState(0);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("wishlistItems");
      if (!stored) return [];
      const parsed = JSON.parse(stored) as WishlistItem[];
      const normalized = Array.isArray(parsed)
        ? parsed.map((item) => ({ ...item, id: String(item.id) }))
        : [];
      localStorage.setItem("wishlistItems", JSON.stringify(normalized));
      return normalized;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId = 0;
    const updateParallax = () => {
      const y = window.scrollY;
      setHeroParallaxY(Math.max(-14, y * -0.04));
      rafId = 0;
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateParallax);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    window.scrollTo(0, 0);
    const rafId = window.requestAnimationFrame(() => window.scrollTo(0, 0));

    return () => {
      window.cancelAnimationFrame(rafId);
      window.history.scrollRestoration = previousRestoration;
    };
  }, [id]);

  const resolveAvatarUrl = (path?: string): string => {
    return resolveMediaUrl(path, "");
  };

  const mapApiReview = (review: {
    _id: string;
    trailerId: string;
    bookingId: string;
    userId: { _id: string; fullName: string; profilePicture?: string };
    rating: number;
    message: string;
    createdAt: string;
  }): TrailerReview => ({
    avatar: resolveAvatarUrl(review.userId.profilePicture),
    name: review.userId.fullName || "Guest",
    stars: review.rating || 5,
    context: new Date(review.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    text: review.message || "",
  });

  useEffect(() => {
    if (!id) {
      setTrailer(null);
      setLoadState("error");
      return;
    }
    let cancelled = false;
    setLoadState("loading");
    setTrailer(null);
    void (async () => {
      const resolved = await resolveTrailerForRoute(id);
      if (cancelled) return;
      if (resolved) {
        setTrailer(resolved);
        setLoadState("ready");
      } else {
        setTrailer(null);
        setLoadState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) {
      setBackendReviews([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      const result = await fetchTrailerReviews(id);
      if (cancelled) return;
      if (result) {
        setBackendReviews(result.map(mapApiReview));
      } else if (trailer?.reviews?.length) {
        setBackendReviews(trailer.reviews);
      } else {
        setBackendReviews([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, trailer?.reviews]);

  if (loadState === "loading") {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 px-4">
        <div className="flex items-center justify-center py-6">
          <div
            className="w-8 h-8 border-4 border-[#389131] border-t-transparent rounded-full animate-spin"
            aria-label="Loading"
          />
        </div>
      </div>
    );
  }

  if (loadState === "error" || !trailer) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-gray-800 font-medium">
          We couldn&apos;t load this trailer.
        </p>
        <p className="text-gray-600 text-sm max-w-md">
          It may have been removed or the link is invalid. Return home to keep
          browsing.
        </p>
        <Link
          to="/"
          className="text-[#389131] font-medium underline hover:no-underline"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const typeLabel = getTrailerTypeLabel(trailer.type);
  const locationText = `${typeLabel} – ${trailer.location}`;
  const trailerLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/trailer/${id}`
      : `/trailer/${id}`;

  const readWishlistFromStorage = (): WishlistItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("wishlistItems");
      if (!stored) return [];
      const parsed = JSON.parse(stored) as WishlistItem[];
      const normalized = Array.isArray(parsed)
        ? parsed.map((item) => ({ ...item, id: String(item.id) }))
        : [];
      localStorage.setItem("wishlistItems", JSON.stringify(normalized));
      return normalized;
    } catch {
      return [];
    }
  };

  const handleSaveClick = async () => {
    if (!isAuthenticated) {
      setWishlistLoginOpen(true);
      return;
    }

    const current = readWishlistFromStorage();
    const trailerId = String(trailer.id);
    const exists = current.some((item) => item.id === trailerId);

    if (!exists) {
      try {
        await addWishlistItem(trailerId);
        toast.success("Added to wishlist");
      } catch (error) {
        toast.error("Could not add trailer to wishlist.");
        return;
      }
    }

    const next: WishlistItem[] = exists
      ? current
      : [
          ...current,
          {
            id: trailerId,
            title: trailer.title,
            subtitle: trailer.specs,
            imageUrl: trailer.images[0] ?? "",
          },
        ];

    if (typeof window !== "undefined") {
      localStorage.setItem("wishlistItems", JSON.stringify(next));
    }

    setWishlistItems(next);
    setWishlistOpen(true);
  };

  const handleRemoveItem = async (itemId: string) => {
    if (isAuthenticated) {
      try {
        await deleteWishlistItem(String(itemId));
        toast.success("Removed from wishlist");
      } catch (error) {
        toast.error("Could not remove item from wishlist.");
      }
    }

    setWishlistItems((prev) => {
      const next = prev.filter((item) => String(item.id) !== String(itemId));
      if (typeof window !== "undefined") {
        localStorage.setItem("wishlistItems", JSON.stringify(next));
      }
      if (next.length === 0) {
        setWishlistOpen(false);
      }
      return next;
    });
  };

  const handleClearAll = async () => {
    if (isAuthenticated) {
      try {
        await Promise.all(
          wishlistItems.map((item) => deleteWishlistItem(String(item.id))),
        );
      } catch (error) {
        toast.error("Could not clear wishlist from server.");
      }
    }

    setWishlistItems(() => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("wishlistItems");
      }
      return [];
    });
  };

  return (
    <div className="min-h-screen bg-[#ffffff] w-full min-w-0 overflow-x-hidden scroll-smooth">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-5 w-full min-w-0">
        <TrailerTitleSection
          title={trailer.title}
          location={locationText}
          specs={trailer.specs}
          onShareClick={() => setShareModalOpen(true)}
          onSaveClick={handleSaveClick}
        />

        <ShareTrailerModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          trailerTitle={locationText}
          trailerImage={trailer.images[0] ?? ""}
          trailerDescription={trailer.specs}
          trailerLink={trailerLink}
        />

        <WishlistLoginModal
          isOpen={wishlistLoginOpen}
          onClose={() => setWishlistLoginOpen(false)}
          onLoginClick={() => openAuthModal("login")}
        />

        <WishlistModal
          isOpen={wishlistOpen}
          onClose={() => setWishlistOpen(false)}
          items={wishlistItems}
          onRemoveItem={handleRemoveItem}
          onClearAll={handleClearAll}
        />

        <RevealSection variant="soft">
          <div
            style={{ transform: `translateY(${heroParallaxY}px)` }}
            className="will-change-transform transition-transform duration-300 ease-out"
          >
            <TrailerImageGallery
              images={trailer.images}
              trailerId={id ?? trailer.id}
            />
          </div>
        </RevealSection>

        <RevealSection delayMs={80} variant="soft">
          <div className="mb-4 space-y-[10px]">
            <p
              className="font-medium text-black text-[30px] leading-[100%] tracking-[0%]"
              style={{ fontFamily: "Lexend", verticalAlign: "middle" }}
            >
              {locationText}
            </p>
            <p
              className="text-[19px] font-normal leading-[100%] tracking-[0%] text-black"
              style={{ fontFamily: "Lexend", verticalAlign: "middle" }}
            >
              {trailer.specs}
            </p>
          </div>
        </RevealSection>

        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2 space-y-8">
            <RevealSection variant="soft">
              <RatingSummaryCard
                rating={trailer.rating}
                description={trailer.ratingDescription}
                reviewCount={trailer.reviewCount}
              />
            </RevealSection>

            <RevealSection delayMs={100} variant="soft">
              <FeatureIconsSection features={trailer.features} />
            </RevealSection>

            {/* <GuestFavouriteSection
              rating={trailer.guestFavouriteRating}
              title="Guest Favourite"
              description={trailer.guestFavouriteDescription}
              metrics={trailer.metrics}
            /> */}

            {/* <ReviewsSection reviews={trailer.reviews} /> */}

            {/* <PolicySection /> */}
          </div>

          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <RevealSection delayMs={140} variant="soft">
              <StickyPricingCard
                trailerId={id ?? String(trailer.id)}
                price={trailer.price}
                trailer={{
                  title: locationText,
                  subtitle: trailer.specs,
                  image: trailer.images[0] ?? "",
                  price: trailer.price,
                }}
              />
            </RevealSection>
          </div>
        </div>

        {/* bottom section  */}

        <div className="mt-4 space-y-4">
          <RevealSection variant="soft">
            <GuestFavouriteSection
              rating={trailer.guestFavouriteRating}
              title="Guest Favourite"
              description={trailer.guestFavouriteDescription}
              metrics={trailer.metrics}
              ratingBreakdown={trailer.ratingBreakdown}
            />
          </RevealSection>

          <RevealSection delayMs={100} variant="soft">
            <ReviewsSection
              reviews={
                backendReviews.length > 0 ? backendReviews : trailer.reviews
              }
              onShowAll={() => {
                if (!isAuthenticated) {
                  openAuthModal("login");
                } else if (id) {
                  navigate(`/trailer/${id}/reviews`);
                }
              }}
            />
          </RevealSection>

          <RevealSection delayMs={140} variant="soft">
            <PolicySection />
          </RevealSection>
        </div>
      </div>
    </div>
  );
};

export default Trailer;
