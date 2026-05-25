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
  road: traction,
};

type FeatureIconsSectionProps = {
  features: Feature[];
};

export const FeatureIconsSection: React.FC<FeatureIconsSectionProps> = ({
  features,
}) => {
  return (
    <section
      className="grid grid-cols-1 md:
    grid-cols-3 gap-5 text-center justify-items-center"
    >
      {features.map(({ icon, label }, index) => {
        const iconSrc = iconMap[icon];
        const isSecondIcon = index === 1;
        const displayText =
          label === "Foldable loading ramps"
            ? "Commercial Grade Strength"
            : label === "Tandem dual wheels" || label === "Tandem dual only"
              ? "Maximum Towing Stability"
              : label === "Reinforced steel chassis"
                ? "Enhanced Road Stability"
                : label;
        const displayWords = displayText.split(" ");
        const renderLabel =
          [
            "Commercial Grade Strength",
            "Maximum Towing Stability",
            "Enhanced Road Stability",
          ].includes(displayText) && displayWords.length > 1 ? (
            <>
              {displayWords[0]}
              <br />
              {displayWords.slice(1).join(" ")}
            </>
          ) : (
            displayText
          );
        return (
          <div key={label}>
            <img
              src={iconSrc}
              alt={displayText}
              className={`w-[62px] h-[74px] mx-auto mb-3 object-contain ${isSecondIcon ? "scale-110" : ""}`}
            />
            <p
              className="text-black font-normal leading-[100%]"
              style={{
                fontFamily: "Lexend",
                fontSize: "24px",
                fontStyle: "normal",
                letterSpacing: "0%",
                verticalAlign: "middle",
                marginLeft: index === 0 ? "2px" : undefined,
              }}
            >
              {renderLabel}
            </p>
          </div>
        );
      })}
    </section>
  );
};
