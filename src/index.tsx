import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import App from "./App.tsx";

import reportWebVitals from "./reportWebVitals";
import { store } from "./store/index.ts";
import { loadTokensFromStorage, clearTokens } from "./api/api.ts";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { logout, initFromToken } from "./store/authSlice.ts";
import {
  resetSessionExpiredGuard,
  setSessionExpiredHandler,
} from "./api/sessionExpired.ts";

declare const process: {
  env: {
    REACT_APP_GOOGLE_CLIENT_ID?: string;
  };
};

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

// Initialize tokens from localStorage (if present) before app renders
loadTokensFromStorage();
// Populate Redux auth state from stored token (if any)
store.dispatch(initFromToken(localStorage.getItem("accessToken")));

setSessionExpiredHandler(() => {
  store.dispatch(logout());
  // Ensure tokens are removed from storage when session expires
  clearTokens();
  if (typeof window === "undefined") return;

  toast.error("Your session has expired. Please sign in again.");

  // Redirect to home page
  window.location.href = "/";
});

// Allow a new session after successful sign-in
store.subscribe(() => {
  if (store.getState().auth.isAuthenticated) {
    resetSessionExpiredGuard();
  }
});

const root = ReactDOM.createRoot(rootElement);

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <BrowserRouter>
          <>
            <App />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnHover
              draggable
              theme="colored"
            />
          </>
        </BrowserRouter>
      </Provider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);

reportWebVitals();
