import React, { useEffect, useRef, useState } from "react";
import guestFavouriteIcon from "../../assets/icons/Guest-Favourite.png";
import overallRatingIcon from "../../assets/icons/Overall rating.png";
import clientCoordinationIcon from "../../assets/icons/Client Coordination.png";
import structuralIntegrityIcon from "../../assets/icons/Structural Integrity.png";
import accessibilityIcon from "../../assets/icons/Accessibility.png";
import CostefficiencyIcon from "../../assets/icons/Cost Efficiency .png";

import {
  BarChart3,
  Users,
  Building2,
  DollarSign,
  Accessibility,
} from "lucide-react";

type Metric = {
  label: string;
  score: number;
  icon: "communication" | "integrity" | "cost" | "accessibility";
};

type GuestFavouriteSectionProps = {
  rating: number;
  title?: string;
  description: string;
  metrics: Metric[];
  ratingBreakdown?: Record<number, number>;
};

const iconMap = {
  communication: Users,
  integrity: Building2,
  cost: DollarSign,
  accessibility: Accessibility,
};

const metricPngIconByLabel: Record<string, string> = {
  "Overall rating": overallRatingIcon,
  "Client Coordination": clientCoordinationIcon,
  "Structural Integrity": structuralIntegrityIcon,
  "Cost Efficiency": CostefficiencyIcon,
  Accessibility: accessibilityIcon,
};

export const GuestFavouriteSection: React.FC<GuestFavouriteSectionProps> = ({
  rating,
  title = "Guest Favourite",
  description,
  metrics,
  ratingBreakdown,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const target = sectionRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const durationMs = 900;
    const start = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const next = Math.min(elapsed / durationMs, 1);
      setProgress(next);
      if (next < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isInView]);

  const animatedScore = (score: number) => {
    const decimals = String(score).includes(".")
      ? Math.min((String(score).split(".")[1] || "").length, 2)
      : 0;
    return (score * progress).toFixed(decimals);
  };

  const allMetrics = [
    { label: "Overall rating", score: rating, icon: "communication" as const },
    ...metrics,
  ];
  const iconByLabel: Record<
    string,
    React.ComponentType<{ className?: string }>
  > = {
    "Overall rating": BarChart3,
    "Client Coordination": Users,
    "Structural Integrity": Building2,
    "Cost Efficiency": DollarSign,
    Accessibility: Accessibility,
  };

  return (
    <section
      ref={sectionRef}
      className="
    mt-4
    text-center
    bg-white
    py-10
    w-[calc(100%+32px)] sm:w-[calc(100%+48px)] lg:w-[calc(100%+64px)]
    -mx-4 sm:-mx-6 lg:-mx-8
    shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
  "
    >
      <div className="mx-auto relative flex items-center justify-center w-[242px] h-[242px]">
        <img
          src={guestFavouriteIcon}
          alt="Guest favourite rating wreath"
          className={`w-full h-full mt-10 object-contain transition-all 
      duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
        isInView
          ? "opacity-100 scale-100 rotate-0"
          : "opacity-0 scale-75 -rotate-6"
      }`}
        />

        <span
          className={`absolute text-black transition-all duration-700 delay-150 ${
            isInView ? "opacity-100 scale-100" : "opacity-0 scale-75"
          }`}
          style={{
            fontFamily: "Lexend",
            fontWeight: 400,
            fontSize: "74px",
            fontStyle: "normal",
            lineHeight: "100%",
            letterSpacing: "0%",
            verticalAlign: "middle",
          }}
        >
          {animatedScore(rating)}
        </span>
      </div>
      <h2
        className={`text-center text-black transition-all duration-700 delay-200 ${
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
        style={{
          fontFamily: "Lexend",
          fontWeight: 500,
          fontSize: "32px",
          fontStyle: "normal",
          lineHeight: "100%",
          letterSpacing: "0%",
          verticalAlign: "middle",
          textAlign: "center",
        }}
      >
        {title}
      </h2>
      <p
        className={`max-w-2xl mx-auto text-center text-black transition-all duration-700 delay-300 ${
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
        style={{
          fontFamily: "Lexend",
          fontWeight: 400,
          fontSize: "19px",
          fontStyle: "normal",
          lineHeight: "100%",
          letterSpacing: "0%",
          verticalAlign: "middle",
        }}
      >
        {description}
      </p>
      {/* <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
        {allMetrics.slice(0, 5).map((m) => {
          const isOverallRating = m.label === "Overall rating";
          const showRatingBars =
            isOverallRating &&
            ratingBreakdown &&
            Object.keys(ratingBreakdown).length > 0;
          const pngIcon = showRatingBars
            ? undefined
            : metricPngIconByLabel[m.label];
          const Icon =
            iconByLabel[m.label] || iconMap[m.icon as keyof typeof iconMap];
          const maxCount = showRatingBars
            ? Math.max(...Object.values(ratingBreakdown))
            : 1;
          return (
            <div
              key={m.label}
              className={`bg-background rounded-xl border border-gray-200 p-4 shadow-sm text-center transition-all duration-700 ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-3"
              }`}
              style={{
                transitionDelay: `${60 * (allMetrics.indexOf(m) + 1)}ms`,
              }}
            >
              <p className="text-xs font-bold text-gray-700 mb-1 capitalize">
                {m.label}
              </p>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                {animatedScore(m.score)}
              </p>
              {showRatingBars ? (
                <div className="flex flex-col gap-0.5 text-left">
                  {([5, 4, 3, 2, 1] as const).map((star) => {
                    const count = ratingBreakdown[star] ?? 0;
                    const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    return (
                      <div
                        key={star}
                        className="flex items-center gap-1.5 text-[10px]"
                      >
                        <span className="w-3 shrink-0 font-medium text-gray-900">
                          {star}
                        </span>
                        <div className="flex-1 h-1.5 min-w-[20px] rounded-full bg-gray-300 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-black transition-all duration-700 ease-out"
                            style={{
                              width: `${Math.max(pct * progress, progress > 0 ? 2 : 0)}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : pngIcon ? (
                <img
                  src={pngIcon}
                  alt={m.label}
                  className="w-10 h-10 mx-auto object-contain"
                />
              ) : (
                <Icon className="w-8 h-8 text-gray-600 mx-auto" />
              )}
            </div>
          );
        })}
      </div> */}
    </section>
  );
};
