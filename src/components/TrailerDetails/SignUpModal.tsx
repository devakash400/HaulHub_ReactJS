import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { lockScroll } from "../../utils/scrollLock.ts";

export type SignUpData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  password: string;
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

export const SignUpModal: React.FC<SignUpModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setFirstName("");
    setLastName("");
    setDateOfBirth("");
    setEmail("");
    setPassword("");
    setPhoneNumber("");
    setAgreed(false);
    setFirstNameTouched(false);
    setLastNameTouched(false);
    setEmailTouched(false);
    setPasswordTouched(false);
    setPhoneTouched(false);
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
    password
  );

  const isPasswordValid =
    passwordHasMinLength &&
    passwordHasUppercase &&
    passwordHasLowercase &&
    passwordHasNumber &&
    passwordHasSpecial;

  const normalizedDigits = phoneNumber.replace(/\D/g, "");
  const isPhoneValid = normalizedDigits.length >= 10;

  const isFormValid =
    isFirstNameValid &&
    isLastNameValid &&
    dateOfBirth.trim().length > 0 &&
    isEmailValid &&
    isPasswordValid &&
    isPhoneValid &&
    agreed;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth.trim(),
      email: email.trim(),
      password,
      phoneNumber: phoneNumber.trim(),
      agreedToTerms: agreed,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign-up-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-hidden border-4 border-[#389131]"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          className="relative flex flex-col max-h-[90vh]"
          onSubmit={handleSubmit}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 top-4 text-gray-700 hover:text-black"
            aria-label="Close sign up"
          >
            <X className="w-6 h-6" aria-hidden />
          </button>

          <div className="px-6 pt-10 pb-6 sm:px-10 sm:pt-12 sm:pb-8 overflow-y-auto">
            <h2
              id="sign-up-title"
              className="text-2xl sm:text-3xl font-semibold text-center text-gray-900"
            >
              Sign Up
            </h2>

            <div className="mt-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => setFirstNameTouched(true)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#389131] focus:border-transparent"
                    placeholder="demo"
                  />
                  {firstNameTouched && !isFirstNameValid && (
                    <p className="mt-1 text-xs text-red-600">
                      Please enter only alphabet
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() => setLastNameTouched(true)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#389131] focus:border-transparent"
                    placeholder="demo"
                  />
                  {lastNameTouched && !isLastNameValid && (
                    <p className="mt-1 text-xs text-red-600">
                      Please enter only alphabet
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#389131] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="dem@gmail.com"
                  className={`w-full border rounded-lg px-3 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#389131] focus:border-transparent ${
                    emailTouched && !isEmailValid
                      ? "border-red-400"
                      : "border-gray-300"
                  }`}
                />
                {emailTouched && !isEmailValid && (
                  <p className="mt-1 text-xs text-red-600">Enter valid email</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#389131] focus:border-transparent"
                />
                {passwordTouched && (
                  <ul className="mt-2 space-y-0.5 text-xs">
                    <li
                      className={
                        passwordHasMinLength ? "text-green-600" : "text-red-600"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700">
                    +1
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onBlur={() => setPhoneTouched(true)}
                    placeholder="**********"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#389131] focus:border-transparent"
                  />
                </div>
                {phoneTouched && !isPhoneValid && (
                  <p className="mt-1 text-xs text-red-600">
                    Enter at least 10 digits number
                  </p>
                )}
              </div>

              <div className="flex items-start gap-3 mt-2">
                <input
                  id="signup-agree"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#389131] focus:ring-[#389131]"
                />
                <label
                  htmlFor="signup-agree"
                  className="text-xs sm:text-sm text-gray-700"
                >
                  By selecting Agree and continue, I agree to HaulHub{" "}
                  <button
                    type="button"
                    className="underline text-[#389131]"
                  >
                    Terms of service
                  </button>
                  ,{" "}
                  <button
                    type="button"
                    className="underline text-[#389131]"
                  >
                    Payments Terms of Service and Anti -Discrimination Policy
                  </button>
                  , and acknowledge the{" "}
                  <button
                    type="button"
                    className="underline text-[#389131]"
                  >
                    Privacy Policy
                  </button>
                  .
                </label>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 sm:px-10 sm:pb-8">
            <button
              type="submit"
              disabled={!isFormValid}
              aria-disabled={!isFormValid}
              className={`w-full py-3.5 text-sm sm:text-base font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2 ${
                isFormValid
                  ? "bg-[#389131] text-white hover:opacity-90"
                  : "bg-[#389131]/60 text-white cursor-not-allowed"
              }`}
            >
              Agree and Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

