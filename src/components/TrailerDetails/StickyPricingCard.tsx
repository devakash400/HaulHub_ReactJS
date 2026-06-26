import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import calendarIcon from "../../assets/icons/Calendar (2).png";
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
  getMyBookings,
} from "../../api/bookingsApi.ts";
import { signUpSuccess } from "../../store/authSlice.ts";
import { store, type RootState } from "../../store/index.ts";

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
  const formatUserDate = (value: string): string => {
    if (!value) return "";
    const [y, m, d] = value.split("-");
    return `${d}-${m}-${y}`;
  };
  const today = new Date().toISOString().split("T")[0];
  const { status: passedStatus, startDate: passedStartDate, endDate: passedEndDate } = location.state || {};
  const hasBookingStatus = !!passedStatus;

  const [checkIn, setCheckIn] = useState(passedStartDate || "");
  const [checkOut, setCheckOut] = useState(passedEndDate || "");
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
  const [isCheckingBookings, setIsCheckingBookings] = useState(false);

  const checkPendingBookings = async () => {
    try {
      const res = await getMyBookings();
      let userBookings: any[] = [];
      if (Array.isArray(res)) userBookings = res;
      else if (res && Array.isArray((res as any).bookings)) userBookings = (res as any).bookings;
      else if (res && Array.isArray((res as any).data)) userBookings = (res as any).data;
      else if (res && Array.isArray((res as any).results)) userBookings = (res as any).results;

      const activeStatuses = [
        "pending", "accepted", "active", "in_use", "pre_screening", "pre-screening", 
        "owner_photos_uploaded", "waiting_for_pickup_approval", "pre_screening_completed"
      ];
      
      const currentTrailerId = String(trailerId).trim();
      const hasActiveBooking = userBookings.some((b) => {
         const bTrailerId = b.trailerId?._id || b.trailerId;
         return String(bTrailerId) === currentTrailerId && activeStatuses.includes(String(b.status).toLowerCase());
      });

      return hasActiveBooking;
    } catch (err) {
       console.error("Error checking bookings", err);
       return false;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoginOpen(false);
    }
  }, [isAuthenticated]);

  const handleReserve = async () => {
    if (!validateBookingDates(checkIn, checkOut)) {
      return;
    }

    if (isAuthenticated) {
      setIsCheckingBookings(true);
      const alreadyBooked = await checkPendingBookings();
      setIsCheckingBookings(false);
      if (alreadyBooked) {
        toast.error("You already have an active or pending booking for this trailer.");
        return;
      }
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

  const handleRentalDatesNext = async (pickupDate: string, returnDate: string) => {
    if (!validateBookingDates(pickupDate, returnDate)) {
      return;
    }

    if (isAuthenticated) {
      setIsCheckingBookings(true);
      const alreadyBooked = await checkPendingBookings();
      setIsCheckingBookings(false);
      if (alreadyBooked) {
        toast.error("You already have an active or pending booking for this trailer.");
        return;
      }
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
        className="w-full min-w-0 self-start flex justify-center lg:justify-start"
      >
        <div
          style={{ backgroundColor: "#FFFFFF" }}
          className="
      w-full max-w-[463px] mx-auto lg:mx-0
    
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
                <div className="relative w-full">
                  <div 
                    className={`absolute z-10 inset-y-0 left-0 w-full flex items-center text-[14px] mt-1 ${hasBookingStatus ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={(e) => {
                      if (hasBookingStatus) return;
                      e.preventDefault();
                      e.stopPropagation();
                      const input = e.currentTarget.nextElementSibling as HTMLInputElement;
                      if (input && input.showPicker) {
                        try { input.showPicker(); } catch (err) {}
                      }
                    }}
                  >
                    <span className={hasBookingStatus ? "text-[#8C8C8C] opacity-50" : "text-[#8C8C8C]"}>
                      {checkIn ? formatUserDate(checkIn) : <span className="opacity-80 lowercase">dd-mm-yyyy</span>}
                    </span>
                    <img
                      src={calendarIcon}
                      alt="Calendar"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                    />
                  </div>
                  <input
                    type="date"
                    value={checkIn}
                    min={today}
                    disabled={hasBookingStatus}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      setValidationError(null);
                    }}
                    className="
                      mt-1
                      w-full
                      bg-transparent
                      text-[14px]
                      focus:outline-none
                      appearance-none
                      pr-10
                      opacity-0
                      pointer-events-none
                      disabled:cursor-not-allowed
                    "
                  />
                </div>
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
                <div className="relative w-full">
                  <div 
                    className={`absolute z-10 inset-y-0 left-0 w-full flex items-center text-[14px] mt-1 ${hasBookingStatus || !checkIn ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={(e) => {
                      if (hasBookingStatus || !checkIn) return;
                      e.preventDefault();
                      e.stopPropagation();
                      const input = e.currentTarget.nextElementSibling as HTMLInputElement;
                      if (input && input.showPicker) {
                        try { input.showPicker(); } catch (err) {}
                      }
                    }}
                  >
                    <span className={hasBookingStatus || !checkIn ? "text-[#8C8C8C] opacity-50" : "text-[#8C8C8C]"}>
                      {checkOut ? formatUserDate(checkOut) : <span className="opacity-80 lowercase">dd-mm-yyyy</span>}
                    </span>
                    <img
                      src={calendarIcon}
                      alt="Calendar"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                    />
                  </div>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || today}
                    disabled={hasBookingStatus || !checkIn}
                    onChange={(e) => {
                      setCheckOut(e.target.value);
                      setValidationError(null);
                    }}
                    className="
                      mt-1
                      w-full
                      bg-transparent
                      text-[14px]
                      focus:outline-none
                      appearance-none
                      pr-10
                      opacity-0
                      pointer-events-none
                      disabled:cursor-not-allowed
                    "
                  />
                </div>
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
            disabled={isCheckingBookings || hasBookingStatus}
            className="w-full mt-4 h-[53px] 
            flex items-center justify-center text-white 
            over:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
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
            <span>{hasBookingStatus ? String(passedStatus).replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "Reserve"}</span>
          </button>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginOpen && !isAuthenticated}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={async () => {
          setIsLoginOpen(false);
          const userType = store.getState().auth.userType;
          if (userType === "Owner") {
            navigate("/");
            return;
          }

          const alreadyBooked = await checkPendingBookings();
          if (alreadyBooked) {
            toast.error("You already have an active or pending booking for this trailer.");
            return;
          }
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
