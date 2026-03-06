import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { images } from "../assets/images/index.ts";
import { BookingStepCard } from "../components/RequestToBook/BookingStepCard.tsx";
import { BookingSummaryCard } from "../components/RequestToBook/BookingSummaryCard.tsx";
import type { BookingSummary } from "../components/RequestToBook/types.ts";

const defaultBookingSummary: BookingSummary = {
  title: "Gooseneck Trailer - Texas, USA",
  subtitle: "25FT Flatbed · Dual Axle · Industrial Steel Frame",
  image: images.Catimg,
  dates: "17-15 March 2026",
  totalPrice: "$21,993.50",
  cancellationPreview: "Cancel before check-in on 2 March for a partial refund.",
  policyLinkText: "Fully Policy",
};

const RequestToBookPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as
    | {
        title?: string;
        subtitle?: string;
        image?: string;
        totalPrice?: string;
        dates?: string;
      }
    | null
    | undefined;

  const bookingSummary: BookingSummary = state
    ? {
        title: state.title ?? defaultBookingSummary.title,
        subtitle: state.subtitle ?? defaultBookingSummary.subtitle,
        image: state.image || defaultBookingSummary.image,
        dates: state.dates ?? defaultBookingSummary.dates,
        totalPrice: state.totalPrice ?? defaultBookingSummary.totalPrice,
        cancellationPreview: defaultBookingSummary.cancellationPreview,
        policyLinkText: defaultBookingSummary.policyLinkText,
      }
    : defaultBookingSummary;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EF] w-full min-w-0 overflow-x-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-gray-200/60 bg-[#F7F5EF] z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-3">
          {/* Logo - top row */}
          <div className="mb-3">
            <Link to="/" className="inline-block shrink-0">
              <img
                src={images.logo}
                alt="HaulHub"
                className="h-12 object-contain"
              />
            </Link>
          </div>
          {/* Back + title - same row, aligned */}
          <div className="relative flex items-center min-h-[40px]">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="flex-shrink-0 p-1 -ml-1 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="absolute left-1/2 -translate-x-1/2 text-xl sm:text-2xl font-bold text-gray-900 m-0">
              Request to book
            </h1>
            <div className="w-10 shrink-0" aria-hidden />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 content-start min-w-0">
          {/* Left column - booking steps */}
          <div className="lg:col-span-2 space-y-4 lg:max-w-[340px] min-w-0 w-full">
            <BookingStepCard
              title="Log in or sign Up"
              showContinueButton
              onContinue={() => navigate("/login")}
            />
            <BookingStepCard title="Add Payment method" />
            <BookingStepCard title="Review your request" />
          </div>

          {/* Right column - booking summary */}
          <div className="lg:col-span-3 min-w-0 w-full">
            <div className="lg:sticky lg:top-28">
              <BookingSummaryCard data={bookingSummary} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RequestToBookPage;
