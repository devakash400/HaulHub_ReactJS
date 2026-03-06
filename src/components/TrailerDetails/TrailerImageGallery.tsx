import React from "react";
import { useNavigate } from "react-router-dom";
import { images as assetImages } from "../../assets/images/index.ts";
import showAllPhotosIcon from "../../assets/icons/showallphoto.png";

type TrailerImageGalleryProps = {
  images: string[];
  trailerId?: number;
};

const PLACEHOLDER = assetImages.Catimg;

export const TrailerImageGallery: React.FC<TrailerImageGalleryProps> = ({
  images: propImages,
  trailerId,
}) => {
  const navigate = useNavigate();
  const mainImage = propImages[0] || PLACEHOLDER;
  const gridImages = [
    propImages[1] || mainImage,
    propImages[2] || mainImage,
    propImages[3] || mainImage,
    propImages[4] || mainImage,
  ];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={mainImage}
          alt="Main trailer"
          className="w-full h-[300px] lg:h-[420px] object-cover rounded-2xl"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {gridImages.map((src, i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl">
            <img
              src={src}
              alt={`Trailer view ${i + 2}`}
              className="w-full h-[200px] object-cover rounded-2xl"
            />
            {i === 3 && trailerId != null && (
              <button
                type="button"
                onClick={() => navigate(`/trailer/${trailerId}/photos`)}
                className="absolute border border-black bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white text-xs sm:text-sm px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl shadow-md font-medium text-gray-800 hover:bg-gray-50 transition-colors flex items-center gap-1.5 sm:gap-2"
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
        ))}
      </div>
    </section>
  );
};

