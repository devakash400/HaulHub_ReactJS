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
      className="flex flex-wrap md:flex-nowrap items-start
     justify-center md:justify-between w-full md:w-[682px] ml-0 mr-auto px-0 gap-6 md:gap-0"
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

        const renderLabel = [
          "Commercial Grade Strength",
          "Maximum Towing Stability",
          "Enhanced Road Stability",
        ].includes(displayText) ? (
          <>
            {displayWords[0]}
            <br />
            {displayWords.slice(1).join(" ")}
          </>
        ) : (
          displayText
        );

        return (
          <div
            key={label}
            className="flex flex-col items-center
             text-center w-[45%] md:w-auto pb-8 md:pb-[100px]"
          >
            <img
              src={iconSrc}
              alt={displayText}
              className={`w-[50px] md:w-[62px] h-[60px] md:h-[74px] object-contain mb-3 mx-auto ${
                isSecondIcon ? "scale-110" : ""
              }`}
            />

            <p
              className="text-[16px] md:text-[24px]"
              style={{
                fontFamily: "Lexend",
                fontWeight: 400,
                lineHeight: "100%",
                letterSpacing: "0%",
                color: "#000000",
                verticalAlign: "middle",
                margin: 0,
                textAlign: "center",
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
