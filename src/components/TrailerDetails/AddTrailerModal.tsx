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
  const [price, setPrice] = useState("");
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [usageRestrictions, setUsageRestrictions] = useState("");

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [takePhoto, setTakePhoto] = useState<string | null>(null);

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [typeOpen, setTypeOpen] = useState(false);
  const [hitchOpen, setHitchOpen] = useState(false);
  const [dimensionPresetOpen, setDimensionPresetOpen] = useState(false);

  const [selectedDimensionPreset, setSelectedDimensionPreset] = useState("");

  const typeRef = useRef<HTMLDivElement>(null);
  const hitchRef = useRef<HTMLDivElement>(null);
  const dimensionPresetRef = useRef<HTMLDivElement>(null);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const takePhotoInputRef = useRef<HTMLInputElement>(null);

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
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) {
        setTypeOpen(false);
      }

      if (hitchRef.current && !hitchRef.current.contains(e.target as Node)) {
        setHitchOpen(false);
      }

      if (
        dimensionPresetRef.current &&
        !dimensionPresetRef.current.contains(e.target as Node)
      ) {
        setDimensionPresetOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const validate = () => {
    const newErrors: Errors = {};

    if (!title.trim()) {
      newErrors.title = "Trailer title is required";
    }

    if (!trailerType.trim()) {
      newErrors.trailerType = "Trailer type is required";
    }

    if (!weight.trim()) {
      newErrors.weight = "Weight is required";
    }

    if (!hitchType.trim()) {
      newErrors.hitchType = "Hitch type is required";
    }

    if (!length.trim()) {
      newErrors.length = "Length is required";
    }

    if (!width.trim()) {
      newErrors.width = "Width is required";
    }

    if (!height.trim()) {
      newErrors.height = "Height is required";
    }

    if (!price.trim()) {
      newErrors.price = "Price is required";
    }

    if (!availabilityDate.trim()) {
      newErrors.availabilityDate = "Availability date is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    validate();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fill all required fields");
      return;
    }

    dispatch(addOwnerTrailer());

    toast.success("Trailer saved successfully");

    onClose();
    onSuccess?.();
  };

  const inputBase = `
    w-full
    h-[40px]
    rounded-[5px]
    border
    border-[#7C7C7C]
    bg-white
    px-4
    font-lexend
    font-light
    text-[12px]
    text-black
    outline-none
    appearance-none
    focus:border-[#389131]
    focus:ring-2
    focus:ring-[#389131]/20
    placeholder:text-[#9B989E]
  `;

  const selectBase = `
    flex
    w-full
    items-center
    justify-between
    h-[40px]
    rounded-[5px]
    border
    border-[#7C7C7C]
    bg-white
    px-4
    text-left
    font-lexend
    font-light
    text-[12px]
    outline-none
    appearance-none
    focus:border-[#389131]
    focus:ring-2
    focus:ring-[#389131]/20
  `;

  const inputError = "border-red-500";

  const fieldLabelClass =
    "mb-1.5 block text-left font-lexend text-[14px] font-normal text-black";

  if (!isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          title={
            <span className="font-lexend text-[23px] font-bold text-white">
              Add Trailer Detail
            </span>
          }
          onClose={onClose}
          variant="close"
          titleId="add-trailer-title"
        />

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-y-auto"
        >
          <div className="space-y-4 px-6 py-6 sm:px-8">
            {/* Trailer Title */}
            <div>
              <label className={fieldLabelClass}>Trailer Title</label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleBlur("title")}
                placeholder="Enter Trailer Title"
                className={`${inputBase} ${
                  touched.title && errors.title ? inputError : ""
                }`}
              />
            </div>

            {/* Trailer Type */}
            <div ref={typeRef} className="relative">
              <label className={fieldLabelClass}>Trailer Type</label>

              <button
                type="button"
                onClick={() => {
                  setTypeOpen((prev) => !prev);
                  setHitchOpen(false);
                  setDimensionPresetOpen(false);
                }}
                className={`${selectBase} ${
                  touched.trailerType && errors.trailerType ? inputError : ""
                }`}
              >
                <span
                  className={`${trailerType ? "text-black" : "text-[#9B989E]"}`}
                >
                  {trailerType || "Select Trailer Type"}
                </span>

                <ChevronDown
                  className={`h-5 w-5 text-[#9B989E] transition-transform ${
                    typeOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {typeOpen && (
                <ul className="absolute z-10 mt-1 w-full rounded-[5px] border border-[#7C7C7C] bg-white shadow-lg">
                  {TRAILER_TYPES.map((opt) => (
                    <li key={opt}>
                      <button
                        type="button"
                        onClick={() => {
                          setTrailerType(opt);
                          setTypeOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-[12px] hover:bg-gray-100"
                      >
                        {opt}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Weight */}
            <div>
              <label className={fieldLabelClass}>Weight</label>

              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter Trailer Weight"
                className={`${inputBase} ${
                  touched.weight && errors.weight ? inputError : ""
                }`}
              />
            </div>

            {/* Hitch Type */}
            <div ref={hitchRef} className="relative">
              <label className={fieldLabelClass}>Hitch Type</label>

              <button
                type="button"
                onClick={() => {
                  setHitchOpen((prev) => !prev);
                  setTypeOpen(false);
                  setDimensionPresetOpen(false);
                }}
                className={`${selectBase} ${
                  touched.hitchType && errors.hitchType ? inputError : ""
                }`}
              >
                <span
                  className={`${hitchType ? "text-black" : "text-[#9B989E]"}`}
                >
                  {hitchType || "Select Hitch Type"}
                </span>

                <ChevronDown
                  className={`h-5 w-5 text-[#9B989E] transition-transform ${
                    hitchOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {hitchOpen && (
                <ul className="absolute z-10 mt-1 w-full rounded-[5px] border border-[#7C7C7C] bg-white shadow-lg">
                  {HITCH_TYPES.map((opt) => (
                    <li key={opt}>
                      <button
                        type="button"
                        onClick={() => {
                          setHitchType(opt);
                          setHitchOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-[12px] hover:bg-gray-100"
                      >
                        {opt}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Dimensions */}
            <div ref={dimensionPresetRef} className="relative">
              <label className={fieldLabelClass}>Dimensions</label>

              <button
                type="button"
                onClick={() => {
                  setDimensionPresetOpen((prev) => !prev);
                  setTypeOpen(false);
                  setHitchOpen(false);
                }}
                className={selectBase}
              >
                <span
                  className={`${
                    selectedDimensionPreset ? "text-black" : "text-[#9B989E]"
                  }`}
                >
                  {selectedDimensionPreset || "Select Dimensions"}
                </span>

                <ChevronDown
                  className={`h-5 w-5 text-[#9B989E] transition-transform ${
                    dimensionPresetOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dimensionPresetOpen && (
                <ul className="absolute z-10 mt-1 w-full rounded-[5px] border border-[#7C7C7C] bg-white shadow-lg">
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
                        className="w-full px-4 py-2 text-left text-[12px] hover:bg-gray-100"
                      >
                        {preset.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="Length"
                  className={inputBase}
                />

                <input
                  type="text"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="Width"
                  className={inputBase}
                />
              </div>

              <div className="mt-4">
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Height"
                  className={inputBase}
                />
              </div>
            </div>

            {/* Uploads */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={fieldLabelClass}>Profile Picture</label>

                <input
                  ref={profileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      setProfilePhoto(URL.createObjectURL(file));
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                  className="
    flex
    w-full
    h-[40px]
    items-center
    justify-center
    rounded-[5px]
    border
    border-[#7C7C7C]
    bg-white
  "
                >
                  <div className="flex items-center justify-center gap-[6px]">
                    <Upload
                      className="w-[11.33px] h-[11.33px] shrink-0 text-black"
                      strokeWidth={2}
                    />

                    <span
                      className="
        font-lexend
        font-light
        text-[12px]
        leading-[100%]
        tracking-[0%]
        text-black
      "
                    >
                      {profilePhoto ? "Photo Added" : "Upload Photo"}
                    </span>
                  </div>
                </button>
              </div>

              <div>
                <label className={fieldLabelClass}>Take Photo</label>

                <input
                  ref={takePhotoInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      setTakePhoto(URL.createObjectURL(file));
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() => takePhotoInputRef.current?.click()}
                  className="
    flex
    w-full
    h-[40px]
    items-center
    justify-center
    rounded-[5px]
    border
    border-[#7C7C7C]
    bg-white
  "
                >
                  <div className="flex items-center justify-center gap-[6px]">
                    <Upload
                      className="w-[11.33px] h-[11.33px] shrink-0 text-black"
                      strokeWidth={2}
                    />

                    <span
                      className="
        font-lexend
        font-light
        text-[12px]
        leading-[100%]
        tracking-[0%]
        text-black
      "
                    >
                      {takePhoto ? "Photo Added" : "Take Photo"}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className={fieldLabelClass}>Set Pricing</label>

              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className={inputBase}
              />
            </div>

            {/* Availability */}
            <div>
              <label className={fieldLabelClass}>Availability Calendar</label>

              <input
                type="date"
                value={availabilityDate}
                onChange={(e) => setAvailabilityDate(e.target.value)}
                className={`
    ${inputBase}

    font-lexend
    font-light
    text-[12px]
    leading-[100%]
    tracking-[0%]

    ${availabilityDate ? "text-black" : "text-[#9B989E]"}

    [&::-webkit-datetime-edit]:font-lexend
    [&::-webkit-datetime-edit]:font-light
    [&::-webkit-datetime-edit]:text-[12px]

    ${
      availabilityDate
        ? "[&::-webkit-datetime-edit]:text-black"
        : "[&::-webkit-datetime-edit]:text-[#9B989E]"
    }

    [&::-webkit-calendar-picker-indicator]:opacity-100
  `}
              />
            </div>

            {/* Restrictions */}
            <div>
              <label className={fieldLabelClass}>Usage Restrictions</label>

              <input
                type="text"
                value={usageRestrictions}
                onChange={(e) => setUsageRestrictions(e.target.value)}
                placeholder="Enter Usage Restrictions"
                className={inputBase}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 py-4 sm:px-8">
            <button
              type="submit"
              className="h-[40px] w-full rounded-[5px] bg-[#389131] font-lexend text-[14px] font-semibold text-white"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
