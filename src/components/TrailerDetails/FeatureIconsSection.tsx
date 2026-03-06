import React from "react";
import dexterityIcon from "../../assets/icons/dexterity-icon.png";
import towingIcon from "../../assets/icons/towing-service-icon.png";
import traction from "../../assets/icons/traction-control-icon.png";



type Feature = {
  icon: "commercial" | "towing" | "road";
  label: string;
};

const iconMap: Record<Feature["icon"], string> = {
  commercial: dexterityIcon,
  towing: towingIcon,
  road: traction
};

type FeatureIconsSectionProps = {
  features: Feature[];
};

export const FeatureIconsSection: React.FC<FeatureIconsSectionProps> = ({
  features,
}) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-5 text-center">
      {features.map(({ icon, label }, index) => {
        const iconSrc = iconMap[icon];
        const isSecondIcon = index === 1;
        return (
          <div key={label}>
            <img
              src={iconSrc}
              alt={label}
              className={`w-[62px] h-[74px] mx-auto mb-3 object-contain ${isSecondIcon ? "scale-110" : ""}`}
            />
            <p className="text-sm font-medium text-gray-800">{label}</p>
          </div>
        );
      })}
    </section>
  );
};

