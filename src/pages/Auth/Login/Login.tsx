import React, { useEffect, useMemo, useState, MouseEvent } from "react";
import { images } from "../../../assets/images/index.ts";
import { ArrowLeft, Eye, EyeOff, X } from "lucide-react";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type Step = "email" | "password" | "reset" | "newPassword";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [password, setPassword] = useState("");

  // Reset flow
  const [resetPhone, setResetPhone] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSeconds, setOtpSeconds] = useState(59);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // New password flow
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const isEmailFilled = email.trim().length > 0;
  const isEmailValid = useMemo(() => emailRegex.test(email.trim()), [email]);
  const isPasswordFilled = useMemo(() => password.trim().length > 0, [password]);

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

  const handleEmailContinue = () => {
    if (!isEmailFilled || !isEmailValid) return;
    setStep("password");
  };

  const handleLoginContinue = () => {
    if (!isPasswordFilled) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("isLoggedIn", "true");
    }
    onSuccess();
  };

  const handleOpenReset = () => {
    setStep("reset");
    setResetEmail(email.trim());
    setResetPhone("");
    setOtp("");
    setOtpError(null);
    setShowOtpModal(false);
  };

  const handleResetContinue = () => {
    if (!resetCanContinue) return;
    setOtp("");
    setOtpError(null);
    setShowOtpModal(true);
  };

  const handleVerifyOtp = () => {
    // Demo OTP validation: accept "1234" only
    if (otp.trim() !== "1234") {
      setOtpError("Invalid OTP. Please try again");
      return;
    }
    setShowOtpModal(false);
    setOtpError(null);
    setStep("newPassword");
  };

  const passwordsMatch = useMemo(
    () => newPassword.length > 0 && newPassword === confirmNewPassword,
    [newPassword, confirmNewPassword]
  );

  const canSetNewPassword = useMemo(() => {
    return newPassword.length >= 6 && passwordsMatch;
  }, [newPassword, passwordsMatch]);

  const handleNewPasswordContinue = () => {
    if (!canSetNewPassword) return;
    // After reset, go back to login + auto success for demo
    if (typeof window !== "undefined") {
      localStorage.setItem("isLoggedIn", "true");
    }
    onSuccess();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/45"
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-[820px] bg-white rounded-[18px] shadow-[0_20px_40px_rgba(15,23,42,0.25)] relative font-sans overflow-hidden"
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className="px-6 sm:px-8 py-6 border-b border-gray-200 relative">
          <button
            type="button"
            onClick={goBack}
            aria-label="Back"
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-gray-100 text-gray-900 inline-flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden />
          </button>
          <h2 className="text-center m-0 text-2xl font-semibold text-black">
            {step === "reset" ? "Reset Password" : "Login"}
          </h2>
        </div>

        <div className="px-6 sm:px-10 py-8">
          {step === "email" && (
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Email ID <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="Enter your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-400 rounded-lg px-4 py-3 text-sm outline-none"
              />
              {email.trim().length > 0 && !isEmailValid && (
                <p className="mt-2 text-xs text-red-600">Enter a valid Email ID</p>
              )}

              <button
                type="button"
                onClick={handleEmailContinue}
                disabled={!isEmailFilled || !isEmailValid}
                className={`w-full mt-6 py-3.5 rounded-md text-sm font-semibold ${
                  isEmailFilled && isEmailValid
                    ? "bg-[#389131] text-white"
                    : "bg-gray-300 text-white cursor-not-allowed"
                }`}
              >
                Continue
              </button>

              <div className="flex items-center gap-3 my-7 text-sm text-gray-500">
                <div className="flex-1 h-px bg-gray-200" />
                <span>Or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                type="button"
                className="w-full px-4 py-3 rounded-md border border-gray-200 bg-white flex items-center justify-center gap-2 text-sm mb-3"
              >
                <img
                  src={images.Phone}
                  alt="Phone"
                  className="w-[18px] h-[18px] object-contain"
                />
                <span>Login with Phone Number</span>
              </button>
              <button
                type="button"
                className="w-full px-4 py-3 rounded-md border border-gray-200 bg-white flex items-center justify-center gap-2 text-sm mb-3"
              >
                <img
                  src={images.Google}
                  alt="Google"
                  className="w-[18px] h-[18px] object-contain"
                />
                <span>Sign up with Google</span>
              </button>
              <button
                type="button"
                className="w-full px-4 py-3 rounded-md border border-gray-200 bg-white flex items-center justify-center gap-2 text-sm"
              >
                <img
                  src={images.Apple}
                  alt="Apple"
                  className="w-[18px] h-[18px] object-contain"
                />
                <span>Sign up with Apple</span>
              </button>
            </div>
          )}

          {step === "password" && (
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-400 rounded-lg px-4 py-3 text-sm outline-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleOpenReset}
                  className="text-xs font-semibold text-[#389131]"
                >
                  Forget Password
                </button>
              </div>

              <button
                type="button"
                onClick={handleLoginContinue}
                disabled={!isPasswordFilled}
                className={`w-full mt-6 py-3.5 rounded-md text-sm font-semibold ${
                  isPasswordFilled
                    ? "bg-[#389131] text-white"
                    : "bg-gray-300 text-white cursor-not-allowed"
                }`}
              >
                Continue
              </button>
            </div>
          )}

          {step === "reset" && (
            <div>
              <p className="text-center text-sm text-gray-800 leading-6">
                Please Enter your Phone Number or
                <br />
                Email ID yor previously logged in
              </p>

              <div className="mt-6">
                <label className="block text-sm font-medium text-black mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="w-full border border-gray-400 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                  <span className="text-sm">🇺🇸</span>
                  <span className="text-gray-600">+1</span>
                  <input
                    value={resetPhone}
                    onChange={(e) => setResetPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="flex-1 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 my-6 text-sm text-gray-500">
                <div className="flex-1 h-px bg-gray-200" />
                <span>Or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Email ID <span className="text-red-500">*</span>
                </label>
                <input
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter Email ID"
                  className="w-full border border-gray-400 rounded-lg px-4 py-3 text-sm outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleResetContinue}
                disabled={!resetCanContinue}
                className={`w-full mt-6 py-3.5 rounded-md text-sm font-semibold ${
                  resetCanContinue
                    ? "bg-[#389131] text-white"
                    : "bg-gray-300 text-white cursor-not-allowed"
                }`}
              >
                Continue
              </button>
            </div>
          )}

          {step === "newPassword" && (
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPwd ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-400 rounded-lg px-4 py-3 text-sm outline-none pr-10"
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

              <label className="block text-sm font-medium text-black mb-2 mt-5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPwd ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full border border-gray-400 rounded-lg px-4 py-3 text-sm outline-none pr-10"
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
                <p className="mt-2 text-xs text-red-600">Passwords do not match</p>
              )}

              <button
                type="button"
                onClick={handleNewPasswordContinue}
                disabled={!canSetNewPassword}
                className={`w-full mt-6 py-3.5 rounded-md text-sm font-semibold ${
                  canSetNewPassword
                    ? "bg-[#389131] text-white"
                    : "bg-gray-300 text-white cursor-not-allowed"
                }`}
              >
                Continue
              </button>
            </div>
          )}
        </div>

        {/* OTP Modal */}
        {showOtpModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
            onClick={() => setShowOtpModal(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="w-full max-w-[380px] bg-white rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(15,23,42,0.25)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#389131] text-white px-5 py-4 relative">
                <h3 className="text-center text-lg font-semibold m-0">Enter OTP</h3>
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="absolute right-3 top-3 h-8 w-8 rounded-full bg-white/10 inline-flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" aria-hidden />
                </button>
              </div>
              <div className="px-5 py-5">
                <p className="text-center text-sm text-gray-700">
                  Please enter the OTP sent to
                  <br />
                  <span className="font-medium text-gray-900">{otpTargetLabel}</span>
                </p>

                <label className="block text-sm font-medium text-gray-900 mt-5 mb-2">
                  Enter OTP
                </label>
                <input
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setOtpError(null);
                  }}
                  placeholder="Enter OTP"
                  className="w-full border border-gray-400 rounded-lg px-4 py-3 text-sm outline-none"
                />

                <div className="mt-2 flex justify-end text-xs text-gray-600">
                  Didn&apos;t get Code{" "}
                  <span className="ml-1 font-semibold">
                    {String(Math.floor(otpSeconds / 60)).padStart(2, "0")}:
                    {String(otpSeconds % 60).padStart(2, "0")}
                  </span>
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
                  className={`w-full mt-6 py-3.5 rounded-md text-sm font-semibold ${
                    otpError ? "bg-[#389131] text-white" : "bg-gray-300 text-white"
                  }`}
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
};

export default LoginModal;

