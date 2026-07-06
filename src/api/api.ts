import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  handleSessionExpired,
  isPublicAuthRequest,
} from "./sessionExpired.ts";

declare const process: { env: { REACT_APP_API_URL?: string } };

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/** Override with e.g. `REACT_APP_API_URL=http://localhost:5100` for local backend. */
export const API_BASE_URL = (
  process.env.REACT_APP_API_URL ?? "https://api.renthaulhub.com/"
).replace(/\/$/, "");

const BASE_URL = API_BASE_URL;

let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
  }
};

export const loadTokensFromStorage = () => {
  if (typeof window === "undefined") return;
  accessToken = localStorage.getItem("accessToken");
  refreshToken = localStorage.getItem("refreshToken");
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string | null) => void;
  reject: (err: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const forceLogoutForExpiredSession = () => {
  clearTokens();
  handleSessionExpired();
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url ?? "";

    if (isPublicAuthRequest(requestUrl)) {
      return Promise.reject(error);
    }

    const hadSession = Boolean(accessToken || refreshToken);

    if (refreshToken && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (!token) return reject(error);
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshUrl = `${BASE_URL}/api/auth/refresh`;
        console.log("[refresh] URL:", refreshUrl);
        const res = await axios.post(refreshUrl, {
          refreshToken,
        });

        console.log("[refresh] response:", res.data);

        const payload = (res.data ?? {}) as {
          success?: boolean;
          data?: {
            accessToken?: string;
            refreshToken?: string;
          };
          accessToken?: string;
          refreshToken?: string;
        };

        const nestedData = payload.data ?? {};
        const newAccessToken =
          nestedData.accessToken ?? payload.accessToken ?? null;
        const newRefreshToken =
          nestedData.refreshToken ?? payload.refreshToken ?? refreshToken;

        console.log("[refresh] parsed accessToken:", newAccessToken);
        console.log("[refresh] parsed refreshToken:", newRefreshToken);

        if (!newAccessToken) {
          throw new Error("Refresh response missing accessToken");
        }

        setTokens(newAccessToken, newRefreshToken || "");
        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (hadSession) {
          forceLogoutForExpiredSession();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (hadSession) {
      forceLogoutForExpiredSession();
    }

    return Promise.reject(error);
  }
);

export default api;

