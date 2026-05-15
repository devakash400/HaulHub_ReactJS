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
import { loadTokensFromStorage } from "./api/api.ts";
import { logout } from "./store/authSlice.ts";
import {
  resetSessionExpiredGuard,
  setSessionExpiredHandler,
} from "./api/sessionExpired.ts";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

// Initialize tokens from localStorage (if present) before app renders
loadTokensFromStorage();

setSessionExpiredHandler(() => {
  store.dispatch(logout());
  if (typeof window === "undefined") return;

  toast.error("Your session has expired. Please sign in again.");
  window.sessionStorage.setItem("openLoginAfterLogout", "1");

  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
});

// Allow a new session after successful sign-in
store.subscribe(() => {
  if (store.getState().auth.isAuthenticated) {
    resetSessionExpiredGuard();
  }
});

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
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
  </React.StrictMode>
);

reportWebVitals();