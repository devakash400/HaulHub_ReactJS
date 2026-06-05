import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../api/api.ts";
import { RootState } from "../../store";

type BookingDetailsLocationState = {
  renterFirstName?: string;
  renterLastName?: string;
  renterEmail?: string;
};

const BookingDetails: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as BookingDetailsLocationState | null;
  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processed, setProcessed] = useState<"Accepted" | "Rejected" | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);
  const [verifiedDocs, setVerifiedDocs] = useState(false);

  const isOwnerUser = useSelector(
    (state: RootState) =>
      state.auth.userType === "Owner" || state.auth.user?.trailor === "Owner",
  );

  useEffect(() => {
    if (!bookingId) return;
    const fetchBooking = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/bookings/${bookingId}`);
        // Normalize response payload — log for debugging if empty
        const data = res.data?.data ?? res.data?.booking ?? res.data ?? null;
        // eslint-disable-next-line no-console
        console.debug(
          "Booking fetch response:",
          res.data,
          "-> selected:",
          data,
        );
        if (!data) {
          // eslint-disable-next-line no-console
          console.warn("Booking fetch returned no usable data for", bookingId);
        }
        setBooking(data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Booking fetch error:", err);
        setError("Unable to load booking details.");
      } finally {
        setLoading(false);
      }
    };

    void fetchBooking();
  }, [bookingId]);

  useEffect(() => {
    const status = String(booking?.status ?? "").toLowerCase();
    if (status === "accepted") {
      setProcessed("Accepted");
    } else if (status === "rejected") {
      setProcessed("Rejected");
    } else {
      setProcessed(null);
    }
  }, [booking?.status]);

  // Reset verification checkbox when booking changes
  useEffect(() => {
    setVerifiedDocs(false);
  }, [booking?._id]);

  const handleAction = async (action: "accept" | "reject") => {
    if (!bookingId) return;
    setProcessing(true);
    setError(null);
    try {
      await api.patch(`/api/bookings/${bookingId}/${action}`);
      setProcessed(action === "accept" ? "Accepted" : "Rejected");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Booking action error:", err);
      setError("Unable to perform action. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Helpers to resolve possible document fields stored in multiple shapes
  const resolveDocUrl = (val: any): string | undefined => {
    if (!val) return undefined;
    if (typeof val === "string") return val;
    if (val?.url) return val.url;
    if (Array.isArray(val) && val.length > 0) {
      const first = val[0];
      if (typeof first === "string") return first;
      return first?.url;
    }
    return undefined;
  };

  const drivingLicenseUrl =
    resolveDocUrl(booking?.user?.drivingLicense) ||
    resolveDocUrl(booking?.userId?.drivingLicense) ||
    resolveDocUrl(booking?.drivingLicenseDocuments) ||
    resolveDocUrl(
      booking?.drivingLicenseDocuments?.length
        ? booking.drivingLicenseDocuments
        : undefined,
    ) ||
    resolveDocUrl(booking?.renter?.drivingLicense) ||
    resolveDocUrl(booking?.renterId?.drivingLicense) ||
    resolveDocUrl(booking?.requester?.drivingLicense) ||
    resolveDocUrl(booking?.bookedBy?.drivingLicense) ||
    resolveDocUrl(booking?.drivingLicense) ||
    resolveDocUrl(booking?.renterDrivingLicense) ||
    resolveDocUrl(booking?.renterLicense) ||
    resolveDocUrl(booking?.user?.documents?.drivingLicense) ||
    undefined;

  const passportUrl =
    resolveDocUrl(booking?.passportDocuments) ||
    resolveDocUrl(
      booking?.passportDocuments?.length
        ? booking.passportDocuments
        : undefined,
    ) ||
    resolveDocUrl(booking?.user?.passport) ||
    resolveDocUrl(booking?.userId?.passport) ||
    resolveDocUrl(booking?.renter?.passport) ||
    resolveDocUrl(booking?.renterId?.passport) ||
    resolveDocUrl(booking?.requester?.passport) ||
    resolveDocUrl(booking?.bookedBy?.passport) ||
    resolveDocUrl(booking?.passport) ||
    resolveDocUrl(booking?.renterPassport) ||
    resolveDocUrl(booking?.user?.documents?.passport) ||
    undefined;

  // derive file names and download helper
  const getFileNameFromUrl = (url?: string, fallback = "document") => {
    if (!url) return `${fallback}.jpg`;
    try {
      const u = new URL(url, window.location.href);
      const parts = u.pathname.split("/");
      const last = parts.pop() || fallback;
      return last || `${fallback}.jpg`;
    } catch (e) {
      return `${fallback}.jpg`;
    }
  };

  const downloadFile = async (url?: string, fileName?: string) => {
    if (!url) return;
    try {
      const res = await fetch(url, { mode: "cors" });
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = fileName || getFileNameFromUrl(url);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Download error:", err);
      setError("Unable to download file.");
    }
  };

  const drivingLicenseFileName = getFileNameFromUrl(
    drivingLicenseUrl,
    "driving_license",
  );
  const passportFileName = getFileNameFromUrl(passportUrl, "passport");
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatName = (
    first?: string,
    last?: string,
    full?: string,
  ): string => {
    const combined = [first?.trim(), last?.trim()].filter(Boolean).join(" ");
    return combined || (full?.trim() ?? "");
  };

  const renterName =
    formatName(
      booking?.user?.firstName,
      booking?.user?.lastName,
      booking?.user?.fullName,
    ) ||
    formatName(
      booking?.userId?.firstName,
      booking?.userId?.lastName,
      booking?.userId?.fullName,
    ) ||
    formatName(
      booking?.renter?.firstName,
      booking?.renter?.lastName,
      booking?.renter?.fullName,
    ) ||
    formatName(
      booking?.renterId?.firstName,
      booking?.renterId?.lastName,
      booking?.renterId?.fullName,
    ) ||
    formatName(
      booking?.requester?.firstName,
      booking?.requester?.lastName,
      booking?.requester?.fullName,
    ) ||
    formatName(
      booking?.bookedBy?.firstName,
      booking?.bookedBy?.lastName,
      booking?.bookedBy?.fullName,
    ) ||
    booking?.renterName ||
    formatName(state?.renterFirstName, state?.renterLastName) ||
    "Unknown";

  const renterEmail =
    booking?.user?.email ?? booking?.userId?.email ?? state?.renterEmail ?? "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 flex-shrink-0 rounded-full bg-indigo-500 text-white flex items-center justify-center text-lg font-semibold">
              {getInitials(renterName)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {renterName}
              </h2>
              {renterEmail && (
                <p className="text-sm text-gray-500">{renterEmail}</p>
              )}
              <p className="mt-1 text-sm text-gray-600">
                Booking ID:{" "}
                <span className="font-mono text-xs text-gray-700">
                  {booking?._id ?? bookingId}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {processed ? (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700">
                {processed}
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-50 text-yellow-700">
                Pending
              </span>
            )}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm text-gray-600"
            >
              Close
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-[#FEF3F2] p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-lg border border-gray-100 bg-white p-4">
              <h3 className="text-sm font-medium text-gray-700">Trip dates</h3>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-md bg-gray-50">
                  <p className="text-xs text-gray-500">Start</p>
                  <p className="text-sm font-medium text-gray-900">
                    {booking?.startDate
                      ? new Date(booking.startDate).toLocaleString()
                      : "-"}
                  </p>
                </div>
                <div className="p-3 rounded-md bg-gray-50">
                  <p className="text-xs text-gray-500">End</p>
                  <p className="text-sm font-medium text-gray-900">
                    {booking?.endDate
                      ? new Date(booking.endDate).toLocaleString()
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            {isOwnerUser && (drivingLicenseUrl || passportUrl) && (
              <div className="rounded-lg border border-gray-100 bg-white p-4">
                <h3 className="text-sm font-medium text-gray-700">
                  Renter documents
                </h3>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {drivingLicenseUrl && (
                    <div className="p-3 rounded-md bg-gray-50 flex flex-col justify-between h-56">
                      <p className="text-xs text-gray-500">Driving license</p>
                      <div className="mt-2 flex-1 flex items-center justify-center w-full">
                        <img
                          src={drivingLicenseUrl}
                          alt="dl"
                          className="max-h-36 w-full object-contain rounded"
                        />
                      </div>
                      <div className="mt-3 flex gap-3 justify-center">
                        <a
                          href={drivingLicenseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          Open
                        </a>
                        <button
                          onClick={() =>
                            void downloadFile(
                              drivingLicenseUrl,
                              drivingLicenseFileName,
                            )
                          }
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  )}

                  {passportUrl && (
                    <div className="p-3 rounded-md bg-gray-50 flex flex-col justify-between h-56">
                      <p className="text-xs text-gray-500">Passport</p>
                      <div className="mt-2 flex-1 flex items-center justify-center w-full">
                        <img
                          src={passportUrl}
                          alt="passport"
                          className="max-h-36 w-full object-contain rounded"
                        />
                      </div>
                      <div className="mt-3 flex gap-3 justify-center">
                        <a
                          href={passportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          Open
                        </a>
                        <button
                          onClick={() =>
                            void downloadFile(passportUrl, passportFileName)
                          }
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-gray-100 bg-white p-4">
              <h4 className="text-sm font-medium text-gray-700">Actions</h4>

              {processed ? (
                <div className="mt-3 text-sm text-gray-700">
                  You {processed === "Accepted" ? "accepted" : "rejected"} this
                  request.
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  {(drivingLicenseUrl || passportUrl) && (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={verifiedDocs}
                        onChange={(e) => setVerifiedDocs(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-gray-700">
                        I have verified the renter's documents
                      </span>
                    </label>
                  )}

                  <div className="flex flex-col gap-2">
                    <button
                      disabled={
                        processing ||
                        (Boolean(drivingLicenseUrl || passportUrl) &&
                          !verifiedDocs)
                      }
                      onClick={() => void handleAction("accept")}
                      className={`flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white ${processing ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                    >
                      {processing ? "Processing..." : "Accept request"}
                    </button>

                    <button
                      disabled={processing}
                      onClick={() => void handleAction("reject")}
                      className={`flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold ${processing ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "border border-red-300 text-red-600 hover:bg-red-50"}`}
                    >
                      {processing ? "Processing..." : "Reject request"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-gray-100 bg-white p-4 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-800">Requested on:</span>{" "}
                {booking?.createdAt
                  ? new Date(booking.createdAt).toLocaleString()
                  : "-"}
              </p>
              <p className="mt-2">
                Contact the renter via email to discuss details.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
