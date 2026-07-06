import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Navbar from "../../../src/components/Navbar/Navbar.tsx";
import BottomBar from "../../components/BottomBar/BottomBar.tsx";
import {
  completePreScreening,
  getConditionPhotos,
  getPreScreeningStatus,
  ConditionPhotoImage,
} from "../../../src/api/preScreeningApi.ts";
import { uploadSignature } from "../../../src/api/uploadApi.ts";
import { createPaymentIntent, confirmPaymentIntent } from "../../../src/api/paymentApi.ts";
import { getBookingById } from "../../../src/api/bookingsApi.ts";
import CardPaymentModal from "../../components/Payment/CardPaymentModal.tsx";
const stepDefinitions = [
  { label: "Pre-Screening" },
  { label: "Liability" },
  { label: "Photos" },
  { label: "Payment" },
];

const checklistItems = [
  {
    title: "My identity information is correct",
    description:
      "The information provided matches your official government ID.",
  },
  {
    title: "I have a valid driving license",
    description:
      "Your license is currently active and appropriate for towing this equipment.",
  },
  {
    title: "I agree to follow HaulHub rental rules",
    description:
      "Review our standard operating procedures and usage guidelines.",
  },
  {
    title: "I understand safe trailer towing practices.",
    description:
      "You are familiar with height distribution, braking distances, and securement.",
  },
  {
    title: "I understand deposit may be deducted for damages",
    description:
      "In the event of negligence or equipment damage, your security deposit may be used.",
  },
];

const photoItems = [
  {
    title: "Front View",
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=60",
  },
  {
    title: "Back View",
    src: "https://images.unsplash.com/photo-1519817650390-64a93db511aa?auto=format&fit=crop&w=800&q=60",
  },
  {
    title: "Left Side",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60",
  },
  {
    title: "Right Side",
    src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=60",
  },
];

type BookingState = {
  title?: string;
  subtitle?: string;
  image?: string;
  totalPrice?: string;
  dates?: string;
  checkIn?: string;
  checkOut?: string;
  bookingId?: string;
};

const pad2 = (n: number) => String(n).padStart(2, "0");
const makeBookingId = () => {
  const d = new Date();
  return `HH-${pad2(d.getMonth() + 1)}${pad2(d.getDate())}-${Math.floor(
    100000 + Math.random() * 900000,
  )}`;
};

