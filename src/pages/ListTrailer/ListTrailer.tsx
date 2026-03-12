import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronDown, Upload } from "lucide-react";

const TRAILER_TYPES = [
  "Heavy-Duty Gooseneck",
  "Bumper Pull",
  "Flatbed",
  "Car Hauler",
  "Enclosed Cargo",
  "Dump Trailer",
  "Utility",
  "Other",
];

const ListTrailer: React.FC = () => {
  const [title, setTitle] = useState("");
  const [trailerType, setTrailerType] = useState("");
  const [location, setLocation] = useState("");
  const [specs, setSpecs] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [description, setDescription] = useState("");
  const [typeOpen, setTypeOpen] = useState(false);
  const typeRef = useRef<HTMLDivElement>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) {
        setTypeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const newPreviews: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = URL.createObjectURL(files[i]);
      newPreviews.push(url);
    }
    setPhotoPreviews((prev) => [...prev, ...newPreviews].slice(0, 12));
  };

  const removePhoto = (index: number) => {
    setPhotoPreviews((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index]);
      next.splice(index, 1);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic can be added here
  };

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#F6F1E8] font-sans">
      {/* Sticky header – same style as AllTrailerPhotos / gallery page */}
      <header className="sticky top-0 z-40 bg-[#F6F1E8] border-b border-gray-200/80 shadow-sm">
        <div className="mx-auto max-w-[1120px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-row flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                to="/"
                className="-ml-1 flex-shrink-0 rounded-full p-1 text-gray-700 transition-colors hover:bg-gray-100"
                aria-label="Back to home"
              >
                <ChevronLeft className="h-6 w-6" />
              </Link>
              <h1 className="truncate text-xl font-semibold tracking-tight text-[#389131] sm:text-2xl lg:text-3xl">
                List Your Trailer
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <p className="mb-8 text-neutral-700 sm:text-lg">
          Add your trailer to the HaulHub marketplace. Fill in the details below.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Basic info */}
          <section className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 text-xl font-semibold tracking-tight text-[#389131] sm:text-2xl">
              Basic information
            </h2>
            <div className="grid gap-5 sm:grid-cols-1">
              <div>
                <label
                  htmlFor="list-trailer-title"
                  className="mb-1.5 block text-sm font-medium text-neutral-800"
                >
                  Listing title
                </label>
                <input
                  id="list-trailer-title"
                  type="text"
                  placeholder="e.g. Heavy-Duty Gooseneck Trailer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-neutral-800 placeholder:text-gray-500 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/20"
                />
              </div>

              <div ref={typeRef} className="relative">
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                  Trailer type
                </label>
                <button
                  type="button"
                  onClick={() => setTypeOpen(!typeOpen)}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-left text-neutral-800 placeholder:text-gray-500 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/20"
                >
                  <span className={trailerType ? "text-neutral-800" : "text-gray-500"}>
                    {trailerType || "Select trailer type"}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${typeOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
                {typeOpen && (
                  <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    {TRAILER_TYPES.map((opt) => (
                      <li key={opt}>
                        <button
                          type="button"
                          onClick={() => {
                            setTrailerType(opt);
                            setTypeOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-neutral-800 hover:bg-gray-100"
                        >
                          {opt}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label
                  htmlFor="list-trailer-location"
                  className="mb-1.5 block text-sm font-medium text-neutral-800"
                >
                  Location
                </label>
                <input
                  id="list-trailer-location"
                  type="text"
                  placeholder="e.g. Texas, USA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-neutral-800 placeholder:text-gray-500 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="list-trailer-specs"
                  className="mb-1.5 block text-sm font-medium text-neutral-800"
                >
                  Specs (short summary)
                </label>
                <input
                  id="list-trailer-specs"
                  type="text"
                  placeholder="e.g. 25FT Flatbed · Dual Axle · Industrial Steel Frame"
                  value={specs}
                  onChange={(e) => setSpecs(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-neutral-800 placeholder:text-gray-500 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="list-trailer-rate"
                  className="mb-1.5 block text-sm font-medium text-neutral-800"
                >
                  Daily rate ($)
                </label>
                <input
                  id="list-trailer-rate"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 150"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-neutral-800 placeholder:text-gray-500 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="list-trailer-description"
                  className="mb-1.5 block text-sm font-medium text-neutral-800"
                >
                  Description
                </label>
                <textarea
                  id="list-trailer-description"
                  placeholder="Describe your trailer, condition, and what renters can expect..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-neutral-800 placeholder:text-gray-500 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/20"
                />
              </div>
            </div>
          </section>

          {/* Photos – grid style similar to gallery */}
          <section className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 text-xl font-semibold tracking-tight text-[#389131] sm:text-2xl">
              Photos
            </h2>
            <p className="mb-4 text-sm text-neutral-600">
              Add up to 12 photos. The first image will be the cover.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoChange}
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {photoPreviews.map((url, index) => (
                <div
                  key={url}
                  className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100"
                >
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white transition hover:bg-black/70"
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}
              {photoPreviews.length < 12 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 transition hover:border-[#389131] hover:bg-[#389131]/5 hover:text-[#389131]"
                >
                  <Upload className="h-8 w-8" />
                  <span className="text-sm font-medium">Add photos</span>
                </button>
              )}
            </div>
          </section>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-lg bg-[#389131] px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#2d7326] focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2"
            >
              Submit listing
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ListTrailer;
