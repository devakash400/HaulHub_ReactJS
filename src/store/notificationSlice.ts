import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { images } from "../assets/images/index.ts";

export type OwnerBookingRequest = {
  id: number;
  trailerTitle: string;
  trailerModel: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
  renterName: string;
  pickupDate: string;
};

export type RenterOrderNotification = {
  id: number;
  requestId: number;
  trailerTitle: string;
  trailerModel: string;
  bookingId: string;
  status: "Accepted" | "Rejected";
  createdAt: string;
};

type NotificationState = {
  ownerRequests: OwnerBookingRequest[];
  renterNotifications: RenterOrderNotification[];
};

const initialState: NotificationState = {
  ownerRequests: [
    {
      id: 1,
      trailerTitle: "Gooseneck Trailer",
      trailerModel: "FMAX208",
      price: "$21,435",
      rating: 4.9,
      reviews: 593,
      image: images.Container,
      renterName: "Renter",
      pickupDate: "12 March 2026",
    },
  ],
  renterNotifications: [
    {
      id: 101,
      requestId: 1,
      trailerTitle: "Gooseneck Trailer",
      trailerModel: "FMAX208",
      bookingId: "#TR-2026-00001",
      status: "Accepted",
      createdAt: new Date().toISOString(),
    },
    {
      id: 102,
      requestId: 2,
      trailerTitle: "Flatbed Trailer",
      trailerModel: "FLB900",
      bookingId: "#TR-2026-00002",
      status: "Rejected",
      createdAt: new Date().toISOString(),
    },
  ],
};

const buildBookingId = (id: number) => `#TR-2026-${String(id).padStart(5, "0")}`;

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    acceptOwnerRequest(state, action: PayloadAction<number>) {
      const request = state.ownerRequests.find((item) => item.id === action.payload);
      if (!request) return;

      state.ownerRequests = state.ownerRequests.filter(
        (item) => item.id !== action.payload
      );
      state.renterNotifications.unshift({
        id: Date.now(),
        requestId: request.id,
        trailerTitle: request.trailerTitle,
        trailerModel: request.trailerModel,
        bookingId: buildBookingId(request.id),
        status: "Accepted",
        createdAt: new Date().toISOString(),
      });
    },
    rejectOwnerRequest(state, action: PayloadAction<number>) {
      const request = state.ownerRequests.find((item) => item.id === action.payload);
      if (!request) return;

      state.ownerRequests = state.ownerRequests.filter(
        (item) => item.id !== action.payload
      );
      state.renterNotifications.unshift({
        id: Date.now(),
        requestId: request.id,
        trailerTitle: request.trailerTitle,
        trailerModel: request.trailerModel,
        bookingId: buildBookingId(request.id),
        status: "Rejected",
        createdAt: new Date().toISOString(),
      });
    },
  },
});

export const { acceptOwnerRequest, rejectOwnerRequest } =
  notificationSlice.actions;
export default notificationSlice.reducer;
