import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { ChevronDown, Upload, X } from "lucide-react";
import { ModalHeader } from "../ModalHeader.tsx";
import { lockScroll } from "../../utils/scrollLock.ts";
import { addOwnerTrailer } from "../../store/authSlice.ts";
import { createTrailer } from "../../api/trailersApi.ts";
import uploadProfilePhoto from "../../api/uploadApi.ts";
import { toast } from "react-toastify";

const TRAILER_TYPES = [
  "gooseneck",
  "Bumper Pull",
  "flatbed",
  "car_hauler",
  "Enclosed Cargo",
  "Dump Trailer",
  "Utility",
  "Other",
];

const HITCH_TYPES = ["Ball Hitch", "gooseneck", "Fifth Wheel", "Other"];

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
  const [availabilityStartDate, setAvailabilityStartDate] = useState("");
  const [availabilityEndDate, setAvailabilityEndDate] = useState("");
  const [usageRestrictions, setUsageRestrictions] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [locationState, setLocationState] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [typeOpen, setTypeOpen] = useState(false);
  const [hitchOpen, setHitchOpen] = useState(false);
  const [dimensionPresetOpen, setDimensionPresetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDimensionPreset, setSelectedDimensionPreset] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const removeGalleryPhoto = (indexToRemove: number) => {
    const nextPhotos = photos.filter((_, idx) => idx !== indexToRemove);
    const nextPhotoFiles = photoFiles.filter((_, idx) => idx !== indexToRemove);
    setPhotos(nextPhotos);
    setPhotoFiles(nextPhotoFiles);
    setTouched(prev => ({ ...prev, photos: true }));
    validate(nextPhotos, profilePhotoUrl);
  };

  const removeProfilePhoto = () => {
    setProfilePhotoUrl(null);
    setProfilePhotoFile(null);
    if (profileInputRef.current) profileInputRef.current.value = "";
    setTouched(prev => ({ ...prev, profilePhoto: true }));
    validate(photos, null);
  };

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
    setAvailabilityStartDate("");
    setAvailabilityEndDate("");
    setUsageRestrictions("");
    setAddress("");
    setCity("");
    setLocationState("");
    setZipCode("");
    setProfilePhotoUrl(null);
    setProfilePhotoFile(null);
    if (profileInputRef.current) profileInputRef.current.value = "";
    if (takePhotoInputRef.current) takePhotoInputRef.current.value = "";
    setPhotos([]);
    setPhotoFiles([]);
    setSelectedDimensionPreset("");
    setPreviewImageUrl(null);
    setErrors({});
    setTouched({});
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const unlock = lockScroll();

    return unlock;
  }, [isOpen]);

  // DEBUG: Monitor state changes for image files
  useEffect(() => {
    if (photoFiles.length > 0 || photos.length > 0) {
      console.log("STATE UPDATE - Image files changed:", {
        photoFilesCount: photoFiles.length,
        photosCount: photos.length,
        photoFiles: photoFiles.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
      });
    }
  }, [photoFiles, photos]);

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

  const validate = (photoList: string[] = photos, profilePhoto: string | null = profilePhotoUrl) => {
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

    if (!availabilityStartDate.trim()) {
      newErrors.availabilityStartDate = "Start date is required";
    }

    if (!availabilityEndDate.trim()) {
      newErrors.availabilityEndDate = "End date is required";
    }

    if (!profilePhoto?.trim()) {
      newErrors.profilePhoto = "Profile photo is required";
    }

    if (!address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!city.trim()) {
      newErrors.city = "City is required";
    }

    if (!locationState.trim()) {
      newErrors.locationState = "State is required";
    }

    if (!zipCode.trim()) {
      newErrors.zipCode = "Zip code is required";
    }

    if (photoList.length === 0) {
      newErrors.photos = "Please upload at least 4 photos";
    } else if (photoList.length < 4) {
      newErrors.photos = `${photoList.length} of 4 images uploaded`;
    } else if (photoList.length > 20) {
      newErrors.photos = "You can upload up to 20 photos";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // DEBUG: Log state at submission time
      console.log("=== FORM SUBMISSION DEBUG ===");
      console.log("profilePhotoFile:", profilePhotoFile);
      console.log("photoFiles array length:", photoFiles.length);
      console.log("photoFiles array:", photoFiles);
      console.log("photos array (URLs) length:", photos.length);
      console.log("photos array (URLs):", photos);

      const uploadImageFile = async (file: File): Promise<string> => {
        console.log("Uploading file:", {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        });

        const uploadResp = await uploadProfilePhoto(file);

        console.log("Upload response for", file.name, ":", uploadResp);

        if (!uploadResp || !uploadResp.success) {
          throw new Error("Image upload failed");
        }

        const uploadedUrl = uploadResp.data.url || uploadResp.data.publicId;
        console.log("Uploaded URL:", uploadedUrl);

        return uploadedUrl;
      };

      // Upload profile picture
      console.log("--- Starting profile picture upload ---");
      const profilePictureUrl = profilePhotoFile
        ? await uploadImageFile(profilePhotoFile)
        : profilePhotoUrl || "";
      console.log("Final profilePictureUrl:", profilePictureUrl);

      // Upload gallery images - CRITICAL: Create a fresh snapshot of photoFiles
      console.log("--- Starting gallery images upload ---");
      console.log("Number of gallery images to upload:", photoFiles.length);

      const uploadedImages: string[] = [];

      // Upload images sequentially with logging instead of Promise.all
      // This prevents closure issues and makes debugging easier
      if (photoFiles.length > 0) {
        for (let i = 0; i < photoFiles.length; i++) {
          console.log(`Uploading gallery image ${i + 1}/${photoFiles.length}`);
          const file = photoFiles[i];

          // Verify file before upload
          if (!file || !(file instanceof File)) {
            console.error(`Invalid file at index ${i}:`, file);
            throw new Error(`Invalid file at index ${i}`);
          }

          const uploadedUrl = await uploadImageFile(file);
          uploadedImages.push(uploadedUrl);
          console.log(`Gallery image ${i + 1} uploaded:`, uploadedUrl);
        }
      }

      console.log("Final uploadedImages array:", uploadedImages);
      console.log("uploadedImages length:", uploadedImages.length);

      const trailerData = {
        title: title.trim(),
        name: title.trim(),
        model: "",
        description: "",
        trailerType: trailerType.trim(),
        weight: parseInt(weight) || 0,
        hitchType: hitchType.trim(),
        dimensions: `${length}ft x ${width}ft`,
        length: parseFloat(length) || 0,
        width: parseFloat(width) || 0,
        height: parseFloat(height) || 0,
        pricePerDay: parseFloat(price) || 0,
        usageRestrictions: usageRestrictions.trim() || "",
        profilePicture: profilePictureUrl,
        images: uploadedImages,
        securityDepositAmount: 0,
        isFeatured: false,
        features: [],
        location: {
          address: address.trim(),
          city: city.trim(),
          state: locationState.trim(),
          zipCode: zipCode.trim(),
          country: "USA",
        },
        availability:
          availabilityStartDate && availabilityEndDate
            ? [
                {
                  startDate: availabilityStartDate,
                  endDate: availabilityEndDate,
                  isAvailable: true,
                },
              ]
            : [],
      };

      console.log("Final trailerData.images:", trailerData.images);
      console.log(
        "Final trailerData.profilePicture:",
        trailerData.profilePicture,
      );
      console.log("=== DEBUG END ===");

      const success = await createTrailer(trailerData);

      if (success) {
        dispatch(addOwnerTrailer());
        toast.success("Trailer saved successfully");
        onClose();
        onSuccess?.();
      } else {
        toast.error("Failed to save trailer. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting trailer:", error);
      toast.error("An error occurred while saving the trailer.");
    } finally {
      setIsSubmitting(false);
    }
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
          closeOnRight
          titleId="add-trailer-title"
        />

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-y-auto"
        >
          <div className="space-y-4 px-6 py-6 sm:px-8">
            {/* Trailer Title */}
            <div>
              <label className={fieldLabelClass}>Trailer Title <span className="text-red-500">*</span></label>

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
              <label className={fieldLabelClass}>Trailer Type <span className="text-red-500">*</span></label>

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
              <label className={fieldLabelClass}>Weight <span className="text-red-500">*</span></label>

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
              <label className={fieldLabelClass}>Hitch Type <span className="text-red-500">*</span></label>

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
              <label className={fieldLabelClass}>Dimensions <span className="text-red-500">*</span></label>

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
                <label className={fieldLabelClass}>Profile Picture <span className="text-red-500">*</span></label>

                <input
                  ref={profileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    console.log("Profile photo selected:", {
                      name: file?.name,
                      size: file?.size,
                      type: file?.type,
                    });

                    if (file && file instanceof File) {
                      const objectUrl = URL.createObjectURL(file);
                      setProfilePhotoFile(file);
                      setProfilePhotoUrl(objectUrl);
                      setTouched((prev) => ({ ...prev, profilePhoto: true }));
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.profilePhoto;
                        return next;
                      });
                      console.log(
                        "Profile photo state updated with:",
                        file.name,
                      );
                    } else {
                      console.warn("Invalid profile photo file:", file);
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
                      {profilePhotoUrl ? "Photo Added" : "Upload Photo"}
                    </span>
                  </div>
                </button>
                {touched.profilePhoto && errors.profilePhoto && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.profilePhoto}
                  </p>
                )}

                {profilePhotoUrl && (
                  <div className="mt-3">
                    <p className="mb-2 font-lexend text-[12px] font-normal text-[#7C7C7C]">
                      Profile Picture Preview
                    </p>
                    <div className="relative group h-[60px] w-[60px] overflow-hidden rounded-[5px] border border-[#7C7C7C]/30">
                      <img
                        src={profilePhotoUrl}
                        alt="Profile Preview"
                        className="h-full w-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setPreviewImageUrl(profilePhotoUrl)}
                      />
                      <button
                        type="button"
                        onClick={removeProfilePhoto}
                        className="absolute top-1 right-1 bg-white/80 p-0.5 rounded-full hover:bg-white transition-colors shadow-sm"
                        aria-label="Remove profile photo"
                      >
                        <X className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className={fieldLabelClass}>Upload Images <span className="text-red-500">*</span></label>

                <input
                  ref={takePhotoInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files
                      ? Array.from(e.target.files)
                      : [];

                    console.log("Gallery photos selected:", {
                      count: files.length,
                      files: files.map((f) => ({
                        name: f.name,
                        size: f.size,
                        type: f.type,
                        lastModified: f.lastModified,
                      })),
                    });

                    if (!files.length) {
                      console.warn("No files selected");
                      return;
                    }

                    const validFiles = files.filter((file) => {
                      if (!(file instanceof File)) {
                        console.error("Invalid file object:", file);
                        return false;
                      }
                      return true;
                    });

                    if (validFiles.length !== files.length) {
                      console.warn(
                        `Filtered out ${files.length - validFiles.length} invalid files`,
                      );
                    }

                    const photoUrls = validFiles.map((file) => {
                      const url = URL.createObjectURL(file);
                      console.log(
                        "Created object URL for",
                        file.name,
                        ":",
                        url,
                      );
                      return url;
                    });

                    const filesSnapshot = [...validFiles];
                    const urlsSnapshot = [...photoUrls];
                    const nextPhotos = [...photos, ...urlsSnapshot];

                    console.log(
                      "Before setState - filesSnapshot length:",
                      filesSnapshot.length,
                    );
                    console.log(
                      "Before setState - urlsSnapshot length:",
                      urlsSnapshot.length,
                    );
                    console.log(
                      "Current photoFiles length:",
                      photoFiles.length,
                    );

                    setPhotoFiles((prev) => [...prev, ...filesSnapshot]);
                    setPhotos(nextPhotos);
                    setTouched((prev) => ({ ...prev, photos: true }));
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.photos;
                      return next;
                    });

                    validate(nextPhotos);

                    e.target.value = "";

                    console.log("Gallery photos state updated successfully");
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
                      {photos.length
                        ? `${photos.length} Photos Added`
                        : "Upload Images"}
                    </span>
                  </div>
                </button>

                {touched.photos && errors.photos && (
                  <p className="mt-2 text-sm text-red-500">{errors.photos}</p>
                )}

                {photos.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 font-lexend text-[12px] font-normal text-[#7C7C7C]">
                      Preview of {photos.length} uploaded image{photos.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#7C7C7C]/30 scrollbar-track-transparent">
                      {photos.map((photo, idx) => (
                        <div
                          key={idx}
                          className="relative group h-[60px] w-[60px] shrink-0 overflow-hidden rounded-[5px] border border-[#7C7C7C]/30"
                        >
                          <img
                            src={photo}
                            alt={`Upload ${idx + 1}`}
                            className="h-full w-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setPreviewImageUrl(photo)}
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryPhoto(idx)}
                            className="absolute top-1 right-1 bg-white/80 p-0.5 rounded-full hover:bg-white transition-colors shadow-sm"
                            aria-label={`Remove photo ${idx + 1}`}
                          >
                            <X className="h-3 w-3 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price */}
            <div>
              <label className={fieldLabelClass}>Set Pricing <span className="text-red-500">*</span></label>

              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className={inputBase}
              />
            </div>

            {/* Availability */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={fieldLabelClass}>Availability Start <span className="text-red-500">*</span></label>

                <input
                  type="date"
                  value={availabilityStartDate}
                  onChange={(e) => setAvailabilityStartDate(e.target.value)}
                  onBlur={() => handleBlur("availabilityStartDate")}
                  className={`
    ${inputBase}

    font-lexend
    font-light
    text-[12px]
    leading-[100%]
    tracking-[0%]

    ${availabilityStartDate ? "text-black" : "text-[#9B989E]"}

    [&::-webkit-datetime-edit]:font-lexend
    [&::-webkit-datetime-edit]:font-light
    [&::-webkit-datetime-edit]:text-[12px]

    ${
      availabilityStartDate
        ? "[&::-webkit-datetime-edit]:text-black"
        : "[&::-webkit-datetime-edit]:text-[#9B989E]"
    }

    [&::-webkit-calendar-picker-indicator]:opacity-100
  `}
                />
                {touched.availabilityStartDate &&
                  errors.availabilityStartDate && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.availabilityStartDate}
                    </p>
                  )}
              </div>

              <div>
                <label className={fieldLabelClass}>Availability End <span className="text-red-500">*</span></label>

                <input
                  type="date"
                  value={availabilityEndDate}
                  onChange={(e) => setAvailabilityEndDate(e.target.value)}
                  onBlur={() => handleBlur("availabilityEndDate")}
                  className={`
    ${inputBase}

    font-lexend
    font-light
    text-[12px]
    leading-[100%]
    tracking-[0%]

    ${availabilityEndDate ? "text-black" : "text-[#9B989E]"}

    [&::-webkit-datetime-edit]:font-lexend
    [&::-webkit-datetime-edit]:font-light
    [&::-webkit-datetime-edit]:text-[12px]

    ${
      availabilityEndDate
        ? "[&::-webkit-datetime-edit]:text-black"
        : "[&::-webkit-datetime-edit]:text-[#9B989E]"
    }

    [&::-webkit-calendar-picker-indicator]:opacity-100
  `}
                />
                {touched.availabilityEndDate && errors.availabilityEndDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.availabilityEndDate}
                  </p>
                )}
              </div>
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

            {/* Location Fields */}
            <div>
              <label className={fieldLabelClass}>Address <span className="text-red-500">*</span></label>

              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onBlur={() => handleBlur("address")}
                placeholder="Enter Street Address"
                className={`${inputBase} ${
                  touched.address && errors.address ? inputError : ""
                }`}
              />
              {touched.address && errors.address && (
                <p className="mt-1 text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={fieldLabelClass}>City <span className="text-red-500">*</span></label>

                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onBlur={() => handleBlur("city")}
                  placeholder="City"
                  className={`${inputBase} ${
                    touched.city && errors.city ? inputError : ""
                  }`}
                />
                {touched.city && errors.city && (
                  <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              <div>
                <label className={fieldLabelClass}>State <span className="text-red-500">*</span></label>

                <input
                  type="text"
                  value={locationState}
                  onChange={(e) => setLocationState(e.target.value)}
                  onBlur={() => handleBlur("locationState")}
                  placeholder="State"
                  className={`${inputBase} ${
                    touched.locationState && errors.locationState
                      ? inputError
                      : ""
                  }`}
                />
                {touched.locationState && errors.locationState && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.locationState}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className={fieldLabelClass}>Zip Code <span className="text-red-500">*</span></label>

              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                onBlur={() => handleBlur("zipCode")}
                placeholder="Zip Code"
                className={`${inputBase} ${
                  touched.zipCode && errors.zipCode ? inputError : ""
                }`}
              />
              {touched.zipCode && errors.zipCode && (
                <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 py-4 sm:px-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`h-[40px] w-full rounded-[5px] font-lexend text-[14px] font-semibold text-white flex items-center justify-center gap-2
    ${isSubmitting ? "bg-[#2f6f2a] opacity-80 cursor-not-allowed" : "bg-[#389131]"}
  `}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="white"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const imagePreviewModal = previewImageUrl ? (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
      onClick={() => setPreviewImageUrl(null)}
    >
      <div className="relative max-h-[90vh] max-w-[90vw]">
        <button
          className="absolute -top-10 right-0 text-white hover:text-gray-300"
          onClick={() => setPreviewImageUrl(null)}
          aria-label="Close preview"
        >
          <X className="h-8 w-8" />
        </button>
        <img
          src={previewImageUrl}
          alt="Full screen preview"
          className="max-h-[85vh] max-w-full rounded-lg object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  ) : null;

  return createPortal(
    <>
      {modal}
      {imagePreviewModal}
    </>,
    document.body
  );
};
