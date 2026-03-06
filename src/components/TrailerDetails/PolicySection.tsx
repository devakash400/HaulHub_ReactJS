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
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
      {policies.map(({ icon, title, description }) => (
        <div key={title}>
          <img
            src={icon}
            alt={title}
            className="w-8 h-8 text-gray-800 mb-4 object-contain"
          />
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
      ))}
    </section>
  );
};

