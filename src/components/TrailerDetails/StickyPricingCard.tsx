import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { SelectRentalDatesModal } from "./SelectRentalDatesModal.tsx";
import {
  IdentityVerificationModal,
  type IdentityVerificationData,
} from "./IdentityVerificationModal.tsx";
import LoginModal from "../../pages/Auth/Login/Login.tsx";
import { SignUpModal, type SignUpData } from "./SignUpModal.tsx";
import { register, roleToTrailor } from "../../api/authApi.ts";
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
  const location = useLocation();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  const parseISODate = (value: string): Date | null => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };
  const today = new Date().toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const validateBookingDates = (
    pickupDate: string,
    returnDate: string,
  ): boolean => {
    if (!pickupDate) {
      setValidationError("Please select pickup date.");
      return false;
    }

    if (!returnDate) {
      setValidationError("Please select return date.");
      return false;
    }

    const pickup = parseISODate(pickupDate);
    const returnAt = parseISODate(returnDate);

    if (!pickup || !returnAt) {
      setValidationError("Please select valid pickup and return dates.");
      return false;
    }

    // Prevent same dates
    if (pickupDate === returnDate) {
      setValidationError("Pickup date and return date cannot be the same.");
      return false;
    }

    // Prevent return before pickup
    if (returnAt < pickup) {
      setValidationError("Return date must be after pickup date.");
      return false;
    }

    setValidationError(null);
    return true;
  };
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

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoginOpen(false);
    }
  }, [isAuthenticated]);

  const handleReserve = () => {
    if (!validateBookingDates(checkIn, checkOut)) {
      return;
    }

    const dates = `${checkIn} – ${checkOut}`;
    const bookingState = {
      title: trailer?.title ?? "Gooseneck Trailer - Texas, USA",
      subtitle:
        trailer?.subtitle ??
        "25FT Flatbed · Dual Axle · Industrial Steel Frame",
      image: trailer?.image ?? "",
      totalPrice: price,
      dates,
      checkIn,
      checkOut,
    };

    setPendingBookingState(bookingState);

    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    // Authenticated users: navigate to verify-identity page where user uploads documents
    navigate("/verify-identity", {
      state: {
        trailerId: trailerId != null ? String(trailerId) : "",
        backgroundLocation: location,
        ...bookingState,
      },
    });
  };

  const handleRentalDatesNext = (pickupDate: string, returnDate: string) => {
    if (!validateBookingDates(pickupDate, returnDate)) {
      return;
    }

    const dates = `${pickupDate} – ${returnDate}`;
    const bookingState = {
      title: trailer?.title ?? "Gooseneck Trailer - Texas, USA",
      subtitle:
        trailer?.subtitle ??
        "25FT Flatbed · Dual Axle · Industrial Steel Frame",
      image: trailer?.image ?? "",
      totalPrice: price,
      dates,
      checkIn: pickupDate,
      checkOut: returnDate,
    };
    setPendingBookingState(bookingState);
    navigate("/verify-identity", {
      state: {
        trailerId: trailerId != null ? String(trailerId) : "",
        backgroundLocation: location,
        ...bookingState,
      },
    });
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
      // include uploaded documents if provided
      const payload: any = { trailerId: tid, startDate, endDate };
      const dl = data.drivingLicenseDocument
        ? [data.drivingLicenseDocument]
        : undefined;
      const pp = data.passportDocument ? [data.passportDocument] : undefined;
      if (dl) payload.drivingLicenseDocuments = dl;
      if (pp) payload.passportDocuments = pp;

      await createBooking(payload);
      toast.success("Booking submitted successfully.");
      setShowIdentityModal(false);
      // navigate to a simple booking sent confirmation page
      navigate("/booking-sent", {
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
      const apiUser = res.user as {
        role?: string;
        trailor?: string | string[];
      };
      const trailorFromApi =
        roleToTrailor(apiUser.role) ??
        roleToTrailor(
          Array.isArray(apiUser.trailor) ? apiUser.trailor[0] : apiUser.trailor,
        );
      const normalizedTrailor = trailorFromApi ?? data.trailor;

      dispatch(
        signUpSuccess({
          user: {
            firstName: firstName || undefined,
            lastName,
            email: res.user.email || data.email,
            trailor: normalizedTrailor,
          },
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          userType: normalizedTrailor,
        }),
      );

      setIsSignUpOpen(false);
      toast.success("Account created successfully");
      if (normalizedTrailor === "Owner") {
        navigate("/");
      } else {
        // After sign-up, proceed to identity verification page
        navigate("/verify-identity", {
          state: {
            trailerId: trailerId != null ? String(trailerId) : "",
            backgroundLocation: location,
            ...pendingBookingState,
          },
        });
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
      <div
        className="w-full min-w-0 self-start
       flexjcenter justify-start"
      >
        <div
          style={{ backgroundColor: "#FFFFFF" }}
          className="
      w-full max-w-[463px]
    
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
                  Pick Up Date
                </p>

                <input
                  type="date"
                  value={checkIn}
                  min={today}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    setValidationError(null);
                  }}
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
                  Return Date
                </p>

                <input
                  type="date"
                  value={checkOut}
                  min={today}
                  onChange={(e) => {
                    setCheckOut(e.target.value);
                    setValidationError(null);
                  }}
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
          </div>

          {validationError ? (
            <p className="mt-3 text-sm text-[#E65C4F]">{validationError}</p>
          ) : null}

          {/* Button */}
          <button
            type="button"
            onClick={handleReserve}
            className="w-full mt-4 h-[53px] 
            flex items-center justify-center text-white 
            over:opacity-90 transition"
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
        isOpen={isLoginOpen && !isAuthenticated}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => {
          setIsLoginOpen(false);
          // After login, continue booking flow: go to verify-identity page
          navigate("/verify-identity", {
            state: {
              trailerId: trailerId != null ? String(trailerId) : "",
              backgroundLocation: location,
              ...pendingBookingState,
            },
          });
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
        startAtDetails={true}
        requiredDocuments={["driving_licence", "passport"]}
      />
    </>
  );
};

export default StickyPricingCard;
