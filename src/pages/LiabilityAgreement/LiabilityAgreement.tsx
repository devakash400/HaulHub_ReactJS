import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Download, Upload } from "lucide-react";

type LiabilityAgreementState = {
  title?: string;
  subtitle?: string;
  image?: string;
  totalPrice?: string;
  dates?: string;
  checkIn?: string;
  checkOut?: string;
  identityVerification?: unknown;
  bookingId?: string;
  pdfUrl?: string;
};

const pad2 = (n: number) => String(n).padStart(2, "0");
const makeBookingId = () => {
  const d = new Date();
  return `HH-${pad2(d.getMonth() + 1)}${pad2(d.getDate())}-${Math.floor(
    100000 + Math.random() * 900000,
  )}`;
};

const LiabilityAgreement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LiabilityAgreementState;

  const bookingId = useMemo(
    () => state.bookingId ?? makeBookingId(),
    [state.bookingId],
  );
  const bookDates = useMemo(() => state.dates ?? "—", [state.dates]);
  const pdfUrl = useMemo(
    () => state.pdfUrl ?? "/liability-agreement.pdf",
    [state.pdfUrl],
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const signatureInputRef = useRef<HTMLInputElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureImageUrl, setSignatureImageUrl] = useState<string | null>(
    null,
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSignaturePreviewUrl, setPaymentSignaturePreviewUrl] = useState<
    string | null
  >(null);

  const resizeCanvasToDisplaySize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width === width && canvas.height === height) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
  };

  useEffect(() => {
    resizeCanvasToDisplaySize();
    const onResize = () => resizeCanvasToDisplaySize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const begin = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    resizeCanvasToDisplaySize();
    drawingRef.current = true;
    lastPointRef.current = getPoint(e);
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = getPoint(e);
    const last = lastPointRef.current;
    if (!last) {
      lastPointRef.current = p;
      return;
    }
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPointRef.current = p;
    if (signatureImageUrl) setSignatureImageUrl(null);
    setHasSignature(true);
  };

  const end = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (signatureInputRef.current) signatureInputRef.current.value = "";
    if (signatureImageUrl) URL.revokeObjectURL(signatureImageUrl);
    setSignatureImageUrl(null);
    setHasSignature(false);
  };

  useEffect(() => {
    return () => {
      if (signatureImageUrl) URL.revokeObjectURL(signatureImageUrl);
    };
  }, [signatureImageUrl]);

  const handleSignatureUpload = (file: File | null) => {
    if (!file) return;
    if (signatureImageUrl) URL.revokeObjectURL(signatureImageUrl);
    const url = URL.createObjectURL(file);
    setSignatureImageUrl(url);
    setHasSignature(true);
  };

  const openPdf = () => {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  const downloadPdf = () => {
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = "liability-agreement.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const goNext = () => {
    if (!hasSignature) return;
    if (signatureImageUrl) {
      setPaymentSignaturePreviewUrl(signatureImageUrl);
    } else {
      const canvas = canvasRef.current;
      setPaymentSignaturePreviewUrl(
        canvas ? canvas.toDataURL("image/png") : null,
      );
    }
    setShowPaymentModal(true);
  };

  const handleMakePayment = () => {
    navigate("/payment-receipt", {
      state: {
        ...state,
        bookingId,
        liabilityAgreementSigned: true,
      },
    });
  };

  return (
    <div className="min-h-screen bg-white w-full min-w-0 overflow-x-hidden">
      <div className="max-w-3xl mx-auto w-full">
        <header className="relative py-6 border-b border-gray-200">
          <h1 className="text-xl sm:text-2xl font-bold text-black text-center">
            Liability Agreement
          </h1>
        </header>

        <main className="px-4 sm:px-6 py-6 space-y-6">
          <section className="border border-gray-200 shadow-sm bg-white rounded-sm p-4">
            <p className="text-sm text-gray-900 font-medium">
              Booking ID :{" "}
              <span className="font-semibold text-gray-900"># {bookingId}</span>
            </p>
            <p className="text-sm text-gray-900 font-medium mt-1">
              Book Dates : <span className="font-semibold">{bookDates}</span>
            </p>
          </section>

          <section className="border border-gray-200 shadow-sm bg-white rounded-sm p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-md bg-red-50 border border-red-100 flex items-center justify-center">
                <span className="text-xs font-bold text-red-600">PDF</span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-gray-900">
                  Liability Document
                </h2>
                <p className="text-xs text-gray-600 mt-1">
                  Please review the complete agreement before signing.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={openPdf}
                className="w-full border border-gray-300 bg-white text-gray-900 py-3 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Open PDF
              </button>
              <button
                type="button"
                onClick={downloadPdf}
                className="w-full bg-[#389131] text-white py-3 rounded-md text-sm font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90"
              >
                <Download className="w-4 h-4" aria-hidden />
                Download PDF
              </button>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">
              Digital Signature
            </h3>
            <p className="text-xs text-gray-600">
              Please sign below using your finger, or upload a signature image.
            </p>
            <input
              ref={signatureInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                handleSignatureUpload(e.target.files?.[0] ?? null)
              }
            />
            <button
              type="button"
              onClick={() => signatureInputRef.current?.click()}
              className="w-full border border-gray-300 bg-white text-gray-900 py-3 rounded-md text-sm font-medium hover:bg-gray-50 inline-flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" aria-hidden />
              Upload Signature
            </button>
            <div className="border border-gray-200 rounded-md bg-white h-40">
              {signatureImageUrl ? (
                <img
                  src={signatureImageUrl}
                  alt="Uploaded signature"
                  className="w-full h-full object-contain"
                />
              ) : (
                <canvas
                  ref={canvasRef}
                  className="w-full h-full touch-none"
                  onPointerDown={begin}
                  onPointerMove={move}
                  onPointerUp={end}
                  onPointerCancel={end}
                  onPointerLeave={end}
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={clear}
                className="w-full border border-gray-300 bg-white text-gray-900 py-3 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!hasSignature}
                aria-disabled={!hasSignature}
                className={`w-full py-3 rounded-md text-sm font-semibold transition-opacity text-white`}
                style={{
                  backgroundColor: !hasSignature ? "#929191" : "#389131",
                  cursor: !hasSignature ? "not-allowed" : "pointer",
                }}
              >
                Next
              </button>
            </div>
          </section>
        </main>
      </div>

      {showPaymentModal && (
        <div
          className="modal-overlay fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 text-center">
                Liability Agreement
              </h2>
              <div className="mt-5 border border-gray-200 rounded-md p-4">
                <p className="text-sm text-gray-900 font-medium">
                  Booking ID :{" "}
                  <span className="font-semibold text-gray-900">
                    # {bookingId}
                  </span>
                </p>
                <p className="text-sm text-gray-900 font-medium mt-1">
                  Book Dates :{" "}
                  <span className="font-semibold">{bookDates}</span>
                </p>
              </div>

              <div className="mt-5">
                <h3 className="text-sm font-semibold text-gray-900">
                  Digital Signature
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Please sign below using your finger.
                </p>
                <div className="mt-3 border border-gray-200 rounded-md bg-white h-36 flex items-center justify-center">
                  {paymentSignaturePreviewUrl ? (
                    <img
                      src={paymentSignaturePreviewUrl}
                      alt="Signature preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">No signature</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleMakePayment}
                className="mt-6 w-full bg-[#389131] text-white py-3 rounded-md text-sm font-semibold hover:opacity-90"
              >
                Make Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiabilityAgreement;
