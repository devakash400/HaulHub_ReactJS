import React, { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { lockScroll } from "../../utils/scrollLock.ts";
import { ModalHeader } from "../ModalHeader.tsx";
import Calendar from "../../assets/images/calendar.png";
import chevronDown from "../../assets/images/Dorpdown.png";
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
  submitError?: string | null;
}

const onlyAlphabetsRegex = /^[A-Za-z\s]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type CountryOption = {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  flagUrl: string;
};
//Data 
const COUNTRY_OPTIONS: CountryOption[] = [
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    flag: "🇺🇸",
    flagUrl: "https://flagcdn.com/w20/us.png",
  },
  {
    code: "CA",
    name: "Canada",
    dialCode: "+1",
    flag: "🇨🇦",
    flagUrl: "https://flagcdn.com/w20/ca.png",
  },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    flag: "🇬🇧",
    flagUrl: "https://flagcdn.com/w20/gb.png",
  },
  {
    code: "IN",
    name: "India",
    dialCode: "+91",
    flag: "🇮🇳",
    flagUrl: "https://flagcdn.com/w20/in.png",
  },
  {
    code: "AU",
    name: "Australia",
    dialCode: "+61",
    flag: "🇦🇺",
    flagUrl: "https://flagcdn.com/w20/au.png",
  },
  {
    code: "DE",
    name: "Germany",
    dialCode: "+49",
    flag: "🇩🇪",
    flagUrl: "https://flagcdn.com/w20/de.png",
  },
  {
    code: "FR",
    name: "France",
    dialCode: "+33",
    flag: "🇫🇷",
    flagUrl: "https://flagcdn.com/w20/fr.png",
  },
];

