import React, { useEffect, useMemo, useRef, useState, MouseEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useModalNavigate from "../../../hooks/useModalNavigate.ts";
import { createPortal } from "react-dom";
import { images } from "../../../assets/images/index.ts";
import { Eye, EyeOff, Mail, Smartphone, ChevronDown } from "lucide-react";
import { ModalHeader } from "../../../components/ModalHeader.tsx";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../../../store/authSlice.ts";
import { RootState } from "../../../store/index.ts";
import backButton from "../../../assets/images/Back button.png";
import smartphone from "../../../assets/images/Mobile-phone.png";
import chevronDown from "../../../assets/images/Dorpdown.png";
import {
  login as loginApi,
  phoneLogin as phoneLoginApi,
  checkEmail as checkEmailApi,
  checkPhone as checkPhoneApi,
} from "../../../api/authApi.ts";
import { toast } from "react-toastify";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenSignUp?: () => void;
  initialStep?: Step;
  initialIdentifier?: string;
  initialUsePhoneOnly?: boolean;
  initialCountryCode?: string;
  initialTrailor?: "Renter" | "Owner";
};

type Step = "email" | "password" | "reset" | "otp" | "newPassword";

const STATIC_RESET_OTP = "123456";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Same rule as `SignUpModal` password special-character check */
const passwordSpecialCharRegex = /[!@#$%^&*(),.?":{}|<>_\-\\[\];'/`~+]/;

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
    flag: "ðŸ‡ºðŸ‡¸",
    flagUrl: "https://flagcdn.com/w20/us.png",
  },
  {
    code: "CA",
    name: "Canada",
    dialCode: "+1",
    flag: "ðŸ‡¨ðŸ‡¦",
    flagUrl: "https://flagcdn.com/w20/ca.png",
  },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    flag: "ðŸ‡¬ðŸ‡§",
    flagUrl: "https://flagcdn.com/w20/gb.png",
  },
  {
    code: "IN",
    name: "India",
    dialCode: "+91",
    flag: "ðŸ‡®ðŸ‡³",
    flagUrl: "https://flagcdn.com/w20/in.png",
  },
  {
    code: "AU",
    name: "Australia",
    dialCode: "+61",
    flag: "ðŸ‡¦ðŸ‡º",
    flagUrl: "https://flagcdn.com/w20/au.png",
  },
  {
    code: "DE",
    name: "Germany",
    dialCode: "+49",
    flag: "ðŸ‡©ðŸ‡ª",
    flagUrl: "https://flagcdn.com/w20/de.png",
  },
  {
    code: "FR",
    name: "France",
    dialCode: "+33",
    flag: "ðŸ‡«ðŸ‡·",
    flagUrl: "https://flagcdn.com/w20/fr.png",
  },
];

