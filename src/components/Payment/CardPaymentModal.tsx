import React, { useState } from 'react';

interface CardPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cardData: { cardNumber: string; expMonth: number; expYear: number; cvc: string }) => void;
  isProcessing: boolean;
  amount: number;
}

const CardPaymentModal: React.FC<CardPaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isProcessing,
  amount
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      cardNumber: cardNumber.replace(/\s+/g, ''),
      expMonth: parseInt(expMonth, 10),
      expYear: parseInt(expYear, 10),
      cvc
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Payment Details</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Card Number</label>
            <input
              type="text"
              required
              maxLength={19}
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="0000 0000 0000 0000"
              className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 focus:border-[#1F8A3D] focus:outline-none focus:ring-1 focus:ring-[#1F8A3D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Expiration Date</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value)}
                  placeholder="MM"
                  className="w-full rounded-xl border border-slate-300 p-3 text-center text-slate-900 focus:border-[#1F8A3D] focus:outline-none focus:ring-1 focus:ring-[#1F8A3D]"
                />
                <span className="text-slate-500">/</span>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value)}
                  placeholder="YYYY"
                  className="w-full rounded-xl border border-slate-300 p-3 text-center text-slate-900 focus:border-[#1F8A3D] focus:outline-none focus:ring-1 focus:ring-[#1F8A3D]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">CVC</label>
              <input
                type="text"
                required
                maxLength={4}
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="123"
                className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 focus:border-[#1F8A3D] focus:outline-none focus:ring-1 focus:ring-[#1F8A3D]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="mt-6 w-full rounded-xl bg-[#1F8A3D] p-4 text-sm font-semibold text-white transition hover:bg-[#16692d] disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CardPaymentModal;
