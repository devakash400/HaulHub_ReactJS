import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const SERVICE_OPTIONS = [
  "Trailer Rental",
  "Equipment Hauling",
  "Dump Trailer",
  "Flatbed",
  "Enclosed Cargo",
  "Other",
];

const BUDGET_OPTIONS = [
  "Under $100",
  "$100 – $250",
  "$250 – $500",
  "$500 – $1,000",
  "$1,000+",
];

const Contact: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [serviceOpen, setServiceOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const serviceRef = useRef<HTMLDivElement>(null);
  const budgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (serviceRef.current && !serviceRef.current.contains(e.target as Node)) setServiceOpen(false);
      if (budgetRef.current && !budgetRef.current.contains(e.target as Node)) setBudgetOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic can be added here
  };

  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#F6F1E8] font-sans">
      <div className="mx-auto max-w-[1120px] px-4 py-10 sm:px-6 sm:py-14">
        {/* Two columns: image left, form right */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
          {/* Left: Trailer image */}
          <div className="w-full lg:w-[45%] lg:min-w-0 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=600&fit=crop"
              alt="Dump trailer at dealership"
              className="h-full min-h-[280px] w-full rounded-xl object-cover object-center sm:min-h-[360px]"
            />
          </div>

          {/* Right: Contact form */}
          <div className="flex flex-1 flex-col lg:min-w-0">
            <h1 className="mb-6 text-3xl font-bold tracking-tight text-[#389131] sm:text-4xl">
              Contact Us
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-1.5 block text-sm font-medium text-neutral-800"
                >
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="Enter your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-neutral-800 placeholder:text-gray-500 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/20"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="contact-email"
                  className="mb-1.5 block text-sm font-medium text-neutral-800"
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  placeholder="Enter your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-neutral-800 placeholder:text-gray-500 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/20"
                />
              </div>

              {/* Service Type dropdown */}
              <div ref={serviceRef} className="relative">
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                  What service are you interested in
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setServiceOpen(!serviceOpen);
                    setBudgetOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-left text-neutral-800 placeholder:text-gray-500 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/20"
                >
                  <span className={serviceType ? "text-neutral-800" : "text-gray-500"}>
                    {serviceType || "Select Service type"}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${serviceOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
                {serviceOpen && (
                  <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    {SERVICE_OPTIONS.map((opt) => (
                      <li key={opt}>
                        <button
                          type="button"
                          onClick={() => {
                            setServiceType(opt);
                            setServiceOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-neutral-800 hover:bg-gray-100"
                        >
                          {opt}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Budget dropdown */}
              <div ref={budgetRef} className="relative">
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                  Budget
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setBudgetOpen(!budgetOpen);
                    setServiceOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-left text-neutral-800 placeholder:text-gray-500 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/20"
                >
                  <span className={budget ? "text-neutral-800" : "text-gray-500"}>
                    {budget || "Select project budget"}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${budgetOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
                {budgetOpen && (
                  <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    {BUDGET_OPTIONS.map((opt) => (
                      <li key={opt}>
                        <button
                          type="button"
                          onClick={() => {
                            setBudget(opt);
                            setBudgetOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-neutral-800 hover:bg-gray-100"
                        >
                          {opt}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-1.5 block text-sm font-medium text-neutral-800"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  placeholder="Tell us about your project or question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-neutral-800 placeholder:text-gray-500 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/20"
                />
              </div>

              {/* Submit */}
              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#389131] px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#2d7326] focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;
