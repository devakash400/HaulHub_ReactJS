import { images } from "../images/index.ts";

export type TrailerType = "gooseneck" | "bumper-pull" | "flatbed" | "car-hauler";

export type TrailerReview = {
  avatar: string;
  name: string;
  stars: number;
  context: string;
  text: string;
};

export type TrailerMetric = {
  label: string;
  score: number;
  icon: "communication" | "integrity" | "cost" | "accessibility";
};

export type TrailerDetail = {
  id: number;
  type: TrailerType;
  title: string;
  model?: string;
  images: string[];
  location: string;
  specs: string;
  rating: number;
  reviewCount: number;
  ratingDescription: string;
  features: {
    icon: "commercial" | "towing" | "road";
    label: string;
  }[];
  price: string;
  ratingBreakdown: Record<number, number>;
  metrics: TrailerMetric[];
  guestFavouriteRating: number;
  guestFavouriteDescription: string;
  reviews: TrailerReview[];
};

const defaultImages = [images.Catimg];

export const trailersData: TrailerDetail[] = [
  {
    id: 1,
    type: "gooseneck",
    title: "Heavy-Duty Gooseneck Trailer",
    images: defaultImages,
    location: "Texas, USA",
    specs: "25FT Flatbed · Dual Axle · Industrial Steel Frame",
    rating: 4.9,
    reviewCount: 593,
    ratingDescription:
      "One of the most preferred heavy-duty trailers according to professional buyers.",
    features: [
      { icon: "commercial", label: "Commercial Grade Strength" },
      { icon: "towing", label: "Maximum Towing Stability" },
      { icon: "road", label: "Enhanced Road Stability" },
    ],
    price: "$21,993.50",
    ratingBreakdown: { 5: 450, 4: 100, 3: 30, 2: 8, 1: 5 },
    metrics: [
      { label: "Client Coordination", score: 5.0, icon: "communication" },
      { label: "Structural Integrity", score: 4.9, icon: "integrity" },
      { label: "Cost Efficiency", score: 4.0, icon: "cost" },
      { label: "Accessibility", score: 4.5, icon: "accessibility" },
    ],
    guestFavouriteRating: 4.93,
    guestFavouriteDescription:
      "This Gooseneck Trailer is in the top 5% of eligible listings based on renter ratings, performance, and reliability.",
    reviews: [
      {
        avatar: "",
        name: "Jason",
        stars: 5,
        context: "January 2026 · Rented for 5 days",
        text: "Outstanding trailer. The 25FT flatbed was perfect for hauling my heavy equipment, and the dual axle made towing extremely stable on the highway. The industrial steel frame feels very solid and durable. Pickup was smooth and everything was exactly as listed. Highly recommend this gooseneck trailer in Texas.",
      },
      {
        avatar: "",
        name: "Anthony",
        stars: 5,
        context: "December 2025 · Rented for a weekend",
        text: "This trailer exceeded expectations. Strong build quality and very well maintained. I was hauling construction materials, and it handled the weight without any issues. Pickup instructions were clear and the owner was responsive. Highly recommended in Texas. I especially appreciated how stable it felt even when fully loaded, and the braking felt very controlled on downhill sections.",
      },
      {
        avatar: "",
        name: "Robert",
        stars: 5,
        context: "January 2026 · Rented for 5 days",
        text: "The gooseneck trailer in Texas was exactly what I needed. The 25FT flatbed had plenty of space for my equipment, and the dual axle setup made towing very stable even on long highway drives. The industrial steel frame feels extremely strong and reliable. Smooth pickup process and excellent communication from the owner.",
      },
      {
        avatar: "",
        name: "Chris",
        stars: 5,
        context: "November 2025 · Rented for 2 days",
        text: "One of the best trailers I've rented. The dual axle setup makes a big difference in stability, especially on longer routes. The 25FT flatbed is spacious and practical. Everything was clean, functional, and ready to go. Will definitely book again. It felt very similar to using my own equipment, which made the whole job go smoother and faster than expected.",
      },
      {
        avatar: "",
        name: "Mark",
        stars: 5,
        context: "February 2026 · Rented for 1 day",
        text: "Excellent gooseneck trailer. The 25FT flatbed gave me more than enough room for transporting machinery. Dual axle design kept everything balanced and secure during towing. The industrial steel frame feels heavy-duty and built for serious work. Very smooth rental experience.",
      },
      {
        avatar: "",
        name: "Brian",
        stars: 5,
        context: "February 2026 · Rented for 4 days",
        text: "Fantastic experience from start to finish. The 25FT flatbed was perfect for transporting my farm equipment, and the dual axle provided excellent balance and control while towing. The industrial steel frame is extremely sturdy and clearly built for heavy duty use. Communication was quick, pickup and drop-off were simple, and I would not hesitate to rent the same trailer again.",
      },
    ],
  },
  {
    id: 2,
    type: "gooseneck",
    title: "Heavy-Duty Gooseneck Trailer",
    images: defaultImages,
    location: "Texas, USA",
    specs: "25FT Flatbed · Dual Axle · Industrial Steel Frame",
    rating: 4.9,
    reviewCount: 593,
    ratingDescription:
      "One of the most preferred heavy-duty trailers according to professional buyers.",
    features: [
      { icon: "commercial", label: "Commercial Grade Strength" },
      { icon: "towing", label: "Maximum Towing Stability" },
      { icon: "road", label: "Enhanced Road Stability" },
    ],
    price: "$21,995.50",
    ratingBreakdown: { 5: 450, 4: 100, 3: 30, 2: 8, 1: 5 },
    metrics: [
      { label: "Client Coordination", score: 5.0, icon: "communication" },
      { label: "Structural Integrity", score: 4.9, icon: "integrity" },
      { label: "Cost Efficiency", score: 4.0, icon: "cost" },
      { label: "Accessibility", score: 4.3, icon: "accessibility" },
    ],
    guestFavouriteRating: 4.93,
    guestFavouriteDescription:
      "This Gooseneck Trailer is in the top 5% of eligible listings based on renter ratings, performance, and reliability.",
    reviews: [
      {
        avatar: "",
        name: "Jason",
        stars: 5,
        context: "January 2026 · Rented for 8 days",
        text: "Excellent trailer! Handled our heavy equipment with ease.",
      },
      {
        avatar: "",
        name: "Anthony",
        stars: 5,
        context: "January 2026 · Rented for 5 days",
        text: "Very professional service. Trailer was in great condition.",
      },
    ],
  },
  ...Array.from({ length: 6 }, (_, i): TrailerDetail => ({
    id: 3 + i,
    type: "gooseneck",
    title: "Heavy-Duty Gooseneck Trailer",
    images: defaultImages,
    location: "Texas, USA",
    specs: i < 2 ? "25FT Flatbed · Dual Axle · Industrial Steel Frame" : i < 4 ? "26FT Flatbed · Dual Axle · Industrial Steel Frame" : "28FT Flatbed · Dual Axle · Industrial Steel Frame",
    rating: 4.9,
    reviewCount: 450 + i * 20,
    ratingDescription:
      "One of the most preferred heavy-duty trailers according to professional buyers.",
    features: [
      { icon: "commercial", label: "Commercial Grade Strength" },
      { icon: "towing", label: "Maximum Towing Stability" },
      { icon: "road", label: "Enhanced Road Stability" },
    ],
    price: i < 2 ? "$21,995.50" : i < 4 ? "$23,995.00" : "$25,450.00",
    ratingBreakdown: { 5: 400, 4: 80, 3: 25, 2: 5, 1: 3 },
    metrics: [
      { label: "Client Coordination", score: 5.0, icon: "communication" },
      { label: "Structural Integrity", score: 4.9, icon: "integrity" },
      { label: "Cost Efficiency", score: 4.0, icon: "cost" },
      { label: "Accessibility", score: 4.3, icon: "accessibility" },
    ],
    guestFavouriteRating: 4.93,
    guestFavouriteDescription:
      "This Gooseneck Trailer is in the top 5% of eligible listings based on renter ratings, performance, and reliability.",
    reviews: [
      { avatar: "", name: "Jason", stars: 5, context: "January 2026 · Rented for 8 days", text: "Excellent trailer! Would definitely rent again." },
      { avatar: "", name: "Anthony", stars: 5, context: "January 2026 · Rented for 5 days", text: "Very professional service. Trailer in great condition." },
    ],
  })),
  {
    id: 9,
    type: "bumper-pull",
    title: "Heavy-Duty Bumper Pull Trailer",
    images: defaultImages,
    location: "Texas, USA",
    specs: "18FT Flatbed · Single Axle · Industrial Steel Frame",
    rating: 4.8,
    reviewCount: 412,
    ratingDescription:
      "Reliable bumper pull option favored by contractors and weekend haulers.",
    features: [
      { icon: "commercial", label: "Commercial Grade Strength" },
      { icon: "towing", label: "Easy Hitch Compatibility" },
      { icon: "road", label: "Smooth Towing Experience" },
    ],
    price: "$15,450.00",
    ratingBreakdown: { 5: 320, 4: 70, 3: 15, 2: 5, 1: 2 },
    metrics: [
      { label: "Client Coordination", score: 4.9, icon: "communication" },
      { label: "Structural Integrity", score: 4.7, icon: "integrity" },
      { label: "Cost Efficiency", score: 4.5, icon: "cost" },
      { label: "Accessibility", score: 4.8, icon: "accessibility" },
    ],
    guestFavouriteRating: 4.85,
    guestFavouriteDescription:
      "This Bumper Pull Trailer is in the top 5% of eligible listings based on renter ratings, performance, and reliability.",
    reviews: [
      {
        avatar: "",
        name: "Mike",
        stars: 5,
        context: "February 2026 · Rented for 6 days",
        text: "Perfect for my pickup. Easy to hitch and tow. Very pleased.",
      },
      {
        avatar: "",
        name: "Sarah",
        stars: 5,
        context: "January 2026 · Rented for 4 days",
        text: "Great bumper pull trailer. Handled our landscaping equipment well.",
      },
      {
        avatar: "",
        name: "David",
        stars: 4,
        context: "January 2026 · Rented for 3 days",
        text: "Good value. Trailer was clean and ready to go.",
      },
      {
        avatar: "",
        name: "Emily",
        stars: 5,
        context: "December 2025 · Rented for 7 days",
        text: "Excellent experience. Will use HaulHub again for sure.",
      },
    ],
  },
  ...Array.from({ length: 7 }, (_, i): TrailerDetail => ({
    id: 10 + i,
    type: "bumper-pull",
    title: "Heavy-Duty Bumper Pull Trailer",
    images: defaultImages,
    location: "Texas, USA",
    specs: i < 4 ? "18FT Flatbed · Single Axle · Industrial Steel Frame" : i < 6 ? "20FT Flatbed · Dual Axle · Industrial Steel Frame" : "22FT Flatbed · Dual Axle · Industrial Steel Frame",
    rating: 4.8,
    reviewCount: 380 + i * 15,
    ratingDescription:
      "Reliable bumper pull option favored by contractors and weekend haulers.",
    features: [
      { icon: "commercial", label: "Commercial Grade Strength" },
      { icon: "towing", label: "Easy Hitch Compatibility" },
      { icon: "road", label: "Smooth Towing Experience" },
    ],
    price: i < 4 ? "$15,450.00" : i < 6 ? "$16,950.00" : "$18,250.00",
    ratingBreakdown: { 5: 300, 4: 65, 3: 12, 2: 4, 1: 2 },
    metrics: [
      { label: "Client Coordination", score: 4.9, icon: "communication" },
      { label: "Structural Integrity", score: 4.7, icon: "integrity" },
      { label: "Cost Efficiency", score: 4.5, icon: "cost" },
      { label: "Accessibility", score: 4.8, icon: "accessibility" },
    ],
    guestFavouriteRating: 4.85,
    guestFavouriteDescription:
      "This Bumper Pull Trailer is in the top 5% of eligible listings based on renter ratings, performance, and reliability.",
    reviews: [
      { avatar: "", name: "Mike", stars: 5, context: "February 2026 · Rented for 6 days", text: "Perfect for my pickup. Easy to hitch and tow." },
      { avatar: "", name: "Sarah", stars: 5, context: "January 2026 · Rented for 4 days", text: "Great bumper pull trailer. Highly recommend." },
    ],
  })),
  ...Array.from({ length: 8 }, (_, i): TrailerDetail => ({
    id: 20 + i,
    type: "flatbed",
    title: "Heavy-Duty Flatbed Trailer",
    images: defaultImages,
    location: "Texas, USA",
    specs: i < 3 ? "25FT Flatbed · Dual Axle · Industrial Steel Frame" : i < 6 ? "26FT Flatbed · Dual Axle · Industrial Steel Frame" : "28FT Flatbed · Dual Axle · Industrial Steel Frame",
    rating: 4.9,
    reviewCount: 380 + i * 25,
    ratingDescription: "One of the most preferred flatbed trailers according to professional buyers.",
    features: [
      { icon: "commercial", label: "Commercial Grade Strength" },
      { icon: "towing", label: "Maximum Towing Stability" },
      { icon: "road", label: "Enhanced Road Stability" },
    ],
    price: i < 2 ? "$21,993.50" : i < 4 ? "$32,857.09" : i < 6 ? "$36,752.21" : i < 8 ? "$41,502.57" : "$46,755.00",
    ratingBreakdown: { 5: 400, 4: 80, 3: 25, 2: 5, 1: 3 },
    metrics: [
      { label: "Client Coordination", score: 5.0, icon: "communication" },
      { label: "Structural Integrity", score: 4.9, icon: "integrity" },
      { label: "Cost Efficiency", score: 4.0, icon: "cost" },
      { label: "Accessibility", score: 4.5, icon: "accessibility" },
    ],
    guestFavouriteRating: 4.93,
    guestFavouriteDescription: "This Flatbed Trailer is in the top 5% of eligible listings based on renter ratings, performance, and reliability.",
    reviews: [
      { avatar: "", name: "Jason", stars: 5, context: "January 2026 · Rented for 8 days", text: "Excellent flatbed trailer! Would definitely rent again." },
      { avatar: "", name: "Anthony", stars: 5, context: "January 2026 · Rented for 5 days", text: "Very professional service. Trailer in great condition." },
    ],
  })),
  ...Array.from({ length: 8 }, (_, i): TrailerDetail => ({
    id: 30 + i,
    type: "car-hauler",
    title: "Enclosed Car Hauler Trailer",
    images: defaultImages,
    location: "Texas, USA",
    specs: i < 4 ? "20FT Enclosed · Dual Axle · Aluminum Frame" : "24FT Enclosed · Dual Axle · Aluminum Frame",
    rating: 4.8,
    reviewCount: 320 + i * 20,
    ratingDescription: "Premium car hauler favored by auto dealers and enthusiasts.",
    features: [
      { icon: "commercial", label: "Vehicle Protection" },
      { icon: "towing", label: "Easy Loading Ramp" },
      { icon: "road", label: "Smooth Towing Experience" },
    ],
    price: i < 2 ? "$23,596.50" : i < 4 ? "$23,926.52" : i < 6 ? "$46,755.00" : "$54,455.47",
    ratingBreakdown: { 5: 300, 4: 65, 3: 15, 2: 5, 1: 2 },
    metrics: [
      { label: "Client Coordination", score: 4.9, icon: "communication" },
      { label: "Structural Integrity", score: 4.8, icon: "integrity" },
      { label: "Cost Efficiency", score: 4.5, icon: "cost" },
      { label: "Accessibility", score: 4.7, icon: "accessibility" },
    ],
    guestFavouriteRating: 4.88,
    guestFavouriteDescription: "This Car Hauler is in the top 5% of eligible listings based on renter ratings, performance, and reliability.",
    reviews: [
      { avatar: "", name: "Chris", stars: 5, context: "February 2026 · Rented for 3 days", text: "Perfect for transporting my classic car. Highly recommend." },
      { avatar: "", name: "Lisa", stars: 5, context: "January 2026 · Rented for 5 days", text: "Great car hauler. Secure and easy to use." },
    ],
  })),
];

