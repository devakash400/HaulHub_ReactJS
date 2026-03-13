import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { WishlistItem } from "../components/TrailerDetails/WishlistModal.tsx";

export interface WishlistState {
  items: WishlistItem[];
}

const readInitialWishlist = (): WishlistItem[] => {
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

const initialState: WishlistState = {
  items: readInitialWishlist(),
};

const persist = (items: WishlistItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("wishlistItems", JSON.stringify(items));
  } catch {
    // ignore quota errors
  }
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlist(state, action: PayloadAction<WishlistItem[]>) {
      state.items = action.payload;
      persist(state.items);
    },
    toggleWishlistItem(
      state,
      action: PayloadAction<Omit<WishlistItem, "id"> & { id: string | number }>
    ) {
      const idString = String(action.payload.id);
      const existing = state.items.find((i) => String(i.id) === idString);
      if (existing) {
        state.items = state.items.filter((i) => String(i.id) !== idString);
      } else {
        state.items.push({
          id: idString,
          title: action.payload.title,
          subtitle: action.payload.subtitle,
          imageUrl: action.payload.imageUrl,
        });
      }
      persist(state.items);
    },
    removeWishlistItem(state, action: PayloadAction<string | number>) {
      const idString = String(action.payload);
      state.items = state.items.filter((i) => String(i.id) !== idString);
      persist(state.items);
    },
    clearWishlist(state) {
      state.items = [];
      if (typeof window !== "undefined") {
        localStorage.removeItem("wishlistItems");
      }
    },
  },
});

export const {
  setWishlist,
  toggleWishlistItem,
  removeWishlistItem,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;

