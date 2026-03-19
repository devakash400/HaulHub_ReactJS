import React from "react";
import cancellationPolicyIcon from "../../assets/icons/Cancellation policy .png";
import rentalProtectionIcon from "../../assets/icons/Rental Protection.png";
import trustSafetyIcon from "../../assets/icons/Trust & Safety.png";

const policies = [
  {
    icon: cancellationPolicyIcon,
    title: "Cancellation policy",
    description:
      "Free cancellation up to 24 hours before your rental start. Late cancellations may incur a fee.",
  },
  {
    icon: rentalProtectionIcon,
    title: "Rental Protection",
    description:
      "Every rental is covered by our protection plan. Damage and liability coverage included for your peace of mind.",
  },
  {
    icon: trustSafetyIcon,
    title: "Trust & Safety",
    description:
      "Verified listings and secure payments. We verify trailer condition and owner identity for a safe marketplace.",
  },
];

export const PolicySection: React.FC = () => {
  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-white py-3 md:py-4 shadow-[0_6px_18px_rgba(15,23,42,0.12)]">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {policies.map(({ icon, title, description }) => (
            <div key={title} className="flex flex-col items-start">
              <img
                src={icon}
                alt={title}
                className="w-8 h-8 mb-4 object-contain"
              />
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

