import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Navbar from "../../../src/components/Navbar/Navbar.tsx";
import BottomBar from "../../components/BottomBar/BottomBar.tsx";
import {
  completePreScreening,
  getPreScreeningStatus,
} from "../../../src/api/preScreeningApi.ts";

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
  const [canvasReady, setCanvasReady] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    setCanvasReady(true);
  }, []);

  const getPointerPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawingRef.current = true;
    lastPoint.current = getPointerPoint(e);
    canvas.setPointerCapture(e.pointerId);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const point = getPointerPoint(e);
    const last = lastPoint.current;
    if (!last) {
      lastPoint.current = point;
      return;
    }
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPoint.current = point;
    setHasSignature(true);
  };

  const endDrawing = () => {
    drawingRef.current = false;
    lastPoint.current = null;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSignatureImage(null);
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

  useEffect(() => {
    const fetchPreScreeningStatus = async () => {
      const id = state.bookingId ?? bookingId;
      if (!id) return;

      try {
        const response = await getPreScreeningStatus(id);
        if (response?.success && response.data) {
          const { identityVerified, licenseVerified, agreementConfirmed } =
            response.data;

          if (identityVerified && licenseVerified && agreementConfirmed) {
            setCheckedItems(checklistItems.map(() => true));
            setLiabilityAccepted(true);
            setStep0Error("");
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

  const submitPreScreening = async () => {
    const id = state.bookingId ?? bookingId;
    const payload = {
      identityVerified: Boolean(checkedItems[0]),
      licenseVerified: Boolean(checkedItems[1]),
      agreementConfirmed: Boolean(liabilityAccepted),
    };

    try {
      setPreScreeningSubmitting(true);
      setApiError("");
      console.log("📤 Calling API with:", {
        endpoint: `/api/pre-screening/${id}/complete`,
        payload,
      });
      const response = await completePreScreening(id, payload);
      console.log("✅ API Response:", response);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("❌ PreScreening submission error:", err);
      setApiError(
        "Error submitting pre-screening. Please check your internet connection and try again.",
      );
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
      // submit pre-screening to backend before moving to photos
      console.log("Submitting pre-screening with payload:", {
        identityVerified: Boolean(checkedItems[0]),
        licenseVerified: Boolean(checkedItems[1]),
        agreementConfirmed: Boolean(liabilityAccepted),
        bookingId: state.bookingId ?? bookingId,
      });
      await submitPreScreening();
      if (!apiError) {
        setStepIndex(2);
      }
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
      setStepIndex(3);
      return;
    }
    if (stepIndex === 3) {
      navigate("/payment-receipt", {
        state: {
          ...state,
          bookingId,
          dates: state.dates,
          totalPrice: state.totalPrice,
          liabilityAgreementSigned: true,
        },
      });
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
    <div className="min-h-screen bg-[#F3F7FB]">
      <Navbar />
      <div className="pt-[96px] pb-10">
        <div className="w-full px-0 py-10">
          <div
            className="overflow-hidden rounded-[32px]

           shadow-[0_24px_120px_rgba(15,23,42,0.08)]"
          >
            <div className="bg-white px-6 py-8 sm:px-8 sm:py-10">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#1F8A3D]">
                  Pre-Screening
                </p>
                <h1 className="text-3xl font-semibold text-slate-900">
                  Ready to complete your booking
                </h1>
                <p className="max-w-3xl text-sm text-slate-600">
                  Confirm your identity, license, and liability agreement before
                  moving to the trailer review.
                </p>
              </div>
            </div>
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-6 sm:px-8">
              <div className="flex items-center gap-4 sm:gap-6">
                {stepDefinitions.map((step, index) => {
                  const completed = index < stepIndex;
                  const current = index === stepIndex;
                  return (
                    <React.Fragment key={step.label}>
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full border text-sm font-semibold ${
                            completed
                              ? "bg-[#1F8A3D] text-white border-[#1F8A3D]"
                              : current
                                ? "bg-white text-slate-900 border-slate-300"
                                : "bg-white text-slate-500 border-slate-200"
                          }`}
                        >
                          {completed ? "✓" : index + 1}
                        </div>
                        <p
                          className={`text-xs font-semibold uppercase tracking-[0.22em] ${
                            completed || current
                              ? "text-slate-900"
                              : "text-slate-500"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                      {index < stepDefinitions.length - 1 && (
                        <div
                          className={`h-[2px] flex-1 rounded-full ${
                            index < stepIndex ? "bg-[#1F8A3D]" : "bg-slate-300"
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            <main className="px-6 py-10 sm:px-10 sm:py-10">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 shadow-sm">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1F8A3D]">
                    {currentStep.label}
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900">
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
                            className={`group flex cursor-pointer flex-col rounded-[28px] border bg-white p-5 shadow-sm transition hover:border-[#1F8A3D] ${
                              showError ? "border-red-300" : "border-slate-200"
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
                    <div className="rounded-3xl border border-[#D9D9D9] bg-white p-6">
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

                    <div className="rounded-3xl border border-[#D9D9D9] bg-white p-6">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              Signature
                            </p>
                            <p className="text-sm text-slate-500">
                              Draw your signature below.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={clearSignature}
                            className="rounded-full border border-[#D9D9D9] px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            Clear
                          </button>
                        </div>

                        <div className="h-[200px] rounded-[24px] border border-[#D9D9D9] bg-[#F8F8F8] overflow-hidden">
                          <canvas
                            ref={canvasRef}
                            className="w-full h-full"
                            onPointerDown={startDrawing}
                            onPointerMove={draw}
                            onPointerUp={endDrawing}
                            onPointerCancel={endDrawing}
                            onPointerLeave={endDrawing}
                          />
                        </div>

                        <label className="inline-flex items-center gap-3 rounded-2xl border border-[#D9D9D9] bg-white px-4 py-3">
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
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {photoItems.map((photo) => (
                        <div
                          key={photo.title}
                          className="rounded-3xl overflow-hidden border border-[#D9D9D9] bg-white"
                        >
                          <img
                            src={photo.src}
                            alt={photo.title}
                            className="h-48 w-full object-cover"
                          />
                          <div className="p-4">
                            <p className="text-sm font-semibold text-slate-900">
                              {photo.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <label className="inline-flex items-start gap-3 rounded-2xl border border-[#D9D9D9] bg-white px-4 py-4">
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
                    <div className="grid gap-4 rounded-3xl border border-[#D9D9D9] bg-white p-6 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-slate-500">Booking ID</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">
                          {bookingId}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Rental Dates</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">
                          {state.dates ?? "TBA"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-[#D9D9D9] bg-white p-6">
                      <p className="text-sm font-semibold text-slate-900">
                        Payment overview
                      </p>
                      <div className="mt-4 space-y-3 text-sm text-slate-600">
                        <div className="flex items-center justify-between">
                          <span>Rental fee</span>
                          <span>{state.totalPrice ?? "$20.00"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Taxes & fees</span>
                          <span>{state.totalPrice ? "$3.60" : "$2.00"}</span>
                        </div>
                        <div className="border-t border-[#E5E7EB] pt-3 flex items-center justify-between text-base font-semibold text-slate-900">
                          <span>Total</span>
                          <span>{state.totalPrice ?? "$22.00"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-[#D9D9D9] bg-white p-6">
                      <p className="text-sm font-semibold text-slate-900">
                        Payment method
                      </p>
                      <div className="mt-4 rounded-3xl border border-[#D9D9D9] bg-[#F8F8F8] px-4 py-4">
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
                  className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={completeStep}
                  disabled={!canContinue || preScreeningSubmitting}
                  className="w-full rounded-2xl bg-[#1F8A3D] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#16692d] disabled:cursor-not-allowed disabled:opacity-50"
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
    </div>
  );
};

export default PreScreening;
