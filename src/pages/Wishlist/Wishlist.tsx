// import React, { useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { toast } from "react-toastify";
// import { WishlistItem } from "../../components/TrailerDetails/WishlistModal.tsx";
// import { RootState } from "../../store/index.ts";
// import {
//   toggleWishlistItem,
//   clearWishlist,
//   setWishlist,
//   removeWishlistItem,
// } from "../../store/wishlistSlice.ts";
// import { fetchWishlist, deleteWishlistItem } from "../../api/wishlistApi.ts";
// import { images } from "../../assets/images/index.ts";

// const Wishlist: React.FC = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const items = useSelector<RootState, WishlistItem[]>(
//     (state) => state.wishlist.items,
//   );
//   const isAuthenticated = useSelector<RootState, boolean>(
//     (state) => state.auth.isAuthenticated,
//   );

//   useEffect(() => {
//     if (!isAuthenticated) return;

//     let cancelled = false;

//     const loadWishlist = async () => {
//       try {
//         const wishlist = await fetchWishlist(1, 20);
//         if (!cancelled) {
//           dispatch(setWishlist(wishlist));
//         }
//       } catch (error) {
//         console.error("Failed to load wishlist", error);
//       }
//     };

//     loadWishlist();

//     return () => {
//       cancelled = true;
//     };
//   }, [dispatch, isAuthenticated]);

//   const handleToggleItem = async (item: WishlistItem) => {
//     if (isAuthenticated) {
//       try {
//         await deleteWishlistItem(String(item.id));
//         dispatch(removeWishlistItem(item.id));
//         toast.success("Removed from wishlist");
//       } catch (error) {
//         toast.error("Could not remove item from wishlist.");
//       }
//       return;
//     }

//     dispatch(
//       toggleWishlistItem({
//         id: item.id,
//         title: item.title,
//         subtitle: item.subtitle,
//         imageUrl: item.imageUrl,
//       }),
//     );
//   };

//   const handleClearAll = async () => {
//     if (isAuthenticated) {
//       try {
//         await Promise.all(
//           items.map((item) => deleteWishlistItem(String(item.id))),
//         );
//       } catch (error) {
//         toast.error("Could not clear wishlist from server.");
//       }
//     }
//     dispatch(clearWishlist());
//   };

//   const hasItems = items.length > 0;

//   return (
//     <div className="min-h-screen bg-background w-full min-w-0 overflow-x-hidden">
//       <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full min-w-0">
//         <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div>
//             <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
//               Wishlist
//             </h1>
//             <p className="mt-1 text-sm text-gray-600 max-w-xl">
//               Save trailers you love and quickly compare options when
//               you&apos;re ready to book.
//             </p>
//           </div>

//           {hasItems && (
//             <button
//               type="button"
//               onClick={handleClearAll}
//               className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
//             >
//               Clear all
//             </button>
//           )}
//         </header>

//         {hasItems ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {items.map((item) => (
//               <article
//                 key={item.id}
//                 className="flex flex-col rounded-2xl border border-[#D2C7B3] bg-[#F7F1E4] overflow-hidden shadow-sm"
//               >
//                 <button
//                   type="button"
//                   onClick={() => navigate(`/trailer/${item.id}`)}
//                   className="relative block text-left"
//                 >
//                   <img
//                     src={item.imageUrl}
//                     alt={item.title}
//                     className="w-full h-56 object-cover"
//                   />
//                   <button
//                     type="button"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleToggleItem(item);
//                     }}
//                     className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md hover:bg-white/90 transition-colors"
//                     aria-label="Remove from wishlist"
//                   >
//                     <img
//                       src={images.Wishlist}
//                       alt="Wishlist"
//                       className="w-[18px] h-[18px] object-contain"
//                       style={{
//                         filter:
//                           "invert(25%) sepia(93%) saturate(7480%) hue-rotate(357deg) brightness(99%) contrast(115%)",
//                       }}
//                     />
//                   </button>
//                 </button>

//                 <div className="px-4 py-3 flex-1 flex flex-col items-center text-center">
//                   <h2 className="text-sm sm:text-base font-semibold text-gray-900">
//                     {item.title}
//                   </h2>
//                   {item.subtitle && (
//                     <p className="mt-1 text-[11px] sm:text-xs text-gray-700">
//                       {item.subtitle}
//                     </p>
//                   )}

