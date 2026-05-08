import React from "react";
import cancellationPolicyIcon from "../../assets/icons/Cancellation policy .png";
import rentalProtectionIcon from "../../assets/icons/Rental Protection.png";
import trustSafetyIcon from "../../assets/icons/Trust & Safety.png";

const policies = [
  {
    icon: cancellationPolicyIcon,
    title: "Cancellation policy",
    description:
      "Cancel before pickup on April 17 for a partial refund. Review the owner’s full cancellation policy for complete details.",
  },
  {
    icon: rentalProtectionIcon,
    title: "Rental Protection",
    description:
      "Every booking is protection through identity verification , secure payment and security deposit safeguards and rental experience",
  },
  {
    icon: trustSafetyIcon,
    title: "Trust & Safety",
    description:
      "At HaulHub, your safety comes first. All booking follow verified policy secure protection measure for complete details.",
  },
];

export const PolicySection: React.FC = () => {
  return (
    <section
      className="
    relative
    left-1/2 right-1/2
    -ml-[50vw] -mr-[50vw]
    w-screen

    bg-[#FFFFFF]
    border-t border-b border-[#D9D9D9]
    shadow-[0px_4px_4px_0px_#00000040]

    px-6 py-5
    mb-0
  "
    >
      <div
        className="
      max-w-[1200px]
      mx-auto
      grid grid-cols-1 md:grid-cols-3
      gap-y-8 md:gap-x-16
    "
      >
        {policies.map(({ icon, title, description }) => (
          <div key={title} className="flex flex-col items-start">
            <img
              src={icon}
              alt={title}
              className="
            w-[34px] h-[34px]
            object-contain
            mb-3
          "
            />

            <h3
              className="
            text-[16px]
            font-semibold
            text-[#222]
            leading-none
            mb-2
          "
            >
              {title}
            </h3>

            <p
              className="
            text-[12px]
            leading-[1.45]
            text-[#555]
            max-w-[260px]
            m-0
          "
            >
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
