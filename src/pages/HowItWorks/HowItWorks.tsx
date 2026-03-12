import React from "react";
import { Link } from "react-router-dom";
import {
  Search,
  CalendarCheck,
  CreditCard,
  Truck,
  RotateCcw,
  Star,
  Shield,
  ArrowRight,
} from "lucide-react";

const STEPS = [
  {
    number: "1",
    title: "Browse & choose",
    description:
      "Search trailers by type, size, and location. Compare options, read reviews, and pick the trailer that fits your trip or project.",
    icon: Search,
    color: "bg-[#389131]/15 text-[#389131]",
  },
  {
    number: "2",
    title: "Request to book",
    description:
      "Select your dates and submit a request. The owner will confirm availability. You can message the owner with any questions before booking.",
    icon: CalendarCheck,
    color: "bg-amber-500/15 text-amber-700",
  },
  {
    number: "3",
    title: "Confirm & pay",
    description:
      "Once approved, complete payment securely through HaulHub. A refundable security deposit may apply. You’ll get pickup and return details from the owner.",
    icon: CreditCard,
    color: "bg-blue-500/15 text-blue-700",
  },
  {
    number: "4",
    title: "Pick up & use",
    description:
      "Meet the owner at the agreed time and location, do a quick walkthrough, and hit the road. Use the trailer for your move, project, or adventure.",
    icon: Truck,
    color: "bg-emerald-500/15 text-emerald-700",
  },
  {
    number: "5",
    title: "Return & review",
    description:
      "Return the trailer on time and in the same condition. The owner confirms return and your deposit is released. Leave a review to help the community.",
    icon: RotateCcw,
    color: "bg-violet-500/15 text-violet-700",
  },
];

const HowItWorks: React.FC = () => {
  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#F6F1E8] font-sans">
      {/* Hero */}
      <section className="relative w-full min-h-[45vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1200&h=500&fit=crop"
          alt="Trailer and truck on the road"
          className="h-full min-h-[45vh] w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-neutral-900/40 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md sm:text-4xl md:text-5xl">
              How it works
            </h1>
            <p className="mt-3 max-w-xl mx-auto text-lg text-white/90 drop-shadow">
              Rent the right trailer in a few simple steps
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1120px]">
        {/* Intro */}
        <section className="px-6 py-10 sm:px-10 sm:py-14">
          <p className="max-w-2xl text-base leading-relaxed text-neutral-800 sm:text-[1.05rem]">
            HaulHub makes trailer rental simple. Whether you need a flatbed for
            a one-time haul or a car hauler for a road trip, follow the steps
            below to find, book, and return a trailer with confidence.
          </p>
        </section>

        {/* Steps */}
        <section className="px-6 pb-10 sm:px-10 sm:pb-14">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Renting a trailer
          </h2>
          <div className="space-y-0">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === STEPS.length - 1;
              return (
                <div key={step.number} className="relative flex gap-5 sm:gap-6">
                  {/* Connector line (except last) */}
                  {!isLast && (
                    <div
                      className="absolute left-6 top-14 bottom-0 w-0.5 bg-neutral-200"
                      aria-hidden
                    />
                  )}
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#F6F1E8] shadow-sm">
                    <span className="font-bold text-lg text-neutral-800">
                      {step.number}
                    </span>
                  </div>
                  <div className="flex-1 pb-12 sm:pb-14">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${step.color}`}>
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <h3 className="text-xl font-semibold text-neutral-900 sm:text-2xl">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-base leading-relaxed text-neutral-700 sm:text-[1.05rem]">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Trust & safety snippet */}
        <section className="border-t border-neutral-200 px-6 py-10 sm:px-10 sm:py-14">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Safe and simple
          </h2>
          <div className="flex flex-wrap gap-6 sm:gap-10">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#389131]/15 text-[#389131]">
                <Shield className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <p className="font-semibold text-neutral-900">Secure payments</p>
                <p className="text-sm text-neutral-600">
                  Pay through HaulHub; deposits handled fairly.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#389131]/15 text-[#389131]">
                <Star className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <p className="font-semibold text-neutral-900">Reviews</p>
                <p className="text-sm text-neutral-600">
                  See what other renters say about owners and trailers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-neutral-200 px-6 py-10 sm:px-10 sm:py-14">
          <div className="rounded-2xl bg-neutral-900 px-6 py-10 text-center sm:px-10 sm:py-12">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base text-neutral-300">
              Browse available trailers or list your own to earn when it’s not in
              use.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full bg-[#389131] px-6 py-3 text-base font-semibold text-white no-underline transition hover:bg-[#2d7327] focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2 focus:ring-offset-neutral-900"
              >
                Browse trailers
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <Link
                to="/list-trailer"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/60 bg-transparent px-6 py-3 text-base font-semibold text-white no-underline transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900"
              >
                List your trailer
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default HowItWorks;
