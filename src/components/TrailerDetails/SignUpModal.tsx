import React, { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { lockScroll } from "../../utils/scrollLock.ts";
import { ModalHeader } from "../ModalHeader.tsx";

export type SignUpData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  password: string;
  trailor: string;
  phoneNumber: string;
  agreedToTerms: boolean;
};

export interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SignUpData) => void;
}

const onlyAlphabetsRegex = /^[A-Za-z\s]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type CountryOption = {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
};

const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
];

export const SignUpModal: React.FC<SignUpModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [trailor, setTrailor] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    COUNTRY_OPTIONS[3],
  );
  const [agreed, setAgreed] = useState(false);

  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [genderTouched, setGenderTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const todayIso = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!isOpen) return;
    setFirstName("");
    setLastName("");
    setDateOfBirth("");
    setGender("");
    setEmail("");
    setPassword("");
    setTrailor("");
    setPhoneNumber("");
    setSelectedCountry(COUNTRY_OPTIONS[3]);
    setAgreed(false);
    setFirstNameTouched(false);
    setLastNameTouched(false);
    setEmailTouched(false);
    setPasswordTouched(false);
    setPhoneTouched(false);
    setGenderTouched(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const unlock = lockScroll();
    return () => {
      unlock();
    };
  }, [isOpen]);

  const isFirstNameValid =
    firstName.trim().length > 0 && onlyAlphabetsRegex.test(firstName.trim());
  const isLastNameValid =
    lastName.trim().length > 0 && onlyAlphabetsRegex.test(lastName.trim());

  const isEmailValid = useMemo(() => {
    const trimmed = email.trim();
    if (!trimmed) return false;
    return emailRegex.test(trimmed);
  }, [email]);

  const passwordHasMinLength = password.length >= 8;
  const passwordHasUppercase = /[A-Z]/.test(password);
  const passwordHasLowercase = /[a-z]/.test(password);
  const passwordHasNumber = /[0-9]/.test(password);
  const passwordHasSpecial = /[!@#$%^&*(),.?":{}|<>_\-\\[\];'/`~+]/.test(
    password,
  );

  const isPasswordValid =
    passwordHasMinLength &&
    passwordHasUppercase &&
    passwordHasLowercase &&
    passwordHasNumber &&
    passwordHasSpecial;

  const normalizedDigits = phoneNumber.replace(/\D/g, "");
  const isPhoneValid = normalizedDigits.length === 10;

  const isFormValid =
    isFirstNameValid &&
    isLastNameValid &&
    dateOfBirth.trim().length > 0 &&
    dateOfBirth <= todayIso &&
    gender.trim().length > 0 &&
    isEmailValid &&
    isPasswordValid &&
    trailor.trim().length > 0 &&
    isPhoneValid &&
    agreed;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    const fullPhone =
      normalizedDigits.length > 0
        ? `${selectedCountry.dialCode}${normalizedDigits}`
        : phoneNumber.trim();
    onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth.trim(),
      gender: gender.trim(),
      email: email.trim(),
      password,
      trailor: trailor.trim(),
      phoneNumber: fullPhone,
      agreedToTerms: agreed,
    });
  };

  return (
    <>
      <style>{`
        .custom-placeholder::placeholder {
          font-family: "Lexend";
          font-weight: 300;
          font-size: 12px;
          line-height: 100%;
          letter-spacing: 0%;
          color: #9b989e;
        }
      `}</style>
      <div
        className="modal-overlay fixed 
        inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sign-up-title"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-[554px] bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <form
            className="relative flex flex-col max-h-[90vh]"
            onSubmit={handleSubmit}
          >
            <ModalHeader
              title="Sign Up"
              onClose={onClose}
              variant="close"
              titleId="sign-up-title"
            />

            <div className="px-6 pt-6 pb-4 sm:px-10 sm:pt-6 sm:pb-6 overflow-y-auto">
              <div className="mt-8 space-y-4">
                <div className="flex flex-col gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      style={{
                        fontFamily: "Lexend",
                        fontWeight: 400,
                        fontSize: "14px",
                        lineHeight: "100%",
                        letterSpacing: "0%",
                        color: "#000000",
                      }}
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onBlur={() => setFirstNameTouched(true)}
                      className="w-full px-3 text-gray-900 placeholder:text-gray-400 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15 custom-placeholder"
                      placeholder="Enter your First Name"
                      style={{
                        height: "40px",
                        borderRadius: "5px",
                        border: "1px solid #7C7C7C",
                        opacity: 1,
                      }}
                    />
                    {firstNameTouched && !isFirstNameValid && (
                      <p className="mt-1 text-xs text-red-600">
                        Please enter only alphabet
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      style={{
                        fontFamily: "Lexend",
                        fontWeight: 400,
                        fontSize: "14px",
                        lineHeight: "100%",
                        letterSpacing: "0%",
                        color: "#000000",
                      }}
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onBlur={() => setLastNameTouched(true)}
                      className="w-full px-3 text-gray-900 placeholder:text-gray-400 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15 custom-placeholder"
                      placeholder="Enter your Last Name"
                      style={{
                        height: "40px",
                        borderRadius: "5px",
                        border: "1px solid #7C7C7C",
                        opacity: 1,
                      }}
                    />
                    {lastNameTouched && !isLastNameValid && (
                      <p className="mt-1 text-xs text-red-600">
                        Please enter only alphabet
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    style={{
                      fontFamily: "Lexend",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "100%",
                      letterSpacing: "0%",
                      color: "#000000",
                    }}
                  >
                    Date of birth
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    min="1900-01-01"
                    max={todayIso}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (!v) {
                        setDateOfBirth("");
                        return;
                      }
                      if (v > todayIso) {
                        setDateOfBirth(todayIso);
                        return;
                      }
                      const [y, m, d] = v.split("-");
                      if (!y || !m || !d) return;
                      const year = y.slice(0, 4);
                      setDateOfBirth(`${year}-${m}-${d}`);
                    }}
                    className="w-full px-3 text-gray-900 placeholder:text-gray-400 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
                    style={{
                      height: "40px",
                      borderRadius: "5px",
                      border: "1px solid #7C7C7C",
                      opacity: 1,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    style={{
                      fontFamily: "Lexend",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "100%",
                      letterSpacing: "0%",
                      color: "#000000",
                    }}
                  >
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      onBlur={() => setGenderTouched(true)}
                      className="w-full px-3 pr-9 text-sm text-gray-900 bg-white focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15 appearance-none"
                      style={{
                        height: "40px",
                        borderRadius: "5px",
                        border: "1px solid #7C7C7C",
                        opacity: 1,
                      }}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                      <ChevronDown className="w-4 h-4" aria-hidden />
                    </span>
                  </div>
                  {genderTouched && gender.trim().length === 0 && (
                    <p className="mt-1 text-xs text-red-600">
                      Please select gender
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    style={{
                      fontFamily: "Lexend",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "100%",
                      letterSpacing: "0%",
                      color: "#000000",
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="Enter your email address"
                    className="w-full px-3 text-gray-900 placeholder:text-gray-400 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15 custom-placeholder"
                    style={{
                      height: "40px",
                      borderRadius: "5px",
                      border:
                        emailTouched && !isEmailValid
                          ? "1px solid #f87171"
                          : "1px solid #7C7C7C",
                      opacity: 1,
                    }}
                  />
                  {emailTouched && !isEmailValid && (
                    <p className="mt-1 text-xs text-red-600">
                      Enter valid email
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    style={{
                      fontFamily: "Lexend",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "100%",
                      letterSpacing: "0%",
                      color: "#000000",
                    }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setPasswordTouched(true)}
                      placeholder="Enter your password"
                      className="w-full px-3 pr-10 text-gray-900 placeholder:text-gray-400 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15 custom-placeholder"
                      style={{
                        height: "40px",
                        borderRadius: "5px",
                        border: "1px solid #7C7C7C",
                        opacity: 1,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <Eye className="w-5 h-5" aria-hidden />
                      ) : (
                        <EyeOff className="w-5 h-5" aria-hidden />
                      )}
                    </button>
                  </div>
                  {passwordTouched && password.trim().length > 0 && (
                    <ul className="mt-2 space-y-0.5 text-xs">
                      <li
                        className={
                          passwordHasMinLength
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        • Add at least 8 characters
                      </li>
                      <li
                        className={
                          passwordHasUppercase
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        • Uppercase letters (A-Z)
                      </li>
                      <li
                        className={
                          passwordHasLowercase
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        • Lowercase letters (a-z)
                      </li>
                      <li
                        className={
                          passwordHasNumber ? "text-green-600" : "text-red-600"
                        }
                      >
                        • Numbers (0-9)
                      </li>
                      <li
                        className={
                          passwordHasSpecial ? "text-green-600" : "text-red-600"
                        }
                      >
                        • Special characters (e.g., @, #, $, %, !)
                      </li>
                    </ul>
                  )}
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    style={{
                      fontFamily: "Lexend",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "100%",
                      letterSpacing: "0%",
                      color: "#000000",
                    }}
                  >
                    Choose Your Category
                  </label>
                  <div className="relative">
                    <select
                      value={trailor}
                      onChange={(e) => setTrailor(e.target.value)}
                      className="w-full px-3 pr-9 text-sm text-gray-900 bg-white focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15 appearance-none"
                      style={{
                        height: "40px",
                        borderRadius: "5px",
                        border: "1px solid #7C7C7C",
                        opacity: 1,
                      }}
                    >
                      <option value="">Select option</option>
                      <option value="Renter">Renter</option>
                      <option value="Owner">Owner</option>
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                      <ChevronDown className="w-4 h-4" aria-hidden />
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    style={{
                      fontFamily: "Lexend",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "100%",
                      letterSpacing: "0%",
                      color: "#000000",
                    }}
                  >
                    Phone Number
                  </label>
                  <div
                    className="w-full pl-3 pr-2 py-2.5 flex items-center gap-2 bg-white focus-within:border-[#389131] focus-within:ring-2 focus-within:ring-[#389131]/15"
                    style={{
                      height: "40px",
                      borderRadius: "5px",
                      border: "1px solid #7C7C7C",
                      opacity: 1,
                    }}
                  >
                    <select
                      className="flex items-center gap-1 text-sm bg-transparent outline-none border-none pr-1 max-w-[40%] sm:max-w-[32%]"
                      value={selectedCountry.code}
                      onChange={(e) => {
                        const next = COUNTRY_OPTIONS.find(
                          (c) => c.code === e.target.value,
                        );
                        if (next) setSelectedCountry(next);
                      }}
                    >
                      {COUNTRY_OPTIONS.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.dialCode}
                        </option>
                      ))}
                    </select>
                    <div className="h-5 w-px bg-gray-300 flex-shrink-0" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      onBlur={() => setPhoneTouched(true)}
                      placeholder="Enter your phone number"
                      maxLength={10}
                      className="flex-1 border-none outline-none text-sm px-1 py-0 bg-transparent custom-placeholder"
                    />
                  </div>
                  {phoneTouched && !isPhoneValid && (
                    <p className="mt-1 text-xs text-red-600">
                      Phone number must be exactly 10 digits
                    </p>
                  )}
                </div>

                <div className="flex items-start gap-2 mt-2 pb-4 px-0.5">
                  <input
                    id="signup-agree"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#389131] bg-white accent-[#389131] focus:ring-[#389131] flex-shrink-0"
                  />
                  <label
                    htmlFor="signup-agree"
                    className="text-[11px] sm:text-xs leading-relaxed text-gray-700 break-words"
                  >
                    <span
                      className="block sm:inline"
                      style={{
                        fontFamily: "Lexend, sans-serif",
                        fontWeight: 400,
                        fontStyle: "normal",
                        fontSize: "17px",
                        lineHeight: "21px",
                        letterSpacing: "4%",
                        color: "#000000",
                      }}
                    >
                      By selecting Agree and continue, I agree to HaulHub{" "}
                    </span>
                    <span
                      className="block sm:inline"
                      style={{
                        fontFamily: "Lexend, sans-serif",
                        fontWeight: 400,
                        fontStyle: "normal",
                        fontSize: "17px",
                        lineHeight: "21px",
                        letterSpacing: "4%",
                        color: "#389131",
                      }}
                    >
                      Terms of service
                    </span>
                    <span
                      className="block sm:inline"
                      style={{
                        fontFamily: "Lexend, sans-serif",
                        fontWeight: 400,
                        fontStyle: "normal",
                        fontSize: "17px",
                        lineHeight: "21px",
                        letterSpacing: "4%",
                        color: "#389131",
                      }}
                    >
                      ,{" "}
                    </span>
                    <span
                      className="block sm:inline"
                      style={{
                        fontFamily: "Lexend, sans-serif",
                        fontWeight: 400,
                        fontStyle: "normal",
                        fontSize: "17px",
                        lineHeight: "21px",
                        letterSpacing: "4%",
                        color: "#389131",
                      }}
                    >
                      Payments Terms of Service and Anti-Discrimination Policy
                    </span>
                    <span
                      className="block sm:inline"
                      style={{
                        fontFamily: "Lexend, sans-serif",
                        fontWeight: 400,
                        fontStyle: "normal",
                        fontSize: "17px",
                        lineHeight: "21px",
                        letterSpacing: "4%",
                        color: "#000000",
                      }}
                    >
                      , and acknowledge the{" "}
                    </span>
                    <span className="block sm:hidden mt-0.5">
                      , and acknowledge the
                    </span>{" "}
                    <span
                      className="block sm:inline"
                      style={{
                        fontFamily: "Lexend, sans-serif",
                        fontWeight: 400,
                        fontStyle: "normal",
                        fontSize: "17px",
                        lineHeight: "21px",
                        letterSpacing: "4%",
                        color: "#389131",
                      }}
                    >
                      Privacy Policy
                    </span>
                    <span>.</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 sm:px-10 sm:pb-8 border-t border-gray-200">
              <button
                type="submit"
                disabled={!isFormValid}
                aria-disabled={!isFormValid}
                className={`w-full py-3.5 text-sm sm:text-base font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2 ${
                  isFormValid
                    ? "bg-[#389131] text-white hover:opacity-90"
                    : "text-white cursor-not-allowed"
                }`}
                style={{
                  backgroundColor: isFormValid ? "#389131" : "#929191",
                }}
              >
                Agree and Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
