import React from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  CreditCard,
  Star,
  FileCheck,
  AlertTriangle,
  MessageCircle,
  Lock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const TRUST_PILLARS = [
  {
    icon: Shield,
    title: "Verified listings",
    description:
      "Trailer owners list real equipment with photos and details. We encourage accurate descriptions so renters know exactly what they're booking.",
    color: "bg-[#389131]/15 text-[#389131]",
  },
  {
    icon: CreditCard,
    title: "Secure payments & deposits",
    description:
      "Pay through HaulHub so your transaction is protected. Refundable security deposits are held until the trailer is returned in agreed condition.",
    color: "bg-amber-500/15 text-amber-700",
  },
  {
    icon: Star,
    title: "Reviews & ratings",
    description:
      "See what other renters say about owners and trailers. Leave honest reviews after your rental to help the community make informed decisions.",
    color: "bg-blue-500/15 text-blue-700",
  },
  {
    icon: FileCheck,
    title: "Clear rental terms",
    description:
      "Booking details, pickup/return times, and condition are documented in the app. Photos can be held until delivery is complete and the owner confirms return.",
    color: "bg-emerald-500/15 text-emerald-700",
  },
];

const GUIDELINES = [
  "Inspect the trailer with the owner at pickup and return.",
  "Use the trailer only for its intended purpose and within legal limits.",
  "Return the trailer on time and in the same condition you received it.",
  "Communicate promptly with the owner about any issues or changes.",
  "Follow local laws regarding towing, weight limits, and licensing.",
];

const TrustSafety: React.FC = () => {
  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#F6F1E8] font-sans">
      {/* Hero */}
      <section className="relative w-full min-h-[45vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1200&h=500&fit=crop"
          alt="Trailer and truck on the road"
          className="h-full min-h-[45vh] w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-neutral-900/50 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md sm:text-4xl md:text-5xl">
              Trust & Safety
            </h1>
            <p className="mt-3 max-w-xl mx-auto text-lg text-white/90 drop-shadow">
              Your security and peace of mind matter to us
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1120px]">
        {/* Intro */}
        <section className="px-6 py-10 sm:px-10 sm:py-14">
          <p className="max-w-2xl text-base leading-relaxed text-neutral-800 sm:text-[1.05rem]">
            HaulHub is built to keep renters and trailer owners safe. From
            secure payments and refundable deposits to reviews and clear
            guidelines, we work to make every rental transparent and
            trustworthy.
          </p>
        </section>

        {/* Trust pillars - grid */}
        <section className="px-6 py-10 sm:px-10 sm:py-14 border-t border-neutral-200">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            How we protect you
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {TRUST_PILLARS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex gap-4 rounded-xl border border-neutral-200 bg-white/60 p-6 shadow-sm"
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${item.color}`}
                  >
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 sm:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-neutral-700 sm:text-[1.05rem]">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Safety guidelines */}
        <section className="border-t border-neutral-200 px-6 py-10 sm:px-10 sm:py-14">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Safety guidelines
          </h2>
          <p className="mb-6 max-w-2xl text-base leading-relaxed text-neutral-800 sm:text-[1.05rem]">
            Following these practices helps keep everyone safe and ensures a
            smooth rental experience.
          </p>
          <ul className="space-y-3">
            {GUIDELINES.map((guideline, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-base text-neutral-800 sm:text-[1.05rem]"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#389131]/15 text-[#389131]">
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                </span>
                {guideline}
              </li>
            ))}
          </ul>
        </section>

        {/* Deposits & photos */}
        <section className="border-t border-neutral-200 px-6 py-10 sm:px-10 sm:py-14">
          <div className="flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50/80 p-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-700">
              <Lock className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-amber-900">
                Deposits & condition photos
              </h3>
              <p className="mt-2 text-base leading-relaxed text-amber-900/90">
                Owners and renters can exchange photos in the app. HaulHub holds
                them until delivery is complete and the owner confirms the
                trailer was returned in the same condition. Once confirmed, the
                deposit is cleared for return. This keeps both sides protected
                and accountable.
              </p>
            </div>
          </div>
        </section>

        {/* Reporting */}
        <section className="border-t border-neutral-200 px-6 py-10 sm:px-10 sm:py-14">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Report an issue
          </h2>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch">
            <div className="flex flex-1 gap-4 rounded-xl border border-neutral-200 bg-white/60 p-6 shadow-sm">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-700">
                <AlertTriangle className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  Safety or policy concerns
                </h3>
                <p className="mt-2 text-base leading-relaxed text-neutral-700">
                  If you experience fraud, safety issues, or behavior that
                  violates our policies, please contact us. We take reports
                  seriously and will follow up as appropriate.
                </p>
              </div>
            </div>
            <div className="flex flex-1 gap-4 rounded-xl border border-neutral-200 bg-white/60 p-6 shadow-sm">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#389131]/15 text-[#389131]">
                <MessageCircle className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  General support
                </h3>
                <p className="mt-2 text-base leading-relaxed text-neutral-700">
                  For questions about your booking, payments, or how things work,
                  our team is here to help.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-neutral-200 px-6 py-10 sm:px-10 sm:py-14">
          <div className="rounded-2xl bg-neutral-900 px-6 py-10 text-center sm:px-10 sm:py-12">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Need help or have questions?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base text-neutral-300">
              Reach out anytime for support, to report an issue, or to learn more
              about how we keep the marketplace safe.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[#389131] px-6 py-3 text-base font-semibold text-white no-underline transition hover:bg-[#2d7327] focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2 focus:ring-offset-neutral-900"
              >
                Contact us
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/60 bg-transparent px-6 py-3 text-base font-semibold text-white no-underline transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900"
              >
                How it works
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default TrustSafety;
