import React from "react";

const Terms: React.FC = () => {
  return (
    <main className="h-full bg-white text-black px-4 py-8 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold mb-4">Terms & Conditions</h1>
        <p className="mb-6 text-gray-700">
          Welcome to HaulHub. These Terms & Conditions govern your use of our
          website, mobile applications, and related services. By accessing or
          using our services, you agree to be bound by these terms.
        </p>
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700">
              You must agree to these Terms to use our services. If you do not
              agree, please do not use the platform.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">
              2. Account Responsibilities
            </h2>
            <p className="text-gray-700">
              You are responsible for keeping your account information accurate
              and keeping your login credentials confidential.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">3. Payment and Fees</h2>
            <p className="text-gray-700">
              All booking payments, refunds, and cancellations are subject to
              the terms outlined in the booking policies and any applicable
              fees.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">4. User Conduct</h2>
            <p className="text-gray-700">
              Users must follow all applicable laws and treat others
              respectfully.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">5. Changes to Terms</h2>
            <p className="text-gray-700">
              We may update these Terms from time to time. Continued use of the
              service after changes means you accept the updated Terms.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Terms;
