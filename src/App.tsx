import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.tsx";
import BottomBar from "./components/BottomBar/BottomBar.tsx";
import Home from "./pages/Dashboard/Home.tsx";
import LoginPage from "./pages/Auth/Login/LoginPage.tsx";
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
import Profile from "./pages/Profile/Profile.tsx";
import AccountSettings from "./pages/AccountSettings/AccountSettings.tsx";
import Wishlist from "./pages/Wishlist/Wishlist.tsx";
import Notifications from "./pages/Notifications/Notifications.tsx";
import TrailorCondition from "./pages/TrailorCondition/TrailorCondition.tsx";
import TrailorConditionAfter from "./pages/TrailorCondition/TrailorConditionAfter.tsx";
import Return from "./pages/Return/Return.tsx";
import OwnerTruckDescription from "./pages/OwnerTruckDescription/OwnerTruckDescription.tsx";
import OwnerViewMoreTrucks from "./pages/OwnerViewMoreTrucks/OwnerViewMoreTrucks.tsx";

const App: React.FC = () => {
  const location = useLocation();
  const hideNavFooter =
    location.pathname === "/request-to-book" ||
    location.pathname === "/liability-agreement";
  const contentTopPadding = hideNavFooter
    ? ""
    : location.pathname === "/"
      ? "pt-[124px] sm:pt-[76px]"
      : "pt-[76px]";

  return (
    <div className="min-h-screen bg-background w-full max-w-full overflow-x-hidden min-w-0">
      {!hideNavFooter && <Navbar />}
      <main className={contentTopPadding}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/list-trailer" element={<ListTrailer />} />
          <Route path="/trailor-condition" element={<TrailorCondition />} />
          <Route path="/trailor-condition-after" element={<TrailorConditionAfter />} />
          <Route path="/return" element={<Return />} />
          <Route path="/owner/truck/:id" element={<OwnerTruckDescription />} />
          <Route path="/owner/view-more-trucks" element={<OwnerViewMoreTrucks />} />
          <Route path="/trailer/:id" element={<Trailer />} />
          <Route path="/trailer/:id/photos" element={<AllTrailerPhotos />} />
          <Route path="/trailer/:id/reviews" element={<TrailerReviews />} />
          <Route path="/request-to-book" element={<RequestToBookPage />} />
          <Route path="/liability-agreement" element={<LiabilityAgreement />} />
          <Route path="/payment-receipt" element={<PaymentReceipt />} />
          <Route path="/booking" element={<BookingScreen />} />
          <Route path="/why-choose" element={<WhyChooseHaulHub />} />
          <Route path="/trust-safety" element={<TrustSafety />} />
          <Route path="/get-help" element={<GetHelp />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
        </Routes>
      </main>
      {!hideNavFooter && <BottomBar />}
    </div>
  );
};

export default App;

