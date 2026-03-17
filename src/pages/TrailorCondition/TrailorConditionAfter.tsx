import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeftRight, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { RateTrailerModal } from "../../components/TrailerDetails/RateTrailerModal.tsx";

type TrailorConditionState = {
  bookingId?: string;
  beforePhoto?: string;
};

const RETURN_PHOTOS = [
  { id: "front", label: "Upload Front" },
  { id: "back", label: "Upload Back" },
  { id: "left", label: "Upload Left" },
  { id: "right", label: "Upload Right" },
] as const;

const INSPECTION_OPTIONS = [
  { id: "noDamage", label: "No Damage Found" },
  { id: "minorScratch", label: "Minor Scratch (Left Panel)" },
] as const;

const TrailorConditionAfter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as TrailorConditionState;

  const [beforePhoto, setBeforePhoto] = useState<string>(state.beforePhoto ?? "");
  const [afterPhoto, setAfterPhoto] = useState<string>("");
  const [returnPhotos, setReturnPhotos] = useState<
    Record<string, string>
  >({ front: "", left: "", back: "", right: "" });
  const [inspection, setInspection] = useState<Record<string, boolean>>({
    noDamage: false,
    minorScratch: false,
  });
  const [damageNote, setDamageNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const bookingId = state.bookingId ?? "#TR-2026-45821";

  const handleFileChange = (
    key: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    if (key === "before") {
      if (beforePhoto) URL.revokeObjectURL(beforePhoto);
      setBeforePhoto(url);
    } else if (key === "after") {
      if (afterPhoto) URL.revokeObjectURL(afterPhoto);
      setAfterPhoto(url);
    } else if (key in returnPhotos) {
      const old = returnPhotos[key];
      if (old) URL.revokeObjectURL(old);
      setReturnPhotos((prev) => ({ ...prev, [key]: url }));
    }
    e.target.value = "";
  };

  const toggleInspection = (id: string) => {
    setInspection((prev) => ({ ...prev, [id]: !prev[id] }));
    if (errors.inspection) setErrors((e) => ({ ...e, inspection: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!beforePhoto || !afterPhoto) {
      newErrors.comparison = "Please upload both Before and After photos";
    }

    const hasPhoto = RETURN_PHOTOS.some((p) => returnPhotos[p.id]);
    if (!hasPhoto) {
      newErrors.returnPhotos = "Please upload at least one return photo";
    }

    const hasOption = INSPECTION_OPTIONS.some((o) => inspection[o.id]);
    if (!hasOption) {
      newErrors.inspection =
        "Please select at least one inspection summary option";
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
    setIsSubmitted(true);
  };

  const handleDoneClick = () => setRateModalOpen(true);

  const handleRateSubmit = (rating: number) => {
    if (rating > 0) {
      toast.success(`Thank you! Your ${rating}-star rating has been submitted.`);
    } else {
      toast.success("Thank you for completing the inspection!");
    }
    setRateModalOpen(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-white font-sans">
      <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white shadow-sm">
        <div className="mx-auto max-w-[640px] px-4 py-4 sm:px-6">
          <p className="mb-1 text-left text-sm text-gray-500">
            Booking ID: <span className="font-medium text-gray-900">{bookingId}</span>
          </p>
          <h1 className="text-center text-xl font-semibold tracking-tight text-[#389131] sm:text-2xl">
            Before Vs After Comparison
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-[640px] px-4 py-6 sm:px-6 sm:py-8">
        {isSubmitted ? (
          <>
            {/* Completion view - Inspection Summary, Damage Note, Price, Done */}
            <div className="space-y-6">
              <section className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-gray-900">
                  Inspection Summary:
                </h2>
                <div className="space-y-3">
                  {INSPECTION_OPTIONS.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center gap-3"
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded border ${
                          inspection[option.id]
                            ? "border-[#389131] bg-[#389131] text-white"
                            : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        {inspection[option.id] ? "✓" : "⋯"}
                      </span>
                      <span className="text-sm text-gray-800">{option.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Damage Note:
                  </label>
                  <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800">
                    {damageNote || "—"}
                  </p>
                </div>
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Price:
                  </label>
                  <p className="text-base font-semibold text-gray-900">$120</p>
                </div>
              </section>
              <button
                type="button"
                onClick={handleDoneClick}
                className="w-full rounded-lg bg-[#389131] py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#2d7326] focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2"
              >
                Done
              </button>
            </div>
            <RateTrailerModal
              isOpen={rateModalOpen}
              onClose={() => setRateModalOpen(false)}
              onSubmit={handleRateSubmit}
            />
          </>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-6">
          {/* Before Vs After Comparison */}
          <section className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-stretch gap-3">
              <div className="flex flex-1 flex-col">
                <div className="aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                  {beforePhoto ? (
                    <img
                      src={beforePhoto}
                      alt="Before"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      [ Front View Upload ]
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={(el) => (fileInputRefs.current["before"] = el)}
                  onChange={(e) => handleFileChange("before", e)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRefs.current["before"]?.click()}
                  className="mt-2 rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-600 hover:border-[#389131] hover:text-[#389131]"
                >
                  + Upload Before
                </button>
              </div>
              <div className="flex shrink-0 items-center">
                <ArrowLeftRight className="h-8 w-8 text-[#389131]" />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                  {afterPhoto ? (
                    <img
                      src={afterPhoto}
                      alt="After"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      [ Front View Upload ]
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={(el) => (fileInputRefs.current["after"] = el)}
                  onChange={(e) => handleFileChange("after", e)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRefs.current["after"]?.click()}
                  className="mt-2 rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-600 hover:border-[#389131] hover:text-[#389131]"
                >
                  + Upload After
                </button>
              </div>
            </div>
            {errors.comparison && (
              <p className="mt-2 text-xs text-red-600">{errors.comparison}</p>
            )}
          </section>

          {/* Upload Return Photos */}
          <section className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              Upload Return Photos:
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {RETURN_PHOTOS.map(({ id, label }) => (
                <div key={id} className="flex flex-col">
                  <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                    {returnPhotos[id] ? (
                      <img
                        src={returnPhotos[id]}
                        alt={label}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-50 text-gray-400">
                        —
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(el) => (fileInputRefs.current[id] = el)}
                    onChange={(e) => handleFileChange(id, e)}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[id]?.click()}
                    className="mt-2 flex items-center justify-center gap-1 rounded-lg bg-[#389131] py-2 text-sm font-medium text-white transition-colors hover:bg-[#2d7326]"
                  >
                    <Plus className="h-4 w-4" /> + Upload {label}
                  </button>
                </div>
              ))}
            </div>
            {errors.returnPhotos && (
              <p className="mt-2 text-xs text-red-600">{errors.returnPhotos}</p>
            )}
          </section>

          {/* Inspection Summary */}
          <section className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              Inspection Summary:
            </h2>
            <div className="space-y-3">
              {INSPECTION_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <input
                    type="checkbox"
                    checked={inspection[option.id] ?? false}
                    onChange={() => toggleInspection(option.id)}
                    className="h-4 w-4 rounded border-gray-300 text-[#389131] focus:ring-[#389131]"
                  />
                  <span className="text-sm text-gray-800">{option.label}</span>
                </label>
              ))}
            </div>
            {errors.inspection && (
              <p className="mt-2 text-xs text-red-600">{errors.inspection}</p>
            )}

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Damage Note:
              </label>
              <input
                type="text"
                value={damageNote}
                onChange={(e) => setDamageNote(e.target.value)}
                placeholder="Small Scratch On The Left Side Panel"
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
          </>
        )}
      </main>
    </div>
  );
};

export default TrailorConditionAfter;