const PreScreening: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as BookingState;
  const queryBookingId = useMemo(
    () => new URLSearchParams(location.search).get("bookingId") ?? undefined,
    [location.search],
  );
  const bookingId = useMemo(
    () => state.bookingId ?? queryBookingId ?? makeBookingId(),
    [state.bookingId, queryBookingId],
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    checklistItems.map(() => false),
  );
  const [liabilityAccepted, setLiabilityAccepted] = useState(false);
  const [photosConfirmed, setPhotosConfirmed] = useState(false);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSignatureFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSignatureFile(file);
      setHasSignature(true);
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setSignaturePreview(previewUrl);
      console.log("✅ Signature file selected:", file.name);
    } else {
      setApiError("Please select a valid image file for your signature.");
    }
  };

  const clearSignature = () => {
    setSignatureFile(null);
    setHasSignature(false);
    if (signaturePreview) {
      URL.revokeObjectURL(signaturePreview);
    }
    setSignaturePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCheckboxChange = (index: number) => {
    setCheckedItems((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const [preScreeningSubmitting, setPreScreeningSubmitting] = useState(false);
  const [step0Error, setStep0Error] = useState<string>("");
  const [apiError, setApiError] = useState<string>("");
  const [pickupPhotos, setPickupPhotos] = useState<Record<string, string>>({
    front: "",
    left: "",
    right: "",
    back: "",
  });
  const [photoError, setPhotoError] = useState<string>("");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      const id = state.bookingId ?? bookingId;
      if (!id) return;
      try {
        const response = await getBookingById(id);
        if (response?.success && response?.data) {
          setBookingDetails(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch booking details:", err);
      }
    };
    void fetchBooking();
  }, [bookingId, state.bookingId]);

  const displayDates = useMemo(() => {
    if (bookingDetails?.startDate && bookingDetails?.endDate) {
      const start = new Date(bookingDetails.startDate);
      const end = new Date(bookingDetails.endDate);
      const startStr = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      const endStr = `${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      return `${startStr} - ${endStr}`.toUpperCase();
    }
    return state.dates ?? "TBA";
  }, [bookingDetails, state.dates]);

  const { rentalFee, taxAmount, totalAmount } = useMemo(() => {
    let numericPrice = 20;
    if (bookingDetails?.totalPrice != null) {
      numericPrice = Number(bookingDetails.totalPrice);
    } else if (state.totalPrice) {
      numericPrice = Number(state.totalPrice.replace(/[^0-9.]/g, ""));
    }

    // Assume the given price is the rental fee
    // const tax = Number((numericPrice * 0.18).toFixed(2));
    // const total = Number((numericPrice + tax).toFixed(2));

    return {
      rentalFee: numericPrice,
      taxAmount: 0, // tax
      totalAmount: numericPrice // total
    };
  }, [bookingDetails, state.totalPrice]);

  const handlePaymentSubmit = async (cardData: { cardNumber: string; expMonth: number; expYear: number; cvc: string }) => {
    if (!paymentIntentId) return;

    try {
      setPreScreeningSubmitting(true);
      const confirmResponse = await confirmPaymentIntent({
        paymentIntentId,
        ...cardData
      });
      console.log("Confirm Intent Response:", confirmResponse);

      if (confirmResponse?.success && confirmResponse?.data?.status === "succeeded") {
        setIsPaymentModalOpen(false);
        navigate("/payment-receipt", {
          state: {
            ...state,
            bookingId,
            dates: displayDates,
            totalPrice: state.totalPrice,
            rentalFee: rentalFee,
            liabilityAgreementSigned: true,
          },
        });
      } else {
        setApiError("Payment failed to process successfully.");
      }
    } catch (err) {
      console.error("Payment confirmation flow failed:", err);
      setApiError("Payment failed. Please check your card details and try again.");
    } finally {
      setPreScreeningSubmitting(false);
    }
  };
  useEffect(() => {
    const fetchPreScreeningStatus = async () => {
      const id = state.bookingId ?? bookingId;
      if (!id) return;

      try {
        const response = await getPreScreeningStatus(id);
        if (response?.success && response.data) {
          const {
            identityVerified,
            licenseVerified,
            agreementConfirmed,
            agreementSignature,
          } = response.data;

          if (identityVerified && licenseVerified && agreementConfirmed) {
            setCheckedItems(checklistItems.map(() => true));
            setLiabilityAccepted(true);
            setStep0Error("");

            // Load signature if it exists
            if (agreementSignature) {
              setSignaturePreview(agreementSignature);
              setHasSignature(true);
              console.log(
                "✅ Signature loaded from pre-screening:",
                agreementSignature,
              );
            }
          } else {
            setCheckedItems((prev) => [
              identityVerified,
              licenseVerified,
              prev[2],
              prev[3],
              prev[4],
            ]);
            setLiabilityAccepted(agreementConfirmed);
          }
        }
      } catch (fetchError) {
        // eslint-disable-next-line no-console
        console.error("Failed to load pre-screening status:", fetchError);
      }
    };

    void fetchPreScreeningStatus();
  }, [bookingId, state.bookingId]);

  useEffect(() => {
    if (stepIndex !== 2) return;
    const fetchPickupPhotos = async () => {
      const id = state.bookingId ?? bookingId;
      if (!id) return;

      setPhotoError("");
      setPhotoLoading(true);
      try {
        const response = await getConditionPhotos(id);
        const pickupRecords = response.data.filter(
          (record) => record.phase === "pickup",
        );

        if (!pickupRecords.length) {
          setPhotoError(
            "No pickup condition photos were found for this booking.",
          );
          setPickupPhotos({ front: "", left: "", right: "", back: "" });
          return;
        }

        const latestRecord = pickupRecords.reduce((latest, record) =>
          new Date(record.updatedAt).valueOf() >
            new Date(latest.updatedAt).valueOf()
            ? record
            : latest,
        );

        const grouped = latestRecord.images.reduce(
          (acc: Record<string, ConditionPhotoImage>, image) => {
            const existing = acc[image.label];
            if (
              !existing ||
              new Date(image.uploadedAt).valueOf() >
              new Date(existing.uploadedAt).valueOf()
            ) {
              acc[image.label] = image;
            }
            return acc;
          },
          {},
        );

        setPickupPhotos({
          front: grouped.front?.url ?? "",
          left: grouped.left?.url ?? "",
          right: grouped.right?.url ?? "",
          back: grouped.back?.url ?? "",
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to load pickup photos:", err);
        setPhotoError(
          "Unable to load pickup photos. Please refresh the page and try again.",
        );
      } finally {
        setPhotoLoading(false);
      }
    };

    void fetchPickupPhotos();
  }, [bookingId, state.bookingId, stepIndex]);

  const submitPreScreening = async () => {
    const id = state.bookingId ?? bookingId;
    let signatureUrl = "";

    // Upload signature if agreement is confirmed and we have a file to upload
    // (If signature was loaded from API, we already have the URL)
    if (liabilityAccepted && signatureFile) {
      try {
        console.log("📸 Uploading signature file...", signatureFile.name);
        const uploadResponse = await uploadSignature(signatureFile);

        if (uploadResponse.success && uploadResponse.data?.url) {
          signatureUrl = uploadResponse.data.url;
          console.log("✅ Signature uploaded successfully:", signatureUrl);
        } else {
          throw new Error("Signature upload failed");
        }
      } catch (uploadErr) {
        // eslint-disable-next-line no-console
        console.error("❌ Signature upload error:", uploadErr);
        setApiError("Failed to upload signature. Please try again.");
        setPreScreeningSubmitting(false);
        return false;
      }
    } else if (liabilityAccepted && signaturePreview && !signatureFile) {
      // Signature was already uploaded in a previous session
      signatureUrl = signaturePreview;
      console.log("✅ Using previously uploaded signature:", signatureUrl);
    }

    const payload: {
      identityVerified: boolean;
      licenseVerified: boolean;
      agreementConfirmed: boolean;
      currentPhotosVerified: boolean;
      agreementSignature?: string;
    } = {
      identityVerified: Boolean(checkedItems[0]),
      licenseVerified: Boolean(checkedItems[1]),
      agreementConfirmed: Boolean(liabilityAccepted),
      currentPhotosVerified: Boolean(photosConfirmed),
    };

    if (signatureUrl) {
      payload.agreementSignature = signatureUrl;
    }

    try {
      setPreScreeningSubmitting(true);
      setApiError("");
      console.log("📤 Calling pre-screening complete API with:", {
        endpoint: `/api/pre-screening/${id}/complete`,
        payload,
      });
      const response = await completePreScreening(id, payload);
      console.log("✅ Pre-screening API Response:", response);
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("❌ PreScreening submission error:", err);
      setApiError(
        "Error submitting pre-screening. Please check your internet connection and try again.",
      );
      return false;
    } finally {
      setPreScreeningSubmitting(false);
    }
  };

  const completeStep = async () => {
    if (stepIndex === 0) {
      // Validate all checkboxes are checked
      if (!checklistItems.every((_, i) => checkedItems[i])) {
        setStep0Error(
          "Please confirm all pre-screening details before continuing",
        );
        return;
      }
      setStep0Error("");
      setStepIndex(1);
      return;
    }
    if (stepIndex === 1 && liabilityAccepted && hasSignature) {
      setStepIndex(2);
      return;
    }
    if (stepIndex === 1) {
      console.warn("Cannot proceed - Missing conditions:", {
        liabilityAccepted,
        hasSignature,
      });
      return;
    }
    if (stepIndex === 2 && photosConfirmed) {
      console.log("📋 Step 2: Submitting pre-screening...", {
        identityVerified: Boolean(checkedItems[0]),
        licenseVerified: Boolean(checkedItems[1]),
        agreementConfirmed: Boolean(liabilityAccepted),
        bookingId: state.bookingId ?? bookingId,
      });
      const success = await submitPreScreening();
      if (success) {
        console.log(
          "✅ Pre-screening submitted successfully, advancing to step 3",
        );
        setStepIndex(3);
      } else {
        console.error("❌ Pre-screening submission failed, staying on step 2");
      }
      return;
    }
    if (stepIndex === 3) {
      try {
        setPreScreeningSubmitting(true);
        setApiError("");
        const response = await createPaymentIntent(bookingId);
        console.log("Payment Intent Response:", response);

        const newPaymentIntentId = response?.data?.paymentIntentId;
        const amount = response?.data?.amount;
        if (newPaymentIntentId) {
          setPaymentIntentId(newPaymentIntentId);
          setPaymentAmount(amount || 0);
          setIsPaymentModalOpen(true);
        } else {
          console.warn("No paymentIntentId found in response");
          setApiError("Failed to initialize payment.");
        }
      } catch (err) {
        console.error("Payment intent flow failed:", err);
        setApiError("Failed to initialize payment. Please try again.");
      } finally {
        setPreScreeningSubmitting(false);
      }
      return;
    }
  };

  const goBack = () => {
    setStepIndex((value) => Math.max(0, value - 1));
  };

  const currentStep = stepDefinitions[stepIndex];
  const allStep0ChecksCompleted = checklistItems.every(
    (_, i) => checkedItems[i],
  );
  const canContinue =
    (stepIndex === 0 && allStep0ChecksCompleted) ||
    (stepIndex === 1 && liabilityAccepted && hasSignature) ||
    (stepIndex === 2 && photosConfirmed) ||
    stepIndex === 3;

  return (
    <div className="min-h-screen bg-[#F3F7FB] max-w-[100vw] overflow-x-hidden">
      <Navbar />
      <div className="pt-[96px] pb-10 w-full max-w-[100vw]">
        <div className="w-full px-3 sm:px-0 py-6 sm:py-10 max-w-full">
          <div
            className="overflow-hidden rounded-2xl sm:rounded-[32px]

           shadow-[0_24px_120px_rgba(15,23,42,0.08)]"
          >
            <div className="bg-white px-4 py-6 sm:px-8 sm:py-10">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#1F8A3D]">
                  Pre-Screening
                </p>
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                  Ready to complete your booking
                </h1>
                <p className="max-w-3xl text-sm text-slate-600">
                  Confirm your identity, license, and liability agreement before
                  moving to the trailer review.
                </p>
              </div>
            </div>
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-8 sm:py-6">
              <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto pb-2 sm:pb-0">
                {stepDefinitions.map((step, index) => {
                  const completed = index < stepIndex;
                  const current = index === stepIndex;
                  return (
                    <React.Fragment key={step.label}>
                      <div className="flex flex-col items-center gap-2 sm:gap-3 text-center min-w-[70px] sm:min-w-0">
                        <div
                          className={`flex shrink-0 h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-full border text-xs sm:text-sm font-semibold ${completed
                            ? "bg-[#1F8A3D] text-white border-[#1F8A3D]"
                            : current
                              ? "bg-white text-slate-900 border-slate-300"
                              : "bg-white text-slate-500 border-slate-200"
                            }`}
                        >
                          {completed ? "✓" : index + 1}
                        </div>
                        <p
                          className={`text-[10px] sm:text-xs font-semibold uppercase tracking-tight sm:tracking-[0.22em] whitespace-nowrap ${completed || current
                            ? "text-slate-900"
                            : "text-slate-500"
                            }`}
                        >
                          {step.label}
                        </p>
                      </div>
                      {index < stepDefinitions.length - 1 && (
                        <div
                          className={`h-[2px] min-w-[24px] sm:min-w-0 flex-1 rounded-full shrink-0 ${index < stepIndex ? "bg-[#1F8A3D]" : "bg-slate-300"
                            }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            <main className="px-4 py-6 sm:px-10 sm:py-10">
              <div className="rounded-2xl sm:rounded-[28px] border border-slate-200 bg-slate-50 p-4 sm:p-8 shadow-sm">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1F8A3D]">
                    {currentStep.label}
                  </p>
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
                    {stepIndex === 0
                      ? "Confirm your pre-screening details"
                      : stepIndex === 1
                        ? "Review and sign the liability agreement"
                        : stepIndex === 2
                          ? "Review pickup photos before payment"
                          : "Complete your payment"}
                  </h2>
                </div>

                {stepIndex === 0 && (
                  <div className="mt-8 grid gap-4">
                    {checklistItems.map((item, index) => {
                      const showError = step0Error && !checkedItems[index];
                      return (
                        <div key={item.title}>
                          <label
                            className={`group flex cursor-pointer flex-col rounded-2xl sm:rounded-[28px] border bg-white p-4 sm:p-5 shadow-sm transition hover:border-[#1F8A3D] ${showError ? "border-red-300" : "border-slate-200"
                              }`}
                          >
                            <div className="flex items-start gap-4">
                              <input
                                type="checkbox"
                                checked={checkedItems[index]}
                                onChange={() => handleCheckboxChange(index)}
                                className="mt-1 h-6 w-6 rounded border-gray-300 text-[#1F8A3D] focus:ring-[#1F8A3D]"
                              />
                              <div className="min-w-0">
                                <p className="text-base font-semibold text-slate-900">
                                  {item.title}
                                </p>
                                <p className="mt-2 text-sm text-slate-600">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </label>
                          {showError && (
                            <p className="mt-3 text-sm text-red-600 font-medium">
                              Please confirm this item before continuing.
                            </p>
                          )}
                        </div>
                      );
                    })}
                    {step0Error && (
                      <div className="rounded-[24px] bg-red-50 border border-red-200 p-4">
                        <p className="text-sm text-red-700 font-medium">
                          {step0Error}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {stepIndex === 1 && (
                  <div className="mt-8 space-y-6">
                    {apiError && (
                      <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
                        <p className="text-sm text-red-700 font-medium">
                          <span className="font-bold">❌ Error:</span>{" "}
                          {apiError}
                        </p>
                      </div>
                    )}
                    <div className="rounded-2xl sm:rounded-3xl border border-[#D9D9D9] bg-white p-4 sm:p-6">
                      <p className="text-sm font-semibold text-slate-900 mb-4">
                        HaulHub Trailer Rental Liability Agreement
                      </p>
                      <div className="space-y-4 text-sm text-slate-600">
                        <div>
                          <p className="font-semibold text-slate-900">
                            Assumption of Risk
                          </p>
                          <p>
                            The renter acknowledges and agrees that use of the
                            trailer involves inherent risks, including but not
                            limited to property damage, personal injury, or
                            death. Renter agrees to assume all risks associated
                            with possession and operation of the trailer during
                            the rental period.
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            Responsibility for Damage
                          </p>
                          <p>
                            Renter is solely responsible for any damage to the
                            trailer, its components, or accessories that occurs
                            during the rental period, regardless of fault.
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">
                            Please sign below to acknowledge the terms.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl sm:rounded-3xl border border-[#D9D9D9] bg-white p-4 sm:p-6">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              Signature
                            </p>
                            <p className="text-sm text-slate-500">
                              Upload your signature image.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={clearSignature}
                            className="rounded-full border border-[#D9D9D9] px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            disabled={!hasSignature}
                          >
                            Clear
                          </button>
                        </div>

                        <div className="rounded-2xl sm:rounded-[24px] border-2 border-dashed border-[#D9D9D9] bg-[#F8F8F8] p-4 sm:p-6">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleSignatureFileChange}
                            className="hidden"
                          />
                          {!hasSignature ? (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full text-center py-8 hover:bg-slate-100 rounded-[20px] transition"
                            >
                              <p className="text-sm font-semibold text-slate-900">
                                📁 Click to upload signature
                              </p>
                              <p className="text-xs text-slate-600 mt-2">
                                or drag and drop (PNG, JPG, etc.)
                              </p>
                            </button>
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <img
                                src={signaturePreview || ""}
                                alt="Signature preview"
                                className="max-h-[150px] max-w-[300px] object-contain rounded-[12px] border border-slate-300"
                              />
                              <div className="text-center">
                                <p className="text-sm font-semibold text-[#1F8A3D]">
                                  ✓ Signature uploaded
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                  {signatureFile?.name}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <label className="inline-flex items-start sm:items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-[#D9D9D9] bg-white px-3 py-3 sm:px-4 sm:py-3">
                          <input
                            type="checkbox"
                            checked={liabilityAccepted}
                            onChange={() =>
                              setLiabilityAccepted((prev) => !prev)
                            }
                            className="h-5 w-5 rounded border-gray-300 text-[#1F8A3D] focus:ring-[#1F8A3D]"
                          />
                          <span className="text-sm text-slate-900">
                            I have read and agree to the liability agreement.
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {stepIndex === 2 && (
                  <div className="mt-8 space-y-6">
                    <p className="text-sm text-slate-600">
                      Please review the trailer condition photos before payment.
                    </p>
                    {photoLoading ? (
                      <div className="rounded-2xl sm:rounded-3xl border border-[#D9D9D9] bg-white p-4 sm:p-8 text-center text-sm text-slate-600">
                        Loading pickup photos...
                      </div>
                    ) : photoError ? (
                      <div className="rounded-2xl sm:rounded-3xl border border-red-200 bg-red-50 p-4 sm:p-6 text-sm text-red-700">
                        {photoError}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {[
                          { key: "front", title: "Front View" },
                          { key: "left", title: "Left Side" },
                          { key: "right", title: "Right Side" },
                          { key: "back", title: "Back View" },
                        ].map((item) => (
                          <div
                            key={item.key}
                            className="rounded-2xl sm:rounded-3xl overflow-hidden border border-[#D9D9D9] bg-white"
                          >
                            <img
                              src={
                                pickupPhotos[item.key] ||
                                "https://via.placeholder.com/600x360?text=Missing+Photo"
                              }
                              alt={item.title}
                              className="h-48 w-full object-cover"
                            />
                            <div className="p-4">
                              <p className="text-sm font-semibold text-slate-900">
                                {item.title}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <label className="inline-flex items-start gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-[#D9D9D9] bg-white px-3 py-3 sm:px-4 sm:py-4">
                      <input
                        type="checkbox"
                        checked={photosConfirmed}
                        onChange={() => setPhotosConfirmed((prev) => !prev)}
                        className="mt-1 h-5 w-5 rounded border-gray-300 text-[#1F8A3D] focus:ring-[#1F8A3D]"
                      />
                      <span className="text-sm text-slate-900">
                        I have reviewed the photos and confirm the trailer
                        condition at pickup.
                      </span>
                    </label>
                  </div>
                )}

                {stepIndex === 3 && (
                  <div className="mt-8 space-y-6">
                    {apiError && (
                      <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
                        <p className="text-sm text-red-700 font-medium">
                          <span className="font-bold">❌ Error:</span>{" "}
                          {apiError}
                        </p>
                      </div>
                    )}
                    <div className="grid gap-4 rounded-2xl sm:rounded-3xl border border-[#D9D9D9] bg-white p-4 sm:p-6 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-slate-500">Booking ID</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">
                          {bookingId}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Rental Dates</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">
                          {displayDates}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl sm:rounded-3xl border border-[#D9D9D9] bg-white p-4 sm:p-6">
                      <p className="text-sm font-semibold text-slate-900">
                        Payment overview
                      </p>
                      <div className="mt-4 space-y-3 text-sm text-slate-600">
                        <div className="flex items-center justify-between">
                          <span>Rental fee</span>
                          <span>${rentalFee.toFixed(2)}</span>
                        </div>
                        {/* <div className="flex items-center justify-between">
                          <span>Taxes & fees</span>
                          <span>${taxAmount.toFixed(2)}</span>
                        </div> */}
                        <div className="border-t border-[#E5E7EB] pt-3 flex items-center justify-between text-base font-semibold text-slate-900">
                          <span>Total</span>
                          <span>${totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl sm:rounded-3xl border border-[#D9D9D9] bg-white p-4 sm:p-6">
                      <p className="text-sm font-semibold text-slate-900">
                        Payment method
                      </p>
                      <div className="mt-4 rounded-2xl sm:rounded-3xl border border-[#D9D9D9] bg-[#F8F8F8] px-3 py-3 sm:px-4 sm:py-4">
                        <p className="text-sm text-slate-900">
                          Credit / Debit Card
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          You will be redirected to complete payment.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={stepIndex === 0 || preScreeningSubmitting}
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={completeStep}
                  disabled={!canContinue || preScreeningSubmitting}
                  className="w-full rounded-xl sm:rounded-2xl bg-[#1F8A3D] px-4 py-3 sm:px-6 sm:py-4 text-sm font-semibold text-white transition hover:bg-[#16692d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {preScreeningSubmitting
                    ? "Processing..."
                    : stepIndex === 3
                      ? "Proceed to Payment"
                      : stepIndex === 1
                        ? "Sign & Continue"
                        : "Continue"}
                </button>
              </div>
            </main>
          </div>
        </div>
      </div>
      <BottomBar />
      <CardPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSubmit={handlePaymentSubmit}
        isProcessing={preScreeningSubmitting}
        amount={paymentAmount}
      />
    </div>
  );
};

export default PreScreening;
