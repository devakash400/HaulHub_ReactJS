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
          <h1 className="text-[32px] md:text-[40px] font-semibold text-[#111111]">
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
            <div className="flex justify-end mb-8">
              <button
                onClick={() => dispatch(clearWishlist())}
                className="
                  border
                  border-[#D7D7D7]
                  px-5
                  py-2.5
                  rounded-full
                  text-sm
                  hover:bg-white
                  transition
                "
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {validItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/trailer/${item.id}`)}
                  className="cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative rounded-[18px] overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-[360px] object-cover"
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
                        top-4
                        right-4
                        w-10
                        h-10
                        rounded-full
                        bg-white
                        flex
                        items-center
                        justify-center
                        shadow-md
                      "
                    >
                      <Heart size={18} fill="#E53935" color="#E53935" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="pt-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 text-center">
                        <h2 className="text-[18px] font-medium text-black">
                          {item.title}
                        </h2>

                        {item.description && (
                          <p
                            className="mt-2 
                          text-[14px] text-[#5E5E5E]"
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
                          text-[14px]
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