const getApiErrorMessage = (err: any): string | null => {
  const data = err?.response?.data;
  if (!data) return null;
  if (typeof data === "string") return data;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.error === "string") return data.error;
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.details === "string") return data.details;
  // Handle nested data object with message
  if (
    typeof data?.data === "object" &&
    data.data !== null &&
    typeof data.data.message === "string"
  ) {
    return data.data.message;
  }
  if (
    Array.isArray(data?.errors) &&
    typeof data.errors[0]?.message === "string"
  ) {
    return data.errors[0].message;
  }
  if (Array.isArray(data?.errors) && typeof data.errors[0]?.msg === "string") {
    return data.errors[0].msg;
  }
  if (Array.isArray(data?.errors) && typeof data.errors[0] === "string") {
    return data.errors[0];
  }
  return null;
};

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenSignUp,
  initialStep,
  initialIdentifier,
  initialUsePhoneOnly,
  initialCountryCode,
  initialTrailor,
}) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const [email, setEmail] = useState(initialIdentifier ?? "");
  const [usePhoneOnly, setUsePhoneOnly] = useState(
    initialUsePhoneOnly ?? false,
  );
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(() => {
    const country = COUNTRY_OPTIONS.find((c) => c.code === initialCountryCode);
    return country ?? COUNTRY_OPTIONS[0];
  });
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState<Step>(initialStep ?? "email");
  const [password, setPassword] = useState("");
  const [loginTrailor, setLoginTrailor] = useState<"Renter" | "Owner">(
    initialTrailor ?? "Renter",
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
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  // New password flow
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [confirmNewPasswordTouched, setConfirmNewPasswordTouched] =
    useState(false);

  const isEmailFilled = email.trim().length > 0;
  const isEmailValid = useMemo(() => emailRegex.test(email.trim()), [email]);
  const isPhoneLike = useMemo(() => {
    const digits = email.replace(/\D/g, "");
    return digits.length === 10;
  }, [email]);
  // In email mode, only email is allowed; in phone mode, only a 10â€‘digit phone is allowed
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
    if (step !== "otp") return;
    setOtpSeconds(59);
    const id = window.setInterval(() => {
      setOtpSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [step]);

  useEffect(() => {
    const handleOutsideClick = (event: Event) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setCountryMenuOpen(false);
      }
    };

    if (countryMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }
    return undefined;
  }, [countryMenuOpen]);

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    onSuccess();
  }, [isOpen, isAuthenticated, onSuccess]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!isOpen) return;

    // When modal opens, clear transient auth errors from any previous attempt
    setLoginError(null);
    setEmailError(null);
    setResetError(null);
    setPassword("");
    setIsSubmitting(false);
    setNewPassword("");
    setConfirmNewPassword("");
    setNewPasswordTouched(false);
    setConfirmNewPasswordTouched(false);

    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
    };
  }, [isOpen]);

  // ============================================
  // Sync modal step with URL pathname
  // Browser back/forward updates the step correctly
  // ============================================
  const location = useLocation();

  useEffect(() => {
    if (!isOpen) return;

    const pathname = location.pathname;
    const locationState = location.state as {
      modalStep?: Step;
      loginIdentifier?: string;
      usePhoneOnly?: boolean;
      selectedCountryCode?: string;
      loginTrailor?: "Renter" | "Owner";
    } | null;

    // Map pathname to step state
    if (pathname === "/reset-password") {
      setStep("reset");
    } else if (pathname === "/Newpassword") {
      setStep("newPassword");
    } else if (pathname === "/otp") {
      setStep("otp");
    } else if (pathname === "/login" && locationState?.modalStep) {
      setStep(locationState.modalStep);
    } else {
      // For /login or any other path, reset to email step
      setStep(initialStep ?? "email");
    }

    if (pathname === "/login" && locationState) {
      if (locationState.loginIdentifier !== undefined) {
        setEmail(locationState.loginIdentifier);
      }
      if (locationState.usePhoneOnly !== undefined) {
        setUsePhoneOnly(locationState.usePhoneOnly);
      }
      if (locationState.selectedCountryCode) {
        const country = COUNTRY_OPTIONS.find(
          (c) => c.code === locationState.selectedCountryCode,
        );
        if (country) setSelectedCountry(country);
      }
      if (locationState.loginTrailor) {
        setLoginTrailor(locationState.loginTrailor);
      }
    }
  }, [location.pathname, location.state, isOpen, initialStep]);

  const handleOverlayClick = () => {
    onClose();
  };

  const handleModalClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const navigate = useNavigate();
  const modalNavigate = useModalNavigate();

  const goBack = () => {
    const currentState = location.state as Record<string, unknown> | null;

    if (location.pathname === "/reset-password") {
      navigate("/login", {
        replace: true,
        state: {
          ...currentState,
          modalStep: "password",
        },
      });
      return;
    }

    if (location.pathname === "/otp") {
      navigate("/reset-password", {
        replace: true,
        state: currentState,
      });
      return;
    }

    if (location.pathname === "/Newpassword") {
      navigate("/otp", {
        replace: true,
        state: currentState,
      });
      return;
    }

    // Internal step navigation (only on /login route)
    if (step === "password") setStep("email");
    else if (step === "reset") setStep("password");
    else if (step === "otp") {
      setStep("reset");
      setOtp("");
      setOtpError(null);
    } else if (step === "newPassword") setStep("otp");
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
        const res = await checkEmailApi({
          email: trimmed,
          trailor: loginTrailor,
        });
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
          return;
        }
      } else {
        // Phone-only path
        const digits = trimmed.replace(/\D/g, "");
        const phoneWithCode = `${selectedCountry.dialCode}${digits}`;
        const res = await checkPhoneApi({
          phoneNumber: phoneWithCode,
          trailor: loginTrailor,
        });
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
          return;
        }
      }

      setLoginError(null);
      setStep("password");
    } catch (err) {
      let msg =
        getApiErrorMessage(err) || "Unable to verify. Please try again.";
      // Replace technical E.164 format error with user-friendly message
      if (
        msg.toLowerCase().includes("e.164") ||
        msg.toLowerCase().includes("valid international")
      ) {
        msg = "This phone number is not registered. Please check or sign up.";
      }
      setEmailError(msg);
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
        profilePicture?: string;
        trailor?: string | string[];
        role?: string;
      };
      const fullName =
        typeof userWithShape.fullName === "string"
          ? userWithShape.fullName.trim()
          : "";
      const [firstFromFullName, ...restName] = fullName
        .split(" ")
        .filter(Boolean);
      const trailorOrRole =
        userWithShape.role ??
        (Array.isArray(userWithShape.trailor)
          ? userWithShape.trailor[0]
          : userWithShape.trailor);
      const normalizedTrailor =
        trailorOrRole?.toLowerCase() === "owner"
          ? "Owner"
          : trailorOrRole?.toLowerCase() === "renter"
            ? "Renter"
            : loginTrailor;
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
            profilePicture:
              typeof userWithShape.profilePicture === "string"
                ? userWithShape.profilePicture
                : undefined,
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
      const rawMsg =
        getApiErrorMessage(err) ||
        err?.message ||
        "Unable to login. Please try again.";
      const normalizedMsg = rawMsg.toString().toLowerCase();
      const isCredentialError =
        normalizedMsg.includes("invalid email") ||
        normalizedMsg.includes("invalid phone") ||
        normalizedMsg.includes("invalid phone number") ||
        normalizedMsg.includes("invalid password") ||
        normalizedMsg.includes("email or password") ||
        normalizedMsg.includes("phone or password") ||
        normalizedMsg.includes("incorrect password") ||
        normalizedMsg.includes("password is incorrect");
      const displayMsg = isCredentialError ? "Password is incorrect" : rawMsg;
      // eslint-disable-next-line no-console
      console.error("login error:", err?.response?.data ?? err);
      setLoginError(displayMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenReset = () => {
    const currentState = location.state as Record<string, unknown> | null;
    modalNavigate("/reset-password", {
      state: {
        ...currentState,
        loginIdentifier: email,
        usePhoneOnly,
        selectedCountryCode: selectedCountry.code,
        loginTrailor,
      },
    });
  };

  /** Static forgot-password flow â€” no API; Continue opens OTP step. */
  // const handleResetContinue = () => {
  //   if (!resetCanContinue) return;

  //   const phoneDigits = resetPhone.replace(/\D/g, "");
  //   const isPhone = phoneDigits.length >= 10;
  //   const isEmail = emailRegex.test(resetEmail.trim());

  //   if (!isPhone && !isEmail) {
  //     toast.error("Please enter a valid phone number or email.");
  //     return;
  //   }

  //   setOtp("");
  //   setOtpError(null);
  //   setStep("otp");
  // };
  const handleResetContinue = () => {
    if (!resetCanContinue) return;

    const phoneDigits = resetPhone.replace(/\D/g, "");
    const isPhone = phoneDigits.length >= 10;
    const isEmail = emailRegex.test(resetEmail.trim());

    if (!isPhone && !isEmail) {
      setResetError("Please enter a valid phone number or email.");
      return;
    }

    setOtp("");
    setOtpError(null);
    setResetError(null);
    setStep("otp"); // Directly opens OTP screen
  };
  const handleResendOtp = () => {
    setOtpSeconds(59);
    setOtp("");
    setOtpError(null);
  };

  const handleVerifyOtp = () => {
    if (otp.trim() !== STATIC_RESET_OTP) {
      const msg = "Invalid OTP. Please try again.";
      setOtpError(msg);
      return;
    }
    setOtpError(null);
    setStep("newPassword");
  };

  const passwordsMatch = useMemo(
    () => newPassword.length > 0 && newPassword === confirmNewPassword,
    [newPassword, confirmNewPassword],
  );

  const newPasswordRules = useMemo(() => {
    const p = newPassword;
    return {
      hasMinLength: p.length >= 8,
      hasUppercase: /[A-Z]/.test(p),
      hasLowercase: /[a-z]/.test(p),
      hasNumber: /[0-9]/.test(p),
      hasSpecial: passwordSpecialCharRegex.test(p),
    };
  }, [newPassword]);

  const isNewPasswordValid = useMemo(
    () =>
      newPasswordRules.hasMinLength &&
      newPasswordRules.hasUppercase &&
      newPasswordRules.hasLowercase &&
      newPasswordRules.hasNumber &&
      newPasswordRules.hasSpecial,
    [newPasswordRules],
  );

  const confirmPasswordRules = useMemo(() => {
    const p = confirmNewPassword;
    return {
      hasMinLength: p.length >= 8,
      hasUppercase: /[A-Z]/.test(p),
      hasLowercase: /[a-z]/.test(p),
      hasNumber: /[0-9]/.test(p),
      hasSpecial: passwordSpecialCharRegex.test(p),
    };
  }, [confirmNewPassword]);

  const canSetNewPassword = useMemo(() => {
    return isNewPasswordValid && passwordsMatch;
  }, [isNewPasswordValid, passwordsMatch]);

  const isOtpValid = useMemo(() => otp.trim().length === 6, [otp]);

  const handleNewPasswordContinue = () => {
    if (!canSetNewPassword) return;
    toast.success("Password reset successfully");
    onSuccess();
  };

  if (!isOpen || isAuthenticated) return null;

  const modal = (
    <div
      className="modal-overlay fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4"
      onClick={handleOverlayClick}
    >
      <style>{`
        .custom-placeholder::placeholder {
          font-family: "Lexend";
          font-weight: 300;
          font-style: normal;
          font-size: 12px;
          leading-trim: none;
          line-height: 100%;
          letter-spacing: 0%;
          color: #9B989E;
        }
      `}</style>
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
                : step === "reset" || step === "otp"
                  ? "Reset Password"
                  : "New Password"
          }
          onClose={goBack}
          variant={step === "email" ? "close" : "none"}
          closeOnRight={true}
        />

        <div
          className={`px-[18px] pb-3 flex-1 overflow-y-auto ${
            step === "email" ? "pt-6" : "pt-3"
          }`}
        >
          {step === "email" && (
            <div>
              <label
                className="block mb-2 font-['Lexend']
              font-normal text-[14px] leading-[100%]
               tracking-[0%] text-black"
              >
                {usePhoneOnly ? "Phone Number" : "Email ID"}{" "}
                <span className="text-red-500">*</span>
              </label>
              {usePhoneOnly ? (
                <div className="relative w-full" ref={countryDropdownRef}>
                  <div className="h-[40px] bg-white border border-black rounded-[5px] flex items-center px-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setCountryMenuOpen((prev) => !prev)}
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
                      placeholder="Phone Number"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError(null);
                      }}
                      maxLength={10}
                      className="flex-1 bg-transparent outline-none text-[15px] text-black custom-placeholder placeholder:text-[#9B989E] font-normal"
                    />
                  </div>

                  {countryMenuOpen && (
                    <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-[10px] border border-[#D1D5DB] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                      {COUNTRY_OPTIONS.map((country) => (
                        <button
                          type="button"
                          key={country.code}
                          onClick={() => {
                            setSelectedCountry(country);
                            setCountryMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#111827] hover:bg-[#F3F4F6]"
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
              ) : (
                <input
                  type="email"
                  placeholder="Enter your Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null);
                  }}
                  className="w-full px-4 text-sm custom-placeholder placeholder:text-[#9B989E] focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
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
                  className="block mb-2 text-black"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                  }}
                >
                  Choose your Category <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <select
                    value={loginTrailor}
                    onChange={(e) => {
                      setLoginTrailor(e.target.value as "Renter" | "Owner");
                      setLoginError(null);
                    }}
                    className="w-full px-4 pr-10 appearance-none bg-white outline-none"
                    style={{
                      height: "40px",
                      minHeight: "40px",
                      border: "1px solid #050303",
                      borderRadius: "5px",
                      fontFamily: "Lexend",
                      fontWeight: 300,
                      fontSize: "12px",
                      lineHeight: "40px",
                      color: "#000",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
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
                <span className="font-['Inter'] font-medium text-[14px] leading-[20px] tracking-[0%] align-middle text-black">
                  Or
                </span>
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
                  <img
                    src={smartphone}
                    alt="Smartphone"
                    className="w-[22px] h-[22px]"
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

              <p className="mt-8 text-center font-['Myriad Pro'] font-normal text-[12px] leading-[100%] tracking-[0px] text-black">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => modalNavigate("/signup")}
                  className="cursor-pointer text-[#389131] underline"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 600,
                    fontStyle: "normal",
                    fontSize: "12px",
                    lineHeight: "100%",
                    letterSpacing: "0px",
                    textDecoration: "underline",
                    textDecorationStyle: "solid",

                    textDecorationThickness: "0%",
                  }}
                >
                  Sign up
                </button>
              </p>

              <p className="mt-4 text-center font-['Lexend'] text-[10px] font-medium leading-[100%] text-gray-800">
                You agree with{" "}
                <button
                  type="button"
                  onClick={() => navigate("/terms")}
                  className="cursor-pointer text-[#389131] underline"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 700,
                    fontStyle: "normal",
                    fontSize: "10px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    textDecoration: "underline",
                    textDecorationStyle: "solid",
                    textDecorationThickness: "0%",
                    textDecorationSkipInk: "auto",
                  }}
                >
                  Terms &amp; Conditions
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  onClick={() => navigate("/privacy-policy")}
                  className="cursor-pointer text-[#389131] underline"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 700,
                    fontStyle: "normal",
                    fontSize: "10px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    textDecoration: "underline",
                    textDecorationStyle: "solid",
                    textDecorationThickness: "0%",
                    textDecorationSkipInk: "auto",
                  }}
                >
                  Privacy Policy
                </button>
                .
              </p>
            </div>
          )}

          {step === "password" && (
            <div className="flex flex-col min-h-[359px]">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="flex items-center gap-1 mb-5"
              >
                <img
                  src={backButton}
                  alt="Back"
                  className="w-[5px] h-[10px] opacity-100 border-transparent object-contain"
                />
                <span className="font-['Lexend'] text-[14px] font-normal leading-[100%] tracking-[0px] capitalize text-[#7C7C7C]">
                  Back
                </span>
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
              <div className="relative">
                <input
                  type={showLoginPwd ? "text" : "password"}
                  value={password}
                  placeholder="Enter your Password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError(null);
                  }}
                  className="w-full rounded-[5px] border border-black px-4 pr-10 focus:outline-none focus:ring-0 custom-placeholder placeholder:text-[#9B989E]"
                  style={{
                    height: "40px",
                    fontFamily: "Lexend",
                    fontWeight: 400,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPwd((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  aria-label={showLoginPwd ? "Hide password" : "Show password"}
                >
                  {showLoginPwd ? (
                    <Eye className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <EyeOff className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>

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
          {(step === "reset" || step === "otp") && (
            <div>
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1 mb-5"
              >
                <img
                  src={backButton}
                  alt="Back"
                  className="w-[5px] h-[10px] opacity-100 border-transparent object-contain"
                />
                <span className="font-['Lexend'] text-[14px] font-normal leading-[100%] tracking-[0px] capitalize text-[#7C7C7C]">
                  Back
                </span>
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
                <label className="block mb-2 font-['Lexend'] text-[17px] font-normal leading-[100%] text-black">
                  Phone Number{" "}
                  <span className="font-['Lexend'] text-[17px] font-normal leading-[100%] text-[#FF0000]">
                    *
                  </span>
                </label>
                <div
                  className="h-[40px] bg-white border border-black rounded-[5px] flex items-center px-3 gap-2"
                  style={{
                    fontFamily: "Lexend",
                  }}
                >
                  {/* Country Selector */}
                  <div
                    className="relative flex
                   items-center gap-2 flex-shrink-0 min-w-[60px]"
                  >
                    <img
                      src={selectedCountry.flagUrl}
                      alt={selectedCountry.name}
                      className="w-[20px] h-[12px] object-cover rounded-[1px]"
                    />

                    <span
                      className="
    font-['Lexend']
    text-[12px]
    font-light
    text-[#929191]
    leading-[100%]
    whitespace-nowrap
  "
                    >
                      {selectedCountry.dialCode}
                    </span>
                    <div className="flex items-center">
                      <img
                        src={chevronDown}
                        alt="dropdown"
                        className="w-[8.4px] h-[6px] pointer-events-none"
                      />
                    </div>

                    <select
                      className="absolute inset-0 opacity-0 cursor-pointer appearance-none"
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

                  {/* Divider */}

                  {/* Input */}
                  <input
                    type="tel"
                    value={resetPhone}
                    onChange={(e) => {
                      setResetPhone(e.target.value);
                      setResetError(null);
                    }}
                    placeholder="Phone Number"
                    maxLength={10}
                    className="flex-1 min-w-0 bg-transparent
                     outline-none text-[15px] text-black 
                     custom-placeholder placeholder:text-[#9B989E] 
                     font-normal"
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
                  className="block mb-2 font-['Lexend'] font-normal 
                text-[14px] leading-[100%] tracking-[0%] text-black"
                >
                  Email ID <span className="text-red-500">*</span>
                </label>

                <input
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    setResetError(null);
                  }}
                  placeholder="Enter Your Email"
                  className="w-full rounded-[5px] border border-black px-4 outline-none focus:outline-none focus:ring-0 custom-placeholder placeholder:text-[#9B989E]"
                  style={{
                    height: "40px",
                    fontFamily: "Lexend",
                    fontWeight: 400,
                    fontSize: "17px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                  }}
                />
                {resetError && (
                  <p className="mt-2 text-xs text-red-600">{resetError}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleResetContinue}
                disabled={!resetCanContinue}
                className={`w-full mt-6 py-3.5 rounded-md text-sm font-semibold text-white`}
                style={{
                  backgroundColor: resetCanContinue ? "#389131" : "#929191",
                  cursor: resetCanContinue ? "pointer" : "not-allowed",
                }}
              >
                Continue
              </button>
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
                <button
                  type="button"
                  onClick={() => navigate("/terms")}
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
                </button>
                and{"  "}
                <button
                  type="button"
                  onClick={() => navigate("/privacy-policy")}
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
                </button>
              </div>
            </div>
          )}
          {step === "newPassword" && (
            <div>
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1 mb-5"
              >
                <img
                  src={backButton}
                  alt="Back"
                  className="w-[5px] h-[10px] opacity-100 border-transparent object-contain"
                />
                <span className="font-['Lexend'] text-[14px] font-normal leading-[100%] tracking-[0px] capitalize text-[#7C7C7C]">
                  Back
                </span>
              </button>
              <label className="block mb-2 font-['Lexend'] text-[17px] font-normal leading-[100%] text-black">
                New Password{" "}
                <span className="font-['Lexend'] text-[17px] font-normal leading-[100%] text-[#FF0000]">
                  *
                </span>
              </label>
              <div className="relative">
                <input
                  type={showNewPwd ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => setNewPasswordTouched(true)}
                  placeholder="Enter New Password"
                  className="w-full border border-gray-400 rounded-lg px-4 py-3 text-sm pr-10 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                  aria-label="Toggle password visibility"
                >
                  {showNewPwd ? (
                    <Eye className="w-5 h-5" aria-hidden />
                  ) : (
                    <EyeOff className="w-5 h-5" aria-hidden />
                  )}
                </button>
              </div>
              {newPasswordTouched &&
                newPassword.trim().length > 0 &&
                !isNewPasswordValid && (
                  <p className="mt-2 font-lexend font-normal text-[12px] leading-[1.3] tracking-[0em] text-red-500">
                    {!newPasswordRules.hasMinLength
                      ? "Password must be at least 8 characters"
                      : (() => {
                          const missing = [];
                          if (!newPasswordRules.hasUppercase)
                            missing.push("uppercase");
                          if (!newPasswordRules.hasLowercase)
                            missing.push("lowercase");
                          if (!newPasswordRules.hasNumber)
                            missing.push("numbers");
                          if (!newPasswordRules.hasSpecial)
                            missing.push("special characters");
                          if (missing.length === 1)
                            return `Password must contain ${missing[0]}`;
                          if (missing.length === 2)
                            return `Password must contain ${missing[0]} and ${missing[1]}`;
                          if (missing.length > 2) {
                            const last = missing.pop();
                            return `Password must contain ${missing.join(", ")}, and ${last}`;
                          }
                          return "";
                        })()}
                  </p>
                )}
              <label className="mt-5 block mb-2 font-['Lexend'] text-[17px] font-normal leading-[100%] text-black">
                Confirm New Password{" "}
                <span className="font-['Lexend'] text-[17px] font-normal leading-[100%] text-[#FF0000]">
                  *
                </span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPwd ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  onBlur={() => setConfirmNewPasswordTouched(true)}
                  placeholder="Enter Confirm New Password"
                  className="w-full border border-gray-400 rounded-lg px-4 py-3 text-sm pr-10 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPwd ? (
                    <Eye className="w-5 h-5" aria-hidden />
                  ) : (
                    <EyeOff className="w-5 h-5" aria-hidden />
                  )}
                </button>
              </div>
              {confirmNewPassword.length > 0 && !passwordsMatch && (
                <p
                  className="text-[12px] font-light 
                font-['Lexend'] text-red-600 mt-2"
                >
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
                <button
                  type="button"
                  onClick={() => navigate("/terms")}
                  className="cursor-pointer text-[#389131] underline"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 700,
                    fontStyle: "normal",
                    fontSize: "10px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    textDecoration: "underline",
                    textDecorationStyle: "solid",
                    textDecorationThickness: "0%",
                    textDecorationSkipInk: "auto",
                  }}
                >
                  Terms & Conditions
                </button>
                and{"  "}
                <button
                  type="button"
                  onClick={() => navigate("/privacy-policy")}
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
                </button>
              </div>
            </div>
          )}
        </div>

        {step === "otp" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/45">
            <div className="w-[85%] max-w-[400px] bg-white rounded-[15px] overflow-hidden shadow-2xl flex flex-col relative">
              <ModalHeader
                title={
                  <span
                    style={{
                      fontFamily: "Lexend",
                      fontWeight: 600,
                      fontSize: "22px",
                      lineHeight: "135%",
                      letterSpacing: "6%",
                      textAlign: "center",
                      color: "#FFFFFF",
                      display: "block",
                    }}
                  >
                    Enter OTP
                  </span>
                }
                onClose={() => setStep("reset")}
                variant="close"
                closeOnRight={true}
              />
              <div className="p-6">
                <p
                  className="text-center mb-6"
                  style={{
                    fontFamily: "Lexend",
                    fontWeight: 300,
                    fontSize: "13px",
                    lineHeight: "100%",
                    letterSpacing: "0px",
                    color: "#393939",
                  }}
                >
                  Please enter the OTP sent to
                  <br />
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: "6px", // adjust spacing here
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
                </p>
                <label
                  className="block mb-2"
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
                  inputMode="numeric"
                  className="w-full rounded-[5px] border border-black px-4 outline-none custom-placeholder placeholder:text-[#9B989E]"
                  style={{
                    height: "40px",
                    fontFamily: "Lexend",
                    fontSize: "15px",
                  }}
                />
                {otpError && (
                  <p className="mt-2 text-[12px] font-light font-['Lexend'] text-red-600">
                    {otpError}
                  </p>
                )}
                <div className="mt-2 flex justify-end">
                  {otpSeconds > 0 ? (
                    <span className="font-lexend text-[11px] text-[#757171]">
                      Didn&apos;t get Code ?{" "}
                      <span
                        style={{
                          fontFamily: "Lexend",
                          fontWeight: 300,
                          fontSize: "11px",
                          lineHeight: "100%",
                          letterSpacing: "-0.3px",
                          textDecoration: "underline",
                          textDecorationStyle: "solid",
                          textDecorationColor: "#389131",
                          color: "#389131",
                        }}
                      >
                        {String(Math.floor(otpSeconds / 60)).padStart(2, "0")}:
                        {String(otpSeconds % 60).padStart(2, "0")}
                      </span>
                    </span>
                  ) : (
                    <button type="button" onClick={handleResendOtp}>
                      <span className="text-[11px] text-[#757171]">
                        Didn&apos;t get Code ?{" "}
                      </span>
                      <span
                        className="
    text-[11px]
    text-[#389131]
    underline
    underline-offset-[2px]
    decoration-[1px]
    decoration-[#389131]
  "
                        style={{
                          fontFamily: "Lexend",
                          fontWeight: 300,
                          fontSize: "11px",
                          lineHeight: "100%",
                          letterSpacing: "-0.3px",
                          textDecoration: "underline",
                          textDecorationStyle: "solid",
                          textDecorationColor: "#389131",
                          color: "#389131",
                        }}
                      >
                        Resend
                      </span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={!isOtpValid}
                  className="w-full mt-6 py-3.5 rounded-md text-sm font-semibold text-white"
                  style={{
                    backgroundColor: isOtpValid ? "#389131" : "#929191",
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
