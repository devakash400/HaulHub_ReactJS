import React, { useState, MouseEvent } from "react";
import { images } from "../../../assets/images/index.ts";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const isEmailFilled = email.trim().length > 0;

  const handleContinue = () => {
    if (!isEmailFilled) return;

    if (typeof window !== "undefined") {
      localStorage.setItem("isLoggedIn", "true");
    }

    onClose();
  };

  const handleOverlayClick = () => {
    onClose();
  };

  const handleModalClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/45"
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-[420px] bg-white rounded-[18px] shadow-[0_20px_40px_rgba(15,23,42,0.25)] px-7 pt-7 pb-6 relative font-sans"
        onClick={handleModalClick}
      >
        {/* Header row */}
        <div className="flex items-center justify-center mb-5 pb-3 border-b border-gray-200 relative w-full">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close login"
            className="absolute left-0 flex items-center justify-center p-0"
          >
            <img
              src={images.Cross}
              alt="Close"
              className="w-5 h-5 object-contain"
            />
          </button>
          <h2 className="m-0 text-[1.25rem] font-semibold text-black">
            Login
          </h2>
        </div>

        {/* Email input */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-[0.85rem] mb-1.5 text-black font-medium"
          >
            Email ID <span className="text-red-500 ml-[2px]">*</span>
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-[90%] mx-auto px-3 py-2.5 rounded-[5px] border border-gray-400 text-[0.9rem] outline-none"
          />
          <p className="text-[0.7rem] text-gray-500 mt-1.5">
            We&apos;ll send a verification link.
          </p>

          <button
            type="button"
            disabled={!isEmailFilled}
            onClick={handleContinue}
            className={`w-full mt-4 px-4 py-2.5 rounded-full text-[0.95rem] font-medium transition-colors ${
              isEmailFilled
                ? "bg-[#389131] text-white cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5 text-[0.8rem] text-gray-500">
          <div className="flex-1 h-px bg-gray-200" />
          <span>Or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Provider buttons */}
        <button
          type="button"
          className="w-full px-4 py-2.5 rounded-[5px] border border-gray-200 bg-white flex items-center justify-center gap-2 text-[0.9rem] mb-2"
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
          className="w-full px-4 py-2.5 rounded-[5px] border border-gray-200 bg-white flex items-center justify-center gap-2 text-[0.9rem] mb-2"
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
          className="w-full px-4 py-2.5 rounded-[5px] border border-gray-200 bg-white flex items-center justify-center gap-2 text-[0.9rem]"
        >
          <img
            src={images.Apple}
            alt="Apple"
            className="w-[18px] h-[18px] object-contain"
          />
          <span>Sign up with Apple</span>
        </button>
      </div>
    </div>
  );
};

export default LoginModal;

