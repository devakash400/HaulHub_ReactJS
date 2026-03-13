import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { WishlistItem } from "../../components/TrailerDetails/WishlistModal.tsx";
import { RootState } from "../../store/index.ts";
import { toggleWishlistItem, clearWishlist } from "../../store/wishlistSlice.ts";
import { images } from "../../assets/images/index.ts";

const Wishlist: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector<RootState, WishlistItem[]>(
    (state) => state.wishlist.items
  );

  const handleToggleItem = (item: WishlistItem) => {
    dispatch(
      toggleWishlistItem({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        imageUrl: item.imageUrl,
      })
    );
  };

  const handleClearAll = () => {
    dispatch(clearWishlist());
  };

  const hasItems = items.length > 0;

  return (
    <div className="min-h-screen bg-background w-full min-w-0 overflow-x-hidden">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full min-w-0">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Wishlist
            </h1>
            <p className="mt-1 text-sm text-gray-600 max-w-xl">
              Save trailers you love and quickly compare options when you&apos;re
              ready to book.
            </p>
          </div>

          {hasItems && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear all
            </button>
          )}
        </header>

        {hasItems ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex flex-col rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white"
              >
                <button
                  type="button"
                  onClick={() => navigate(`/trailer/${item.id}`)}
                  className="relative block text-left"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleItem(item);
                    }}
                    className="absolute top-3 right-3 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 shadow-md hover:bg-white transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <img
                      src={images.Wishlist}
                      alt="Wishlist"
                      className="w-[18px] h-[18px] object-contain"
                      style={{
                        filter:
                          "invert(25%) sepia(93%) saturate(7480%) hue-rotate(357deg) brightness(99%) contrast(115%)",
                      }}
                    />
                  </button>
                </button>

                <div className="px-4 py-3 flex-1 flex flex-col">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">
                    {item.title}
                  </h2>
                  {item.subtitle && (
                    <p className="mt-1 text-xs sm:text-sm text-gray-600 line-clamp-2">
                      {item.subtitle}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <Link
                      to={`/trailer/${item.id}`}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#389131] text-white text-sm font-medium hover:bg-[#2f7829] transition-colors"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 text-2xl">
              &#10084;
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-1">
              Your wishlist is empty
            </p>
            <p className="text-sm text-gray-600 mb-6 max-w-sm">
              Tap the heart on any trailer to save it here and easily revisit
              your favourites.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#389131] text-white text-sm font-medium hover:bg-[#2f7829] transition-colors"
            >
              Browse trailers
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

