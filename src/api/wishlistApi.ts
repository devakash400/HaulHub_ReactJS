import api from "./api.ts";
import type { WishlistItem } from "../components/TrailerDetails/WishlistModal.tsx";

export type ApiWishlistEntry = {
  id?: string;
  _id?: string;
  // trailerId can be either a string id or an embedded trailer object
  trailerId?: any;
  title?: string;
  name?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  image?: string;
  thumbnail?: string;
};

type WishlistResponseData = {
  wishlist?: ApiWishlistEntry[];
  items?: ApiWishlistEntry[];
  list?: ApiWishlistEntry[];
  total?: number;
  page?: number;
  limit?: number;
};

type WishlistResponse = {
  success: boolean;
  data?: WishlistResponseData;
};

const normalizeWishlistItem = (item: ApiWishlistEntry): WishlistItem => {
  const trailer = (item.trailerId && typeof item.trailerId === "object")
    ? item.trailerId
    : null;

  const id = trailer ? String(trailer._id ?? trailer.id ?? "") : String(item.trailerId ?? item._id ?? item.id ?? "");

  const title = trailer?.title ?? trailer?.name ?? item.title ?? item.name ?? item.subtitle ?? item.description ?? "Trailer";

  const price = trailer?.pricePerDay ?? trailer?.price ?? undefined;
  const subtitle = price !== undefined
    ? `$${price}/day`
    : item.subtitle ?? undefined;
  const description = trailer?.description ?? item.description ?? undefined;

  const imageUrl = trailer?.profilePicture ?? (trailer?.images && trailer.images[0]) ?? item.imageUrl ?? item.image ?? item.thumbnail ?? "";

  return {
    id,
    title,
    subtitle,
    description,
    imageUrl,
  };
};

const getRawItems = (data: WishlistResponseData | undefined): ApiWishlistEntry[] =>
  data?.wishlist ?? data?.items ?? data?.list ?? [];

export const fetchWishlist = async (
  page = 1,
  limit = 20,
): Promise<WishlistItem[]> => {
  const res = await api.get<WishlistResponse>("/api/wishlist", {
    params: { page, limit },
  });
  const rawItems = getRawItems(res.data.data);
  return rawItems.map(normalizeWishlistItem);
};

export const addWishlistItem = async (trailerId: string) => {
  await api.post(`/api/wishlist/${encodeURIComponent(trailerId)}`);
};

export const deleteWishlistItem = async (trailerId: string) => {
  await api.delete(`/api/wishlist/${encodeURIComponent(trailerId)}`);
};
