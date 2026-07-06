import React, { useEffect, useState } from "react";
import { getRenterBookingHistory } from "../../api/bookingsApi.ts";

export type TransactionStatus = "pending" | "confirmed" | "canceled";

export type TransactionItem = {
    id: string;
    name: string;
    transactionId: string;
    amount: string;
    status: TransactionStatus;
    date: string;
    avatarLetter: string;
    avatarColor: string;
};

const transactionStatusLabel: Record<TransactionStatus, string> = {
    pending: "pending",
    confirmed: "Confirmed",
    canceled: "Canceled",
};

const transactionStatusBadgeClass: Record<TransactionStatus, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200/50",
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
    canceled: "bg-rose-50 text-rose-700 border-rose-200/50",
};

const transactionRowClass =
    "flex items-center justify-between p-5 hover:bg-gray-50/40 transition-colors duration-200 w-full";

const AVATAR_COLORS = ["#F4A4C8", "#8FD99A", "#C4A8F4", "#B8E6C8", "#FFD59A", "#A8E6CF", "#DED2F9"];

const getAvatarColor = (index: number) => {
    return AVATAR_COLORS[index % AVATAR_COLORS.length];
};

const mapStatus = (status?: string, paymentStatus?: string): TransactionStatus => {
    const s = (status || "").toLowerCase();
    const p = (paymentStatus || "").toLowerCase();
    if (s === "complete" || s === "confirmed" || p === "paid" || p === "confirmed") {
        return "confirmed";
    }
    if (s === "canceled" || s === "cancelled" || s === "failed" || p === "failed" || p === "canceled" || p === "cancelled") {
        return "canceled";
    }
    return "pending";
};

const formatAmount = (amount: number, currency: string) => {
    const symbol = currency === "USD" ? "$" : currency || "$";
    return `${symbol} ${Number(amount).toFixed(2)}`;
};

const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
        const dateObj = new Date(dateStr);
        if (isNaN(dateObj.getTime())) return dateStr;

        const day = String(dateObj.getDate()).padStart(2, '0');
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = months[dateObj.getMonth()];
        const year = dateObj.getFullYear();

        let hours = dateObj.getHours();
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const strTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

        return `${day} ${month} ${year} ${strTime}`;
    } catch {
        return dateStr;
    }
};

const TransactionHistory: React.FC = () => {
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getRenterBookingHistory();
            console.log("Renter booking history response:", response);

            const rawTransactions = response?.transactions || response?.data?.transactions || [];

            const mapped: TransactionItem[] = rawTransactions.map((txn: any, index: number) => {
                const title = txn.title || "Booking Transaction";
                const amountVal = txn.amount ?? 0;
                const currencyVal = txn.currency || "USD";

                return {
                    id: txn.id || txn.transactionId || String(index),
                    name: title,
                    transactionId: txn.transactionId || txn.paymentIntentId || "N/A",
                    amount: formatAmount(amountVal, currencyVal),
                    status: mapStatus(txn.status, txn.paymentStatus),
                    date: formatDate(txn.date),
                    avatarLetter: title.charAt(0).toUpperCase() || "B",
                    avatarColor: getAvatarColor(index),
                };
            });

            setTransactions(mapped);
        } catch (err: any) {
            console.error("Failed to fetch renter booking history:", err);
            setError("Failed to load transaction history. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchHistory();
    }, []);

    let content;

    if (loading) {
        content = (
            <div className="flex flex-col items-center justify-center py-20 w-full">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#389131] border-t-transparent" />
                <p className="mt-4 text-sm font-medium text-gray-500">Loading transactions...</p>
            </div>
        );
    } else if (error) {
        content = (
            <div className="flex flex-col items-center justify-center py-10 rounded-2xl border border-red-100 bg-red-50/30 px-6 text-center w-full">
                <div className="p-3 bg-red-100/50 rounded-full text-red-600 mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-red-600">{error}</p>
                <button
                    onClick={() => void fetchHistory()}
                    className="mt-4 rounded-lg bg-[#389131] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#2f7a2a] transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    } else if (transactions.length === 0) {
        content = (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-6 text-center w-full">
                <div className="p-3 bg-gray-100 rounded-full text-gray-400 mb-3">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">No transaction history found</p>
                <p className="text-xs text-gray-400 mt-1 max-w-[280px]">
                    When you make transactions, they will show up here.
                </p>
            </div>
        );
    } else {
        content = (
            <div className="flex flex-col w-full rounded-2xl border border-[#D9D9D9] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden divide-y divide-[#D9D9D9]">
                {transactions.map((txn) => (
                    <div key={txn.id} className={transactionRowClass}>
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                            <span
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[16px] font-bold text-gray-800 shadow-sm"
                                style={{ backgroundColor: txn.avatarColor }}
                            >
                                {txn.avatarLetter}
                            </span>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-[15px] font-semibold text-gray-900 leading-snug truncate">
                                    {txn.name}
                                </h3>
                                <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                                    <span className="font-light">ID:</span>
                                    <span className="font-mono bg-gray-50 px-1.5 py-0.5 rounded text-gray-600 border border-gray-100/50 truncate max-w-[160px] sm:max-w-xs">
                                        {txn.transactionId}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-end text-right ml-4">
                            <span className="text-[16px] font-bold text-gray-900">
                                {txn.amount}
                            </span>
                            <span
                                className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border capitalize leading-none ${transactionStatusBadgeClass[txn.status]}`}
                            >
                                {transactionStatusLabel[txn.status]}
                            </span>
                            <span className="mt-2 text-[10px] font-medium text-gray-400">
                                {txn.date}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div 
            className="w-full min-h-[calc(100vh-160px)] bg-white flex justify-center px-4 py-8 sm:py-12"
            style={{
                boxShadow: "0px 4px 4px 0px rgba(0,0,0,0.25)",
                marginBottom: "10px",
            }}
        >
            <div className="w-full max-w-[640px] flex flex-col">
                <header className="text-center sm:text-left">
                    <h1 className="font-['Lexend'] text-[28px] sm:text-[32px] font-semibold tracking-tight text-gray-900">
                        Transaction History
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        View and track your trailer rental payments and transactions.
                    </p>
                </header>
                <div className="border-t border-[#D9D9D9] my-6 w-full" />
                {content}
            </div>
        </div>
    );
};

export default TransactionHistory;
