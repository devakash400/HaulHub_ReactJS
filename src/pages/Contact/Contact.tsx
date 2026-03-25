import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { images } from "../../assets/images/index.ts";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic can be added here
  };

  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#F3F1E9] font-sans px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-[1120px]">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:gap-6">
          <div className="w-full overflow-hidden rounded-[14px] lg:w-[46%] lg:min-w-0 shrink-0">
            <img
              src={images.Contact}
              alt="Dump trailer at dealership"
              className="h-[300px] w-full object-cover object-center sm:h-[420px] lg:h-[760px]"
            />
          </div>

          <div className="flex flex-1 flex-col lg:min-w-0 pt-1">
            <h1 className="mb-5 text-3xl font-semibold tracking-tight text-[#389131] sm:text-4xl lg:text-[42px] lg:leading-[1]">
              Contact Us
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-1.5 block text-sm font-medium leading-[1.2] text-neutral-900 sm:text-base"
                >
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="Enter your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-[48px] w-full rounded-[2px] border border-[#dbdbdb] bg-white px-3.5 text-sm text-neutral-800 shadow-[0_1px_3px_rgba(0,0,0,0.14)] placeholder:text-[#c6c6c6] focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15 sm:text-[15px]"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="mb-1.5 block text-sm font-medium leading-[1.2] text-neutral-900 sm:text-base"
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  placeholder="Enter your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-[48px] w-full rounded-[2px] border border-[#dbdbdb] bg-white px-3.5 text-sm text-neutral-800 shadow-[0_1px_3px_rgba(0,0,0,0.14)] placeholder:text-[#c6c6c6] focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15 sm:text-[15px]"
                />
              </div>

              <div className="relative">
                <label
                  htmlFor="contact-service"
                  className="mb-1.5 block text-sm font-medium leading-[1.2] text-neutral-900 sm:text-base"
                >
                  What service are you interested in
                </label>
                <select
                  id="contact-service"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="h-[48px] w-full appearance-none rounded-[2px] border border-[#dbdbdb] bg-white px-3.5 pr-10 text-sm text-neutral-800 shadow-[0_1px_3px_rgba(0,0,0,0.14)] focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15 sm:text-[15px]"
                >
                  <option value="" className="text-[#bdbdbd]">
                    Select Service type
                  </option>
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute bottom-[17px] right-3 text-neutral-700">
                  <ChevronDown className="h-5 w-5" aria-hidden />
                </span>
              </div>

              <div className="relative">
                <label
                  htmlFor="contact-budget"
                  className="mb-1.5 block text-sm font-medium leading-[1.2] text-neutral-900 sm:text-base"
                >
                  Budget
                </label>
                <select
                  id="contact-budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="h-[48px] w-full appearance-none rounded-[2px] border border-[#dbdbdb] bg-white px-3.5 pr-10 text-sm text-neutral-800 shadow-[0_1px_3px_rgba(0,0,0,0.14)] focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15 sm:text-[15px]"
                >
                  <option value="" className="text-[#bdbdbd]">
                    Select project budget
                  </option>
                  {BUDGET_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute bottom-[17px] right-3 text-neutral-700">
                  <ChevronDown className="h-5 w-5" aria-hidden />
                </span>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-1.5 block text-sm font-medium leading-[1.2] text-neutral-900 sm:text-base"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  placeholder=""
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="min-h-[128px] w-full resize-y rounded-[2px] border border-[#dbdbdb] bg-white px-3.5 py-2.5 text-sm text-neutral-800 shadow-[0_1px_3px_rgba(0,0,0,0.14)] placeholder:text-[#c6c6c6] focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15 sm:text-[15px]"
                />
              </div>

              <div className="pt-1.5">
                <button
                  type="submit"
                  className="h-[48px] w-full rounded-[2px] bg-[#389131] px-6 text-base font-semibold leading-none text-white transition-colors hover:bg-[#2d7326] focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2 sm:text-xl"
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
