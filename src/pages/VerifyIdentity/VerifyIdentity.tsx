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
    label: "Passport",
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
        passportDocuments: [passport],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
      <div
        className="
          relative
          w-full
          max-w-[380px]
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
              text-[15px]
              font-semibold
              text-white
            "
          >
            Identify Verification
          </h1>
        </div>

        {/* Body */}
        <div className="px-4 pt-4 pb-5">
          <h2
            className="
              text-center
              text-[14px]
              font-semibold
              text-black
            "
          >
            Which Method Would You Like To Use?
          </h2>

          <p
            className="
              mt-3
              text-center
              text-[10px]
              leading-[16px]
              text-[#666666]
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
            onChange={(e) => setDrivingLicense(e.target.files?.[0] ?? null)}
          />

          <input
            ref={passportInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => setPassport(e.target.files?.[0] ?? null)}
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
                  className={`
                      w-full
                      h-[42px]
                      border
                      rounded-[3px]
                      px-3
                      flex
                      items-center
                      justify-between
                      transition-all
                      ${
                        isActive
                          ? "border-[#389131] bg-white"
                          : "border-[#DCDCDC] bg-white"
                      }
                    `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-black" />

                    <span
                      className="
                          text-[12px]
                          font-medium
                          text-black
                        "
                    >
                      {key === "driving_licence"
                        ? drivingLicense?.name || meta.label
                        : passport?.name || meta.label}
                    </span>
                  </div>

                  <Upload className="w-3.5 h-3.5 text-black" />
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
                <CalendarDays className="h-4 w-4 text-black" />

                <span
                  className="
                    text-[11px]
                    font-medium
                    text-black
                  "
                >
                  Pickup Date
                </span>
              </div>

              <div className="relative">
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="
                    h-[30px]
                    w-full
                    rounded-[3px]
                    border
                    border-[#DCDCDC]
                    px-2
                    pr-8
                    text-[10px]
                    outline-none
                  "
                />

                <CalendarDays
                  className="
                    absolute
                    right-2
                    top-1/2
                    h-3.5
                    w-3.5
                    -translate-y-1/2
                    text-[#777777]
                  "
                />
              </div>
            </div>

            {/* Return */}
            <div className="p-3">
              <div className="mb-2 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-black" />

                <span
                  className="
                    text-[11px]
                    font-medium
                    text-black
                  "
                >
                  Return Date
                </span>
              </div>

              <div className="relative">
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="
                    h-[30px]
                    w-full
                    rounded-[3px]
                    border
                    border-[#DCDCDC]
                    px-2
                    pr-8
                    text-[10px]
                    outline-none
                  "
                />

                <CalendarDays
                  className="
                    absolute
                    right-2
                    top-1/2
                    h-3.5
                    w-3.5
                    -translate-y-1/2
                    text-[#777777]
                  "
                />
              </div>
            </div>
          </div>

          {/* Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="
              mt-5
              h-[40px]
              w-full
              rounded-[4px]
              bg-[#389131]
              text-[14px]
              font-semibold
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
