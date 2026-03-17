import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  trailor?: string; // Renter, Owner, Both, Dealer
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  ownerTrailersCount: number;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  ownerTrailersCount: 0,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<AuthUser | null>) {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    signUpSuccess(
      state,
      action: PayloadAction<{ user: AuthUser; trailor: string }>
    ) {
      state.isAuthenticated = true;
      state.user = { ...action.payload.user, trailor: action.payload.trailor };
      state.ownerTrailersCount =
        action.payload.trailor === "Owner" ? 0 : state.ownerTrailersCount;
    },
    addOwnerTrailer(state) {
      state.ownerTrailersCount += 1;
    },
    logout() {
      return initialState;
    },
  },
});

export const { loginSuccess, signUpSuccess, logout, addOwnerTrailer } =
  authSlice.actions;
export default authSlice.reducer;

