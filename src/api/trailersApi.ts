import api, { API_BASE_URL } from "./api.ts";
import { images } from "../assets/images/index.ts";
import type {
  TrailerDetail,
  TrailerListItem,
  TrailerMetric,
  TrailerReview,
  TrailerType,
} from "../assets/data/trailers.ts";
import { getTrailerById } from "../assets/data/trailers.ts";

export type ApiTrailer = {
  _id: string;
  title?: string;
  name?: string;
  model?: string;
  trailerType?: string;
  pricePerDay?: number;
  images?: string[];
  profilePicture?: string;
  takePhoto?: string;
  isFeatured?: boolean;
};

type TrailersListResponse = {
  success: boolean;
  data: {
    trailers: ApiTrailer[];
    total: number;
    page: number;
    limit: number;
  };
};

const FALLBACK_IMAGE = images.Catimg;

function resolveMediaUrl(path: string | undefined): string {
  if (!path?.trim()) return FALLBACK_IMAGE;
  const p = path.trim();
  if (/^https?:\/\//i.test(p)) return p;
  return `${API_BASE_URL}/${p.replace(/^\//, "")}`;
}

/** Main card image: profile picture first, then gallery, then takePhoto. */
function pickTrailerImage(t: ApiTrailer): string {
  if (t.profilePicture?.trim()) return resolveMediaUrl(t.profilePicture);
  const fromArray = t.images?.find((u) => u?.trim());
  if (fromArray) return resolveMediaUrl(fromArray);
  if (t.takePhoto?.trim()) return resolveMediaUrl(t.takePhoto);
  return FALLBACK_IMAGE;
}

function normalizeTypeKey(raw: string | undefined): string {
  return (raw ?? "")
    .toLowerCase()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_")
    .trim();
}

export type TrailerCategoryBucket =
  | "gooseneck"
  | "bumper_pull"
  | "flatbed"
  | "car_hauler";

export function trailerCategoryBucket(
  t: ApiTrailer,
): TrailerCategoryBucket | null {
  const key = normalizeTypeKey(t.trailerType);
  if (key === "gooseneck") return "gooseneck";
  if (key === "bumper_pull" || key === "bumperpull") return "bumper_pull";
  if (key === "flatbed" || key === "flat_bed") return "flatbed";
  if (key === "car_hauler" || key === "carhauler") return "car_hauler";
  return null;
}

function formatPricePerDay(n: number | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function apiTrailerToListItem(t: ApiTrailer): TrailerListItem {
  const modelName = (
    t.model ||
    t.title ||
    t.name ||
    "Trailer"
  ).trim();

  return {
    id: t._id,
    image: pickTrailerImage(t),
    modelLabel: `Model: ${modelName}`,
    priceLabel: formatPricePerDay(t.pricePerDay),
    badgeLabel: t.isFeatured ? "Featured" : undefined,
  };
}

export type GroupedHomeTrailers = Record<TrailerCategoryBucket, TrailerListItem[]>;

export function groupTrailersForHome(trailers: ApiTrailer[]): GroupedHomeTrailers {
  const empty: GroupedHomeTrailers = {
    gooseneck: [],
    bumper_pull: [],
    flatbed: [],
    car_hauler: [],
  };

  for (const t of trailers) {
    const bucket = trailerCategoryBucket(t);
    if (!bucket) continue;
    empty[bucket].push(apiTrailerToListItem(t));
  }

  return empty;
}

export async function fetchTrailersList(params?: {
  page?: number;
  limit?: number;
}): Promise<GroupedHomeTrailers> {
  const res = await api.get<TrailersListResponse>("/api/trailers", { params });
  const body = res.data;
  if (!body?.success || !body.data?.trailers) {
    return groupTrailersForHome([]);
  }
  return groupTrailersForHome(body.data.trailers);
}

export type ApiTrailerOwner = {
  _id?: string;
  fullName?: string;
  rating?: number;
  totalReviews?: number;
};

export type ApiTrailerLocation = {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  coordinates?: { type?: string; coordinates?: [number, number] };
};

export type ApiTrailerDetail = ApiTrailer & {
  description?: string;
  dimensions?: string;
  hitchType?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  location?: ApiTrailerLocation;
  ownerId?: ApiTrailerOwner | string;
  features?: string[];
  securityDepositAmount?: number;
  usageRestrictions?: string;
  availability?: { startDate?: string; endDate?: string }[];
};

type TrailerDetailResponse = {
  success: boolean;
  data?: ApiTrailerDetail;
};

function apiTrailerTypeToUIType(raw: string | undefined): TrailerType {
  const bucket = trailerCategoryBucket({ _id: "", trailerType: raw } as ApiTrailer);
  if (bucket === "gooseneck") return "gooseneck";
  if (bucket === "bumper_pull") return "bumper-pull";
  if (bucket === "flatbed") return "flatbed";
  if (bucket === "car_hauler") return "car-hauler";
  return "flatbed";
}

function ownerStats(owner: ApiTrailerDetail["ownerId"]): {
  rating: number;
  totalReviews: number;
} {
  if (owner && typeof owner === "object") {
    return {
      rating: typeof owner.rating === "number" ? owner.rating : 0,
      totalReviews:
        typeof owner.totalReviews === "number" ? owner.totalReviews : 0,
    };
  }
  return { rating: 0, totalReviews: 0 };
}

function galleryImageUrls(t: ApiTrailerDetail): string[] {
  const raw = [t.profilePicture, ...(t.images ?? [])].filter(
    (p): p is string => Boolean(p?.trim()),
  );
  const resolved = raw.map((p) => resolveMediaUrl(p));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of resolved) {
    if (!seen.has(u)) {
      seen.add(u);
      out.push(u);
    }
  }
  return out.length > 0 ? out : [FALLBACK_IMAGE];
}

function mapApiFeaturesToUI(
  strings: string[] | undefined,
): TrailerDetail["features"] {
  const icons: ("commercial" | "towing" | "road")[] = [
    "commercial",
    "towing",
    "road",
  ];
  const list = (strings ?? []).map((s) => s.trim()).filter(Boolean);
  if (list.length === 0) {
    return [
      { icon: "commercial", label: "Listed on HaulHub" },
      { icon: "towing", label: "Ready to book" },
      { icon: "road", label: "Verified listing details" },
    ];
  }
  return list.slice(0, 3).map((label, i) => ({
    icon: icons[i % 3]!,
    label,
  }));
}

const defaultApiMetrics: TrailerMetric[] = [
  { label: "Client Coordination", score: 4.5, icon: "communication" },
  { label: "Structural Integrity", score: 4.5, icon: "integrity" },
  { label: "Cost Efficiency", score: 4.5, icon: "cost" },
  { label: "Accessibility", score: 4.5, icon: "accessibility" },
];

export async function fetchTrailerById(
  id: string,
): Promise<ApiTrailerDetail | null> {
  try {
    const res = await api.get<TrailerDetailResponse>(
      `/api/trailers/${encodeURIComponent(id)}`,
    );
    const body = res.data;
    if (!body?.success || !body.data?._id) return null;
    return body.data;
  } catch {
    return null;
  }
}

export function mapApiTrailerDetailToTrailerDetail(
  data: ApiTrailerDetail,
): TrailerDetail {
  const { rating, totalReviews } = ownerStats(data.ownerId);
  const type = apiTrailerTypeToUIType(data.trailerType);
  const title = (data.title || data.name || "Trailer").trim();
  const loc = data.location;
  const location =
    loc?.city && loc?.state
      ? `${loc.city}, ${loc.state}`
      : [loc?.address, loc?.city, loc?.state].filter(Boolean).join(", ") ||
      "Location on request";

  const specParts = [data.model, data.dimensions, data.hitchType].filter(
    Boolean,
  ) as string[];
  const specs =
    specParts.length > 0
      ? specParts.join(" · ")
      : (data.description ?? "").trim().slice(0, 140) || "—";

  const reviews: TrailerReview[] = [];
  const ratingDescription =
    totalReviews > 0
      ? `Based on ${totalReviews} review${totalReviews === 1 ? "" : "s"}.`
      : "New on HaulHub — be the first to leave a review.";

  return {
    id: data._id,
    type,
    title,
    model: data.model,
    images: galleryImageUrls(data),
    location,
    specs,
    rating,
    reviewCount: totalReviews,
    ratingDescription,
    features: mapApiFeaturesToUI(data.features),
    price: formatPricePerDay(data.pricePerDay),
    ratingBreakdown: {},
    metrics: defaultApiMetrics,
    guestFavouriteRating: rating > 0 ? rating : 4.5,
    guestFavouriteDescription:
      "Ratings and guest favourite status will grow as renters complete trips.",
    reviews,
  };
}

export async function resolveTrailerForRoute(
  id: string | undefined,
): Promise<TrailerDetail | null> {
  if (!id?.trim()) return null;
  const trimmed = id.trim();
  const fromApi = await fetchTrailerById(trimmed);
  if (fromApi) return mapApiTrailerDetailToTrailerDetail(fromApi);
  const n = Number(trimmed);
  if (Number.isInteger(n) && !Number.isNaN(n)) {
    return getTrailerById(n) ?? null;
  }
  return null;
}
