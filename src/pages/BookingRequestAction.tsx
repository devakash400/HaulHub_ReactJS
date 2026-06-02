// import React, { useMemo } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// type LocationState = {
//   bookingId?: string;
//   action?: "accept" | "reject";
// };

// const BookingRequestAction: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const state = location.state as LocationState | null;
//   const bookingId = state?.bookingId;
//   const action = state?.action ?? "accept";
//   const actionLabel = action === "reject" ? "Reject" : "Accept";

//   const title = useMemo(() => {
//     if (!bookingId) return "No booking selected";
//     return action === "reject"
//       ? "Reject Rental Request"
//       : "Accept Rental Request";
//   }, [action, bookingId]);

//   const description = useMemo(() => {
//     if (!bookingId)
//       return "Please return to notifications and select a request.";
//     return action === "reject"
//       ? "Review the request and confirm rejection. This will notify the renter that their request was declined."
//       : "Review the request and confirm acceptance. This will notify the renter and advance the booking process.";
//   }, [action, bookingId]);

//   const handleConfirm = () => {
//     if (!bookingId) {
//       navigate("/notifications");
//       return;
//     }
//     navigate("/booking", {
//       state: { bookingId, action },
//     });
//   };

//   return (
//     <div className="min-h-screen flex justify-center bg-[#F9F8F3] px-4 py-10">
//       <div className="w-full max-w-3xl bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-md">
//         <h1 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h1>
//         <p className="text-sm text-gray-700 mb-6">{description}</p>

//         {bookingId ? (
//           <div className="space-y-4 rounded-2xl border border-gray-200 bg-[#F9F8F3] p-5">
//             <div>
//               <p className="text-xs uppercase tracking-wide text-gray-500">
//                 Booking ID
//               </p>
//               <p className="mt-1 text-base font-medium text-gray-900">
//                 {bookingId}
//               </p>
//             </div>
//             <div>
//               <p className="text-xs uppercase tracking-wide text-gray-500">
//                 Action
//               </p>
//               <p className="mt-1 text-base font-medium text-gray-900">
//                 {actionLabel}
//               </p>
//             </div>
//           </div>
//         ) : null}

//         <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
//           <button
//             type="button"
//             onClick={() => navigate(-1)}
//             className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-100"
//           >
//             Cancel
//           </button>
//           <button
//             type="button"
//             onClick={handleConfirm}
//             className="rounded-lg bg-[#389131] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2f7a29]"
//           >
//             Confirm {actionLabel}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BookingRequestAction;
import React from "react";

const TrailerConditionPage = () => {
  const photos = [
    {
      title: "Front View",
      image:
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400",
    },
    {
      title: "Left View",
      image:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400",
    },
    {
      title: "Right View",
      image:
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400",
    },
    {
      title: "Back View",
      image:
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F4EF] py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-6 border border-gray-300">
        {/* Title */}
        <h1 className="text-center text-2xl font-bold mb-6">
          Trailer Condition ( Before )
        </h1>

        {/* Booking Details */}
        <div className="border border-gray-300 rounded p-4 text-sm mb-6">
          <p>
            <strong>Booking ID:</strong> #TR-2026-45821
          </p>
          <p>
            <strong>Trailer Name:</strong> 25FT Gooseneck Trailer
          </p>
          <p>
            <strong>Pickup Date:</strong> 12 March 2026
          </p>
          <p>
            <strong>Renter Name:</strong> Demo
          </p>
        </div>

        {/* Green Header */}
        <div className="bg-green-700 text-white text-center py-2 text-sm font-medium rounded mb-4">
          📷 Uploaded Condition Photos
        </div>

        {/* Photos */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {photos.map((photo) => (
            <div key={photo.title} className="text-center">
              <img
                src={photo.image}
                alt={photo.title}
                className="w-full h-24 border object-cover"
              />
              <p className="text-xs mt-2">{photo.title}</p>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <h2 className="text-center text-xl font-semibold mb-4">
          Additional Info About Your Trailer
        </h2>

        <div className="border border-gray-300 rounded p-4 mb-4">
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked readOnly />
              <span>No Visible Dents</span>
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" checked readOnly />
              <span>Tires In Good Condition</span>
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" checked readOnly />
              <span>Lights Working</span>
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" checked readOnly />
              <span>No Scratches</span>
            </label>
          </div>
        </div>

        {/* Notes */}
        <textarea
          rows={5}
          placeholder="Text here..."
          className="w-full border border-gray-300 rounded p-3 text-sm resize-none mb-6"
        />

        {/* Submit */}
        <button className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded text-sm font-medium">
          Submit Inspection
        </button>
      </div>
    </div>
  );
};

export default TrailerConditionPage;
