import React from "react";

const PaymentTerms: React.FC = () => {
  return (
    <main className="h-full bg-white text-black px-4 py-8 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold mb-4">Payment Terms & Conditions</h1>
        <p className="mb-6 text-gray-700">
          These Payment Terms & Conditions govern all financial transactions, payments, and billing activities conducted through HaulHub. By initiating a payment or booking a service on our platform, you agree to these terms.
        </p>
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              1. Pricing and Currency
            </h2>
            <p className="text-gray-700">
              All rates, fees, and charges displayed on the platform are in the specified local currency and are subject to change based on service requirements, peak hours, or distance before a booking is confirmed.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">
              2. Payment Methods
            </h2>
            <p className="text-gray-700">
              We accept payments through approved credit cards, debit cards, net banking, and integrated third-party digital wallets. By providing payment information, you authorize HaulHub to charge the specified amount for your bookings.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">3. Billing and Invoices</h2>
            <p className="text-gray-700">
              An electronic invoice or receipt will be generated and sent to your registered email address or account dashboard immediately upon the successful completion of a transaction.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">4. Cancellation and Refunds</h2>
            <p className="text-gray-700">
              <strong>User Cancellations:</strong> Refunds for cancelled bookings are subject to our standard cancellation window. Cancellations made outside this window may incur a processing fee.
              <br /><br />
              <strong>Service Failures:</strong> If a service cannot be completed due to a fault on our end, a full refund will be processed back to your original payment method within 5–7 business days.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">5. Failed Transactions and Chargebacks</h2>
            <p className="text-gray-700">
              In the event of a failed transaction where funds are deducted from your account but not received by HaulHub, the amount is typically reversed by your bank. Any fraudulent chargeback claims will result in immediate account suspension.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default PaymentTerms;
