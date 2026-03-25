import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { ChevronDown, Upload } from "lucide-react";
import { ModalHeader } from "../ModalHeader.tsx";
import { lockScroll } from "../../utils/scrollLock.ts";
import { addOwnerTrailer } from "../../store/authSlice.ts";
import { toast } from "react-toastify";

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

const HITCH_TYPES = ["Ball Hitch", "Gooseneck", "Fifth Wheel", "Other"];

const DIMENSION_PRESETS = [
  { label: "12x6x5 ft", length: "12", width: "6", height: "5" },
  { label: "8x5x4 ft", length: "8", width: "5", height: "4" },
  { label: "16x7x6 ft", length: "16", width: "7", height: "6" },
  { label: "20x8x7 ft", length: "20", width: "8", height: "7" },
];

type Errors = Record<string, string>;

export interface AddTrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddTrailerModal: React.FC<AddTrailerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [trailerType, setTrailerType] = useState("");
  const [weight, setWeight] = useState("");
  const [hitchType, setHitchType] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [dimensionUnit] = useState("ft");
  const [price, setPrice] = useState("");
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [usageRestrictions, setUsageRestrictions] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [takePhoto, setTakePhoto] = useState<string | null>(null);

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const typeRef = useRef<HTMLDivElement>(null);
  const hitchRef = useRef<HTMLDivElement>(null);
  const dimensionPresetRef = useRef<HTMLDivElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const takePhotoInputRef = useRef<HTMLInputElement>(null);

  const [typeOpen, setTypeOpen] = useState(false);
  const [hitchOpen, setHitchOpen] = useState(false);
  const [dimensionPresetOpen, setDimensionPresetOpen] = useState(false);
  const [selectedDimensionPreset, setSelectedDimensionPreset] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setTitle("");
    setTrailerType("");
    setWeight("");
    setHitchType("");
    setLength("");
    setWidth("");
    setHeight("");
    setPrice("");
    setAvailabilityDate("");
    setUsageRestrictions("");
    setProfilePhoto(null);
    setTakePhoto(null);
    setSelectedDimensionPreset("");
    setErrors({});
    setTouched({});
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const unlock = lockScroll();
    return unlock;
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        typeRef.current &&
        !typeRef.current.contains(e.target as Node) &&
        hitchRef.current &&
        !hitchRef.current.contains(e.target as Node) &&
        dimensionPresetRef.current &&
        !dimensionPresetRef.current.contains(e.target as Node)
      ) {
        setTypeOpen(false);
        setHitchOpen(false);
        setDimensionPresetOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validate = (): boolean => {
    const newErrors: Errors = {};

    if (!title.trim()) {
      newErrors.title = "Trailor title is required";
    } else if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!trailerType.trim()) {
      newErrors.trailerType = "Please select trailer type";
    }

    if (!weight.trim()) {
      newErrors.weight = "Weight is required";
    } else {
      const weightMatch = weight.match(/^(\d+(?:\.\d+)?)\s*(lbs|kg)?$/i);
      if (!weightMatch) {
        newErrors.weight = "Enter valid weight (e.g. 3500 lbs)";
      }
    }

    if (!hitchType.trim()) {
      newErrors.hitchType = "Please select hitch type";
    }

    const parseDim = (v: string) =>
      parseFloat(String(v).replace(/[^0-9.]/g, "")) || 0;
    if (!length.trim()) {
      newErrors.length = "Length is required";
    } else if (parseDim(length) <= 0) {
      newErrors.length = "Enter a valid length (e.g. 12 or 12 ft)";
    }

    if (!width.trim()) {
      newErrors.width = "Width is required";
    } else if (parseDim(width) <= 0) {
      newErrors.width = "Enter a valid width (e.g. 6 or 6 ft)";
    }

    if (!height.trim()) {
      newErrors.height = "Height is required";
    } else if (parseDim(height) <= 0) {
      newErrors.height = "Enter a valid height (e.g. 5 or 5 ft)";
    }

    if (!price.trim()) {
      newErrors.price = "Pricing is required";
    } else {
      const priceNum = parseFloat(price.replace(/[^0-9.]/g, ""));
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = "Enter a valid price";
      }
    }

    if (!availabilityDate.trim()) {
      newErrors.availabilityDate = "Availability date is required";
    } else {
      const date = new Date(availabilityDate);
      if (isNaN(date.getTime())) {
        newErrors.availabilityDate = "Enter a valid date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate();
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setProfilePhoto(url);
    }
  };

  const handleTakePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setTakePhoto(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      title: true,
      trailerType: true,
      weight: true,
      hitchType: true,
      length: true,
      width: true,
      height: true,
      price: true,
      availabilityDate: true,
    });

    if (!validate()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    dispatch(addOwnerTrailer());
    toast.success("Trailer saved successfully");
    onClose();
    onSuccess?.();
  };

  if (!isOpen) return null;

  const inputBase =
    "w-full rounded-lg border px-4 py-3 text-neutral-800 placeholder:text-gray-500 focus:border-[#389131] focus:outline-none focus:ring-2 focus:ring-[#389131]/20 bg-white";
  const inputError =
    "border-red-500 focus:border-red-500 focus:ring-red-500/20";

  const modal = (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-trailer-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[640px] max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          title="Add Trailer Details"
          onClose={onClose}
          variant="close"
          titleId="add-trailer-title"
        />

        <form
          onSubmit={handleSubmit}
          className="flex flex-col overflow-y-auto flex-1"
        >
          <div className="px-6 py-6 sm:px-8 space-y-4 text-left">
            <div>
              <label className="mb-1.5 block text-left text-sm font-medium text-neutral-800">
                Trailor Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleBlur("title")}
                placeholder="e.g. Heavy Duty Car Hauler Trailer"
                className={`${inputBase} ${
                  touched.title && errors.title ? inputError : "border-gray-300"
                }`}
              />
              {touched.title && errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title}</p>
              )}
            </div>

            <div ref={typeRef} className="relative">
              <label className="mb-1.5 block text-left text-sm font-medium text-neutral-800">
                Trailor Type
              </label>
              <button
                type="button"
                onClick={() => setTypeOpen(!typeOpen)}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-[#389131]/20 ${
                  touched.trailerType && errors.trailerType
                    ? "border-red-500 bg-white"
                    : "border-gray-300 bg-white"
                }`}
              >
                <span
                  className={
                    trailerType ? "text-neutral-800" : "text-gray-500"
                  }
                >
                  {trailerType || "Select trailer type"}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${typeOpen ? "rotate-180" : ""}`}
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
                          setTouched((prev) => ({ ...prev, trailerType: true }));
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.trailerType;
                            return next;
                          });
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-neutral-800 hover:bg-gray-100"
                      >
                        {opt}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {touched.trailerType && errors.trailerType && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.trailerType}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-left text-sm font-medium text-neutral-800">
                Weight
              </label>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                onBlur={() => handleBlur("weight")}
                placeholder="e.g. 3500 lbs"
                className={`${inputBase} ${
                  touched.weight && errors.weight
                    ? inputError
                    : "border-gray-300"
                }`}
              />
              {touched.weight && errors.weight && (
                <p className="mt-1 text-xs text-red-600">{errors.weight}</p>
              )}
            </div>

            <div ref={hitchRef} className="relative">
              <label className="mb-1.5 block text-left text-sm font-medium text-neutral-800">
                Hitch Type
              </label>
              <button
                type="button"
                onClick={() => setHitchOpen(!hitchOpen)}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-[#389131]/20 ${
                  touched.hitchType && errors.hitchType
                    ? "border-red-500 bg-white"
                    : "border-gray-300 bg-white"
                }`}
              >
                <span
                  className={hitchType ? "text-neutral-800" : "text-gray-500"}
                >
                  {hitchType || "Select hitch type"}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${hitchOpen ? "rotate-180" : ""}`}
                />
              </button>
              {hitchOpen && (
                <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  {HITCH_TYPES.map((opt) => (
                    <li key={opt}>
                      <button
                        type="button"
                        onClick={() => {
                          setHitchType(opt);
                          setHitchOpen(false);
                          setTouched((prev) => ({ ...prev, hitchType: true }));
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.hitchType;
                            return next;
                          });
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-neutral-800 hover:bg-gray-100"
                      >
                        {opt}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {touched.hitchType && errors.hitchType && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.hitchType}
                </p>
              )}
            </div>

            <div ref={dimensionPresetRef} className="relative">
              <label className="mb-2 block text-left text-sm font-medium text-neutral-800">
                Dimensions
              </label>
              <button
                type="button"
                onClick={() => setDimensionPresetOpen(!dimensionPresetOpen)}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-[#389131]/20 border-gray-300 bg-white`}
              >
                <span className={selectedDimensionPreset ? "text-neutral-800" : "text-gray-500"}>
                  {selectedDimensionPreset || "Select your Dimensions"}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${dimensionPresetOpen ? "rotate-180" : ""}`}
                />
              </button>
              {dimensionPresetOpen && (
                <ul className="absolute left-0 right-0 z-10 mt-1 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDimensionPreset("");
                        setDimensionPresetOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-100"
                    >
                      Custom
                    </button>
                  </li>
                  {DIMENSION_PRESETS.map((preset) => (
                    <li key={preset.label}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDimensionPreset(preset.label);
                          setLength(preset.length);
                          setWidth(preset.width);
                          setHeight(preset.height);
                          setDimensionPresetOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-neutral-800 hover:bg-gray-100"
                      >
                        {preset.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="mb-1.5 block text-left text-sm font-medium text-neutral-800">
                      Length
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={length}
                        onChange={(e) => {
                          setLength(e.target.value);
                          setSelectedDimensionPreset("");
                        }}
                        onBlur={() => handleBlur("length")}
                        placeholder={`12 ${dimensionUnit}`}
                        className={`flex-1 min-w-0 rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#389131]/20 ${
                          touched.length && errors.length
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    <div className="min-h-5">
                      {touched.length && errors.length && (
                        <p className="mt-1 text-xs text-red-600">{errors.length}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1.5 block text-left text-sm font-medium text-neutral-800">
                      Width
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={width}
                        onChange={(e) => {
                          setWidth(e.target.value);
                          setSelectedDimensionPreset("");
                        }}
                        onBlur={() => handleBlur("width")}
                        placeholder={`6 ${dimensionUnit}`}
                        className={`flex-1 min-w-0 rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#389131]/20 ${
                          touched.width && errors.width
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    <div className="min-h-5">
                      {touched.width && errors.width && (
                        <p className="mt-1 text-xs text-red-600">{errors.width}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="mb-1.5 block text-left text-sm font-medium text-neutral-800">
                      Height
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={height}
                        onChange={(e) => {
                          setHeight(e.target.value);
                          setSelectedDimensionPreset("");
                        }}
                        onBlur={() => handleBlur("height")}
                        placeholder={`5 ${dimensionUnit}`}
                        className={`flex-1 min-w-0 rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#389131]/20 ${
                          touched.height && errors.height
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    <div className="min-h-5">
                      {touched.height && errors.height && (
                        <p className="mt-1 text-xs text-red-600">{errors.height}</p>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:block" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-left text-sm font-medium text-neutral-800">
                  Profile Picture
                </label>
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePhotoChange}
                />
                <button
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-gray-500 transition hover:border-[#389131] hover:bg-[#389131]/5 hover:text-[#389131]"
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {profilePhoto ? "Photo added" : "Upload Photo"}
                  </span>
                </button>
              </div>
              <div>
                <label className="mb-1.5 block text-left text-sm font-medium text-neutral-800">
                  Take Photo
                </label>
                <input
                  ref={takePhotoInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleTakePhotoChange}
                />
                <button
                  type="button"
                  onClick={() => takePhotoInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-gray-500 transition hover:border-[#389131] hover:bg-[#389131]/5 hover:text-[#389131]"
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {takePhoto ? "Photo added" : "Upload Photo"}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-left text-sm font-medium text-neutral-800">
                Set Pricing
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                  $
                </span>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  onBlur={() => handleBlur("price")}
                  placeholder="0.00"
                  inputMode="decimal"
                  className={`pl-8 ${inputBase} ${
                    touched.price && errors.price ? inputError : "border-gray-300"
                  }`}
                />
              </div>
              {touched.price && errors.price && (
                <p className="mt-1 text-xs text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-left text-sm font-medium text-neutral-800">
                Availability Calendar
              </label>
              <input
                type="date"
                value={availabilityDate}
                onChange={(e) => setAvailabilityDate(e.target.value)}
                onBlur={() => handleBlur("availabilityDate")}
                className={`${inputBase} ${
                  touched.availabilityDate && errors.availabilityDate
                    ? inputError
                    : "border-gray-300"
                }`}
              />
              {touched.availabilityDate && errors.availabilityDate && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.availabilityDate}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-left text-sm font-medium text-neutral-800">
                Usage Restrictions
              </label>
              <input
                type="text"
                value={usageRestrictions}
                onChange={(e) => setUsageRestrictions(e.target.value)}
                placeholder="e.g. No off-road driving"
                className={`${inputBase} border-gray-300`}
              />
            </div>
          </div>

          <div className="px-6 pb-6 sm:px-8 border-t border-gray-200 pt-4">
            <button
              type="submit"
              className="w-full rounded-lg bg-[#389131] py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#2d7326] focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === "undefined") return modal;
  return createPortal(modal, document.body);
};
