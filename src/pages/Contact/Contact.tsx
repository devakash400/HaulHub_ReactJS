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
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [serviceMenuOpen, setServiceMenuOpen] = useState(false);
  const [budgetMenuOpen, setBudgetMenuOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let ok = true;
    if (!name.trim()) {
      setNameError("Enter your name");
      ok = false;
    }
    if (!email.trim()) {
      setEmailError("Enter your email");
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address");
      ok = false;
    }
    if (!serviceType.trim()) {
      setServiceError("Select a service type");
      ok = false;
    }
    if (!budget.trim()) {
      setBudgetError("Select a budget range");
      ok = false;
    }
    if (!message.trim()) {
      setMessageError("Enter a message");
      ok = false;
    }

    if (!ok) return;

    // TODO: submit form
    setName("");
    setEmail("");
    setServiceType("");
    setBudget("");
    setMessage("");
    setNameError(null);
    setEmailError(null);
    setServiceError(null);
    setBudgetError(null);
    setMessageError(null);
  };

  return (
    <main
      className="min-h-screen w-full min-w-0
       overflow-x-hidden bg-[#F6F3E9] font-sans 
       px-4 py-8 sm:px-10 sm:py-12"
    >
      <div className="mx-auto w-full">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:gap-6">
          {/* Left Image */}
          <div
            className="w-full overflow-hidden 
          rounded-[24px] lg:w-[46%] lg:min-w-0 shrink-0"
          >
            <img
              src={images.Contact}
              alt="Dump trailer at dealership"
              className="h-[300px] w-full object-cover object-center sm:h-[420px] lg:h-[800px]"
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
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  onBlur={() => {
                    if (!name.trim()) setNameError("Enter your name");
                  }}
                  className="w-full rounded-[2px] border border-[#dbdbdb] px-3.5 text-sm text-neutral-800 placeholder:font-['Lexend'] placeholder:font-light placeholder:text-[15px] placeholder:leading-[100%] placeholder:tracking-[0%] placeholder:text-[#B2B2B2] focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
                  style={{
                    background: "#FFFFFF",
                    boxShadow: "0px 4px 4px 0px #00000040",
                    height: "46px",
                  }}
                />
                {nameError && (
                  <p className="mt-2 text-sm text-[#E74C3C]">{nameError}</p>
                )}
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  onBlur={() => {
                    if (!email.trim()) setEmailError("Enter your email");
                    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                      setEmailError("Enter a valid email address");
                  }}
                  className="w-full rounded-[2px] border border-[#dbdbdb] px-3.5 text-sm text-neutral-800 placeholder:font-['Lexend'] placeholder:font-light placeholder:text-[15px] placeholder:leading-[100%] placeholder:tracking-[0%] placeholder:text-[#B2B2B2] focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
                  style={{
                    background: "#FFFFFF",
                    boxShadow: "0px 4px 4px 0px #00000040",
                    height: "46px",
                  }}
                />
                {emailError && (
                  <p className="mt-2 text-sm text-[#E74C3C]">{emailError}</p>
                )}
              </div>

              {/* Service */}
              <div>
                <label
                  htmlFor="contact-service"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "100%",
                    color: "#000000",
                  }}
                  className="mb-4.5 block"
                >
                  What service are you interested in
                </label>

                <div className="relative w-full max-w-full overflow-visible">
                  {/* Desktop Native Select */}
                  <div className="hidden md:block relative w-full">
                    <select
                      id="contact-service"
                      value={serviceType}
                      onChange={(e) => {
                        setServiceType(e.target.value);
                        if (serviceError) setServiceError(null);
                      }}
                      onBlur={() => {
                        if (!serviceType.trim()) {
                          setServiceError("Select a service type");
                        }
                      }}
                      className="w-full appearance-none rounded-[2px] border border-[#dbdbdb] px-3.5 pr-10 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
                      style={{
                        background: "#FFFFFF",
                        boxShadow: "0px 4px 4px 0px #00000040",
                        height: "46px",
                        fontFamily: "Lexend",
                        fontWeight: 300,
                        fontSize: "15px",
                        lineHeight: "100%",
                        color: serviceType ? "#000000" : "#B2B2B2",
                      }}
                    >
                      <option value="" disabled hidden>
                        Select Service type
                      </option>

                      {SERVICE_OPTIONS.map((opt) => (
                        <option
                          key={opt}
                          value={opt}
                          style={{
                            color: "#000000",
                            fontFamily: "Lexend",
                          }}
                        >
                          {opt}
                        </option>
                      ))}
                    </select>

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-700">
                      <ChevronDown className="h-5 w-5" aria-hidden />
                    </span>
                  </div>

                  {/* Mobile Custom Dropdown */}
                  <div 
                    className="md:hidden relative w-full"
                    tabIndex={0}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setServiceMenuOpen(false);
                        if (!serviceType.trim()) {
                          setServiceError("Select a service type");
                        }
                      }
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setServiceMenuOpen((p) => !p)}
                      className="flex items-center justify-between w-full px-3.5 bg-transparent outline-none text-left appearance-none rounded-[2px] border border-[#dbdbdb] focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
                      style={{
                        background: "#FFFFFF",
                        boxShadow: "0px 4px 4px 0px #00000040",
                        height: "46px",
                        fontFamily: "Lexend",
                        fontWeight: 300,
                        fontSize: "15px",
                        lineHeight: "100%",
                        color: serviceType ? "#000000" : "#B2B2B2",
                        boxSizing: "border-box",
                      }}
                    >
                      {serviceType || "Select Service type"}
                      <ChevronDown className="h-5 w-5 text-neutral-700" aria-hidden />
                    </button>
                    {serviceMenuOpen && (
                      <div className="absolute left-0 top-full mt-1 w-full bg-white border border-[#dbdbdb] rounded-[2px] shadow-lg z-50 overflow-hidden">
                        {SERVICE_OPTIONS.map((opt, idx) => (
                          <React.Fragment key={opt}>
                            <button
                              type="button"
                              className="w-full text-left px-3.5 py-2.5 hover:bg-gray-100"
                              style={{
                                color: "#000000",
                                fontFamily: "Lexend",
                                fontWeight: 300,
                                fontSize: "15px",
                              }}
                              onClick={() => {
                                setServiceType(opt);
                                if (serviceError) setServiceError(null);
                                setServiceMenuOpen(false);
                              }}
                            >
                              {opt}
                            </button>
                            {idx < SERVICE_OPTIONS.length - 1 && (
                              <hr className="border-t border-[#dbdbdb] mx-3" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {serviceError && (
                  <p className="mt-2 text-sm text-[#E74C3C]">{serviceError}</p>
                )}
              </div>

              {/* Budget */}
              <div>
                <label
                  htmlFor="contact-budget"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "100%",
                    color: "#000000",
                  }}
                  className="mb-4.5 block"
                >
                  Budget
                </label>

                <div className="relative w-full max-w-full overflow-visible">
                  {/* Desktop Native Select */}
                  <div className="hidden md:block relative w-full">
                    <select
                      id="contact-budget"
                      value={budget}
                      onChange={(e) => {
                        setBudget(e.target.value);
                        if (budgetError) setBudgetError(null);
                      }}
                      onBlur={() => {
                        if (!budget.trim()) {
                          setBudgetError("Select a budget range");
                        }
                      }}
                      className="w-full appearance-none rounded-[2px] border border-[#dbdbdb] px-3.5 pr-10 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
                      style={{
                        background: "#FFFFFF",
                        boxShadow: "0px 4px 4px 0px #00000040",
                        height: "46px",
                        fontFamily: "Lexend",
                        fontWeight: 300,
                        fontSize: "15px",
                        lineHeight: "100%",
                        color: budget ? "#000000" : "#B2B2B2",
                      }}
                    >
                      <option value="" disabled hidden>
                        Select project budget
                      </option>

                      {BUDGET_OPTIONS.map((opt) => (
                        <option
                          key={opt}
                          value={opt}
                          style={{
                            color: "#000000",
                            fontFamily: "Lexend",
                          }}
                        >
                          {opt}
                        </option>
                      ))}
                    </select>

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-700">
                      <ChevronDown className="h-5 w-5" aria-hidden />
                    </span>
                  </div>

                  {/* Mobile Custom Dropdown */}
                  <div 
                    className="md:hidden relative w-full"
                    tabIndex={0}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setBudgetMenuOpen(false);
                        if (!budget.trim()) {
                          setBudgetError("Select a budget range");
                        }
                      }
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setBudgetMenuOpen((p) => !p)}
                      className="flex items-center justify-between w-full px-3.5 bg-transparent outline-none text-left appearance-none rounded-[2px] border border-[#dbdbdb] focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
                      style={{
                        background: "#FFFFFF",
                        boxShadow: "0px 4px 4px 0px #00000040",
                        height: "46px",
                        fontFamily: "Lexend",
                        fontWeight: 300,
                        fontSize: "15px",
                        lineHeight: "100%",
                        color: budget ? "#000000" : "#B2B2B2",
                        boxSizing: "border-box",
                      }}
                    >
                      {budget || "Select project budget"}
                      <ChevronDown className="h-5 w-5 text-neutral-700" aria-hidden />
                    </button>
                    {budgetMenuOpen && (
                      <div className="absolute left-0 top-full mt-1 w-full bg-white border border-[#dbdbdb] rounded-[2px] shadow-lg z-50 overflow-hidden">
                        {BUDGET_OPTIONS.map((opt, idx) => (
                          <React.Fragment key={opt}>
                            <button
                              type="button"
                              className="w-full text-left px-3.5 py-2.5 hover:bg-gray-100"
                              style={{
                                color: "#000000",
                                fontFamily: "Lexend",
                                fontWeight: 300,
                                fontSize: "15px",
                              }}
                              onClick={() => {
                                setBudget(opt);
                                if (budgetError) setBudgetError(null);
                                setBudgetMenuOpen(false);
                              }}
                            >
                              {opt}
                            </button>
                            {idx < BUDGET_OPTIONS.length - 1 && (
                              <hr className="border-t border-[#dbdbdb] mx-3" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {budgetError && (
                  <p className="mt-2 text-sm text-[#E74C3C]">{budgetError}</p>
                )}
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
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (messageError) setMessageError(null);
                  }}
                  onBlur={() => {
                    if (!message.trim()) setMessageError("Enter a message");
                  }}
                  rows={5}
                  className="w-full resize-none rounded-[2px] border border-[#dbdbdb] px-3.5 py-2.5 text-sm text-neutral-800 placeholder:font-['Lexend'] placeholder:font-light placeholder:text-[15px] placeholder:leading-[100%] placeholder:tracking-[0%] placeholder:text-[#B2B2B2] focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
                  style={{
                    background: "#FFFFFF",
                    boxShadow: "0px 4px 4px 0px #00000040",
                    height: "165px",
                  }}
                />
                {messageError && (
                  <p className="mt-2 text-sm text-[#E74C3C]">{messageError}</p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-1.5">
                <button
                  type="submit"
                  className="w-full rounded-[2px] transition-colors hover:bg-[#2d7326] focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2 flex items-center justify-center px-0 sm:px-[246px]"
                  style={{
                    height: "57px",
                    background: "#389131",
                    opacity: 1,
                    gap: "10px",
                    paddingTop: "13px",
                    paddingBottom: "13px",
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
