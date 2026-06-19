import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
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
  const [drivingLicenseVerified, setDrivingLicenseVerified] = useState(false);
  const [passportVerified, setPassportVerified] = useState(false);
  const [conditionFiles, setConditionFiles] = useState<
    Record<string, File | null>
  >({ front: null, left: null, right: null, back: null });
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});
  const previewUrlsRef = useRef<Record<string, string | null>>({
    front: null,
    left: null,
    right: null,
    back: null,
  });

  const isOwnerUser = useSelector(
    (state: RootState) =>
      state.auth.userType === "Owner" || state.auth.user?.trailor === "Owner",
  );

  useEffect(() => {
    if (!bookingId) {
      setError("Booking ID not found in URL");
      return;
    }
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

  // Reset verification states when booking changes
  useEffect(() => {
    setVerifiedDocs(false);
    setDrivingLicenseVerified(false);
    setPassportVerified(false);
  }, [booking?._id]);

  const handleAction = async (action: "accept" | "reject") => {
    if (!bookingId) {
      setError("Booking ID not found. Cannot perform action.");
      return;
    }
    
    // eslint-disable-next-line no-console
    console.log("handleAction called:", { action, bookingId, booking: booking?._id });
    
    if (action === "accept") {
      if (showUploadSection && !areAllPhotosUploaded) {
        setError(
          "Please upload all required condition photos before accepting.",
        );
        return;
      }
      if ((drivingLicenseUrl || passportUrl) && !verifiedDocs) {
        setError("Please verify all renter documents before accepting.");
        return;
      }
    }

    setProcessing(true);
    setError(null);
    try {
      if (action === "accept") {
        // Use unified accept-with-photos endpoint
        const fd = new FormData();
        fd.append("phase", "pickup");
        const labels: string[] = [];

        const files = Object.entries(conditionFiles).filter(([, f]) => f);
        for (const [label, file] of files) {
          if (file) {
            fd.append("photos", file as File);
            labels.push(label);
          }
        }

        if (labels.length > 0) {
          fd.append("labels", JSON.stringify(labels));
        }

        // eslint-disable-next-line no-console
        console.log(`Sending accept-with-photos request to /api/bookings/${bookingId}/accept-with-photos`);
        
        await api.patch(
          `/api/bookings/${bookingId}/accept-with-photos`,
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        
        setProcessed("Accepted");
        setBooking((prev: any) =>
          prev ? { ...prev, status: "accepted" } : prev,
        );
      } else {
        // Reject endpoint remains unchanged
        // eslint-disable-next-line no-console
        console.log(`Sending reject request to /api/bookings/${bookingId}/reject`);
        
        await api.patch(`/api/bookings/${bookingId}/${action}`);
        setProcessed("Rejected");
        setBooking((prev: any) =>
          prev ? { ...prev, status: "rejected" } : prev,
        );
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Booking action error:", err);
      if (action === "accept") {
        setError("Unable to accept request. Please try again.");
      } else {
        setError("Unable to perform action. Please try again.");
      }
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

  const formatName = (first?: string, last?: string, full?: string): string => {
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

  const isAccepted = String(booking?.status ?? "").toLowerCase() === "accepted";
  const isRejected = String(booking?.status ?? "").toLowerCase() === "rejected";
  const showUploadSection = !isAccepted;
  const areAllPhotosUploaded = Object.values(conditionFiles).every(Boolean);
  const canAccept =
    !processing &&
    (!showUploadSection || areAllPhotosUploaded) &&
    (!(drivingLicenseUrl || passportUrl) || verifiedDocs);

  const getDuration = () => {
    if (!booking?.startDate || !booking?.endDate) return "-";
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const days = Math.max(
      Math.ceil((end.valueOf() - start.valueOf()) / (1000 * 60 * 60 * 24)),
      1,
    );
    return `${days} Day${days === 1 ? "" : "s"}`;
  };

  const getTrailerType = () =>
    booking?.trailerType ||
    booking?.trailer?.type ||
    booking?.vehicleType ||
    "Flatbed Trailer";

  const getSummaryValue = (value: any, fallback: string) =>
    value === undefined || value === null ? fallback : value;

  const onConditionFileChange = (label: string, file?: File | null) => {
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5 MB");
      if (fileInputsRef.current[label]) {
        fileInputsRef.current[label]!.value = "";
      }
      return;
    }

    setConditionFiles((prev) => ({ ...prev, [label]: file ?? null }));
    try {
      const prev = previewUrlsRef.current[label];
      if (prev) URL.revokeObjectURL(prev);
    } catch (e) {
      // ignore
    }
    if (file) {
      previewUrlsRef.current[label] = URL.createObjectURL(file);
    } else {
      previewUrlsRef.current[label] = null;
    }
  };

  useEffect(() => {
    return () => {
      try {
        Object.values(previewUrlsRef.current).forEach((u) => {
          if (u) URL.revokeObjectURL(u);
        });
      } catch (e) {
        // ignore
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="mx-auto w-full max-w-[1260px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-14 w-14 shrink-0 rounded-full bg-indigo-500 text-white grid place-items-center text-xl font-semibold">
                {getInitials(renterName)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">
                  {booking?.user?.fullName
                    ? "Booking details"
                    : "Booking details"}
                </p>
                <h1 className="text-2xl font-semibold text-slate-900 break-words break-all">
                  {renterName}
                </h1>
                <p className="mt-1 text-sm text-slate-500 truncate">
                  Booking ID:{" "}
                  <span className="font-mono text-slate-600">
                    {booking?._id ?? bookingId}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {!isAccepted && !isRejected && (
                <span className={`inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-sm capitalize ${
                  String(booking?.status).toLowerCase() === "pending" 
                    ? "bg-emerald-50 text-emerald-700 font-semibold" 
                    : "bg-slate-100 text-slate-600"
                }`}>
                  {booking?.status ? booking.status : "Awaiting action"}
                </span>
              )}
              {isAccepted && (
                <span className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-1 text-sm font-semibold text-white shadow-sm">
                  Accepted
                </span>
              )}
              {isRejected && (
                <span className="inline-flex items-center rounded-full bg-rose-600 px-4 py-1 text-sm font-semibold text-white shadow-sm">
                  Rejected
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Trip details
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Review the trailer booking information.
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                  {getTrailerType()}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Start date</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {booking?.startDate
                      ? new Date(booking.startDate).toLocaleString()
                      : "-"}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">End date</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {booking?.endDate
                      ? new Date(booking.endDate).toLocaleString()
                      : "-"}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Duration</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {getDuration()}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Trailer type</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {getTrailerType()}
                  </p>
                </div>
              </div>
            </div>

            {isOwnerUser && (drivingLicenseUrl || passportUrl) && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Renter documents
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Verify renter identity documents before accepting.
                    </p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {drivingLicenseUrl && (
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-slate-500">
                            Driving license
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {drivingLicenseVerified
                              ? "Verified"
                              : "Awaiting verification"}
                          </p>
                        </div>
                        {drivingLicenseVerified ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Verified
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDrivingLicenseVerified(true)}
                            className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                          >
                            Verify
                          </button>
                        )}
                      </div>
                      <div className="mt-4 flex h-44 items-center justify-center overflow-hidden rounded-3xl bg-white">
                        <img
                          src={drivingLicenseUrl}
                          alt="driving license"
                          className="max-h-full object-contain"
                        />
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-indigo-600">
                        <a
                          href={drivingLicenseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          View
                        </a>
                        <button
                          onClick={() =>
                            void downloadFile(
                              drivingLicenseUrl,
                              drivingLicenseFileName,
                            )
                          }
                          className="hover:underline"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  )}
                  {passportUrl && (
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-slate-500">Passport</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {passportVerified
                              ? "Verified"
                              : "Awaiting verification"}
                          </p>
                        </div>
                        {passportVerified ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Verified
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPassportVerified(true)}
                            className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                          >
                            Verify
                          </button>
                        )}
                      </div>
                      <div className="mt-4 flex h-44 items-center justify-center overflow-hidden rounded-3xl bg-white">
                        <img
                          src={passportUrl}
                          alt="passport"
                          className="max-h-full object-contain"
                        />
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-indigo-600">
                        <a
                          href={passportUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          View
                        </a>
                        <button
                          onClick={() =>
                            void downloadFile(passportUrl, passportFileName)
                          }
                          className="hover:underline"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {showUploadSection && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Trailer condition before trip
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Upload condition photos before pickup.
                    </p>
                  </div>
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Front / Left / Right / Back
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="col-span-full rounded-3xl bg-amber-50 p-4 text-sm text-amber-900">
                    All four condition photos are required before accepting this
                    booking.
                  </div>
                  {[
                    { key: "front", label: "Front View" },
                    { key: "left", label: "Left View" },
                    { key: "right", label: "Right View" },
                    { key: "back", label: "Back View" },
                  ].map((it) => {
                    const file = conditionFiles[it.key];
                    const previewSrc = previewUrlsRef.current[it.key] ?? null;
                    return (
                      <div
                        key={it.key}
                        className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center"
                      >
                        <div className="text-sm font-semibold text-slate-900">
                          {it.label}
                        </div>
                        <div className="mt-4 flex h-40 items-center justify-center rounded-3xl bg-white border border-dashed border-slate-200 overflow-hidden">
                          {previewSrc ? (
                            <img
                              src={previewSrc}
                              alt={`${it.label} preview`}
                              className="h-full w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setFullScreenImage(previewSrc)}
                            />
                          ) : (
                            <div className="px-3 text-sm text-slate-400">
                              Upload Photo
                              <br />
                              <span className="text-xs text-slate-400">
                                PNG, JPG up to 5MB
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              fileInputsRef.current[it.key]?.click()
                            }
                            className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            {file ? "Change" : "Upload"}
                          </button>
                          {file && (
                            <button
                              type="button"
                              onClick={() =>
                                onConditionFileChange(it.key, null)
                              }
                              className="text-sm text-rose-600 hover:underline"
                            >
                              Remove
                            </button>
                          )}
                          <input
                            ref={(el) => {
                              fileInputsRef.current[it.key] = el;
                            }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              onConditionFileChange(
                                it.key,
                                e.target.files?.[0] ?? null,
                              )
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Booking actions
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Review renter details and take action.
                  </p>
                  {error && (
                    <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">
                      {error}
                    </div>
                  )}
                </div>

                {isAccepted ? (
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700">
                    Accepted
                  </div>
                ) : isRejected ? (
                  <div className="rounded-2xl bg-rose-50 px-4 py-3 text-center text-sm font-semibold text-rose-700">
                    Rejected
                  </div>
                ) : (
                  <>
                    <button
                      disabled={!canAccept}
                      onClick={() => void handleAction("accept")}
                      className={`w-full max-w-[280px] mx-auto rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${!canAccept ? "bg-emerald-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
                    >
                      {processing ? "Processing..." : "Accept request"}
                    </button>
                    <button
                      disabled={processing}
                      onClick={() => void handleAction("reject")}
                      className={`w-full max-w-[280px] mx-auto rounded-2xl border border-rose-300 px-4 py-3 text-sm font-semibold transition ${processing ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "text-rose-600 hover:bg-rose-50"}`}
                    >
                      {processing ? "Processing..." : "Reject request"}
                    </button>

                    {(drivingLicenseUrl || passportUrl) && (
                      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={verifiedDocs}
                          onChange={(e) => setVerifiedDocs(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>I have verified all renter documents</span>
                      </label>
                    )}
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {fullScreenImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 p-4 sm:p-8"
          onClick={() => setFullScreenImage(null)}
        >
          <div className="relative flex h-full w-full max-w-5xl items-center justify-center">
            <button
              className="absolute top-0 right-0 z-[101] flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors sm:top-4 sm:right-4"
              onClick={() => setFullScreenImage(null)}
            >
              <span className="text-2xl leading-none">&times;</span>
            </button>
            <img
              src={fullScreenImage}
              alt="Full screen preview"
              className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;
