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
  };

  return (
    <main
      className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#F6F3E9] font-sans px-4 py-8 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-[1120px]">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:gap-6">
          {/* Left Image */}
          <div className="w-full overflow-hidden rounded-[24px] lg:w-[46%] lg:min-w-0 shrink-0">
            <img
              src={images.Contact}
              alt="Dump trailer at dealership"
              className="h-[300px] w-[594px] object-cover object-center sm:h-[420px] lg:h-[800px]"
            />
          </div>

          {/* Right Form */}
          <div className="flex flex-1 flex-col lg:min-w-0">
            <h1
              className="mb-10"
              style={{
                fontFamily: "Lexend",
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "57px",
                lineHeight: "120%",
                letterSpacing: "0%",
                color: "#389131",
              }}
            >
              Contact Us
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
              {/* Name */}
              <div>
                <label
                  htmlFor="contact-name"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 400,
                    fontStyle: "normal",
                    fontSize: "16px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    color: "#000000",
                  }}
                  className="mb-4.5 block"
                >
                  Name
                </label>

                <input
                  id="contact-name"
                  type="text"
                  placeholder="Enter your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-[2px] border border-[#dbdbdb] px-3.5 text-sm text-neutral-800 placeholder:font-['Lexend'] placeholder:font-light placeholder:text-[15px] placeholder:leading-[100%] placeholder:tracking-[0%] placeholder:text-[#B2B2B2] focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
                  style={{
                    background: "#FFFFFF",
                    boxShadow: "0px 4px 4px 0px #00000040",
                    height: "46px",
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="contact-email"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 400,
                    fontStyle: "normal",
                    fontSize: "16px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    color: "#000000",
                  }}
                  className="mb-4.5 block"
                >
                  Email
                </label>

                <input
                  id="contact-email"
                  type="email"
                  placeholder="Enter your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-[2px] border border-[#dbdbdb] px-3.5 text-sm text-neutral-800 placeholder:font-['Lexend'] placeholder:font-light placeholder:text-[15px] placeholder:leading-[100%] placeholder:tracking-[0%] placeholder:text-[#B2B2B2] focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
                  style={{
                    background: "#FFFFFF",
                    boxShadow: "0px 4px 4px 0px #00000040",
                    height: "46px",
                  }}
                />
              </div>

              {/* Service */}
              <div className="relative">
                <label
                  htmlFor="contact-service"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 400,
                    fontStyle: "normal",
                    fontSize: "16px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    color: "#000000",
                  }}
                  className="mb-4.5 block"
                >
                  What service are you interested in
                </label>

                <select
                  id="contact-service"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full appearance-none rounded-[2px] border border-[#dbdbdb] px-3.5 pr-10 text-sm text-neutral-800 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
                  style={{
                    background: "#FFFFFF",
                    boxShadow: "0px 4px 4px 0px #00000040",
                    height: "46px",
                  }}
                >
                  <option value="" className="text-[#B2B2B2]">
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

              {/* Budget */}
              <div className="relative">
                <label
                  htmlFor="contact-budget"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 400,
                    fontStyle: "normal",
                    fontSize: "16px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    color: "#000000",
                  }}
                  className="mb-4.5 block"
                >
                  Budget
                </label>

                <select
                  id="contact-budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full appearance-none rounded-[2px] border border-[#dbdbdb] px-3.5 pr-10 text-sm text-neutral-800 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
                  style={{
                    background: "#FFFFFF",
                    boxShadow: "0px 4px 4px 0px #00000040",
                    height: "46px",
                  }}
                >
                  <option value="" className="text-[#B2B2B2]">
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

              {/* Message */}
              <div>
                <label
                  htmlFor="contact-message"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 400,
                    fontStyle: "normal",
                    fontSize: "16px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    color: "#000000",
                  }}
                  className="mb-4.5 block"
                >
                  Message
                </label>

                <textarea
                  id="contact-message"
                  placeholder="Enter your Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full resize-none rounded-[2px] border border-[#dbdbdb] px-3.5 py-2.5 text-sm text-neutral-800 placeholder:font-['Lexend'] placeholder:font-light placeholder:text-[15px] placeholder:leading-[100%] placeholder:tracking-[0%] placeholder:text-[#B2B2B2] focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
                  style={{
                    background: "#FFFFFF",
                    boxShadow: "0px 4px 4px 0px #00000040",
                    height: "165px",
                  }}
                />
              </div>

              {/* Submit */}
              <div className="pt-1.5">
                <button
                  type="submit"
                  className="w-full rounded-[2px] transition-colors hover:bg-[#2d7326] focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2 flex items-center justify-center"
                  style={{
                    height: "57px",
                    background: "#389131",
                    opacity: 1,
                    gap: "10px",
                    paddingTop: "13px",
                    paddingRight: "246px",
                    paddingBottom: "13px",
                    paddingLeft: "246px",
                    fontFamily: "Lexend",
                    fontWeight: 500,
                    fontStyle: "normal",
                    fontSize: "25px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    color: "#FFFFFF",
                  }}
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