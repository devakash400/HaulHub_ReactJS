import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <main className="min-h-screen bg-white text-black px-4 py-8 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold mb-4">Privacy Policy</h1>
        <p className="mb-6 text-gray-700">
          HaulHub is committed to protecting your personal information. This
          Privacy Policy explains what data we collect, how we use it, and how
          we keep it safe.
        </p>
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              1. Information We Collect
            </h2>
            <p className="text-gray-700">
              We collect information you provide directly, such as your name,
              email, phone number, and payment details.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">
              2. How We Use Your Data
            </h2>
            <p className="text-gray-700">
              We use your data to provide, improve, and personalize the service,
              to support customer service, and to comply with legal obligations.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">3. Data Sharing</h2>
            <p className="text-gray-700">
              We do not sell your personal information. We may share data with
              service providers, partners, or authorities when required.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">4. Security</h2>
            <p className="text-gray-700">
              We employ technical and organizational measures to help protect
              your data from unauthorized access and misuse.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">
              5. Changes to This Policy
            </h2>
            <p className="text-gray-700">
              We may update this Privacy Policy, and we will post the revised
              version on this page.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
