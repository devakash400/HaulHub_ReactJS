import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Camera } from "lucide-react";
import { toast } from "react-toastify";

type TrailorConditionState = {
  bookingId?: string;
  trailorName?: string;
  pickupDate?: string;
  renterName?: string;
};

const CHECKLIST_ITEMS = [
  { id: "noDents", label: "No Visible dents" },
  { id: "tiresGood", label: "Tires in good condition" },
  { id: "lightsWorking", label: "Lights Working" },
  { id: "noScratches", label: "No Scratches" },
] as const;

const TrailorCondition: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as TrailorConditionState;

  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    noDents: false,
    tiresGood: false,
    lightsWorking: false,
    noScratches: false,
  });
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bookingId = state.bookingId ?? "#TR-2026-45821";
  const trailorName = state.trailorName ?? "25FT Gooseneck Trailor";
  const pickupDate = state.pickupDate ?? "12 March 2026";
  const renterName = state.renterName ?? "Demo";

  const toggleCheck = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
    if (errors.checklist) setErrors((e) => ({ ...e, checklist: "" }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith("image/")) {
        newUrls.push(URL.createObjectURL(files[i]));
      }
    }
    setPhotos((prev) => [...prev, ...newUrls].slice(0, 8));
    if (errors.photos) setErrors((e) => ({ ...e, photos: "" }));
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index]);
      next.splice(index, 1);
      return next;
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (photos.length === 0) {
      newErrors.photos = "Please upload at least one condition photo";
    }

    const allChecked = CHECKLIST_ITEMS.every((item) => checklist[item.id]);
    if (!allChecked) {
      newErrors.checklist =
        "Please confirm all trailer conditions by checking each item";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors before submitting");
      return;
    }
    toast.success("Inspection submitted successfully");
    navigate("/");
  };

  const PHOTO_LABELS = ["Front View", "Side View", "Side View", "Rear View"];

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-white font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200/80 shadow-sm">
        <div className="mx-auto max-w-[640px] px-4 py-4 sm:px-6">
          <h1 className="text-xl font-semibold tracking-tight text-[#389131] sm:text-2xl">
            Trailor Condition Before
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-[640px] px-4 py-6 sm:px-6 sm:py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Booking details */}
          <section className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Booking ID:</span>{" "}
                <span className="font-medium text-gray-900">{bookingId}</span>
              </div>
              <div>
                <span className="text-gray-500">Trailor Name:</span>{" "}
                <span className="font-medium text-gray-900">{trailorName}</span>
              </div>
              <div>
                <span className="text-gray-500">Pickup Date:</span>{" "}
                <span className="font-medium text-gray-900">{pickupDate}</span>
              </div>
              <div>
                <span className="text-gray-500">Renter Name:</span>{" "}
                <span className="font-medium text-gray-900">{renterName}</span>
              </div>
            </div>
          </section>

          {/* Upload Condition Photos */}
          <section>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#389131] px-4 py-4 text-white font-medium transition-colors hover:bg-[#2d7326]"
            >
              <Camera className="h-5 w-5" />
              Uploaded Condition Photos
            </button>
            {errors.photos && (
              <p className="mt-1 text-xs text-red-600">{errors.photos}</p>
            )}

            {photos.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4">
                {photos.map((url, index) => (
                  <div key={url} className="flex flex-col items-center">
                    <div className="relative aspect-square w-24 overflow-hidden rounded-lg bg-gray-100 sm:w-28">
                      <img
                        src={url}
                        alt={`Condition ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                        aria-label="Remove photo"
                      >
                        ×
                      </button>
                    </div>
                    <span className="mt-1 text-xs text-gray-600">
                      {PHOTO_LABELS[index] ?? `View ${index + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Additional Info checklist + Notes (same section as image) */}
          <section className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-center text-base font-semibold text-gray-900">
              Additional Info about your Trailor
            </h2>
            <div className="space-y-3">
              {CHECKLIST_ITEMS.map((item) => (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.id] ?? false}
                    onChange={() => toggleCheck(item.id)}
                    className="h-4 w-4 rounded border-gray-300 text-[#389131] focus:ring-[#389131]"
                  />
                  <span className="text-sm text-gray-800">{item.label}</span>
                </label>
              ))}
            </div>
            {errors.checklist && (
              <p className="mt-2 text-xs text-red-600">{errors.checklist}</p>
            )}
            <div className="mt-4">
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Text here..."
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 placeholder:text-gray-500 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/20"
              />
            </div>
          </section>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-lg bg-[#389131] py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#2d7326] focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2"
            >
              Submit Inspection
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default TrailorCondition;
