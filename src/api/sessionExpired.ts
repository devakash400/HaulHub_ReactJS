/** Called when access/refresh tokens are invalid or expired. */
let onSessionExpired: (() => void) | null = null;
let handling = false;

export const setSessionExpiredHandler = (handler: () => void) => {
  onSessionExpired = handler;
};

export const resetSessionExpiredGuard = () => {
  handling = false;
};

export const handleSessionExpired = () => {
  if (handling) return;
  handling = true;
  onSessionExpired?.();
};

const PUBLIC_AUTH_PATH =
  /\/api\/auth\/(login|register|refresh-token|check-email|check-phone|forgot-password|reset-password|otp\/)/;

export const isPublicAuthRequest = (url?: string) =>
  Boolean(url && PUBLIC_AUTH_PATH.test(url));
