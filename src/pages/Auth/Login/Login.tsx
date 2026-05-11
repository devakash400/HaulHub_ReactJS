import React, { useEffect, useMemo, useState, MouseEvent } from "react";
import { createPortal } from "react-dom";
import { images } from "../../../assets/images/index.ts";
import { Eye, EyeOff, Mail, Smartphone, ChevronDown } from "lucide-react";
import { ModalHeader } from "../../../components/ModalHeader.tsx";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../store/authSlice.ts";
import backButton from "../../../assets/images/Back button.png";
import {
  login as loginApi,
  phoneLogin as phoneLoginApi,
  checkEmail as checkEmailApi,
  checkPhone as checkPhoneApi,
  forgotPassword as forgotPasswordApi,
} from "../../../api/authApi.ts";
import { toast } from "react-toastify";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenSignUp?: () => void;
};

type Step = "email" | "password" | "reset" | "newPassword";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type CountryOption = {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  flagUrl: string;
};

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

const getApiErrorMessage = (err: any): string | null => {
  const data = err?.response?.data;
  if (!data) return null;
  if (typeof data === "string") return data;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.error === "string") return data.error;
  if (
    Array.isArray(data?.errors) &&
    typeof data.errors[0]?.message === "string"
  ) {
    return data.errors[0].message;
  }
  if (Array.isArray(data?.errors) && typeof data.errors[0]?.msg === "string") {
    return data.errors[0].msg;
  }
  return null;
};

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenSignUp,
}) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [usePhoneOnly, setUsePhoneOnly] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    COUNTRY_OPTIONS[0],
  );
  const [step, setStep] = useState<Step>("email");
  const [password, setPassword] = useState("");
  const [loginTrailor, setLoginTrailor] = useState<"Renter" | "Owner">(
    "Renter",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Reset flow
  const [resetPhone, setResetPhone] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSeconds, setOtpSeconds] = useState(59);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // New password flow
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  const isEmailFilled = email.trim().length > 0;
  const isEmailValid = useMemo(() => emailRegex.test(email.trim()), [email]);
  const isPhoneLike = useMemo(() => {
    const digits = email.replace(/\D/g, "");
    return digits.length === 10;
  }, [email]);
  // In email mode, only email is allowed; in phone mode, only a 10‑digit phone is allowed
  const isIdentifierValid = usePhoneOnly ? isPhoneLike : isEmailValid;
  const showIdentifierFormatError = useMemo(() => {
    return isEmailFilled && !isIdentifierValid;
  }, [isEmailFilled, isIdentifierValid]);
  const isPasswordFilled = useMemo(
    () => password.trim().length > 0,
    [password],
  );

  const resetCanContinue = useMemo(() => {
    const phoneDigits = resetPhone.replace(/\D/g, "");
    const phoneOk = phoneDigits.length >= 10;
    const emailOk = emailRegex.test(resetEmail.trim());
    return phoneOk || emailOk;
  }, [resetPhone, resetEmail]);

  const otpTargetLabel = useMemo(() => {
    const e = resetEmail.trim();
    if (emailRegex.test(e)) return e;
    return "demo@gmail.com";
  }, [resetEmail]);

  useEffect(() => {
    if (!showOtpModal) return;
    setOtpSeconds(59);
    const id = window.setInterval(() => {
      setOtpSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [showOtpModal]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!isOpen) return;

    // When modal opens, clear transient auth errors from any previous attempt
    setLoginError(null);
    setEmailError(null);
    setPassword("");
    setIsSubmitting(false);

    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
    };
  }, [isOpen]);

  const handleOverlayClick = () => {
    onClose();
  };

  const handleModalClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const goBack = () => {
    if (showOtpModal) {
      setShowOtpModal(false);
      setOtp("");
      setOtpError(null);
      return;
    }
    if (step === "password") setStep("email");
    else if (step === "reset") setStep("password");
    else if (step === "newPassword") setStep("reset");
    else onClose();
  };

  const handleEmailContinue = async () => {
    if (!isEmailFilled || !isIdentifierValid || isCheckingEmail) return;
    setIsCheckingEmail(true);
    setEmailError(null);
    try {
      const trimmed = email.trim();

      if (!usePhoneOnly) {
        // Email-only path
        const res = await checkEmailApi({ email: trimmed });
        // eslint-disable-next-line no-console
        console.log("check-email response:", res);

        const exists =
          res &&
          typeof res === "object" &&
          "data" in res &&
          (res as any).data &&
          typeof (res as any).data === "object" &&
          "exists" in (res as any).data
            ? Boolean((res as any).data.exists)
            : false;

        if (!exists) {
          const msg = "This email is not registered. Please check or sign up.";
          setEmailError(msg);
          toast.error(msg);
          return;
        }
      } else {
        // Phone-only path
        const digits = trimmed.replace(/\D/g, "");
        const phoneWithCode = `${selectedCountry.dialCode}${digits}`;
        const res = await checkPhoneApi({ phoneNumber: phoneWithCode });
        // eslint-disable-next-line no-console
        console.log("check-phone response:", res);

        const exists =
          res &&
          typeof res === "object" &&
          "data" in res &&
          (res as any).data &&
          typeof (res as any).data === "object" &&
          "exists" in (res as any).data
            ? Boolean((res as any).data.exists)
            : false;

        if (!exists) {
          const msg =
            "This phone number is not registered. Please check or sign up.";
          setEmailError(msg);
          toast.error(msg);
          return;
        }
      }

      setLoginError(null);
      setStep("password");
    } catch (err) {
      const msg = "Unable to verify. Please try again.";
      setEmailError(msg);
      toast.error(msg);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleLoginContinue = async () => {
    if (!isPasswordFilled || isSubmitting) return;
    setIsSubmitting(true);
    setLoginError(null);
    try {
      const trimmed = email.trim();

      let loginRes;
      if (!usePhoneOnly && emailRegex.test(trimmed)) {
        loginRes = await loginApi({
          email: trimmed,
          password,
          trailor: loginTrailor,
        });
      } else {
        const digits = trimmed.replace(/\D/g, "");
        const phoneWithCode = `${selectedCountry.dialCode}${digits}`;
        loginRes = await phoneLoginApi({
          phoneNumber: phoneWithCode,
          password,
          trailor: loginTrailor,
        });
      }
      // For debugging / verification in console
      // eslint-disable-next-line no-console
      console.log("login response:", loginRes);
      const { user } = loginRes;
      const userWithShape = user as {
        firstName?: string;
        lastName?: string;
        fullName?: string;
        email?: string;
        phoneNumber?: string | string[];
        gender?: string;
        dateOfBirth?: string;
        trailor?: string | string[];
      };
      const fullName =
        typeof userWithShape.fullName === "string"
          ? userWithShape.fullName.trim()
          : "";
      const [firstFromFullName, ...restName] = fullName
        .split(" ")
        .filter(Boolean);
      const normalizedTrailor = Array.isArray(userWithShape.trailor)
        ? userWithShape.trailor[0]
        : userWithShape.trailor;
      const userPhoneField = userWithShape.phoneNumber;
      const normalizedPhone = Array.isArray(userPhoneField)
        ? userPhoneField[0]
        : userPhoneField;
      dispatch(
        loginSuccess({
          user: {
            firstName:
              userWithShape.firstName || firstFromFullName || undefined,
            lastName:
              userWithShape.lastName ||
              (restName.length > 0 ? restName.join(" ") : undefined),
            email: userWithShape.email || email,
            phoneNumber: normalizedPhone,
            gender: userWithShape.gender,
            dateOfBirth: userWithShape.dateOfBirth,
            trailor: normalizedTrailor,
          },
          accessToken: loginRes.accessToken,
          refreshToken: loginRes.refreshToken,
          userType: normalizedTrailor,
        }),
      );
      toast.success("Logged in successfully");
      onSuccess();
    } catch (err: any) {
      const msg =
        getApiErrorMessage(err) ||
        err?.message ||
        "Unable to login. Please try again.";
      // eslint-disable-next-line no-console
      console.error("login error:", err?.response?.data ?? err);
      const toastOnly =
        typeof msg === "string" &&
        (msg.toLowerCase().includes("not registered as") ||
          msg.toLowerCase().includes("registered as"));
      setLoginError(toastOnly ? null : msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenReset = () => {
    setStep("reset");
    setResetEmail(email.trim());
    setResetPhone("");
    setOtp("");
    setOtpError(null);
    setShowOtpModal(false);
  };

  const handleResetContinue = async () => {
    if (!resetCanContinue || isForgotSubmitting) return;
    setOtp("");
    setOtpError(null);
    setForgotError(null);
    setForgotSuccess(null);

    const emailToUse = resetEmail.trim() || email.trim();
    if (!emailRegex.test(emailToUse)) {
      const msg = "Please enter a valid email address for password reset.";
      setForgotError(msg);
      toast.error(msg);
      return;
    }

    setIsForgotSubmitting(true);
    try {
      const res = await forgotPasswordApi({ email: emailToUse });
      // eslint-disable-next-line no-console
      console.log("forgot-password response:", res);
      const msg = "Password reset link has been sent to your email.";
      setForgotSuccess(msg);
      toast.success(msg);
      setShowOtpModal(true);
    } catch (err) {
      const msg = "Unable to send reset email. Please try again.";
      setForgotError(msg);
      toast.error(msg);
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const handleVerifyOtp = () => {
    // Demo OTP validation: accept "123456" only
    if (otp.trim() !== "123456") {
      const msg = "Invalid OTP. Please try again.";
      setOtpError(msg);
      toast.error(msg);
      return;
    }
    setShowOtpModal(false);
    setOtpError(null);
    setStep("newPassword");
  };

  const passwordsMatch = useMemo(
    () => newPassword.length > 0 && newPassword === confirmNewPassword,
    [newPassword, confirmNewPassword],
  );

  const canSetNewPassword = useMemo(() => {
    return newPassword.length >= 6 && passwordsMatch;
  }, [newPassword, passwordsMatch]);

  const isOtpValid = useMemo(() => otp.trim().length === 6, [otp]);

  const handleNewPasswordContinue = () => {
    if (!canSetNewPassword) return;
    toast.success("Password reset successfully");
    onSuccess();
  };

  if (!isOpen) return null;

  const modal = (
    <div
      className="modal-overlay fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4"
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-[554px] max-h-[90vh] bg-white rounded-[18px] shadow-[0_20px_40px_rgba(15,23,42,0.25)] relative font-sans flex flex-col overflow-hidden"
        onClick={handleModalClick}
      >
        <ModalHeader
          title={
            step === "email"
              ? "Login"
              : step === "password"
                ? "Password"
                : step === "reset"
                  ? "Reset Password"
                  : "New Password"
          }
          onClose={goBack}
          variant="close"
        />

        <div className="px-6 sm:px-10 py-8 flex-1 overflow-y-auto">
          {step === "email" && (
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                {usePhoneOnly ? "Phone Number" : "Email ID"}{" "}
                <span className="text-red-500">*</span>
              </label>
              {usePhoneOnly ? (
                <div className="w-full border border-gray-400 rounded-lg pl-3 pr-2 py-2.5 flex items-center gap-2 bg-white focus-within:border-[#389131] focus-within:ring-2 focus-within:ring-[#389131]/15">
                  <div className="relative flex items-center min-w-[95px] gap-2">
                    <img
                      src={selectedCountry.flagUrl}
                      alt={selectedCountry.name}
                      className="h-4 w-6 rounded-sm object-cover"
                    />
                    <span className="text-sm text-gray-700">
                      {selectedCountry.dialCode}
                    </span>
                    <ChevronDown className="pointer-events-none h-4 w-4 text-gray-500" />
                    <select
                      className="absolute inset-0 opacity-0"
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
                          {country.name} {country.dialCode}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="h-5 w-px bg-gray-300 flex-shrink-0" />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(null);
                    }}
                    maxLength={10}
                    className="flex-1 border-none outline-none text-sm px-1 py-0 bg-transparent"
                  />
                </div>
              ) : (
                <input
                  type="email"
                  placeholder="Enter your Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null);
                  }}
                  className="w-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
                  style={{
                    height: "40px",
                    background: "#FFFFFF",
                    border: "1px solid #000000",
                    borderRadius: "5px",
                  }}
                />
              )}
              {showIdentifierFormatError && (
                <p className="mt-2 text-xs text-red-600">
                  {usePhoneOnly
                    ? "Phone number must be exactly 10 digits"
                    : "Enter a valid Email ID"}
                </p>
              )}
              {emailError && !showIdentifierFormatError && (
                <p className="mt-2 text-xs text-red-600">{emailError}</p>
              )}

              <div className="mt-4">
                <label
                  className="block text-black mb-2"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 400,
                    fontSize: "14px",
                    fontStyle: "normal",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                  }}
                >
                  Choose your category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={loginTrailor}
                    onChange={(e) => {
                      setLoginTrailor(e.target.value as "Renter" | "Owner");
                      setLoginError(null);
                    }}
                    className="w-full px-4 pr-10 text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
                    style={{
                      height: "40px",
                      background: "#FFFFFF",
                      border: "1px solid #050303",
                      borderRadius: "5px",
                    }}
                  >
                    <option value="Renter">Renter</option>
                    <option value="Owner">Owner</option>
                  </select>

                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                    <ChevronDown className="w-4 h-4" aria-hidden />
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleEmailContinue}
                disabled={
                  !isEmailFilled || !isIdentifierValid || isCheckingEmail
                }
                className={`w-full mt-6 py-3.5 rounded-md text-sm font-semibold ${
                  isEmailFilled && isIdentifierValid && !isCheckingEmail
                    ? "bg-[#389131] text-white"
                    : "text-white cursor-not-allowed"
                }`}
                style={{
                  backgroundColor:
                    isEmailFilled && isIdentifierValid && !isCheckingEmail
                      ? "#389131"
                      : "#929191",
                }}
              >
                {isCheckingEmail ? "Checking..." : "Continue"}
              </button>

              <div className="flex items-center gap-3 my-7 text-sm text-gray-500">
                <div className="flex-1 h-px bg-gray-200" />
                <span>Or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                type="button"
                className="w-full mb-3 flex items-center justify-center gap-3 cursor-pointer transition-colors hover:border-[#389131]"
                style={{
                  height: "40px",
                  background: "#FFFFFF",
                  border: "1px solid #000000",
                  borderRadius: "5px",
                  opacity: 1,
                }}
              >
                <img
                  src={images.Google}
                  alt="Google"
                  className="w-[22px] h-[22px] object-contain"
                />
                <span
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 400,
                    fontSize: "14px",
                    fontStyle: "normal",
                    lineHeight: "20px",
                    letterSpacing: "0%",
                    verticalAlign: "middle",
                    color: "#000000",
                  }}
                >
                  Continue with Google
                </span>
              </button>
              <button
                type="button"
                className="w-full mb-3 flex items-center justify-center gap-3 cursor-pointer transition-colors hover:border-[#389131]"
                style={{
                  height: "40px",
                  background: "#FFFFFF",
                  border: "1px solid #000000",
                  borderRadius: "5px",
                  opacity: 1,
                }}
              >
                <img
                  src={images.Apple}
                  alt="Apple"
                  className="w-[22px] h-[22px] object-contain"
                />

                <span
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 400,
                    fontSize: "14px",
                    fontStyle: "normal",
                    lineHeight: "20px",
                    letterSpacing: "0%",
                    verticalAlign: "middle",
                    color: "#000000",
                  }}
                >
                  Continue with Apple
                </span>
              </button>
              <button
                type="button"
                className="w-full mb-3 flex items-center justify-center gap-3 cursor-pointer transition-colors hover:border-[#389131]"
                style={{
                  height: "40px",
                  background: "#FFFFFF",
                  border: "1px solid #000000",
                  borderRadius: "5px",
                  opacity: 1,
                }}
                onClick={() => {
                  setUsePhoneOnly((prev) => !prev);
                  setEmail("");
                  setEmailError(null);
                }}
              >
                {usePhoneOnly ? (
                  <Mail className="w-[22px] h-[22px] text-black" aria-hidden />
                ) : (
                  <Smartphone
                    className="w-[22px] h-[22px] text-black"
                    aria-hidden
                  />
                )}
                <span
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 400,
                    fontSize: "14px",
                    fontStyle: "normal",
                    lineHeight: "20px",
                    letterSpacing: "0%",
                    verticalAlign: "middle",
                    color: "#000000",
                  }}
                >
                  {usePhoneOnly ? "Continue with Email" : "Continue with Phone"}
                </span>
              </button>

              <p className="mt-8 text-center text-sm text-gray-800">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={onOpenSignUp}
                  className="text-[#389131] font-semibold underline cursor-pointer"
                >
                  Sign up
                </button>
              </p>

              <p className="mt-4 text-center text-xs sm:text-sm text-gray-800">
                You agree with{" "}
                <button
                  type="button"
                  className="text-[#389131] font-semibold cursor-pointer"
                >
                  Terms &amp; Conditions
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="text-[#389131] font-semibold cursor-pointer"
                >
                  Privacy Policy
                </button>
                .
              </p>
            </div>
          )}

          {step === "password" && (
            <div className="flex flex-col min-h-[359px]">
              {/* Back Button */}
              <button
                type="button"
                onClick={() => setStep("email")}
                className="flex items-center gap-2 mb-5"
              >
                <img
                  src={backButton}
                  alt="Back"
                  className="w-[5px] h-[10px] opacity-100 border-transparent object-contain"
                />

                <span className="text-sm text-gray-500">Back</span>
              </button>
              {/* Password Label */}
              <label
                className="block mb-2 text-black"
                style={{
                  fontFamily: "Lexend",
                  fontWeight: 400,
                  fontSize: "17px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  color: "#000000",
                }}
              >
                Password
              </label>
              {/* Password Input */}
              <input
                type="password"
                value={password}
                placeholder="Enter your Password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError(null);
                }}
                className="rounded-[5px] border border-black px-4 focus:outline-none focus:ring-0 placeholder:text-[#9B989E]"
                style={{
                  height: "40px",
                  fontFamily: "Lexend",
                  fontWeight: 400,
                }}
              />
              {/* Error */}
              {loginError && (
                <p className="mt-2 text-xs text-red-600">{loginError}</p>
              )}
              {/* Forgot Password */}

              <div className="flex justify-end mt-3">
                <button
                  type="button"
                  onClick={handleOpenReset}
                  className="text-[#389131]"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 500,
                    fontSize: "12px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              {/* Continue Button */}
              <button
                type="button"
                onClick={handleLoginContinue}
                disabled={!isPasswordFilled || isSubmitting}
                className={`w-full mt-6 py-3 rounded-md text-sm font-semibold transition-all text-white`}
                style={{
                  backgroundColor:
                    isPasswordFilled && !isSubmitting ? "#389131" : "#929191",
                  cursor:
                    isPasswordFilled && !isSubmitting
                      ? "pointer"
                      : "not-allowed",
                }}
              >
                {isSubmitting ? "Logging in..." : "Continue"}
              </button>
              {/* Bottom Terms */}
              <div
                className="mt-auto pt-24 text-center text-black"
                style={{
                  fontFamily: "Lexend",
                  fontWeight: 400,
                  fontSize: "10px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  color: "#000000",
                }}
              >
                You agree with{" "}
                <span
                  className="cursor-pointer text-[#389131] underline"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 700,
                    fontSize: "10px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    textDecorationStyle: "solid",
                    textDecorationSkipInk: "auto",
                  }}
                >
                  Terms & Conditions{"  "}
                </span>
                and{"  "}
                <span
                  className="cursor-pointer text-[#389131] underline"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 700,
                    fontSize: "10px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    textDecorationStyle: "solid",
                    textDecorationSkipInk: "auto",
                  }}
                >
                  Privacy Policy
                </span>
              </div>
            </div>
          )}
          {step === "reset" && (
            <div>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="flex items-center gap-2 mb-5"
              >
                <img
                  src={backButton}
                  alt="Back"
                  className="w-[5px] h-[10px] opacity-100 border-transparent object-contain"
                />

                <span className="text-sm text-gray-500">Back</span>
              </button>
              <p
                className="text-center text-black"
                style={{
                  fontFamily: "Lexend",
                  fontWeight: 400,
                  fontSize: "16px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  color: "#000000",
                }}
              >
                Please Enter your Phone Number or
                <br />
                Email ID you previously logged in
              </p>

              <div className="mt-6">
                <label
                  className="block mb-2 text-black"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 400,
                    fontSize: "17px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    color: "#000000",
                  }}
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div
                  className="flex items-center gap-2 px-3"
                  style={{
                    height: "40px",
                    border: "1px solid #000000",
                    borderRadius: "5px",
                    fontFamily: "Lexend",
                  }}
                >
                  <div className="relative flex items-center min-w-[95px] gap-2">
                    <img
                      src={selectedCountry.flagUrl}
                      alt={selectedCountry.name}
                      className="h-4 w-6 rounded-sm object-cover"
                    />
                    <span className="text-sm text-gray-700">
                      {selectedCountry.dialCode}
                    </span>
                    <ChevronDown className="pointer-events-none h-4 w-4 text-gray-500" />
                    <select
                      className="absolute inset-0 opacity-0"
                      value={selectedCountry.code}
                      onChange={(e) => {
                        const next = COUNTRY_OPTIONS.find(
                          (country) => country.code === e.target.value,
                        );
                        if (next) setSelectedCountry(next);
                      }}
                    >
                      {COUNTRY_OPTIONS.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name} {country.dialCode}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="h-5 w-px bg-gray-300 flex-shrink-0" />
                  <input
                    value={resetPhone}
                    onChange={(e) => setResetPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="flex-1 outline-none bg-transparent text-sm"
                    style={{
                      fontFamily: "Lexend",
                      fontWeight: 400,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 my-6 text-sm text-gray-500">
                <div className="flex-1 h-px bg-gray-200" />
                <span
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "20px",
                    letterSpacing: "0%",
                    verticalAlign: "middle",
                    color: "#000000",
                  }}
                >
                  Or
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div>
                <label
                  className="block mb-2 text-black"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 400,
                    fontSize: "17px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    color: "#000000",
                  }}
                >
                  Email ID<span className="text-red-500">*</span>
                </label>

                <input
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter Email ID"
                  className="w-full rounded-[5px] border border-black px-4 outline-none focus:outline-none focus:ring-0"
                  style={{
                    height: "40px",
                    fontFamily: "Lexend",
                    fontWeight: 400,
                    fontSize: "17px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleResetContinue}
                disabled={!resetCanContinue || isForgotSubmitting}
                className={`w-full mt-6 py-3.5 rounded-md text-sm font-semibold text-white`}
                style={{
                  backgroundColor:
                    resetCanContinue && !isForgotSubmitting
                      ? "#389131"
                      : "#929191",
                  cursor:
                    resetCanContinue && !isForgotSubmitting
                      ? "pointer"
                      : "not-allowed",
                }}
              >
                {isForgotSubmitting ? "Sending..." : "Submit"}
              </button>

              {forgotError && (
                <p className="mt-2 text-xs text-red-600">{forgotError}</p>
              )}
              {forgotSuccess && (
                <p className="mt-2 text-xs text-green-600">{forgotSuccess}</p>
              )}
              <div
                className="mt-auto pt-24 text-center text-black"
                style={{
                  fontFamily: "Lexend",
                  fontWeight: 400,
                  fontSize: "10px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  color: "#000000",
                }}
              >
                You agree with{" "}
                <span
                  className="cursor-pointer text-[#389131] underline"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 700,
                    fontSize: "10px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    textDecorationStyle: "solid",
                    textDecorationSkipInk: "auto",
                  }}
                >
                  Terms & Conditions{"  "}
                </span>
                and{"  "}
                <span
                  className="cursor-pointer text-[#389131] underline"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 700,
                    fontSize: "10px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    textDecorationStyle: "solid",
                    textDecorationSkipInk: "auto",
                  }}
                >
                  Privacy Policy
                </span>
              </div>
            </div>
          )}
          {step === "newPassword" && (
            <div>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="flex items-center gap-2 mb-5"
              >
                <img
                  src={backButton}
                  alt="Back"
                  className="w-[5px] h-[10px] opacity-100 border-transparent object-contain"
                />

                <span className="text-sm text-gray-500">Back</span>
              </button>
              <label
                className="block mb-2 text-black"
                style={{
                  fontFamily: "Lexend",
                  fontWeight: 400,
                  fontSize: "17px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  color: "#000000",
                }}
              >
                New Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPwd ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-400 rounded-lg px-4 py-3 text-sm pr-10 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                  aria-label="Toggle password visibility"
                >
                  {showNewPwd ? (
                    <EyeOff className="w-5 h-5" aria-hidden />
                  ) : (
                    <Eye className="w-5 h-5" aria-hidden />
                  )}
                </button>
              </div>
              <label
                className="block mb-2 text-black mt-5"
                style={{
                  fontFamily: "Lexend",
                  fontWeight: 400,
                  fontSize: "17px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  color: "#000000",
                }}
              >
                Confirm New Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPwd ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full border border-gray-400 rounded-lg px-4 py-3 text-sm pr-10 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPwd ? (
                    <EyeOff className="w-5 h-5" aria-hidden />
                  ) : (
                    <Eye className="w-5 h-5" aria-hidden />
                  )}
                </button>
              </div>
              {confirmNewPassword.length > 0 && !passwordsMatch && (
                <p className="mt-2 text-xs text-red-600">
                  Passwords do not match
                </p>
              )}
              <button
                type="button"
                onClick={handleNewPasswordContinue}
                disabled={!canSetNewPassword}
                className={`w-full mt-6 py-3.5 rounded-md text-sm font-semibold text-white`}
                style={{
                  backgroundColor: canSetNewPassword ? "#389131" : "#929191",
                  cursor: canSetNewPassword ? "pointer" : "not-allowed",
                }}
              >
                Continue
              </button>{" "}
              <div
                className="mt-auto pt-24 text-center text-black"
                style={{
                  fontFamily: "Lexend",
                  fontWeight: 400,
                  fontSize: "10px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  color: "#000000",
                }}
              >
                You agree with{" "}
                <span
                  className="cursor-pointer text-[#389131] underline"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 700,
                    fontSize: "10px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    textDecorationStyle: "solid",
                    textDecorationSkipInk: "auto",
                  }}
                >
                  Terms & Conditions{"  "}
                </span>
                and{"  "}
                <span
                  className="cursor-pointer text-[#389131] underline"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 700,
                    fontSize: "10px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    textDecorationStyle: "solid",
                    textDecorationSkipInk: "auto",
                  }}
                >
                  Privacy Policy
                </span>
              </div>
            </div>
          )}
        </div>

        {/* OTP Modal */}
        {showOtpModal && (
          <div
            className="modal-overlay fixed inset-0 z-[90]
             flex items-center justify-center bg-black/45 p-4"
            onClick={() => setShowOtpModal(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="w-full max-w-[380px] bg-white rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(15,23,42,0.25)]"
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader
                title="Enter OTP"
                onClose={() => setShowOtpModal(false)}
                variant="close"
              />
              <div className="px-5 py-5">
                <p
                  className="text-center"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 300,
                    fontSize: "13px",
                    lineHeight: "130%",
                    letterSpacing: "0px",
                    color: "#393939",
                  }}
                >
                  Please enter the OTP sent to
                  <br />
                  <span
                    style={{
                      fontFamily: "Lexend",
                      fontWeight: 300,
                      fontSize: "13px",
                      lineHeight: "100%",
                      letterSpacing: "0px",
                      color: "#000000",
                    }}
                  >
                    {otpTargetLabel}
                  </span>
                  <br />
                  <span
                    style={{
                      fontFamily: "Lexend",
                      fontWeight: 400,
                      fontSize: "12px",
                      lineHeight: "100%",
                      letterSpacing: "0px",
                      color: "#666666",
                    }}
                  >
                    (Demo OTP: 123456)
                  </span>
                </p>
                <label
                  className="block mt-5 mb-2"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    color: "#434343",
                  }}
                >
                  Enter OTP
                </label>
                <>
                  <input
                    value={otp}
                    onChange={(e) => {
                      const onlyDigits = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setOtp(onlyDigits);
                      setOtpError(null);
                    }}
                    placeholder="Enter OTP"
                    maxLength={6}
                    className="otp-input px-4 outline-none focus:outline-none focus:ring-0"
                    style={{
                      width: "100%",
                      height: "40px",
                      border: "1px solid #000000",
                      borderRadius: "3px",
                      color: "#000000",
                      fontFamily: "Lexend",
                      fontWeight: 400,
                      fontSize: "14px",
                    }}
                  />

                  <style>{`
                    .otp-input::placeholder {
                      font-family: Lexend;
                      font-weight: 300;
                      font-size: 12px;
                      line-height: 100%;
                      letter-spacing: 0%;
                      color: #43434380;
                    }
                  `}</style>
                </>
                <div className="mt-2 flex justify-end items-center gap-2 text-xs text-gray-600">
                  {otpSeconds > 0 ? (
                    <span className="font-medium text-gray-600">
                      Didn&apos;t get Code
                      <span className="ml-2 font-semibold text-gray-900">
                        {String(Math.floor(otpSeconds / 60)).padStart(2, "0")}:
                        {String(otpSeconds % 60).padStart(2, "0")}
                      </span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowOtpModal(false);
                        void handleResetContinue();
                      }}
                      className="text-[#389131] font-semibold"
                    >
                      Resend
                    </button>
                  )}
                </div>
                {otpError && (
                  <p className="mt-3 text-xs text-red-600 font-medium flex items-center gap-2">
                    <span className="inline-flex h-4 w-4 rounded-full bg-red-600 text-white items-center justify-center text-[10px]">
                      !
                    </span>
                    {otpError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={!isOtpValid}
                  className={`w-full mt-6 py-3.5 rounded-md text-white`}
                  style={{
                    backgroundColor: isOtpValid ? "#389131" : "#929191",
                    fontFamily: "Lexend",
                    fontWeight: 600,
                    fontSize: "16px",
                    lineHeight: "100%",
                    letterSpacing: "3%",
                    cursor: isOtpValid ? "pointer" : "not-allowed",
                  }}
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return modal;
  return createPortal(modal, document.body);
};

export default LoginModal;
