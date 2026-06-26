import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Upload,
  CalendarDays,
  CreditCard,
  Car,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  createBooking,
  getBookingErrorMessage,
} from "../../../src/api/bookingsApi.ts";

const parseISODate = (value: string): Date | null => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

type MethodKey = "driving_licence" | "passport";
const today = new Date().toISOString().split("T")[0];
const METHOD_META: Record<
  MethodKey,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  driving_licence: {
    label: "Driving licence",
    icon: Car,
  },
  passport: {
    label: "Proof Of Insurance",
    icon: CreditCard,
  },
};

const VerifyIdentity: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = (location.state ?? {}) as Record<string, unknown>;

  const trailerId = String(state.trailerId ?? "");

  const initialCheckIn = String(state.checkIn ?? "");
  const initialCheckOut = String(state.checkOut ?? "");

  const [openMethod, setOpenMethod] = useState<MethodKey>("driving_licence");

  const [drivingLicense, setDrivingLicense] = useState<File | null>(null);

  const [passport, setPassport] = useState<File | null>(null);

  const [pickupDate, setPickupDate] = useState(initialCheckIn);

  const [returnDate, setReturnDate] = useState(initialCheckOut);

  const [sending, setSending] = useState(false);

  const licenseInputRef = useRef<HTMLInputElement>(null);

  const passportInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!pickupDate) {
      toast.error("Please enter pickup date.");
      return;
    }

    if (!returnDate) {
      toast.error("Please enter return date.");
      return;
    }

    const pickup = parseISODate(pickupDate);
    const returnAt = parseISODate(returnDate);

    if (!pickup || !returnAt) {
      toast.error("Please enter valid dates.");
      return;
    }

    if (returnAt < pickup) {
      toast.error("Return date must be on or after pickup date.");
      return;
    }

    if (!drivingLicense) {
      toast.error("Please upload driving licence.");
      return;
    }

    if (!passport) {
      toast.error("Please upload passport.");
      return;
    }

    if (!trailerId) {
      toast.error("Missing trailer id.");
      return;
    }

    setSending(true);

    try {
      console.log("VerifyIdentity: sending booking", {
        trailerId,
        pickupDate,
        returnDate,
        drivingLicense,
        passport,
      });
      await createBooking({
        trailerId,
        startDate: pickupDate,
        endDate: returnDate,
        drivingLicenseDocuments: [drivingLicense],
        proofOfInsuranceDocuments: [passport],
      } as any);

      toast.success("Booking request sent.");
      // Prevent carrying over any backgroundLocation from the modal state
      const { backgroundLocation, ...stateWithoutBackground } =
        (state as Record<string, unknown>) ?? {};

      // replace history so modal/back stack is cleared
      navigate("/booking-sent", {
        replace: true,
        state: {
          ...stateWithoutBackground,
          startDate: pickupDate,
          endDate: returnDate,
        },
      });
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error("createBooking error:", err);
      toast.error(getBookingErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 
    flex items-center justify-center bg-black/40 px-3"
    >
      <div
        className="
          relative
          w-full
          max-w-[600px]
          overflow-hidden
          rounded-[14px]
          bg-[#F8F8F8]
          shadow-2xl
        "
      >
        {/* Header */}
        <div
          className="
            relative
            flex
            h-[78px]
            items-center
            justify-center
            bg-[#389131]
          "
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
            "
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>

          <h1
            className="
    font-['Lexend']
    font-bold
    text-[23px]
    leading-[100%]
    tracking-[0px]
    text-center
    text-white
  "
          >
            Identity Verification
          </h1>
        </div>

        {/* Body */}
        <div className="px-4 pt-4 pb-5">
          <h2
            className="
    font-['Lexend']
    font-normal
    text-[20px]
    leading-[100%]
    tracking-[0px]
    text-center
    capitalize
    text-black
  "
          >
            Which Method Would You Like To Use?
          </h2>

          <p
            className="
    mt-5
    font-['Lexend']
    font-light
    text-[14px]
    leading-[100%]
    tracking-[0px]
    text-[#000000]
  "
          >
            We’ll use this to verify your identity and won’t share it with other
            trailer.
          </p>

          {/* Hidden Inputs */}
          <input
            ref={licenseInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const fileName = file.name.toLowerCase();
                if (!fileName.includes("license") && !fileName.includes("licence")) {
                  toast.error("upload license only");
                  e.target.value = "";
                  setDrivingLicense(null);
                  return;
                }
                if (passport && file.name === passport.name) {
                  toast.error("Cannot upload the same file for both fields.");
                  e.target.value = "";
                  return;
                }
              }
              setDrivingLicense(file ?? null);
            }}
          />

          <input
            ref={passportInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (drivingLicense && file.name === drivingLicense.name) {
                  toast.error("Cannot upload the same file for both fields.");
                  e.target.value = "";
                  return;
                }
              }
              setPassport(file ?? null);
            }}
          />

          {/* Methods */}
          <div className="mt-5 space-y-3">
            {(Object.keys(METHOD_META) as MethodKey[]).map((key) => {
              const meta = METHOD_META[key];
              const Icon = meta.icon;

              const isActive = openMethod === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setOpenMethod(key);

                    if (key === "driving_licence") {
                      licenseInputRef.current?.click();
                    } else {
                      passportInputRef.current?.click();
                    }
                  }}
                  className="
    w-full
    h-[52px]
    rounded-[3px]
    border
    border-[#00000030]
    bg-white
    px-3
    flex
    items-center
    justify-between
    transition-all
  "
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className="
        w-[21px]
        h-[21px]
        text-black
      "
                    />

                    <span
                      className="
        font-['Lexend']
        font-normal
        text-[13px]
        leading-[100%]
        tracking-[0px]
        text-center
        text-black
      "
                    >
                      {key === "driving_licence"
                        ? drivingLicense?.name || meta.label
                        : passport?.name || meta.label}
                    </span>
                  </div>

                  <Upload className="h-3.5 w-3.5 text-black" />
                </button>
              );
            })}
          </div>

          {/* Dates */}
          <div
            className="
    mt-3
    grid
    grid-cols-2
    overflow-hidden
    rounded-[3px]
    border
    border-[#DCDCDC]
    bg-white
  "
          >
            {/* Pickup */}
            <div className="border-r border-[#DCDCDC] p-3">
              <div className="mb-2 flex items-center gap-2">
                <CalendarDays
                  className="
          w-[21px]
          h-[21px]
          text-black
        "
                />

                <span
                  className="
          font-['Lexend']
          font-normal
          text-[13px]
          leading-[100%]
          tracking-[0px]
          text-center
          text-black
        "
                >
                  Pickup Date
                </span>
              </div>

              <input
                type="date"
                min={today}
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="
    h-[30px]
    w-full
    rounded-[3px]
    border
    border-[#DCDCDC]
    px-2
    font-['Lexend']
    text-[13px]
    font-normal
    leading-[100%]
    tracking-[0px]
    text-black
    outline-none
  "
              />
            </div>

            {/* Return */}
            <div className="p-3">
              <div className="mb-2 flex items-center gap-2">
                <CalendarDays
                  className="
          w-[21px]
          h-[21px]
          text-black
        "
                />

                <span
                  className="
          font-['Lexend']
          font-normal
          text-[13px]
          leading-[100%]
          tracking-[0px]
          text-center
          text-black
        "
                >
                  Return Date
                </span>
              </div>

              <input
                type="date"
                min={today}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="
        h-[30px]
        w-full
        rounded-[3px]
        border
        border-[#DCDCDC]
        px-2
        font-['Lexend']
        text-[13px]
        font-normal
        leading-[100%]
        tracking-[0px]
        text-black
        outline-none
      "
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="
    mt-5
    h-[43px]
    w-full
    rounded-[5px]
    bg-[#389131]
    font-['Lexend']
    text-[16px]
    font-semibold
    leading-[100%]
    tracking-[0.03em]
    text-white
  "
          >
            {sending ? "Sending..." : "Send Booking Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyIdentity;
