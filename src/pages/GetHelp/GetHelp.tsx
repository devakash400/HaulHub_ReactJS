import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CreditCard,
  Truck,
  User,
  MessageCircle,
  ChevronDown,
  Search,
  ArrowRight,
  Mail,
  FileText,
  Shield,
} from "lucide-react";

const HELP_CATEGORIES = [
  {
    icon: BookOpen,
    title: "Booking & rentals",
    description: "How to request, confirm, modify, or cancel a booking.",
    color: "bg-[#389131]/15 text-[#389131]",
  },
  {
    icon: CreditCard,
    title: "Payments & deposits",
    description: "Billing, refunds, security deposits, and payment methods.",
    color: "bg-amber-500/15 text-amber-700",
  },
  {
    icon: Truck,
    title: "Listings & trailers",
    description: "Listing your trailer, editing details, and availability.",
    color: "bg-blue-500/15 text-blue-700",
  },
  {
    icon: User,
    title: "Account & profile",
    description: "Sign up, login, password reset, and account settings.",
    color: "bg-emerald-500/15 text-emerald-700",
  },
  {
    icon: Shield,
    title: "Trust & safety",
    description: "Verification, reviews, and reporting issues.",
    color: "bg-violet-500/15 text-violet-700",
  },
];

const FAQ_ITEMS = [
  {
    question: "How do I request to book a trailer?",
    answer:
      "Find the trailer you want, select your dates, and click “Request to book.” The owner will receive your request and can approve or decline. You can message the owner with questions before or after submitting.",
  },
  {
    question: "When do I pay for my rental?",
    answer:
      "Payment is collected after the owner approves your request. You’ll complete payment securely through HaulHub. A refundable security deposit may be required and will be released after the trailer is returned in good condition.",
  },
  {
    question: "How do I list my trailer on HaulHub?",
    answer:
      "Go to “List your trailer” and add photos, description, location, and pricing. Once submitted, your listing will be reviewed and then go live so renters can find and request your trailer.",
  },
  {
    question: "What if I need to cancel my booking?",
    answer:
      "Cancellation policies depend on the owner’s settings and how close you are to the rental date. Check the listing for the specific policy. You can cancel from your booking details; refunds are processed according to that policy.",
  },
  {
    question: "Who do I contact for support?",
    answer:
      "For general questions, booking issues, or payment help, use the Contact form or email support. For urgent safety or policy concerns, contact us and we’ll prioritize your request.",
  },
];

const GetHelp: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaq =
    searchQuery.trim() === ""
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter(
          (item) =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
        );

  return (
    <main
      style={{ fontFamily: "Lexend" }}
      className="min-h-screen w-full min-w-0 
    overflow-x-hidden bg-[#F6F1E8] font-sans"
    >
      {/* Hero */}
      <section className="relative w-full min-h-[40vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=500&fit=crop"
          alt="Support and help"
          className="h-full min-h-[40vh] w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-neutral-900/50 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md sm:text-4xl md:text-5xl">
              Get help
            </h1>
            <p className="mt-3 max-w-xl mx-auto text-lg text-white/90 drop-shadow">
              Find answers, guides, and support for your HaulHub experience
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-full">
        {/* Help categories */}
        <section className="px-6 py-10 sm:px-10 sm:py-14">
          <h2 className="mb-6 font-normal text-[32px] leading-none tracking-normal text-black">
            Browse by topic
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HELP_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.title}
                  to={
                    cat.title.includes("Trust")
                      ? "/trust-safety"
                      : cat.title.includes("Booking")
                        ? "/how-it-works"
                        : "/contact"
                  }
                  className="flex gap-4 rounded-xl border border-neutral-200 bg-white/60 p-5 shadow-sm transition hover:border-[#389131]/40 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${cat.color}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-neutral-900">
                      {cat.title}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                  <ArrowRight
                    className="h-5 w-5 shrink-0 text-gray-400 self-center"
                    aria-hidden
                  />
                </Link>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-neutral-200 px-6 py-10 sm:px-10 sm:py-14">
          <h2 className="mb-6 font-normal text-[32px] leading-none tracking-normal text-black">
            Frequently asked questions
          </h2>
          <div className="space-y-2">
            {filteredFaq.length === 0 ? (
              <p className="rounded-xl border border-neutral-200 bg-white/60 px-5 py-8 text-center text-neutral-600">
                No results for “{searchQuery}”. Try different keywords or{" "}
                <Link
                  to="/contact"
                  className="text-[#389131] font-medium hover:underline"
                >
                  contact us
                </Link>
                .
              </p>
            ) : (
              filteredFaq.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="rounded-xl border border-neutral-200 bg-white/60 shadow-sm overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-neutral-900 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-inset"
                      aria-expanded={isOpen}
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        aria-hidden
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-neutral-100 px-5 py-4 bg-white/40">
                        <p className="text-base leading-relaxed text-neutral-700">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Quick links */}
        <section className="border-t border-neutral-200 px-6 py-10 sm:px-10 sm:py-14">
          <h2 className="mb-6 font-normal text-[32px] leading-none tracking-normal text-black">
            Quick links
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/how-it-works"
              className="inline-flex w-[200px] items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-neutral-800 no-underline transition hover:border-[#389131]/40 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2"
            >
              <FileText className="h-5 w-5 text-[#389131]" />
              How it works
            </Link>

            <Link
              to="/trust-safety"
              className="inline-flex w-[200px] items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-neutral-800 no-underline transition hover:border-[#389131]/40 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2"
            >
              <Shield className="h-5 w-5 text-[#389131]" />
              Trust & safety
            </Link>

            <Link
              to="/contact"
              className="inline-flex w-[200px] items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-neutral-800 no-underline transition hover:border-[#389131]/40 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2"
            >
              <Mail className="h-5 w-5 text-[#389131]" />
              Contact us
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-neutral-200 px-6 py-10 sm:px-10 sm:py-14">
          <div className="rounded-2xl bg-neutral-900 px-6 py-10 text-center sm:px-10 sm:py-12">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#389131]/20 text-[#389131]">
              <MessageCircle className="h-7 w-7" aria-hidden />
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Still need help?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base text-neutral-300">
              Our team is here for you. Send us a message and we’ll get back to
              you as soon as we can.
            </p>
            <div className="mt-8">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[#389131] px-6 py-3 text-base font-semibold text-white no-underline transition hover:bg-[#2d7327] focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2 focus:ring-offset-neutral-900"
              >
                Contact support
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default GetHelp;
