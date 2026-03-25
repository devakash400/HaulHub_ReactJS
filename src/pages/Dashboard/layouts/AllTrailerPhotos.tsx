import React, { useState, useCallback } from "react";
import { useParams, useNavigate, Link, Navigate } from "react-router-dom";
import { ChevronLeft, Heart, Share2 } from "lucide-react";
import { getTrailerById, getTrailerTypeLabel } from "../../../assets/data/trailers.ts";
import { images as assetImages } from "../../../assets/images/index.ts";
import { ImageModal, ShareTrailerModal, WishlistLoginModal } from "../../../components/TrailerDetails/index.ts";

export interface Photo {
  id: number;
  url: string;
}

const PLACEHOLDER = assetImages.Catimg;

const AllTrailerPhotos: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const trailer = id ? getTrailerById(Number(id)) : undefined;
  const [modalPhoto, setModalPhoto] = useState<Photo | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false);

  const photos: Photo[] = trailer
    ? trailer.images.map((url, index) => ({ id: index + 1, url }))
    : [];

  const openModal = useCallback((photo: Photo) => setModalPhoto(photo), []);
  const closeModal = useCallback(() => setModalPhoto(null), []);

  if (!trailer) {
    return <Navigate to="/" replace />;
  }

  const typeLabel = getTrailerTypeLabel(trailer.type);
  const locationText = `${typeLabel} – ${trailer.location}`;
  const trailerLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/trailer/${id}`
      : `/trailer/${id}`;

  return (
    <div className="min-h-screen bg-background w-full min-w-0 overflow-x-hidden">
      {/* Sticky header */}
      <header className=" top-0 z-40 bg-background border-b border-gray-200/80 shadow-sm">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-row flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                to={`/trailer/${id}`}
                className="flex-shrink-0 p-1 -ml-1 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Back to trailer"
              >
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#389131] truncate">
                {trailer.title}
              </h1>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <button
                type="button"
                onClick={() => setShareModalOpen(true)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-[#389131] hover:underline"
                aria-label="Share"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button
                type="button"
                onClick={() => setWishlistModalOpen(true)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-[#389131] hover:underline"
                aria-label="Save"
              >
                <Heart className="h-4 w-4 fill-current" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Photo grid */}
      <main className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              className="relative block w-full aspect-[4/3] overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2"
              onClick={() => openModal(photo)}
            >
              <img
                src={photo.url || PLACEHOLDER}
                alt={`Trailer ${photo.id}`}
                className="w-full h-full object-cover rounded-xl transition-transform duration-300 ease-out hover:scale-105"
              />
            </button>
          ))}
        </div>
      </main>

      {modalPhoto && (
        <ImageModal
          imageUrl={modalPhoto.url || PLACEHOLDER}
          alt={`Trailer ${modalPhoto.id}`}
          onClose={closeModal}
        />
      )}

      <ShareTrailerModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        trailerTitle={locationText}
        trailerImage={trailer.images[0] ?? ""}
        trailerDescription={trailer.specs}
        trailerLink={trailerLink}
      />

      <WishlistLoginModal
        isOpen={wishlistModalOpen}
        onClose={() => setWishlistModalOpen(false)}
        onLoginClick={() => navigate("/login")}
      />
    </div>
  );
};

export default AllTrailerPhotos;