export function getTrailerById(id: number): TrailerDetail | undefined {
  return trailersData.find((t) => t.id === id);
}

export function getTrailerTypeLabel(type: TrailerType): string {
  if (type === "gooseneck") return "Gooseneck Trailer";
  if (type === "bumper-pull") return "Bumper Pull Trailer";
  if (type === "flatbed") return "Flatbed Trailer";
  if (type === "car-hauler") return "Car Hauler";
  return "Trailer";
}

export type TrailerListItem = {
  id: number;
  image: string;
  modelLabel: string;
  priceLabel: string;
  badgeLabel?: string;
};

const GOOSENECK_MODELS = ["FMAX208", "FMAX208", "FMAX208", "FMAX208", "FMAX210", "FMAX210", "FMAX220", "FMAX220"];
const BUMPER_MODELS = ["BMAX150", "BMAX150", "BMAX150", "BMAX150", "BMAX160", "BMAX160", "BMAX180", "BMAX180"];
const FLATBED_MODELS = ["FMAX208", "FMAX315", "FMAX330", "FMAX210", "FMAX340", "FMAX235", "FMAX230", "FMAX250"];
const CAR_HAULER_MODELS = ["CHMAX200", "CHMAX210", "CHMAX220", "CHMAX240", "CHMAX250", "CHMAX260", "CHMAX280", "CHMAX300"];

