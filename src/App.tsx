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
import Trailer from "./pages/Dashboard/layouts/Trailer.tsx";
import AllTrailerPhotos from "./pages/Dashboard/layouts/AllTrailerPhotos.tsx";
import RequestToBookPage from "./pages/RequestToBookPage.tsx";

const App: React.FC = () => {
  const location = useLocation();
  const hideNavFooter = location.pathname === "/request-to-book";

  return (
    <div className="min-h-screen bg-background w-full max-w-full overflow-x-hidden min-w-0">
      {!hideNavFooter && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/list-trailer" element={<ListTrailer />} />
        <Route path="/trailer/:id" element={<Trailer />} />
        <Route path="/trailer/:id/photos" element={<AllTrailerPhotos />} />
        <Route path="/request-to-book" element={<RequestToBookPage />} />
        <Route
          path="/why-choose"
          element={<Placeholder title="Why Choose HaulHub" />}
        />
        <Route
          path="/trust-safety"
          element={<Placeholder title="Trust & Safety" />}
        />
        <Route path="/get-help" element={<Placeholder title="Get Help" />} />
        <Route
          path="/how-it-works"
          element={<Placeholder title="How It Works" />}
        />
      </Routes>
      {!hideNavFooter && <BottomBar />}
    </div>
  );
};

export default App;

