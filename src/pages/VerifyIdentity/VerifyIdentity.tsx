// import React, { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import {
//   createBooking,
//   getBookingErrorMessage,
// } from "../../../src/api/bookingsApi.ts";

// const VerifyIdentity: React.FC = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const state = (location.state ?? {}) as Record<string, unknown>;

//   const trailerId = String(state.trailerId ?? "");
//   const initialCheckIn = String(state.checkIn ?? state.checkIn ?? "");
//   const initialCheckOut = String(state.checkOut ?? state.checkOut ?? "");
//   const [drivingLicense, setDrivingLicense] = useState<File | null>(null);
//   const [passport, setPassport] = useState<File | null>(null);
//   const [pickupDate, setPickupDate] = useState(initialCheckIn);
//   const [returnDate, setReturnDate] = useState(initialCheckOut);
//   const [sending, setSending] = useState(false);

//   const handleSend = async () => {
//     if (!pickupDate || !returnDate) {
//       toast.error("Please enter pickup and return dates.");
//       return;
//     }
//     if (returnDate < pickupDate) {
//       toast.error("Return date must be on or after pickup date.");
//       return;
//     }
//     if (!drivingLicense) {
//       toast.error("Please upload your driving license.");
//       return;
//     }
//     if (!passport) {
//       toast.error("Please upload your passport.");
//       return;
//     }
//     if (!trailerId) {
//       toast.error("Missing trailer id. Please open this from a listing.");
//       return;
//     }

//     setSending(true);
//     try {
//       await createBooking({
//         trailerId,
//         startDate: pickupDate,
//         endDate: returnDate,
//         drivingLicenseDocuments: [drivingLicense],
//         passportDocuments: [passport],
//       } as any);

//       toast.success("Booking request sent.");
//       navigate("/booking-sent", {
//         state: { ...state, startDate: pickupDate, endDate: returnDate },
//       });
//     } catch (err: unknown) {
//       toast.error(getBookingErrorMessage(err));
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-white p-6">
//       <div className="max-w-2xl w-full bg-white border rounded-lg p-6">
//         <h1 className="text-xl font-semibold mb-4">Identify Verification</h1>
//         <p className="text-gray-600 mb-4">
//           Verify your identity to continue — upload license and passport, then
//           send booking request.
//         </p>

//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Upload License
//             </label>
//             <input
//               type="file"
//               accept="image/*,application/pdf"
//               onChange={(e) => setDrivingLicense(e.target.files?.[0] ?? null)}
//             />
//             {drivingLicense && (
//               <div className="mt-1 text-sm text-gray-700">
//                 {drivingLicense.name}
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Upload Passport
//             </label>
//             <input
//               type="file"
//               accept="image/*,application/pdf"
//               onChange={(e) => setPassport(e.target.files?.[0] ?? null)}
//             />
//             {passport && (
//               <div className="mt-1 text-sm text-gray-700">{passport.name}</div>
//             )}
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Pickup Date
//               </label>
//               <input
//                 type="date"
//                 value={pickupDate}
//                 onChange={(e) => setPickupDate(e.target.value)}
//                 className="w-full border rounded px-3 py-2"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Return Date
//               </label>
//               <input
//                 type="date"
//                 value={returnDate}
//                 onChange={(e) => setReturnDate(e.target.value)}
//                 className="w-full border rounded px-3 py-2"
//               />
//             </div>
//           </div>

//           <div className="mt-4">
//             <button
//               type="button"
//               onClick={handleSend}
//               disabled={sending}
//               className="w-full bg-[#389131] text-white py-3 rounded"
//             >
//               {sending ? "Sending..." : "Send Booking Request"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VerifyIdentity;
import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, CalendarDays } from "lucide-react";
import { toast } from "react-toastify";
import {
  createBooking,
  getBookingErrorMessage,
} from "../../../src/api/bookingsApi.ts";

