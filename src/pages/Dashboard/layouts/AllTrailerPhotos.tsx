import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useModalNavigate from "../../../hooks/useModalNavigate.ts";
import { ChevronLeft, Heart, Share2 } from "lucide-react";
import {
  getTrailerTypeLabel,
  type TrailerDetail,
} from "../../../assets/data/trailers.ts";
import { resolveTrailerForRoute } from "../../../api/trailersApi.ts";
import { images as assetImages } from "../../../assets/images/index.ts";
import {
  ImageModal,
  ShareTrailerModal,
  WishlistLoginModal,
} from "../../../components/TrailerDetails/index.ts";
import Loader from "../../../components/common/Loader.tsx";

export interface Photo {
  id: number;
  url: string;
}

const PLACEHOLDER = assetImages.Catimg;

const AllTrailerPhotos: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const modalNavigate = useModalNavigate();
  const [trailer, setTrailer] = useState<TrailerDetail | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [modalPhoto, setModalPhoto] = useState<Photo | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      setTrailer(null);
      setLoadState("error");
      return;
    }
    let cancelled = false;
    setLoadState("loading");
    setTrailer(null);
    void (async () => {
      const resolved = await resolveTrailerForRoute(id);
      if (cancelled) return;
      if (resolved) {
        setTrailer(resolved);
        setLoadState("ready");
      } else {
        setTrailer(null);
        setLoadState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const photos: Photo[] = trailer
    ? trailer.images.map((url, index) => ({ id: index + 1, url }))
    : [];

  const openModal = useCallback((photo: Photo) => setModalPhoto(photo), []);
  const closeModal = useCallback(() => setModalPhoto(null), []);

  if (loadState === "loading") {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 px-4">
        <div className="flex items-center justify-center py-6">
          <Loader />
        </div>
      </div>
    );
  }

  if (loadState === "error" || !trailer) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-gray-800 font-medium">
          We couldn&apos;t load this trailer.
        </p>
        <Link
          to="/"
          className="text-[#389131] font-medium underline hover:no-underline"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const typeLabel = getTrailerTypeLabel(trailer.type);
  const locationText = `${typeLabel} – ${trailer.location}`;
  const trailerLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/trailer/${id}`
      : `/trailer/${id}`;

  return (
<div className="min-h-screen bg-white w-full min-w-0 overflow-x-hidden shadow-[0px_4px_4px_0px_#00000040] relative z-10">      <header className="top-0     z-40 bg-transparent border-0 shadow-none">
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
              <h1 className="truncate font-['Lexend'] font-semibold text-[40px] leading-[100%] tracking-[0%] align-middle text-[#389131]">
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
                <Share2
                  className="w-[16.5px] h-[18px] text-black"
                  style={{ strokeWidth: 1.5 }}
                />
                <span
                  className="font-normal text-[16px] leading-[100%] tracking-[0%] underline text-black"
                  style={{ fontFamily: "Lexend", verticalAlign: "middle" }}
                >
                  Share
                </span>
              </button>
              <button
                type="button"
                onClick={() => setWishlistModalOpen(true)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-[#389131] hover:underline"
                aria-label="Save"
              >
                <Heart
                  className="w-[16.5px] h-[18px] text-black"
                  style={{ strokeWidth: 1.5 }}
                />
                <span
                  className="font-normal text-[16px] leading-[100%] tracking-[0%] underline text-black"
                  style={{ fontFamily: "Lexend", verticalAlign: "middle" }}
                >
                  Save
                </span>
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
              className="relative block w-full h-[283px] overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2"
              onClick={() => openModal(photo)}
            >
              <img
                src={photo.url || PLACEHOLDER}
                alt={`Trailer ${photo.id}`}
                className="w-full h-full object-cover transition-transform duration-300 ease-out hover:scale-105"
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
        onLoginClick={() => {
          modalNavigate("/login");
        }}
      />
    </div>
  );
};

export default AllTrailerPhotos;
