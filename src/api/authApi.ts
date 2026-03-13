import api, { setTokens, clearTokens } from "./api.ts";

export type LoginPayload = {
  email: string;
  password: string;
};

export type PhoneLoginPayload = {
  phoneNumber: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  newPassword: string;
};

export type OtpLoginPayload = {
  email: string;
  otp: string;
};

export type OtpRequestPayload = {
  email: string;
  purpose: "login" | "signup" | "forgot-password" | string;
};

export type CheckEmailPayload = {
  email: string;
};

export type CheckPhonePayload = {
  phoneNumber: string;
};

type BackendLoginResponse = {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    user: {
      id: string;
      email: string;
      fullName?: string;
      role?: string;
      [key: string]: unknown;
    };
  };
};

export type LoginResponse = {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: BackendLoginResponse["data"]["user"];
};

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const res = await api.post<BackendLoginResponse>("/api/auth/login", payload);
  const {
    success,
    data: { accessToken, refreshToken, expiresIn, user },
  } = res.data;

  setTokens(accessToken, refreshToken);

  return {
    success,
    accessToken,
    refreshToken,
    expiresIn,
    user,
  };
};

export const phoneLogin = async (
  payload: PhoneLoginPayload
): Promise<LoginResponse> => {
  const res = await api.post<BackendLoginResponse>("/api/auth/login", payload);
  const {
    success,
    data: { accessToken, refreshToken, expiresIn, user },
  } = res.data;

  setTokens(accessToken, refreshToken);

  return {
    success,
    accessToken,
    refreshToken,
    expiresIn,
    user,
  };
};

export const register = async (
  payload: RegisterPayload
): Promise<LoginResponse> => {
  // Backend expects only fullName, email, password (like Postman example)
  const { fullName, email, password } = payload;
  const res = await api.post<BackendLoginResponse>("/api/auth/register", {
    fullName,
    email,
    password,
  });

  const {
    success,
    data: { accessToken, refreshToken, expiresIn, user },
  } = res.data;

  setTokens(accessToken, refreshToken);

  // eslint-disable-next-line no-console
  console.log("register response:", res.data);

  return {
    success,
    accessToken,
    refreshToken,
    expiresIn,
    user,
  };
};

export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  const res = await api.post("/api/auth/forgot-password", payload);
  // eslint-disable-next-line no-console
  console.log("forgot-password response:", res.data);
  return res.data;
};

export const resetPassword = async (payload: ResetPasswordPayload) => {
  const res = await api.post("/api/auth/reset-password", payload);
  return res.data;
};

export const otpLogin = async (payload: OtpLoginPayload) => {
  const res = await api.post<BackendLoginResponse>("/api/auth/otp/login", payload);
  const {
    success,
    data: { accessToken, refreshToken, expiresIn, user },
  } = res.data;

  setTokens(accessToken, refreshToken);

  return {
    success,
    accessToken,
    refreshToken,
    expiresIn,
    user,
  };
};

export const otpRequest = async (payload: OtpRequestPayload) => {
  const res = await api.post("/api/auth/otp/request", payload);
  return res.data;
};

export const checkEmail = async (payload: CheckEmailPayload) => {
  const res = await api.post("/api/auth/check-email", payload);
  return res.data;
};

export const checkPhone = async (payload: CheckPhonePayload) => {
  const res = await api.post("/api/auth/check-phone", payload);
  return res.data;
};

export const logout = async () => {
  try {
    const storedRefresh =
      typeof window !== "undefined"
        ? window.localStorage.getItem("refreshToken")
        : null;

    const res = await api.post("/api/auth/logout", {
      refreshToken: storedRefresh ?? "",
    });
    // eslint-disable-next-line no-console
    console.log("logout response:", res.data);
  } catch {
    // ignore errors on logout
  }

  clearTokens();
};