const parseISODate = (value: string): Date | null => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const VerifyIdentity: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = (location.state ?? {}) as Record<string, unknown>;

  const trailerId = String(state.trailerId ?? "");

  const initialCheckIn = String(state.checkIn ?? "");
  const initialCheckOut = String(state.checkOut ?? "");

  const [drivingLicense, setDrivingLicense] = useState<File | null>(null);
  const [passport, setPassport] = useState<File | null>(null);

  const [pickupDate, setPickupDate] = useState(initialCheckIn);
  const [returnDate, setReturnDate] = useState(initialCheckOut);

  const [sending, setSending] = useState(false);

  const licenseInputRef = useRef<HTMLInputElement>(null);
  const passportInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!pickupDate) {
      toast.error("Please enter a pickup date.");
      return;
    }
    if (!returnDate) {
      toast.error("Please enter a return date.");
      return;
    }

    const pickup = parseISODate(pickupDate);
    const returnAt = parseISODate(returnDate);
    if (!pickup || !returnAt) {
      toast.error("Please enter valid pickup and return dates.");
      return;
    }
    if (returnAt < pickup) {
      toast.error("Return date must be on or after pickup date.");
      return;
    }

    if (!drivingLicense) {
      toast.error("Please upload your driving license.");
      return;
    }

    if (!passport) {
      toast.error("Please upload your passport.");
      return;
    }

    if (!trailerId) {
      toast.error("Missing trailer id.");
      return;
    }

    setSending(true);

    try {
      await createBooking({
        trailerId,
        startDate: pickupDate,
        endDate: returnDate,
        drivingLicenseDocuments: [drivingLicense],
        passportDocuments: [passport],
      } as any);

      toast.success("Booking request sent.");

      navigate("/booking-sent", {
        state: {
          ...state,
          startDate: pickupDate,
          endDate: returnDate,
        },
      });
    } catch (err: unknown) {
      toast.error(getBookingErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="
          w-full
          max-w-[460px]
          overflow-hidden
          rounded-[18px]
          bg-white
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
            className="absolute left-4"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>

          <h1
            className="
              font-lexend
              text-[24px]
              font-semibold
              text-white
            "
          >
            Identify Verification
          </h1>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <h2
            className="
              text-center
              font-lexend
              text-[15px]
              font-semibold
              text-[#1B1B1B]
            "
          >
            Verify Your Identity to Continue
          </h2>

          <p
            className="
              mt-2
              text-center
              font-lexend
              text-[10px]
              font-light
              text-[#5E5E5E]
            "
          >
            Please upload your license and passport to verify your identity.
          </p>

          {/* Upload License */}
          <div className="mt-6">
            <label
              className="
                mb-2
                block
                font-lexend
                text-[12px]
                font-medium
                text-[#1B1B1B]
              "
            >
              Upload License
            </label>

            <input
              ref={licenseInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => setDrivingLicense(e.target.files?.[0] ?? null)}
            />

            <button
              type="button"
              onClick={() => licenseInputRef.current?.click()}
              className="
                flex
                h-[44px]
                w-full
                items-center
                justify-center
                gap-2
                rounded-[4px]
                border
                border-dashed
                border-[#CFCFCF]
                bg-white
              "
            >
              <Upload
                className="h-[13px] w-[13px] text-[#3E3E3E]"
                strokeWidth={2}
              />

              <span
                className="
                  font-lexend
                  text-[12px]
                  font-light
                  text-[#3E3E3E]
                "
              >
                {drivingLicense ? drivingLicense.name : "Upload License"}
              </span>
            </button>
          </div>

          {/* Upload Passport */}
          <div className="mt-5">
            <label
              className="
                mb-2
                block
                font-lexend
                text-[12px]
                font-medium
                text-[#1B1B1B]
              "
            >
              Upload Passport
            </label>

            <input
              ref={passportInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => setPassport(e.target.files?.[0] ?? null)}
            />

            <button
              type="button"
              onClick={() => passportInputRef.current?.click()}
              className="
                flex
                h-[44px]
                w-full
                items-center
                justify-center
                gap-2
                rounded-[4px]
                border
                border-dashed
                border-[#CFCFCF]
                bg-white
              "
            >
              <Upload
                className="h-[13px] w-[13px] text-[#3E3E3E]"
                strokeWidth={2}
              />

              <span
                className="
                  font-lexend
                  text-[12px]
                  font-light
                  text-[#3E3E3E]
                "
              >
                {passport ? passport.name : "Upload Passport"}
              </span>
            </button>
          </div>

          {/* Dates */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            {/* Pickup */}
            <div>
              <label
                className="
                  mb-2
                  block
                  font-lexend
                  text-[12px]
                  font-medium
                  text-[#1B1B1B]
                "
              >
                Pickup Date
              </label>

              <div className="relative">
                <CalendarDays
                  className="
                    absolute
                    left-3
                    top-1/2
                    h-[14px]
                    w-[14px]
                    -translate-y-1/2
                    text-[#707070]
                  "
                />

                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="
                    h-[40px]
                    w-full
                    rounded-[4px]
                    border
                    border-[#D6D6D6]
                    bg-white
                    pl-10
                    pr-3
                    font-lexend
                    text-[12px]
                    font-light
                    outline-none
                  "
                />
              </div>
            </div>

            {/* Return */}
            <div>
              <label
                className="
                  mb-2
                  block
                  font-lexend
                  text-[12px]
                  font-medium
                  text-[#1B1B1B]
                "
              >
                Return Date
              </label>

              <div className="relative">
                <CalendarDays
                  className="
                    absolute
                    left-3
                    top-1/2
                    h-[14px]
                    w-[14px]
                    -translate-y-1/2
                    text-[#707070]
                  "
                />

                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="
                    h-[40px]
                    w-full
                    rounded-[4px]
                    border
                    border-[#D6D6D6]
                    bg-white
                    pl-10
                    pr-3
                    font-lexend
                    text-[12px]
                    font-light
                    outline-none
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
              mt-7
              h-[44px]
              w-full
              rounded-[4px]
              bg-[#389131]
              font-lexend
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
