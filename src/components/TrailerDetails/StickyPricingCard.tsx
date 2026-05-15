import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { SelectRentalDatesModal } from "./SelectRentalDatesModal.tsx";
import {
  IdentityVerificationModal,
  type IdentityVerificationData,
} from "./IdentityVerificationModal.tsx";
import LoginModal from "../../pages/Auth/Login/Login.tsx";
import { SignUpModal, type SignUpData } from "./SignUpModal.tsx";
import { register } from "../../api/authApi.ts";
import {
  createBooking,
  getBookingErrorMessage,
} from "../../api/bookingsApi.ts";
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
  /** Route / API trailer id (Mongo string or legacy numeric id). */
  trailerId?: string | number;
};

export const StickyPricingCard: React.FC<StickyPricingCardProps> = ({
  price,
  trailer,
  trailerId,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [dispatcher, setDispatcher] = useState("");
  const [showRentalDatesModal, setShowRentalDatesModal] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [pendingBookingState, setPendingBookingState] = useState<{
    title: string;
    subtitle: string;
    image: string;
    totalPrice: string;
    dates: string;
    checkIn: string;
    checkOut: string;
  } | null>(null);
  const bookingInFlight = useRef(false);

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

  const handleIdentityContinue = async (data: IdentityVerificationData) => {
    if (!pendingBookingState || bookingInFlight.current) return;

    const startDate = pendingBookingState.checkIn?.trim();
    const endDate = pendingBookingState.checkOut?.trim();
    if (!startDate || !endDate) {
      toast.error("Please select pickup and return dates.");
      return;
    }
    if (endDate < startDate) {
      toast.error("Return date must be on or after pickup date.");
      return;
    }

    const tid =
      trailerId != null && String(trailerId).trim() !== ""
        ? String(trailerId).trim()
        : "";
    if (!tid) {
      toast.error("Missing trailer. Open this page from a listing to book.");
      return;
    }

    bookingInFlight.current = true;
    try {
      await createBooking({ trailerId: tid, startDate, endDate });
      toast.success("Booking submitted successfully.");
      setShowIdentityModal(false);
      navigate("/liability-agreement", {
        state: {
          ...pendingBookingState,
          identityVerification: data,
          trailerId: tid,
          startDate,
          endDate,
        },
      });
      setPendingBookingState(null);
    } catch (err: unknown) {
      toast.error(getBookingErrorMessage(err));
    } finally {
      bookingInFlight.current = false;
    }
  };

  const handleSignUpSubmit = async (data: SignUpData) => {
    try {
      const res = await register({
        fullName: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        trailor: data.trailor,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
      });

      const fullName =
        typeof res.user.fullName === "string"
          ? res.user.fullName.trim()
          : `${data.firstName} ${data.lastName}`.trim();
      const [firstName, ...restName] = fullName.split(" ").filter(Boolean);
      const lastName = restName.length > 0 ? restName.join(" ") : undefined;
      const trailorFromApi = (res.user as { trailor?: string | string[] })
        .trailor;
      const normalizedTrailor = Array.isArray(trailorFromApi)
        ? trailorFromApi[0]
        : trailorFromApi;

      dispatch(
        signUpSuccess({
          user: {
            firstName: firstName || undefined,
            lastName,
            email: res.user.email || data.email,
            trailor: normalizedTrailor || data.trailor,
          },
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          userType: normalizedTrailor || data.trailor,
        }),
      );

      setIsSignUpOpen(false);
      toast.success("Account created successfully");
      if ((normalizedTrailor || data.trailor) === "Owner") {
        navigate("/");
      } else {
        setShowRentalDatesModal(true);
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(
        "register api error:",
        err?.response?.data ?? err?.message ?? err,
      );
    }
  };

  return (
    <>
    <div className="w-full min-w-0 self-start flex justify-center">
      <div
        className="
      w-full max-w-[403px]
      bg-[#F8F8F8]
      border border-[#D7D7D7]
      rounded-[14px]
      shadow-[0px_2px_8px_rgba(0,0,0,0.12)]
      p-[14px]
    "
      >
        {/* Top Tag */}
        <div
          className="
    w-full h-[46px]
    border border-[#D8D8D8]
    rounded-[4px]
    bg-[#FAFAFA]
    flex items-center justify-center
    text-center
    text-black
    font-light
    leading-[100%]
  "
          style={{
            fontFamily: "Lexend",
            fontSize: "16px",
            fontStyle: "normal",
            letterSpacing: "0%",
            verticalAlign: "middle",
          }}
        >
          Frequently Ordered
        </div>

        {/* Price */}
        <div className="mt-5 flex items-end gap-2">
          <h2
            className="text-black font-normal leading-[100%]"
            style={{
              fontFamily: "Lexend",
              fontSize: "27px",
              fontStyle: "normal",
              letterSpacing: "0%",
              verticalAlign: "middle",
            }}
          >
            <span className="border-b-2 border-[#E65C4F] pb-[2px]">
              {price}
            </span>
          </h2>

          <span
            className="mb-[2px] text-black font-normal leading-[100%]"
            style={{
              fontFamily: "Lexend",
              fontSize: "20px",
              fontStyle: "normal",
              letterSpacing: "0%",
              verticalAlign: "middle",
            }}
          >
            per unit
          </span>
        </div>

        {/* Date Section */}
        <div className="mt-5 border-t border-[#D9D9D9] border-b border-[#D9D9D9]">
          <div className="grid grid-cols-2">
            {/* Check In */}
            <div className="relative px-4 py-4 border-r border-[#D9D9D9]">
              <p
                className="uppercase text-black font-normal leading-[100%]"
                style={{
                  fontFamily: "Lexend",
                  fontSize: "12px",
                  fontStyle: "normal",
                  letterSpacing: "0%",
                  verticalAlign: "middle",
                }}
              >
                Check-in
              </p>

              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="
              mt-1 w-full
              bg-transparent
              text-[14px]
              text-[#8C8C8C]
              focus:outline-none
              appearance-none
              [&::-webkit-calendar-picker-indicator]:opacity-100
              [&::-webkit-calendar-picker-indicator]:cursor-pointer
            "
              />

            
               
            </div>

            {/* Check Out */}
            <div className="relative px-4 py-4">
              <p
                className="uppercase text-black font-normal leading-[100%]"
                style={{
                  fontFamily: "Lexend",
                  fontSize: "12px",
                  fontStyle: "normal",
                  letterSpacing: "0%",
                  verticalAlign: "middle",
                }}
              >
                Check-Out
              </p>

              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="
              mt-1 w-full
              bg-transparent
              text-[14px]
              text-[#8C8C8C]
              focus:outline-none
              appearance-none
              [&::-webkit-calendar-picker-indicator]:opacity-100
              [&::-webkit-calendar-picker-indicator]:cursor-pointer
            "
              />

             
            </div>
          </div>

          {/* Dispatch */}
          <div className="relative px-4 py-4 border-t border-[#D9D9D9]">
            <p
              className="uppercase text-black font-normal leading-[100%]"
              style={{
                fontFamily: "Lexend",
                fontSize: "12px",
                fontStyle: "normal",
                letterSpacing: "0%",
                verticalAlign: "middle",
              }}
            >
              Estimated Dispatch:
            </p>

            <input
              type="time"
              value={dispatcher}
              onChange={(e) => setDispatcher(e.target.value)}
              className="
            mt-1 w-full
            bg-transparent
            text-[14px]
            text-[#8C8C8C]
            focus:outline-none
            appearance-none
            [&::-webkit-calendar-picker-indicator]:opacity-100
            [&::-webkit-calendar-picker-indicator]:cursor-pointer
          "
            />

           
          </div>
        </div>

        {/* Button */}
        <button
          type="button"
          onClick={handleReserve}
          className="w-full h-[53px] flex items-center justify-center text-white hover:opacity-90 transition"
          style={{
            background: "#389131",
            paddingTop: "12px",
            paddingRight: "98px",
            paddingBottom: "12px",
            paddingLeft: "98px",
            gap: "10px",
            fontFamily: "Lexend",
            fontWeight: 500,
            fontSize: "22px",
            fontStyle: "normal",
            lineHeight: "100%",
            letterSpacing: "0%",
            verticalAlign: "middle",
          }}
        >
          <span>Reserve</span>
        </button>
      </div>
    </div>

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
    <SignUpModal
      isOpen={isSignUpOpen}
      onClose={() => setIsSignUpOpen(false)}
      onSubmit={handleSignUpSubmit}
    />
    <SelectRentalDatesModal
      isOpen={showRentalDatesModal}
      onClose={() => setShowRentalDatesModal(false)}
      onNext={handleRentalDatesNext}
    />
    <IdentityVerificationModal
      isOpen={showIdentityModal}
      onClose={() => {
        setShowIdentityModal(false);
        setPendingBookingState(null);
      }}
      onContinue={handleIdentityContinue}
    />
    </>
  );
};

export default StickyPricingCard;
