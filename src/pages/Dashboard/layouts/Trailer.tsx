import React, { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { getTrailerById, getTrailerTypeLabel } from "../../../assets/data/trailers.ts";
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

const Trailer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const trailer = id ? getTrailerById(Number(id)) : undefined;
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [wishlistLoginOpen, setWishlistLoginOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
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

  if (!trailer) {
    return <Navigate to="/" replace />;
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

  const handleSaveClick = () => {
    const isLoggedIn =
      typeof window !== "undefined" &&
      localStorage.getItem("isLoggedIn") === "true";

    if (!isLoggedIn) {
      setWishlistLoginOpen(true);
    } else {
      const current = readWishlistFromStorage();
      const trailerId = String(trailer.id);
      const exists = current.some((item) => item.id === trailerId);

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
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setWishlistItems((prev) => {
      const next = prev.filter(
        (item) => String(item.id) !== String(itemId)
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("wishlistItems", JSON.stringify(next));
      }
      if (next.length === 0) {
        setWishlistOpen(false);
      }
      return next;
    });
  };

  const handleClearAll = () => {
    setWishlistItems(() => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("wishlistItems");
      }
      return [];
    });
  };

  return (
    <div className="min-h-screen bg-background w-full min-w-0 overflow-x-hidden">
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
          onLoginClick={() => {
            if (typeof window !== "undefined") {
              localStorage.setItem("isLoggedIn", "true");
            }
          }}
        />

        <WishlistModal
          isOpen={wishlistOpen}
          onClose={() => setWishlistOpen(false)}
          items={wishlistItems}
          onRemoveItem={handleRemoveItem}
          onClearAll={handleClearAll}
        />

        <TrailerImageGallery images={trailer.images} trailerId={trailer.id} />

        <div className="mb-3">
          <p className="text-base sm:text-lg font-medium text-gray-900">
            {locationText}
          </p>
          <p className="text-sm text-gray-600">
            {trailer.specs}
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2 space-y-8">
            <RatingSummaryCard
              rating={trailer.rating}
              description={trailer.ratingDescription}
              reviewCount={trailer.reviewCount}
            />

            <FeatureIconsSection features={trailer.features} />

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
            <StickyPricingCard
              price={trailer.price}
              trailer={{
                title: locationText,
                subtitle: trailer.specs,
                image: trailer.images[0] ?? "",
                price: trailer.price,
              }}
            />
          </div>
        </div>

    {/* bottom section  */}
    
        <div className="mt-8 space-y-8">
        <GuestFavouriteSection
              rating={trailer.guestFavouriteRating}
              title="Guest Favourite"
              description={trailer.guestFavouriteDescription}
              metrics={trailer.metrics}
              ratingBreakdown={trailer.ratingBreakdown}
            />
        <ReviewsSection reviews={trailer.reviews} />

        <PolicySection />

        </div>
      </div>
    </div>
  );
};

export default Trailer;