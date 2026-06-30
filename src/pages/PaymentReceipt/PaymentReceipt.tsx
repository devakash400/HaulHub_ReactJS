import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getBookingById } from "../../api/bookingsApi.ts";

type PaymentReceiptState = {
  bookingId?: string;
  dates?: string;
  totalPrice?: string;
  rentalFee?: number;
  identityVerification?: unknown;
  liabilityAgreementSigned?: boolean;
};

const formatPaidOn = (d: Date) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[d.getMonth()]} ${d.getDate()},${d.getFullYear()}`;
};

const asMoney = (value?: string) => {
  if (!value) return 20;
  const n = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 20;
};

const PaymentReceipt: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as PaymentReceiptState;

  const searchParams = new URLSearchParams(location.search);
  const queryBookingId = searchParams.get("bookingId");
  const bookingId = state.bookingId || queryBookingId;

  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;
      try {
        const response = await getBookingById(bookingId);
        if (response?.success && response?.data) {
          setBookingDetails(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch booking details:", err);
      }
    };
    void fetchBooking();
  }, [bookingId]);

  const paidOn = useMemo(() => formatPaidOn(new Date()), []);
  
  const displayDates = useMemo(() => {
    if (bookingDetails?.startDate && bookingDetails?.endDate) {
      const start = new Date(bookingDetails.startDate);
      const end = new Date(bookingDetails.endDate);
      const startStr = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      const endStr = `${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      return `${startStr} - ${endStr}`.toUpperCase();
    }
    return state.dates ?? "FEBRUARY 18-MARCH 18,2026";
  }, [bookingDetails, state.dates]);

  const { subtotal, tax, totalDue, amountPay } = useMemo(() => {
    let numericPrice = 20;
    
    if (bookingDetails?.totalPrice != null) {
      numericPrice = Number(bookingDetails.totalPrice);
    } else if (state.rentalFee != null) {
      numericPrice = Number(state.rentalFee);
    } else if (state.totalPrice) {
      numericPrice = asMoney(state.totalPrice);
    }

    const calculatedTax = Number((numericPrice * 0.18).toFixed(2));
    const calculatedTotal = Number((numericPrice + calculatedTax).toFixed(2));
    const finalPay = Number((calculatedTotal - 3).toFixed(2));

    return {
      subtotal: numericPrice,
      tax: calculatedTax,
      totalDue: calculatedTotal,
      amountPay: finalPay
    };
  }, [bookingDetails, state]);

  const handleContinue = () => {
    navigate("/request-to-book", {
      state: {
        ...state,
        paymentCompleted: true,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#faf7f0] w-full min-w-0 overflow-x-hidden">
      <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="bg-white rounded-xl border border-gray-900/70 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-center text-xl sm:text-2xl font-semibold text-gray-900">
              Paid on {paidOn}
            </h1>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs font-semibold tracking-wider text-gray-900">
                  SUMMARY
                </p>
                <div className="mt-2 border border-gray-200 rounded-md p-3">
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-900">
                    <div className="text-gray-600">To</div>
                    <div className="col-span-2 font-medium">John</div>
                    <div className="text-gray-600">From</div>
                    <div className="col-span-2 font-medium">Cursor</div>
                    <div className="text-gray-600">Invoice</div>
                    <div className="col-span-2 font-medium">#****-***-****</div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-wider text-gray-900">
                  ITEMS
                </p>
                <div className="mt-2 border border-gray-200 rounded-md">
                  <div className="p-3 border-b border-gray-200 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-gray-900 uppercase">
                        {displayDates}
                      </p>
                      <p className="text-xs text-gray-900 mt-1">HaulHub Rental</p>
                      <p className="text-xs text-gray-600">Qty 1</p>
                      {bookingId && (
                        <p className="text-[11px] text-gray-600 mt-1">
                          Booking: #{bookingId}
                        </p>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      ${subtotal.toFixed(2)}
                    </div>
                  </div>

                  <div className="p-3 border-b border-gray-200 flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-900 uppercase">
                      Subtotal
                    </span>
                    <span className="font-semibold text-gray-900">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3 space-y-2 text-xs text-gray-900">
                    <div className="flex items-center justify-between border border-gray-200 rounded-md p-2">
                      <span>Total excluding tax</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between border border-gray-200 rounded-md p-2">
                      <span>GST - Usa (18%)</span>
                      <span className="font-semibold">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between border border-gray-200 rounded-md p-2">
                      <span>Total due</span>
                      <span className="font-semibold">${totalDue.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between border border-gray-200 rounded-md p-2">
                      <span>Amount pay</span>
                      <span className="font-semibold">${amountPay.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className="mt-8 w-full bg-[#389131] text-white py-3.5 rounded-md text-sm font-semibold hover:opacity-90"
        >
          Continue
        </button>
      </main>
    </div>
  );
};

export default PaymentReceipt;

