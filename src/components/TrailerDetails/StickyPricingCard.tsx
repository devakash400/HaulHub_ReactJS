import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import { SelectRentalDatesModal } from "./SelectRentalDatesModal.tsx";
import {
  IdentityVerificationModal,
  type IdentityVerificationData,
} from "./IdentityVerificationModal.tsx";
import LoginModal from "../../pages/Auth/Login/Login.tsx";
import {
  SignUpModal,
  type SignUpData,
} from "./SignUpModal.tsx";
import { register } from "../../api/authApi.ts";
import { signUpSuccess } from "../../store/authSlice.ts";
import type { RootState } from "../../store";

export type TrailerBookingInfo = {
  title: string;
  subtitle: string;
  image: string;
  price: string;
};

type StickyPricingCardProps = {
  price: string;
  trailer?: TrailerBookingInfo;
};

export const StickyPricingCard: React.FC<StickyPricingCardProps> = ({
  price,
  trailer,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [dispatcher, setDispatcher] = useState("");
  const [showRentalDatesModal, setShowRentalDatesModal] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [pendingBookingState, setPendingBookingState] = useState<
    | {
        title: string;
        subtitle: string;
        image: string;
        totalPrice: string;
        dates: string;
        checkIn: string;
        checkOut: string;
      }
    | null
  >(null);

  const handleReserve = () => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    setShowRentalDatesModal(true);
  };

  const handleRentalDatesNext = (pickupDate: string, returnDate: string) => {
    const dates =
      pickupDate && returnDate
        ? `${pickupDate} – ${returnDate}`
        : checkIn && checkOut
          ? `${checkIn} – ${checkOut}`
          : "17-15 March 2026";
    setPendingBookingState({
      title: trailer?.title ?? "Gooseneck Trailer - Texas, USA",
      subtitle:
        trailer?.subtitle ??
        "25FT Flatbed · Dual Axle · Industrial Steel Frame",
      image: trailer?.image ?? "",
      totalPrice: price,
      dates,
      checkIn: pickupDate || checkIn,
      checkOut: returnDate || checkOut,
    });
    setShowIdentityModal(true);
  };

  const handleIdentityContinue = (data: IdentityVerificationData) => {
    if (!pendingBookingState) return;
    navigate("/liability-agreement", {
      state: {
        ...pendingBookingState,
        identityVerification: data,
      },
    });
    setPendingBookingState(null);
  };

  const handleSignUpSubmit = async (data: SignUpData) => {
    try {
      const res = await register({
        fullName: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        password: data.password,
      });

      const fullName =
        typeof res.user.fullName === "string"
          ? res.user.fullName.trim()
          : `${data.firstName} ${data.lastName}`.trim();
      const [firstName, ...restName] = fullName.split(" ").filter(Boolean);
      const lastName = restName.length > 0 ? restName.join(" ") : undefined;

      dispatch(
        signUpSuccess({
          user: {
            firstName: firstName || undefined,
            lastName,
            email: res.user.email || data.email,
          },
          trailor: data.trailor,
        })
      );

      setIsSignUpOpen(false);
      toast.success("Account created successfully");
      if (data.trailor === "Owner") {
        navigate("/");
      } else {
        setShowRentalDatesModal(true);
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(
        "register api error:",
        err?.response?.data ?? err?.message ?? err
      );
    }
  };

  return (
    <div className="w-full min-w-0 self-start">
      <div className="bg-white rounded-2xl border border-gray-300 shadow-soft-lg p-5 space-y-5">
        <div className="border border-gray-300 rounded py-3 text-center text-sm text-black text-large tracking-wide">
          Frequently Ordered
        </div>
        <div>
          <p className="text-xl sm:text-2xl font-semibold text-gray-900">
            <span className="inline-block border-b-2 border-primary pb-0.5">
              {price}
            </span>
            <span className="ml-2 text-sm   font-medium font-bold ">
              per unit
            </span>
          </p>
        </div>

        <div className="mt-3 border border-gray-300 rounded-xl overflow-hidden bg-white">
          <div className="grid grid-cols-2 divide-x divide-gray-300">
            <div className="px-4 pt-3 pb-2.5">
              <p className="text-[10px] font-bold tracking-wide  uppercase">
                Check-in
              </p>
              <input
                type="text"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                placeholder="Add date"
                className="mt-1 w-full bg-transparent text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <div className="px-4 pt-3 pb-2.5">
              <p className="text-[10px] font-bold tracking-wide  uppercase">
                Checkout
              </p>
              <input
                type="text"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                placeholder="Add date"
                className="mt-1 w-full bg-transparent text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="border-t border-gray-300 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-[10px] font-bold tracking-wide  uppercase">
                Estimated dispatch:
              </p>
              <input
                type="text"
                value={dispatcher}
                onChange={(e) => setDispatcher(e.target.value)}
                placeholder="Add Time"
                className="mt-1 w-full bg-transparent text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <ChevronDown className="w-4 h-4 text-black" aria-hidden />
          </div>
        </div>

        <button
          type="button"
          onClick={handleReserve}
          className="mt-4 w-full bg-[#389131] text-white py-3 text-sm font-semibold tracking-wide shadow-soft-lg hover:opacity-90 transition-colors "
        >
          Reserve
        </button>
      </div>

      <SelectRentalDatesModal
        isOpen={showRentalDatesModal}
        onClose={() => setShowRentalDatesModal(false)}
        onNext={handleRentalDatesNext}
      />

      <IdentityVerificationModal
        isOpen={showIdentityModal}
        onClose={() => setShowIdentityModal(false)}
        onContinue={handleIdentityContinue}
      />

      {isLoginOpen && !isSignUpOpen && (
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onSuccess={() => {
            setIsLoginOpen(false);
            setShowRentalDatesModal(true);
          }}
          onOpenSignUp={() => {
            setIsLoginOpen(false);
            setIsSignUpOpen(true);
          }}
        />
      )}

      {isSignUpOpen && (
        <SignUpModal
          isOpen={isSignUpOpen}
          onClose={() => setIsSignUpOpen(false)}
          onSubmit={handleSignUpSubmit}
        />
      )}
    </div>
  );
};

export default StickyPricingCard;