//                   <div className="mt-2 w-full flex items-center justify-end">
//                     <button
//                       type="button"
//                       onClick={() => handleToggleItem(item)}
//                       className="text-xs font-medium text-[#389131] underline"
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 </div>
//               </article>
//             ))}
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center py-16 text-center">
//             <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 text-2xl">
//               &#10084;
//             </div>
//             <p className="text-lg font-semibold text-gray-900 mb-1">
//               Your wishlist is empty
//             </p>
//             <p className="text-sm text-gray-600 mb-6 max-w-sm">
//               Tap the heart on any trailer to save it here and easily revisit
//               your favourites.
//             </p>
//             <Link
//               to="/"
//               className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#389131] text-white text-sm font-medium hover:bg-[#2f7829] transition-colors"
//             >
//               Browse trailers
//             </Link>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Wishlist;
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Heart } from "lucide-react";
import { WishlistItem } from "../../components/TrailerDetails/WishlistModal.tsx";
import { RootState } from "../../store/index.ts";
import {
  toggleWishlistItem,
  clearWishlist,
  setWishlist,
  removeWishlistItem,
} from "../../store/wishlistSlice.ts";
import { fetchWishlist, deleteWishlistItem } from "../../api/wishlistApi.ts";
import { images } from "../../assets/images/index.ts";

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

  const handleClearAll = async () => {
    if (isAuthenticated) {
      try {
        await Promise.all(
          items.map((item) => deleteWishlistItem(String(item.id))),
        );
      } catch {
        toast.error("Could not clear wishlist");
      }
    }

    dispatch(clearWishlist());
  };

  const hasItems = items.length > 0;

  return (
    <div className="min-h-screen bg-[#F6F3E9]">
      <div className="px-[40px] py-[30px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-[47px] font-semibold leading-[100%] tracking-[0px] align-middle text-black">
            Wishlist
          </h1>
        </div>

        {hasItems ? (
          <div
            className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-x-[100px]
            gap-y-[40px]
            "
          >
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/trailer/${item.id}`)}
                className="
                cursor-pointer
                h-[440px]
                "
              >
                {/* Image */}
                <div
                  className="
                  relative
                  rounded-[13px]
                  overflow-hidden
                  "
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="
                    w-full
                    h-[350px]
                    object-cover
                    "
                  />

                  {/* Heart Icon */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();

                      handleToggleItem(item);
                    }}
                    className="
                    absolute
                    top-3
                    right-3
                    w-9
                    h-9
                    rounded-full
                    bg-white
                    shadow-md
                    border
                    border-[#E6E6E6]
                    flex
                    items-center
                    justify-center
                    "
                    aria-label="Remove from wishlist"
                  >
                    <Heart
                      size={18}
                      strokeWidth={2.5}
                      color="#E03A3A"
                      fill="#E03A3A"
                    />
                  </button>
                </div>

                {/* Content */}

                <div className="pt-4">
                  {/* Title + Remove */}

                  <div
                    className="
                    flex
                    items-center
                    justify-between
                    "
                  >
                    <h2
                      className="
    flex-1
    text-center
    text-[17px]
    font-normal
    leading-[100%]
    tracking-[0px]
    align-middle
    text-black
  "
                    >
                      {item.title}
                    </h2>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();

                        handleToggleItem(item);
                      }}
                      className="
    text-[14px]
    font-normal
    leading-[100%]
    tracking-[0px]
    text-center
    align-middle
    underline
    decoration-[1px]
    underline-offset-[2px]
    decoration-skip-ink-none
    text-[#389131]
    whitespace-nowrap
  "
                    >
                      Remove
                    </button>
                  </div>

                  {/* Description */}

                  {item.description && (
                    <p
                      className="
    mt-2
    text-center
    text-[14px]
    font-normal
    leading-[100%]
    tracking-[0px]
    align-middle
    text-black
  "
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="
            flex
            flex-col
            items-center
            py-20
            "
          >
            <div className="text-5xl mb-4">❤️</div>

            <h2
              className="
              text-xl
              font-semibold
              "
            >
              Your wishlist is empty
            </h2>

            <p
              className="
              mt-2
              text-gray-500
              text-center
              "
            >
              Save trailers and revisit later
            </p>

            <Link
              to="/"
              className="
              mt-6
              px-6
              py-3
              rounded-full
              bg-[#389131]
              text-white
              "
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