export function getGooseneckListItems(): TrailerListItem[] {
  return trailersData
    .filter((t) => t.type === "gooseneck")
    .map((t, i) => ({
      id: t.id,
      image: t.images[0],
      modelLabel: `Model: ${GOOSENECK_MODELS[i % GOOSENECK_MODELS.length] || "FMAX208"}`,
      priceLabel: t.price,
      badgeLabel: "Guest favourite",
    }));
}

export function getBumperPullListItems(): TrailerListItem[] {
  return trailersData
    .filter((t) => t.type === "bumper-pull")
    .map((t, i) => ({
      id: t.id,
      image: t.images[0],
      modelLabel: `Model: ${BUMPER_MODELS[i % BUMPER_MODELS.length] || "BMAX150"}`,
      priceLabel: t.price,
      badgeLabel: "Guest favourite",
    }));
}

export function getFlatbedListItems(): TrailerListItem[] {
  return trailersData
    .filter((t) => t.type === "flatbed")
    .map((t, i) => ({
      id: t.id,
      image: t.images[0],
      modelLabel: `Model: ${FLATBED_MODELS[i % FLATBED_MODELS.length] || "FMAX208"}`,
      priceLabel: t.price,
      badgeLabel: "Guest favourite",
    }));
}

export function getCarHaulersListItems(): TrailerListItem[] {
  return trailersData
    .filter((t) => t.type === "car-hauler")
    .map((t, i) => ({
      id: t.id,
      image: t.images[0],
      modelLabel: `Model: ${CAR_HAULER_MODELS[i % CAR_HAULER_MODELS.length] || "CHMAX200"}`,
      priceLabel: t.price,
      badgeLabel: "Guest favourite",
    }));
}