export const SignUpModal: React.FC<SignUpModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  submitError,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [trailor, setTrailor] = useState("Renter");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    COUNTRY_OPTIONS[3],
  );
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement | null>(null);
  const [agreed, setAgreed] = useState(false);

  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [genderTouched, setGenderTouched] = useState(false);
  const [dateOfBirthTouched, setDateOfBirthTouched] = useState(false);
  const [ageSubmitError, setAgeSubmitError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const genderDropdownRef = useRef<HTMLDivElement | null>(null);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const todayIso = new Date().toISOString().split("T")[0];

  const getAgeFromDob = (dob: string) => {
    const birthDate = new Date(dob);
    if (Number.isNaN(birthDate.getTime())) return 0;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  };

  const isAgeAtLeast24 =
    dateOfBirth.trim().length > 0 && getAgeFromDob(dateOfBirth) >= 24;
  const hasEmailSubmitError =
    typeof submitError === "string" && /email|email address/i.test(submitError);
  const hasPhoneSubmitError =
    typeof submitError === "string" && /(phone|mobile)/i.test(submitError);

  useEffect(() => {
    if (!isOpen) return;
    setFirstName("");
    setLastName("");
    setDateOfBirth("");
    setGender("");
    setEmail("");
    setPassword("");
    setTrailor("Renter");
    setPhoneNumber("");
    setSelectedCountry(COUNTRY_OPTIONS[3]);
    setAgreed(false);
    setFirstNameTouched(false);
    setLastNameTouched(false);
    setEmailTouched(false);
    setPasswordTouched(false);
    setPhoneTouched(false);
    setGenderTouched(false);
    setDateOfBirthTouched(false);
    setAgeSubmitError(false);
    setGenderDropdownOpen(false);
  }, [isOpen]);

  useEffect(() => {
    setAgeSubmitError(false);
  }, [trailor, dateOfBirth]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        genderDropdownRef.current &&
        !genderDropdownRef.current.contains(event.target as Node)
      ) {
        setGenderDropdownOpen(false);
      }
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setCountryDropdownOpen(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setCategoryMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const isDateOfBirthValid =
    dateOfBirth.trim().length > 0 &&
    dateOfBirth <= todayIso &&
    isAgeAtLeast24;

  const isFormValid =
    isFirstNameValid &&
    isLastNameValid &&
    isDateOfBirthValid &&
    gender.trim().length > 0 &&
    isEmailValid &&
    isPasswordValid &&
    trailor.trim().length > 0 &&
    isPhoneValid &&
    agreed;

  const showDobAgeError =
    (dateOfBirthTouched || ageSubmitError) &&
    dateOfBirth.trim().length > 0 &&
    !isAgeAtLeast24;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAgeAtLeast24) {
      setAgeSubmitError(true);
      return;
    }

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
        .custom-placeholder::placeholder,
        .date-field,
        .date-field::-webkit-datetime-edit,
        .date-field::-webkit-datetime-edit-text,
        .date-field::-webkit-datetime-edit-month-field,
        .date-field::-webkit-datetime-edit-day-field,
        .date-field::-webkit-datetime-edit-year-field {
          font-family: "Lexend";
          font-weight: 300;
          font-style: normal;
          font-size: 12px;
          line-height: 100%;
          letter-spacing: 0%;
          color: #929191;
        }

        .date-field.has-value,
        .date-field.has-value::-webkit-datetime-edit,
        .date-field.has-value::-webkit-datetime-edit-text,
        .date-field.has-value::-webkit-datetime-edit-month-field,
        .date-field.has-value::-webkit-datetime-edit-day-field,
        .date-field.has-value::-webkit-datetime-edit-year-field {
          color: #000000;
        }
      `}</style>
      <div
        className="modal-overlay fixed 
        inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sign-up-title"
      >
        <div
          className="relative w-full max-w-[554px]
           bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-hidden"
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
              closeOnRight={true}
            />

            <div className="px-6 pt-6 pb-4 sm:px-10 sm:pt-6 sm:pb-6 overflow-y-auto">
              <div className="mt-1 space-y-4">
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
                      className="w-full px-3 text-gray-900 placeholder:text-[#929191] focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15 custom-placeholder"
                      placeholder="Enter your First Name"
                      style={{
                        height: "40px",
                        borderRadius: "5px",
                        border: "1px solid #7C7C7C",
                        opacity: 1,
                        fontFamily: "Lexend",
                        fontWeight: 300,
                        fontStyle: "normal",
                        fontSize: "12px",
                        lineHeight: "100%",
                        letterSpacing: "0%",
                        color: "#000000",
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
                      className="w-full px-3 text-gray-900 placeholder:text-[#929191] focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15 custom-placeholder"
                      placeholder="Enter your Last Name"
                      style={{
                        height: "40px",
                        borderRadius: "5px",
                        border: "1px solid #7C7C7C",
                        opacity: 1,
                        fontFamily: "Lexend",
                        fontWeight: 300,
                        fontStyle: "normal",
                        fontSize: "12px",
                        lineHeight: "100%",
                        letterSpacing: "0%",
                        color: "#000000",
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
                  <label className="block mb-1 font-['Lexend'] font-normal text-[14px] leading-[100%] text-black">
                    Date of birth
                  </label>

                  <div className="relative">
                    <input
                      ref={dateInputRef}
                      type="date"
                      required
                      value={dateOfBirth}
                      min="1900-01-01"
                      max={todayIso}
                      onBlur={() => setDateOfBirthTouched(true)}
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

                        setDateOfBirth(`${y.slice(0, 4)}-${m}-${d}`);
                      }}
                      className={`date-field ${dateOfBirth ? "has-value text-[#FF0000]" : "text-[#929191]"} w-full h-[40px] px-3 pr-10 border border-[#7C7C7C] rounded-[5px]
      focus:border-[#389131]
      focus:outline-none
      focus:ring-2
      focus:ring-[#389131]/15
      [appearance:textfield]
      [&::-webkit-calendar-picker-indicator]:opacity-0
      [&::-webkit-calendar-picker-indicator]:absolute`}
                      style={{
                        fontFamily: "Lexend",
                        fontWeight: 300,
                        fontStyle: "normal",
                        fontSize: "12px",
                        lineHeight: "100%",
                        letterSpacing: "0%",
                      }}
                    />
                    <img
                      src={Calendar}
                      alt="calendar"
                      className="w-[18px] h-[18px] absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                      onClick={() =>
                        dateInputRef.current?.showPicker?.() ||
                        dateInputRef.current?.focus()
                      }
                    />
                  </div>
                  {dateOfBirthTouched && dateOfBirth.trim().length === 0 && (
                    <p className="mt-1 text-xs text-red-600">
                      Enter date of birth
                    </p>
                  )}
                  {showDobAgeError && (
                    <p className="mt-1 text-xs text-red-600">
                      You must be at least 24 years old
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
                    Gender
                  </label>
                  <div className="relative" ref={genderDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setGenderDropdownOpen((prev) => !prev)}
                      onBlur={() => setGenderTouched(true)}
                      className="w-full px-3 pr-9 text-left flex items-center justify-between bg-white focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
                      style={{
                        height: "40px",
                        borderRadius: "5px",
                        border: "1px solid #7C7C7C",
                        opacity: 1,
                        fontFamily: "Lexend",
                        fontWeight: 300,
                        fontStyle: "normal",
                        fontSize: "12px",
                        lineHeight: "100%",
                        letterSpacing: "0%",
                        color: gender ? "#000000" : "#929191",
                      }}
                    >
                      {gender || "Select Gender"}
                    </button>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                      <ChevronDown className="w-4 h-4" aria-hidden />
                    </span>
                    {genderDropdownOpen && (
                      <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-[5px] border border-[#D1D5DB] bg-white shadow-lg">
                        {["Male", "Female", "Other"].map((option, index) => (
                          <button
                            type="button"
                            key={option}
                            onClick={() => {
                              setGender(option);
                              setGenderDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-[14px] text-[#000000] hover:bg-[#F3F4F6] ${
                              index !== 2 ? "border-b border-[#D1D5DB]" : ""
                            }`}
                            style={{
                              fontFamily: "Lexend",
                              fontWeight: 300,
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
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
                    placeholder="Enter your Email"
                    className="w-full px-3 text-gray-900 placeholder:text-[#929191] focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15 custom-placeholder"
                    style={{
                      height: "40px",
                      borderRadius: "5px",
                      border:
                        emailTouched && !isEmailValid
                          ? "1px solid #7C7C7C"
                          : "1px solid #7C7C7C",
                      opacity: 1,
                      fontFamily: "Lexend",
                      fontWeight: 300,
                      fontStyle: "normal",
                      fontSize: "12px",
                      lineHeight: "100%",
                      letterSpacing: "0%",
                      color: "#000000",
                    }}
                  />
                  {emailTouched && !isEmailValid && (
                    <p className="mt-1 text-xs text-red-600">
                      Enter valid email
                    </p>
                  )}
                  {hasEmailSubmitError && (
                    <p className="mt-1 text-xs text-red-600">{submitError}</p>
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
                      placeholder="Enter your Password"
                      className="w-full px-3 pr-10 text-gray-900 placeholder:text-[#929191] focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15 custom-placeholder"
                      style={{
                        height: "40px",
                        borderRadius: "5px",
                        border: "1px solid #7C7C7C",
                        opacity: 1,
                        fontFamily: "Lexend",
                        fontWeight: 300,
                        fontStyle: "normal",
                        fontSize: "12px",
                        lineHeight: "100%",
                        letterSpacing: "0%",
                        color: "#000000",
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
                    <ul className="mt-2 space-y-0.5 font-lexend font-light text-[12px] leading-[100%] tracking-[0em] text-[#6B6B6B]">
                      <li
                        className={
                          passwordHasMinLength
                            ? "text-[#6B6B6B]"
                            : "text-red-600"
                        }
                      >
                        • Add at least 8 characters
                      </li>

                      <li
                        className={
                          passwordHasUppercase
                            ? "text-[#6B6B6B]"
                            : "text-red-600"
                        }
                      >
                        • Uppercase letters (A-Z)
                      </li>

                      <li
                        className={
                          passwordHasLowercase
                            ? "text-[#6B6B6B]"
                            : "text-red-600"
                        }
                      >
                        • Lowercase letters (a-z)
                      </li>

                      <li
                        className={
                          passwordHasNumber ? "text-[#6B6B6B]" : "text-red-600"
                        }
                      >
                        • Numbers (0-9)
                      </li>

                      <li
                        className={
                          passwordHasSpecial ? "text-[#6B6B6B]" : "text-red-600"
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
                  <div className="relative" ref={categoryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setCategoryMenuOpen((prev) => !prev)}
                      className="w-full px-3 pr-9 text-left flex items-center justify-between bg-white focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
                      style={{
                        height: "40px",
                        borderRadius: "5px",
                        border: "1px solid #7C7C7C",
                        opacity: 1,
                        fontFamily: "Lexend",
                        fontWeight: 300,
                        fontStyle: "normal",
                        fontSize: "12px",
                        lineHeight: "100%",
                        letterSpacing: "0%",
                        color: "#000000",
                      }}
                    >
                      {trailor}
                    </button>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                      <ChevronDown className="w-4 h-4" aria-hidden />
                    </span>

                    {categoryMenuOpen && (
                      <div className="absolute left-0 top-full mt-1 w-full bg-white border border-[#D1D5DB] rounded-[5px] shadow-lg z-50 overflow-hidden">
                        {["Renter", "Owner"].map((opt, index) => (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => {
                              setTrailor(opt);
                              setCategoryMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-[14px] text-[#000000] hover:bg-[#F3F4F6] ${
                              index !== 1 ? "border-b border-[#D1D5DB]" : ""
                            }`}
                            style={{
                              fontFamily: "Lexend",
                              fontWeight: 300,
                            }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
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
                    Phone Number
                  </label>
                  <div className="relative" ref={countryDropdownRef}>
                    <div
                      className="w-full h-[44px] 
                    border border-[#8B8B8B] rounded-[8px]
                     bg-white flex items-center
                      px-3 focus-within:border-[#389131]
                       focus-within:ring-2 focus-within:ring-[#389131]/10 
                       transition-all gap-2"
                    >
                      <button
                        type="button"
                        onClick={() => setCountryDropdownOpen((prev) => !prev)}
                        className="flex items-center gap-2 rounded-[5px] bg-transparent px-1 py-1 text-left outline-none"
                      >
                        <img
                          src={selectedCountry.flagUrl}
                          alt={selectedCountry.name}
                          className="w-[20px] h-[12px] object-cover rounded-[1px]"
                        />
                        <span className="text-[14px] font-normal text-[#929191] leading-[15px]">
                          {selectedCountry.dialCode}
                        </span>
                        <img
                          src={chevronDown}
                          alt="dropdown"
                          className="w-[8.5px] h-[6px] mt-1 pointer-events-none"
                        />
                      </button>

                      <input
                        type="tel"
                        placeholder="Enter Your Phone Number"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                        }}
                        onBlur={() => setPhoneTouched(true)}
                        maxLength={10}
                        className="flex-1 bg-transparent border-none outline-none text-left text-[15px] text-[#000] custom-placeholder font-normal placeholder:text-[#929191]"
                        style={{
                          fontFamily: "Lexend",
                          fontWeight: 300,
                          fontStyle: "normal",
                          fontSize: "15px",
                          lineHeight: "100%",
                          letterSpacing: "0%",
                        }}
                      />
                    </div>

                    {countryDropdownOpen && (
                      <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-[10px] border border-[#D1D5DB] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                        {COUNTRY_OPTIONS.map((country, index) => (
                          <button
                            type="button"
                            key={country.code}
                            onClick={() => {
                              setSelectedCountry(country);
                              setCountryDropdownOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#111827] hover:bg-[#F3F4F6] ${
                              index !== COUNTRY_OPTIONS.length - 1 ? "border-b border-[#D1D5DB]" : ""
                            }`}
                          >
                            <img
                              src={country.flagUrl}
                              alt={country.name}
                              className="w-[20px] h-[12px] object-cover rounded-[1px]"
                            />
                            <span className="flex-1 truncate">
                              {country.name}
                            </span>
                            <span className="text-[13px] text-[#6B7280]">
                              {country.dialCode}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {phoneTouched && !isPhoneValid && (
                    <p className="mt-1 text-xs text-red-600">
                      Phone number must be exactly 10 digits
                    </p>
                  )}
                  {hasPhoneSubmitError && (
                    <p className="mt-1 text-xs text-red-600">{submitError}</p>
                  )}
                </div>

                <div className="flex items-start gap-2 mt-2 pb-4 px-0.5">
                  <input
                    id="signup-agree"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-[24px] h-[24px] border border-black rounded-[4px] bg-white accent-black focus:ring-0 flex-shrink-0"
                  />

                  {/* Changed label -> div so text click won't toggle checkbox */}
                  <div className="text-[13px] leading-[18px] sm:text-[17px] sm:leading-[21px] text-gray-700 break-words">
                    <span
                      style={{
                        fontFamily: "Lexend, sans-serif",
                        fontWeight: 400,
                        fontStyle: "normal",
                        letterSpacing: "4%",
                        color: "#000000",
                      }}
                    >
                      By selecting Agree and continue, I agree to HaulHub{" "}
                    </span>
                    <a
                      href="/terms"
                      className="underline"
                      style={{
                        fontFamily: "Lexend, sans-serif",
                        fontWeight: 400,
                        fontStyle: "normal",
                        letterSpacing: "0.04em",
                        textDecorationStyle: "solid",
                        textDecorationSkipInk: "auto",
                        color: "#389131",
                      }}
                    >
                      Terms of service
                    </a>
                    <span
                      className="underline"
                      style={{
                        fontFamily: "Lexend, sans-serif",
                        fontWeight: 400,
                        fontStyle: "normal",
                        letterSpacing: "0.04em",
                        textDecorationStyle: "solid",
                        textDecorationSkipInk: "auto",
                        color: "#389131",
                      }}
                    >
                      ,{" "}
                    </span>
                    <a
                      href="/payments-terms"
                      className="underline"
                      style={{
                        fontFamily: "Lexend, sans-serif",
                        fontWeight: 400,
                        fontStyle: "normal",
                        letterSpacing: "0.04em",
                        textDecorationStyle: "solid",
                        textDecorationSkipInk: "auto",
                        color: "#389131",
                      }}
                    >
                      Payments Terms of Service and Anti-Discrimination Policy
                    </a>
                    <span
                      style={{
                        fontFamily: "Lexend, sans-serif",
                        fontWeight: 400,
                        fontStyle: "normal",
                        letterSpacing: "4%",
                        color: "#000000",
                      }}
                    >
                      , and acknowledge the{" "}
                    </span>
                    <a
                      href="/privacy-policy"
                      className="underline"
                      style={{
                        fontFamily: "Lexend, sans-serif",
                        fontWeight: 400,
                        fontStyle: "normal",
                        letterSpacing: "0.04em",
                        textDecorationStyle: "solid",
                        textDecorationSkipInk: "auto",
                        color: "#389131",
                      }}
                    >
                      Privacy Policy
                    </a>
                    <span
                      style={{
                        fontFamily: "Lexend, sans-serif",
                        fontWeight: 400,
                        fontStyle: "normal",
                        color: "#000000",
                      }}
                    >
                      .
                    </span>
                  </div>
                </div>
              </div>
              {/* </div> */}

              {!hasEmailSubmitError && !hasPhoneSubmitError && submitError && (
                <p className="mt-3 text-xs text-red-600">{submitError}</p>
              )}

              {ageSubmitError && (
                <p className="my-3 text-xs text-red-600">Age must be greater than 24</p>
              )}

              {/* <div className="px-6 pb-6 sm:px-10 sm:pb-8 border-t border-gray-200"> */}
              <button
                type="submit"
                disabled={!isFormValid}
                aria-disabled={!isFormValid}
                className={`w-full py-3.5 text-sm sm:text-base font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2 ${isFormValid
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
