import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.ts";
import wishlistReducer from "./wishlistSlice.ts";

const appReducer = {
  auth: authReducer,
  wishlist: wishlistReducer,
};

const rootReducer = (
  state:
    | {
        auth: ReturnType<typeof authReducer>;
        wishlist: ReturnType<typeof wishlistReducer>;
      }
    | undefined,
  action: { type: string }
) => {
  if (action.type === "auth/logout") {
    return {
      auth: authReducer(undefined, action),
      wishlist: wishlistReducer(undefined, action),
    };
  }

  return {
    auth: authReducer(state?.auth, action),
    wishlist: wishlistReducer(state?.wishlist, action),
  };
};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

