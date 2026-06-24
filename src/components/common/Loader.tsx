import React from "react";

interface LoaderProps {
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ className = "" }) => {
  return (
    <div
      className={`w-8 h-8 border-4 border-[#389131] border-t-transparent rounded-full animate-spin ${className}`}
      aria-label="Loading"
    />
  );
};

export default Loader;
