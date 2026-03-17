import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RateTrailerModal } from "../../components/TrailerDetails/RateTrailerModal.tsx";
import { images } from "../../assets/images/index.ts";

const INSPECTION_ITEMS = [
  { id: "damageDents", label: "Damage/ Dents", checked: false },
  { id: "minorScratch", label: "Minor Scratch", checked: true },
] as const;

const TRAILER_DESCRIPTION =
  "A gooseneck Trailer is attached to the truck via a ball and hitch in the bed of the truck as opposed to other types of trailers that are attached to the bumper";

const Return: React.FC = () => {
  const navigate = useNavigate();
  const [rateModalOpen, setRateModalOpen] = useState(true);
  const damageNote = "Small Scratch On The Left Side Panel.";

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
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-gray-100 font-sans">
      <main className="mx-auto max-w-[640px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="space-y-0 overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-lg">
          {/* Trailer header: image, description, model, base price */}
          <div className="relative">
            <div className="h-48 sm:h-56 w-full overflow-hidden bg-gray-200">
              <img
                src={images.Catimg}
                alt="Gooseneck trailer"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-4 sm:p-6">
              <p className="text-sm text-gray-800">{TRAILER_DESCRIPTION}</p>
              <p className="mt-2 text-sm font-medium text-gray-900">
                Model: FMAX208
              </p>
              <p className="mt-0.5 text-sm text-gray-500">$21,993.50</p>
            </div>
          </div>

          {/* Inspection Summary card */}
          <div className="border-t border-gray-200/80 p-4 sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              Inspection Summary :
            </h2>
            <div className="space-y-3">
              {INSPECTION_ITEMS.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded border ${
                      item.checked
                        ? "border-[#389131] bg-[#389131] text-white"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {item.checked ? (
                      <span className="text-xs font-bold">✓</span>
                    ) : (
                      <span className="text-gray-400">⋯</span>
                    )}
                  </span>
                  <span className="text-sm text-gray-800">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Damage Note:
              </label>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                {damageNote}
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Price:
              </label>
              <p className="text-base font-semibold text-gray-900">$120</p>
            </div>
          </div>

          {/* Done button */}
          <div className="border-t border-gray-200/80 p-4 sm:p-6">
            <button
              type="button"
              onClick={() => setRateModalOpen(true)}
              className="w-full rounded-lg bg-[#389131] py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#2d7326] focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2"
            >
              Done
            </button>
          </div>
        </div>
        <RateTrailerModal
          isOpen={rateModalOpen}
          onClose={() => setRateModalOpen(false)}
          onSubmit={handleRateSubmit}
        />
      </main>
    </div>
  );
};

export default Return;
