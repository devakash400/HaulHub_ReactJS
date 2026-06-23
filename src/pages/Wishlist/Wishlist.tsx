import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Heart } from "lucide-react";
import { toast } from "react-toastify";

import { WishlistItem } from "../../components/TrailerDetails/WishlistModal.tsx";
import { RootState } from "../../store/index.ts";

import {
  toggleWishlistItem,
  clearWishlist,
  setWishlist,
  removeWishlistItem,
} from "../../store/wishlistSlice.ts";

import { fetchWishlist, deleteWishlistItem } from "../../api/wishlistApi.ts";

const Wishlist: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = useSelector<RootState, WishlistItem[]>(
    (state) => state.wishlist.items,
  );

  const isAuthenticated = useSelector<RootState, boolean>(
    (state) => state.auth.isAuthenticated,
  );

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const loadWishlist = async () => {
      try {
        const wishlist = await fetchWishlist(1, 20);

        if (!cancelled) {
          dispatch(setWishlist(wishlist));
        }
      } catch (error) {
        console.error("Failed to load wishlist", error);
      }
    };

    loadWishlist();

    return () => {
      cancelled = true;
    };
  }, [dispatch, isAuthenticated]);

  const handleToggleItem = async (item: WishlistItem) => {
    if (isAuthenticated) {
      try {
        await deleteWishlistItem(String(item.id));

        dispatch(removeWishlistItem(item.id));

        toast.success("Removed from wishlist");
      } catch {
        toast.error("Could not remove item");
      }

      return;
    }

    dispatch(
      toggleWishlistItem({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        imageUrl: item.imageUrl,
      }),
    );
  };

  const validItems = items.filter(
    (item) =>
      item.id?.toString().trim() && item.title?.trim() && item.imageUrl?.trim(),
  );

  const hasItems = validItems.length > 0;

  return (
    <div className="min-h-screen bg-[#F8F7F3]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-8">
        {/* Header */}
        <div className="mb-14">
          <h1 className="font-['Lexend'] font-semibold text-[30px] leading-[100%] text-[#389131]">
            Wishlist
          </h1>
          <p
            className="
    mt-3
    font-lexend
    font-light
    text-[20px]
    leading-[100%]
    tracking-[0%]
    text-black
  "
          >
            Save trailers you love and quickly compare options when you&apos;re
            ready to book.
          </p>
        </div>

        {/* Wishlist Items */}
        {hasItems ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-8 pb-5">
              {validItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/trailer/${item.id}`)}
                  className="cursor-pointer group"
                >
                  {/* Image */}
                  <div className="relative w-full aspect-square rounded-[18px] overflow-hidden border border-black">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />

                    {/* Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleItem(item);
                      }}
                      className="
                        absolute
                        top-2 sm:top-3
                        right-2 sm:right-3
                        w-7 sm:w-9
                        h-7 sm:h-9
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
                        className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                        strokeWidth={2.2}
                        color="#E03A3A" 
                        fill="#E03A3A" 
                      />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="pt-3 px-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 overflow-hidden">
                        <p
                          style={{
                            fontFamily: "Lexend",
                            fontWeight: 700,
                            fontSize: "15px",
                            lineHeight: "100%",
                            color: "#000000",
                          }}
                          className="truncate"
                        >
                          {item.title}
                        </p>

                        {item.description && (
                          <p
                            style={{
                              fontFamily: "Lexend",
                              fontWeight: 400,
                              fontSize: "16px",
                              lineHeight: "100%",
                              color: "#9B989E",
                              marginTop: "8px",
                            }}
                            className="truncate"
                          >
                            {item.description}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleItem(item);
                        }}
                        className="
                          text-[13px]
                          text-[#389131]
                          underline
                          whitespace-nowrap
                        "
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            {/* Heart Icon */}
            <div
              className="
                w-14
                h-14
                rounded-full
                bg-[#EFEFEF]
                flex
                items-center
                justify-center
                mb-5
              "
            >
              <Heart size={22} fill="#7B7B7B" color="#7B7B7B" />
            </div>

            {/* Title */}
            <h2
              className="
    font-lexend
    font-normal
    text-[27px]
    leading-[100%]
    tracking-[0%]
    text-black
  "
            >
              Your wishlist is empty
            </h2>

            {/* Subtitle */}
            <p
              className="
    mt-3
  
    font-lexend
    font-light
    text-[20px]
    leading-[100%]
    tracking-[0%]
    text-black
  "
            >
              Tap the heart on any trailer to save it here and easily revisit
              your favourites.
            </p>

            {/* Button */}
            <Link
              to="/"
              className="
                mt-8
                bg-[#389131]
                hover:bg-[#2F7B29]
                transition
                text-white
                font-medium
                px-8
                py-3
                rounded-[10px]
              "
            >
              Browse Trailer
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
