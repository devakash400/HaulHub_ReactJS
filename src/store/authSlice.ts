import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const readStoredToken = (key: "accessToken" | "refreshToken") => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
};

const decodeBase64Url = (input: string) => {
  // JWT uses base64url, where "-" => "+" and "_" => "/"
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  // Pad to multiple of 4 for atob
  const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  return window.atob(base64 + pad);
};

const decodeJwtPayload = (token: string | null) => {
  if (!token || typeof window === "undefined") return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payloadJson = decodeBase64Url(parts[1]);
    return JSON.parse(payloadJson) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export interface AuthUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  trailor?: string; // Renter, Owner, Both, Dealer
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  userType: string | null;
  ownerTrailersCount: number;
}

const initialAccessToken = readStoredToken("accessToken");
const initialRefreshToken = readStoredToken("refreshToken");
const initialJwtPayload = decodeJwtPayload(initialAccessToken);
const initialTrailorRaw = initialJwtPayload?.trailor;
const initialTrailor = Array.isArray(initialTrailorRaw)
  ? String(initialTrailorRaw[0] ?? "")
  : initialTrailorRaw
    ? String(initialTrailorRaw)
    : null;
const initialEmailRaw = initialJwtPayload?.email;
const initialEmail = initialEmailRaw ? String(initialEmailRaw) : null;

const initialState: AuthState = {
  isAuthenticated: Boolean(initialAccessToken),
  user: initialTrailor || initialEmail
    ? {
        email: initialEmail || undefined,
        trailor: initialTrailor || undefined,
      }
    : null,
  accessToken: initialAccessToken,
  refreshToken: initialRefreshToken,
  userType: initialTrailor,
  ownerTrailersCount: 0,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(
      state,
      action: PayloadAction<{
        user: AuthUser | null;
        accessToken: string;
        refreshToken: string;
        userType?: string | null;
      }>
    ) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.userType = action.payload.userType ?? action.payload.user?.trailor ?? null;
    },
    signUpSuccess(
      state,
      action: PayloadAction<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
        userType?: string | null;
      }>
    ) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.userType = action.payload.userType ?? action.payload.user.trailor ?? null;
      state.ownerTrailersCount = state.userType === "Owner" ? 0 : state.ownerTrailersCount;
    },
    addOwnerTrailer(state) {
      state.ownerTrailersCount += 1;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.userType = null;
      state.ownerTrailersCount = 0;
    },
  },
});

export const { loginSuccess, signUpSuccess, logout, addOwnerTrailer } =
  authSlice.actions;
export default authSlice.reducer;

