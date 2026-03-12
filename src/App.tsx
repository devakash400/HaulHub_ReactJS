import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.tsx";
import BottomBar from "./components/BottomBar/BottomBar.tsx";
import Home from "./pages/Dashboard/Home.tsx";
import LoginPage from "./pages/Auth/Login/LoginPage.tsx";
import About from "./pages/About/About.tsx";
import Contact from "./pages/Contact/Contact.tsx";
import ListTrailer from "./pages/ListTrailer/ListTrailer.tsx";
import Placeholder from "./pages/Placeholder/Placeholder.tsx";
import HowItWorks from "./pages/HowItWorks/HowItWorks.tsx";
import TrustSafety from "./pages/TrustSafety/TrustSafety.tsx";
import GetHelp from "./pages/GetHelp/GetHelp.tsx";
import Trailer from "./pages/Dashboard/layouts/Trailer.tsx";
import AllTrailerPhotos from "./pages/Dashboard/layouts/AllTrailerPhotos.tsx";
import RequestToBookPage from "./pages/RequestToBookPage.tsx";
import BookingScreen from "./pages/BookingScreen/BookingScreen.tsx";
import LiabilityAgreement from "./pages/LiabilityAgreement/LiabilityAgreement.tsx";
import PaymentReceipt from "./pages/PaymentReceipt/PaymentReceipt.tsx";
import EditProfile from "./pages/EditProfile/EditProfile.tsx";
import Profile from "./pages/Profile/Profile.tsx";
import AccountSettings from "./pages/AccountSettings/AccountSettings.tsx";

const App: React.FC = () => {
  const location = useLocation();
  const hideNavFooter =
    location.pathname === "/request-to-book" ||
    location.pathname === "/liability-agreement";

  return (
    <div className="min-h-screen bg-background w-full max-w-full overflow-x-hidden min-w-0">
      {!hideNavFooter && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/account-settings" element={<AccountSettings />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/list-trailer" element={<ListTrailer />} />
        <Route path="/trailer/:id" element={<Trailer />} />
        <Route path="/trailer/:id/photos" element={<AllTrailerPhotos />} />
        <Route path="/request-to-book" element={<RequestToBookPage />} />
        <Route path="/liability-agreement" element={<LiabilityAgreement />} />
        <Route path="/payment-receipt" element={<PaymentReceipt />} />
        <Route path="/booking" element={<BookingScreen />} />
        <Route
          path="/why-choose"
          element={<Placeholder title="Why Choose HaulHub" />}
        />
        <Route path="/trust-safety" element={<TrustSafety />} />
        <Route path="/get-help" element={<GetHelp />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
      </Routes>
      {!hideNavFooter && <BottomBar />}
    </div>
  );
};

export default App;

