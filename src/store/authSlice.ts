import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const readStoredToken = (key: "accessToken" | "refreshToken") => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
};

const decodeBase64Url = (input: string) => {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
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
  profilePicture?: string;
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

// Note: do not read tokens here. Use `initFromToken` after load.

// Do not read localStorage at module import time. Initialize with empty defaults
// and populate later via `initFromToken` to avoid race conditions.
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  userType: null,
  ownerTrailersCount: 0,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Initialize auth state from an access token (optionally provided).
    // If `accessToken` is not provided, the reducer will attempt to read
    // it from localStorage. This avoids reading localStorage at module
    // import time and prevents role/side mixups after reload.
    initFromToken(state, action: PayloadAction<string | null | undefined>) {
      const token =
        action.payload ?? (typeof window !== "undefined" ? readStoredToken("accessToken") : null);

      const payload = decodeJwtPayload(token ?? null) ?? {};

      // JWT claim may use different keys depending on backend: 'trailor', 'role', 'roles', or nested under 'user'.
      const userObj =
        payload && typeof payload === "object" && "user" in payload && payload.user && typeof payload.user === "object"
          ? (payload.user as Record<string, any>)
          : undefined;

      const maybeRoleCandidates: any[] = [
        (payload as any).trailor,
        (payload as any).role,
        (payload as any).roles,
        userObj && (userObj.role ?? userObj.trailor ?? userObj.roles),
      ];

      let found: string | null = null;
      for (const c of maybeRoleCandidates) {
        if (!c) continue;
        if (Array.isArray(c) && c.length > 0) {
          found = String(c[0]);
          break;
        }
        if (typeof c === "string") {
          found = c;
          break;
        }
      }

      const normalizeToTrailor = (raw: string | null | undefined) => {
        if (!raw) return null;
        const s = String(raw).trim().toLowerCase();
        if (s.includes("owner")) return "Owner";
        if (s.includes("renter")) return "Renter";
        return null;
      };

      const trailor = normalizeToTrailor(found);
      const emailRaw = ((payload as any).email ?? (userObj && userObj.email)) as unknown;
      const email = emailRaw ? String(emailRaw) : null;
      const profilePictureRaw =
        (payload as any).profilePicture ??
        (payload as any).profile_picture ??
        (userObj && ((userObj.profilePicture ?? userObj.profile_picture) as unknown));
      const profilePicture = profilePictureRaw ? String(profilePictureRaw) : undefined;

      state.isAuthenticated = Boolean(token);
      state.accessToken = token ?? null;
      state.refreshToken = readStoredToken("refreshToken");
      state.userType = trailor;
      let cachedFirst: string | undefined;
      let cachedLast: string | undefined;
      if (typeof window !== "undefined") {
        cachedFirst = window.localStorage.getItem("cachedFirstName") || undefined;
        cachedLast = window.localStorage.getItem("cachedLastName") || undefined;
      }

      state.user = trailor || email || cachedFirst || cachedLast
        ? { 
            email: email || undefined, 
            trailor: trailor || undefined, 
            profilePicture,
            firstName: cachedFirst,
            lastName: cachedLast
          }
        : null;
      state.ownerTrailersCount = trailor === "Owner" ? state.ownerTrailersCount : 0;
    },
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
      if (typeof window !== "undefined" && state.user) {
        if (state.user.firstName) window.localStorage.setItem("cachedFirstName", state.user.firstName);
        if (state.user.lastName) window.localStorage.setItem("cachedLastName", state.user.lastName);
      }
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
      if (typeof window !== "undefined" && state.user) {
        if (state.user.firstName) window.localStorage.setItem("cachedFirstName", state.user.firstName);
        if (state.user.lastName) window.localStorage.setItem("cachedLastName", state.user.lastName);
      }
    },
    updateUser(state, action: PayloadAction<Partial<AuthUser>>) {
      if (!state.user) {
        state.user = { ...action.payload } as AuthUser;
      } else {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
      if (typeof window !== "undefined") {
        if (state.user.firstName) window.localStorage.setItem("cachedFirstName", state.user.firstName);
        if (state.user.lastName) window.localStorage.setItem("cachedLastName", state.user.lastName);
      }
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
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("cachedFirstName");
        window.localStorage.removeItem("cachedLastName");
      }
    },
  },
});

export const {
  initFromToken,
  loginSuccess,
  signUpSuccess,
  updateUser,
  logout,
  addOwnerTrailer,
} = authSlice.actions;
export default authSlice.reducer;

