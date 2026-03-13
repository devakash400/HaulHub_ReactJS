import React from "react";
import { CheckCircle2, ShieldCheck, Truck, Clock, Headphones } from "lucide-react";

const WhyChooseHaulHub: React.FC = () => {
  return (
    <div className="min-h-screen bg-white w-full min-w-0 overflow-x-hidden">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero section */}
        <section className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#389131] mb-3">
              Why choose HaulHub
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight">
              The easier way to{" "}
              <span className="text-[#389131]">find, book, and manage</span>{" "}
              trailers.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-xl">
              HaulHub connects contractors, logistics teams, and owners with the right
              trailers—on demand. Transparent pricing, verified equipment, and
              support from first click to final drop‑off.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 max-w-lg">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-7 w-7 rounded-full bg-[#E5F4E4] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-[#389131]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Trusted, verified fleet
                  </p>
                  <p className="text-xs text-gray-600">
                    Each listing is reviewed for safety, specs, and documentation.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-7 w-7 rounded-full bg-[#E5F4E4] flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#389131]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Minutes, not days
                  </p>
                  <p className="text-xs text-gray-600">
                    Search availability, confirm, and get on the road without back‑and‑forth calls.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-[#389131] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition"
              >
                Browse trailers
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
              >
                List your trailer
              </button>
              <p className="w-full text-[11px] text-gray-500">
                No hidden fees. Cancel‑friendly options on most rentals.
              </p>
            </div>
          </div>

          {/* Right: stats / card */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 shadow-[0_16px_40px_rgba(15,23,42,0.12)] p-6 bg-gradient-to-br from-[#f8fff7] via-white to-[#e6f6ff]">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-[0.16em] mb-2">
                HaulHub at a glance
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-semibold text-gray-900">3k+</p>
                  <p className="mt-1 text-[11px] text-gray-600">Active trailers</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900">4.9</p>
                  <p className="mt-1 text-[11px] text-gray-600">Avg. renter rating</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900">24/7</p>
                  <p className="mt-1 text-[11px] text-gray-600">Support coverage</p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-xl bg-white/80 px-4 py-3">
                <div className="h-9 w-9 rounded-full bg-[#E5F4E4] flex items-center justify-center">
                  <Truck className="w-5 h-5 text-[#389131]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900">
                    Built for heavy‑duty work
                  </p>
                  <p className="text-[11px] text-gray-600">
                    Flatbeds, goosenecks, car haulers and more—matched to your load and route.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-start gap-3">
                <div className="mt-0.5 h-7 w-7 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    Safety first
                  </p>
                  <p className="text-[11px] text-gray-600">
                    ID verification, liability agreements, and guided checklists keep both sides protected.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-start gap-3">
                <div className="mt-0.5 h-7 w-7 rounded-full bg-[#FDF2E9] flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-[#C05621]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    People who pick up
                  </p>
                  <p className="text-[11px] text-gray-600">
                    Talk to real support when plans change, routes shift, or loads run late.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Three-column feature row */}
        <section className="mt-12 border-t border-gray-100 pt-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Why teams rely on HaulHub
          </h2>
          <p className="mt-2 text-sm text-gray-600 max-w-2xl">
            From owner‑operators to nationwide fleets, HaulHub reduces friction in every haul.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-semibold text-gray-900">
                Clear, upfront pricing
              </p>
              <p className="mt-2 text-xs text-gray-600">
                See rate, fees, and terms before you book—no surprise invoices or last‑minute add‑ons.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-semibold text-gray-900">
                Flexible rental windows
              </p>
              <p className="mt-2 text-xs text-gray-600">
                Hourly, daily, or project‑based bookings so you only pay for what you actually use.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-semibold text-gray-900">
                Designed for field teams
              </p>
              <p className="mt-2 text-xs text-gray-600">
                Mobile‑friendly flows, quick ID checks, and simple review tools built for busy job sites.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default WhyChooseHaulHub;

