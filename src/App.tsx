import React from "react";
import { Routes, Route, useLocation, type Location } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.tsx";
import BottomBar from "./components/BottomBar/BottomBar.tsx";
import Home from "./pages/Dashboard/Home.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
// Auth flows are now handled via in-place modals; no dedicated auth routes
import About from "./pages/About/About.tsx";
import Contact from "./pages/Contact/Contact.tsx";
import ListTrailer from "./pages/ListTrailer/ListTrailer.tsx";
import WhyChooseHaulHub from "./pages/WhyChoose/WhyChooseHaulHub.tsx";
import HowItWorks from "./pages/HowItWorks/HowItWorks.tsx";
import TrustSafety from "./pages/TrustSafety/TrustSafety.tsx";
import GetHelp from "./pages/GetHelp/GetHelp.tsx";
import Trailer from "./pages/Dashboard/layouts/Trailer.tsx";
import AllTrailerPhotos from "./pages/Dashboard/layouts/AllTrailerPhotos.tsx";
import TrailerReviews from "./pages/Dashboard/layouts/TrailerReviews.tsx";
import RequestToBookPage from "./pages/RequestToBookPage.tsx";
import BookingScreen from "./pages/BookingScreen/BookingScreen.tsx";
import LiabilityAgreement from "./pages/LiabilityAgreement/LiabilityAgreement.tsx";
import PaymentReceipt from "./pages/PaymentReceipt/PaymentReceipt.tsx";
import BookingSent from "./pages/BookingSent/BookingSent.tsx";
import VerifyIdentity from "./pages/VerifyIdentity/VerifyIdentity.tsx";
import PreScreening from "./pages/PreScreening/PreScreening.tsx";
import Profile from "./pages/Profile/Profile.tsx";
import AccountSettings from "./pages/AccountSettings/AccountSettings.tsx";
import Wishlist from "./pages/Wishlist/Wishlist.tsx";
import Notifications from "./pages/Notifications/Notifications.tsx";
import TrailorCondition from "./pages/TrailorCondition/TrailorCondition.tsx";
import TrailorConditionAfter from "./pages/TrailorCondition/TrailorConditionAfter.tsx";
import Return from "./pages/Return/Return.tsx";
import OwnerTruckDescription from "./pages/OwnerTruckDescription/OwnerTruckDescription.tsx";
import OwnerViewMoreTrucks from "./pages/OwnerViewMoreTrucks/OwnerViewMoreTrucks.tsx";
import LoginPage from "./pages/Auth/Login/LoginPage.tsx";
import SignupPage from "./pages/Auth/Signup/SignupPage.tsx";
import ForgotPasswordPage from "./pages/Auth/ForgotPassword/ForgotPasswordPage.tsx";
import OtpPage from "./pages/Auth/Otp/OtpPage.tsx";
import NewPasswordPage from "./pages/Auth/NewPassword/NewPasswordPage.tsx";

type LocationState = {
  backgroundLocation?: Location;
};

const App: React.FC = () => {
  const currentLocation = useLocation();
  const state = currentLocation.state as LocationState | null;
  const backgroundLocation = state?.backgroundLocation ?? currentLocation;
  const effectivePathname = backgroundLocation.pathname;
  const hideNavFooter =
    effectivePathname === "/request-to-book" ||
    effectivePathname === "/prescreening" ||
    effectivePathname === "/liability-agreement";
  const contentTopPadding = hideNavFooter
    ? ""
    : effectivePathname === "/"
      ? "pt-[124px] sm:pt-[76px]"
      : "pt-[76px]";

  return (
    <div className="min-h-screen bg-background w-full max-w-full overflow-x-hidden min-w-0">
      <ScrollToTop /> {!hideNavFooter && <Navbar />}
      <main className={contentTopPadding}>
        <Routes location={backgroundLocation}>
          <Route path="/" element={<Home />} />
          {/* Auth routes (login/signup/forgot/otp/new-password) */}

          <Route
            path="/signup"
            element={
              <>
                <Home />
                <SignupPage />
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <Home />
                <LoginPage />
              </>
            }
          />

          <Route
            path="/signup"
            element={
              <>
                <Home />
                <SignupPage />
              </>
            }
          />

          <Route
            path="/reset-password"
            element={
              <>
                <Home />
                <ForgotPasswordPage />
              </>
            }
          />

          <Route
            path="/otp"
            element={
              <>
                <Home />
                <OtpPage />
              </>
            }
          />

          <Route
            path="/Newpassword"
            element={
              <>
                <Home />
                <NewPasswordPage />
              </>
            }
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/list-trailer" element={<ListTrailer />} />
          <Route path="/trailor-condition" element={<TrailorCondition />} />
          <Route
            path="/trailor-condition-after"
            element={<TrailorConditionAfter />}
          />
          <Route path="/return" element={<Return />} />
          <Route path="/owner/truck/:id" element={<OwnerTruckDescription />} />
          <Route
            path="/owner/view-more-trucks"
            element={<OwnerViewMoreTrucks />}
          />
          <Route path="/trailer/:id" element={<Trailer />} />
          <Route path="/trailer/:id/photos" element={<AllTrailerPhotos />} />
          <Route path="/trailer/:id/reviews" element={<TrailerReviews />} />
          <Route path="/request-to-book" element={<RequestToBookPage />} />
          <Route path="/liability-agreement" element={<LiabilityAgreement />} />
          <Route path="/prescreening" element={<PreScreening />} />
          <Route path="/verify-identity" element={<VerifyIdentity />} />
          <Route path="/booking-sent" element={<BookingSent />} />
          <Route path="/payment-receipt" element={<PaymentReceipt />} />
          <Route path="/booking" element={<BookingScreen />} />
          <Route path="/why-choose" element={<WhyChooseHaulHub />} />
          <Route path="/trust-safety" element={<TrustSafety />} />
          <Route path="/get-help" element={<GetHelp />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
        </Routes>
        {state?.backgroundLocation && (
          <Routes>
            <Route
              path="/verify-identity"
              element={
                <div className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                  <div className="w-full max-w-[1100px] max-h-[90vh] overflow-auto">
                    <VerifyIdentity />
                  </div>
                </div>
              }
            />
            <Route
              path="/prescreening"
              element={
                <div
                  className="modal-overlay 
                fixed inset-0 z-[100] flex 
                items-center justify-center bg-black/50"
                >
                  <div
                    className="w-full h-full 
                   overflow-auto"
                  >
                    <PreScreening />
                  </div>
                </div>
              }
            />
          </Routes>
        )}
      </main>
      {!hideNavFooter && <BottomBar />}
    </div>
  );
};

export default App;
