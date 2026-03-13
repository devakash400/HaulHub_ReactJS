import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.ts";
import wishlistReducer from "./wishlistSlice.ts";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wishlist: wishlistReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

