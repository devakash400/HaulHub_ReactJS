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

const transactionStatusClass: Record<TransactionStatus, string> = {
    pending: "text-[#E67E22]",
    confirmed: "text-[#389131]",
    canceled: "text-[#E74C3C]",
};

const transactionCardClass =
    "flex min-h-[71px] w-full max-w-[593px] items-center justify-between rounded-[2px] border border-[#D9D9D9] bg-white px-5 py-4 lg:w-[593px]";

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

    if (loading) {
        return (
            <div className="mt-6 flex flex-col items-center justify-center py-10 w-full max-w-[593px]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#389131] border-t-transparent" />
                <p className="mt-2 text-sm text-black/60">Loading transactions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-6 flex flex-col items-center justify-center py-10 rounded-[2px] border border-[#E74C3C]/20 bg-[#E74C3C]/5 px-4 text-center w-full max-w-[593px]">
                <p className="text-sm font-medium text-[#E74C3C]">{error}</p>
                <button
                    onClick={() => void fetchHistory()}
                    className="mt-3 rounded-[4px] bg-[#389131] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2f7a2a]"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="mt-6 flex flex-col items-center justify-center py-10 rounded-[2px] border border-dashed border-gray-300 bg-gray-50 px-4 w-full max-w-[593px]">
                <p className="text-sm font-medium text-black/70">No transaction history found</p>
                <p className="text-xs text-black/50 mt-1">When you make transactions, they will show up here.</p>
            </div>
        );
    }

    return (
        <div className="mt-6 flex flex-col gap-5">
            {transactions.map((txn) => (
                <div key={txn.id} className={transactionCardClass}>
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                        <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[16px] font-semibold text-black"
                            style={{ backgroundColor: txn.avatarColor }}
                        >
                            {txn.avatarLetter}
                        </span>
                        <div className="min-w-0">
                            <p className="text-[14px] font-medium leading-[100%] text-black">
                                {txn.name}
                            </p>
                            <p className="mt-[6px] text-[11px] font-light leading-[100%] text-black/70">
                                Transaction ID
                            </p>
                            <p className="mt-[2px] truncate text-[11px] font-light leading-[100%] text-black">
                                {txn.transactionId}
                            </p>
                        </div>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-[14px] font-medium leading-[100%] text-black">
                            {txn.amount}
                        </p>
                        <p
                            className={`mt-[6px] text-[12px] font-medium capitalize leading-[100%] ${transactionStatusClass[txn.status]}`}
                        >
                            {transactionStatusLabel[txn.status]}
                        </p>
                        <p className="mt-[6px] text-[11px] font-light leading-[100%] text-black/70">
                            {txn.date}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TransactionHistory;
