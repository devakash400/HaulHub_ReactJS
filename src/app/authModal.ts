export type AuthModalType = "login" | "signup" | "reset" | "newPassword";

export function openAuthModal(type: AuthModalType = "login") {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent("openAuthModal", { detail: type }));
  } catch (e) {
    // fallback for older browsers
    // @ts-ignore
    window.__OPEN_AUTH_MODAL__ = type;
  }
}

export function listenAuthModal(handler: (type: AuthModalType) => void) {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => {
    // @ts-ignore
    const t = (e as CustomEvent).detail as AuthModalType;
    if (!t) return;
    handler(t);
  };
  window.addEventListener("openAuthModal", listener as EventListener);
  return () => window.removeEventListener("openAuthModal", listener as EventListener);
}
