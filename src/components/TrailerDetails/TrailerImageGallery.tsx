import React from "react";
import { useNavigate } from "react-router-dom";
import { images as assetImages } from "../../assets/images/index.ts";
import showAllPhotosIcon from "../../assets/icons/showallphoto.png";

type TrailerImageGalleryProps = {
  images: string[];
  trailerId?: string | number;
};

const PLACEHOLDER = assetImages.Catimg;

export const TrailerImageGallery: React.FC<TrailerImageGalleryProps> = ({
  images: propImages,
  trailerId,
}) => {
  const navigate = useNavigate();
  const mainImage = propImages[0] || PLACEHOLDER;
  const gridImages = propImages.slice(1, 5); // At most 4 images for the right side

  return (
    <section className={`grid grid-cols-1 ${gridImages.length > 0 ? "lg:grid-cols-2" : ""} gap-4 mb-5`}>
      <div className="relative overflow-hidden border border-gray-300 rounded-xl h-full">
        <img
          src={mainImage}
          alt="Main trailer"
          className={`w-full ${gridImages.length > 0 ? "h-[300px] lg:h-[414px]" : "h-[300px] lg:h-[500px]"} object-cover`}
        />
        {gridImages.length === 0 && trailerId != null && propImages.length > 1 && (
          <button
            type="button"
            onClick={() => navigate(`/trailer/${trailerId}/photos`)}
            className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white text-xs sm:text-sm px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl shadow-md font-medium text-gray-800 hover:bg-gray-50 transition-colors flex items-center gap-1.5 sm:gap-2"
          >
            <img
              src={showAllPhotosIcon}
              alt=""
              className="w-3 h-3 sm:w-4 sm:h-4 object-contain"
              aria-hidden
            />
            Show all photos
          </button>
        )}
      </div>
      {gridImages.length > 0 && (
        <div className={`grid ${gridImages.length === 2 ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
          {gridImages.map((src, i) => {
            const isFullWidth = gridImages.length === 1 || (gridImages.length === 3 && i === 0);

            return (
              <div
                key={i}
                className={`relative overflow-hidden border border-gray-300 rounded-xl ${isFullWidth ? "col-span-2" : ""}`}
              >
                <img
                  src={src}
                  alt={`Trailer view ${i + 2}`}
                  className={`w-full ${gridImages.length === 1 ? "h-[300px] lg:h-[414px]" : "h-[200px]"} object-cover`}
                />
                {i === gridImages.length - 1 && trailerId != null && (
                  <button
                    type="button"
                    onClick={() => navigate(`/trailer/${trailerId}/photos`)}
                    className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white text-xs sm:text-sm px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl shadow-md font-medium text-gray-800 hover:bg-gray-50 transition-colors flex items-center gap-1.5 sm:gap-2"
                  >
                    <img
                      src={showAllPhotosIcon}
                      alt=""
                      className="w-3 h-3 sm:w-4 sm:h-4 object-contain"
                      aria-hidden
                    />
                    Show all photos
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
