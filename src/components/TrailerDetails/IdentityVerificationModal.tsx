import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CreditCard, IdCard, Car, Upload, FileText, RotateCw } from "lucide-react";
import { lockScroll } from "../../utils/scrollLock.ts";
import { ModalHeader } from "../ModalHeader.tsx";

type MethodKey =
  | "driving_licence"
  | "passport"
  | "liability_document"
  | "digital_signature";

export type IdentityVerificationData = {
  issuingCountryRegion: string;
  method: MethodKey;
  documentNumber: string;
  profilePhoto?: File | null;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  idDocument?: File | null;
  /** Optional uploaded digital signature image */
  digitalSignatureFile?: File | null;
};

export interface IdentityVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (data: IdentityVerificationData) => void;
  defaultIssuingCountryRegion?: string;
}

const METHOD_META: Record<
  MethodKey,
  { label: string; placeholder: string; icon: React.ComponentType<{ className?: string }> }
> = {
  driving_licence: {
    label: "Driving licence",
    placeholder: "Enter Driving licence Number",
    icon: Car,
  },
  passport: {
    label: "Passport",
    placeholder: "Enter Passport",
    icon: CreditCard,
  },
  liability_document: {
    label: "Liability Document",
    placeholder: "Enter Liability Document",
    icon: IdCard,
  },
  digital_signature: {
    label: "Digital Signature",
    placeholder: "Sign below",
    icon: IdCard,
  },
};

export const IdentityVerificationModal: React.FC<
  IdentityVerificationModalProps
> = ({ isOpen, onClose, onContinue, defaultIssuingCountryRegion = "USA" }) => {
  const [step, setStep] = useState<"method" | "details">("method");
  const [issuingCountryRegion, setIssuingCountryRegion] = useState(
    defaultIssuingCountryRegion
  );
  const [openMethod, setOpenMethod] = useState<MethodKey>("driving_licence");
  const [documentNumbers, setDocumentNumbers] = useState<
    Record<MethodKey, string>
  >({
    driving_licence: "",
    passport: "",
    liability_document: "",
    digital_signature: "",
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [methodFiles, setMethodFiles] = useState<Record<MethodKey, File | null>>({
    driving_licence: null,
    passport: null,
    liability_document: null,
    digital_signature: null,
  });
  const profilePhotoInputRef = useRef<HTMLInputElement | null>(null);
  const idDocumentInputRef = useRef<HTMLInputElement | null>(null);
  const methodFileInputRef = useRef<HTMLInputElement | null>(null);
  const digitalSignatureInputRef = useRef<HTMLInputElement | null>(null);
  const [digitalSignaturePreviewUrl, setDigitalSignaturePreviewUrl] = useState<string | null>(null);

  const isIOS = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iPad|iPhone|iPod/i.test(navigator.userAgent);
  }, []);

  // iOS shows the Camera/Media picker sheet reliably when `accept="image/*"`.
  // If we include PDFs in accept, iOS often routes to the Files picker instead.
  const idDocumentAccept = useMemo(() => {
    return isIOS ? "image/*" : "image/*,application/pdf,.pdf";
  }, [isIOS]);

  const isMethodContinueDisabled = useMemo(() => {
    return !issuingCountryRegion.trim();
  }, [issuingCountryRegion]);

  const isEmailValid = useMemo(() => {
    const trimmed = email.trim();
    if (!trimmed) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  }, [email]);

  const isPhoneValid = useMemo(() => {
    const digitsOnly = phoneNumber.replace(/\D/g, "");
    return digitsOnly.length === 10;
  }, [phoneNumber]);

  const missingDetailsFields = useMemo(() => {
    const missing: string[] = [];
    if (!firstName.trim()) missing.push("First name");
    if (!lastName.trim()) missing.push("Last name");
    if (!dateOfBirth.trim()) missing.push("Date of birth");
    if (!email.trim()) missing.push("Email");
    else if (!isEmailValid) missing.push("Valid email");
    if (!phoneNumber.trim()) missing.push("Phone number");
    else if (!isPhoneValid) missing.push("Valid 10-digit phone number");
    if (!idDocument) missing.push("ID document");
    return missing;
  }, [
    firstName,
    lastName,
    dateOfBirth,
    email,
    isEmailValid,
    phoneNumber,
    isPhoneValid,
    idDocument,
  ]);

  const isDetailsContinueDisabled = useMemo(() => {
    return (
      !firstName.trim() ||
      !lastName.trim() ||
      !dateOfBirth.trim() ||
      !email.trim() ||
      !isEmailValid ||
      !phoneNumber.trim() ||
      !isPhoneValid ||
      !idDocument
    );
  }, [
    firstName,
    lastName,
    dateOfBirth,
    email,
    isEmailValid,
    phoneNumber,
    isPhoneValid,
    idDocument,
  ]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleEscape);
    const unlock = lockScroll();
    return () => {
      document.removeEventListener("keydown", handleEscape);
      unlock();
    };
  }, [isOpen, handleEscape]);

  useEffect(() => {
    if (!isOpen) return;
    setStep("method");
    setIssuingCountryRegion(defaultIssuingCountryRegion);
    setOpenMethod("driving_licence");
    setDocumentNumbers({
      driving_licence: "",
      passport: "",
      liability_document: "",
      digital_signature: "",
    });
    setProfilePhoto(null);
    setFirstName("");
    setLastName("");
    setDateOfBirth("");
    setEmail("");
    setPhoneNumber("");
    setIdDocument(null);
    setMethodFiles({
      driving_licence: null,
      passport: null,
      liability_document: null,
      digital_signature: null,
    });
    setDigitalSignaturePreviewUrl(null);
  }, [isOpen, defaultIssuingCountryRegion]);

  const handleMethodFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      setMethodFiles((prev) => ({
        ...prev,
        [openMethod]: file,
      }));
    }
    // Reset input so selecting the same file again still triggers change
    event.target.value = "";
  };

  const handleOpenCurrentPdf = () => {
    const file = methodFiles[openMethod];
    if (!file || typeof window === "undefined") return;
    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener");
    // Revoke after a short delay to give the browser time to load it
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const handleDownloadCurrentPdf = () => {
    const file = methodFiles[openMethod];
    if (!file || typeof window === "undefined" || typeof document === "undefined")
      return;
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name || "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDigitalSignatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setMethodFiles((prev) => ({
      ...prev,
      digital_signature: file,
    }));

    if (digitalSignaturePreviewUrl) {
      URL.revokeObjectURL(digitalSignaturePreviewUrl);
    }

    if (file) {
      const url = URL.createObjectURL(file);
      setDigitalSignaturePreviewUrl(url);
    } else {
      setDigitalSignaturePreviewUrl(null);
    }

    event.target.value = "";
  };

  const clearDigitalSignature = () => {
    setMethodFiles((prev) => ({
      ...prev,
      digital_signature: null,
    }));
    if (digitalSignaturePreviewUrl) {
      URL.revokeObjectURL(digitalSignaturePreviewUrl);
    }
    setDigitalSignaturePreviewUrl(null);
  };

  const handleMethodContinue = () => {
    if (isMethodContinueDisabled) return;
    setStep("details");
  };

  const handleDetailsContinue = () => {
    if (isDetailsContinueDisabled) return;
    onContinue({
      issuingCountryRegion: issuingCountryRegion.trim(),
      method: openMethod,
      documentNumber: documentNumbers[openMethod].trim(),
      profilePhoto,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      idDocument,
      digitalSignatureFile: methodFiles.digital_signature ?? null,
    });
    onClose();
  };

  const clearIdDocument = () => {
    setIdDocument(null);
    if (idDocumentInputRef.current) idDocumentInputRef.current.value = "";
  };

  const clearProfilePhoto = () => {
    setProfilePhoto(null);
    if (profilePhotoInputRef.current) profilePhotoInputRef.current.value = "";
  };

  if (!isOpen) return null;

  const modal = (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="identity-verification-title"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          title={
            step === "method"
              ? "Which Method Would You Like To Use?"
              : "Verify your Identity"
          }
          onClose={onClose}
          variant="close"
          titleId="identity-verification-title"
        />
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          <p className="text-sm text-gray-600 text-center">
            {step === "method"
              ? "We’ll use this to verify your identity and won’t share it with other trailer."
              : "Complete the details below to continue."}
          </p>

          <div className="mt-6 space-y-4">
          {step === "method" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issuing country/region
                </label>
                <input
                  type="text"
                  value={issuingCountryRegion}
                  onChange={(e) => setIssuingCountryRegion(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#389131] focus:border-transparent"
                />
              </div>

              <input
                ref={methodFileInputRef}
                type="file"
                accept="image/*,application/pdf,.pdf"
                className="hidden"
                onChange={handleMethodFileChange}
              />
              <input
                ref={digitalSignatureInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleDigitalSignatureChange}
              />

              <div className="space-y-3">
                {(Object.keys(METHOD_META) as MethodKey[]).map((key) => {
                  const meta = METHOD_META[key];
                  const Icon = meta.icon;
                  const isActive = openMethod === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setOpenMethod(key)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                        isActive
                          ? "border-[#389131] bg-green-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                            <Icon className="h-5 w-5" aria-hidden />
                          </span>
                          <p className="text-sm font-medium text-gray-900">
                            {meta.label}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenMethod(key);
                            if (key === "digital_signature") {
                              digitalSignatureInputRef.current?.click();
                            } else {
                              methodFileInputRef.current?.click();
                            }
                          }}
                          className="inline-flex items-center justify-center rounded-full p-1.5 hover:bg-gray-100"
                          aria-label={`Upload ${meta.label} file`}
                        >
                          <Upload className="h-5 w-5 text-gray-500" aria-hidden />
                        </button>
                      </div>
                    </button>
                  );
                })}
              </div>

              {methodFiles[openMethod] && (
                <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={handleOpenCurrentPdf}
                    className="w-full sm:w-auto border border-gray-800 text-gray-900 rounded-lg px-6 py-2.5 text-sm font-medium bg-white hover:bg-gray-50 transition-colors"
                  >
                    Open PDF
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadCurrentPdf}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white bg-[#389131] hover:bg-[#2f7a29] transition-colors"
                  >
                    <Upload className="h-4 w-4 text-white" aria-hidden />
                    <span>Download PDF</span>
                  </button>
                </div>
              )}

              {openMethod === "digital_signature" && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-3 space-y-3">
                  <p className="text-sm text-gray-700">
                    Upload a photo of your signature.
                  </p>
                  <button
                    type="button"
                    onClick={() => digitalSignatureInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4" aria-hidden />
                    <span>Upload Signature Image</span>
                  </button>
                  {digitalSignaturePreviewUrl && (
                    <div className="mt-2 flex flex-col gap-2">
                      <div className="border border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
                        <img
                          src={digitalSignaturePreviewUrl}
                          alt="Digital signature preview"
                          className="w-full max-h-32 object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={clearDigitalSignature}
                        className="self-start text-xs font-medium text-gray-600 hover:text-gray-900"
                      >
                        Remove signature
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleMethodContinue}
                disabled={isMethodContinueDisabled}
                aria-disabled={isMethodContinueDisabled}
                className={`w-full mt-2 py-3.5 text-sm font-semibold rounded-lg transition-opacity focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2 ${
                  isMethodContinueDisabled
                    ? "bg-[#389131]/60 text-white cursor-not-allowed"
                    : "bg-[#389131] text-white hover:opacity-90"
                }`}
              >
                Continue
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Picture
                </label>
                <input
                  ref={profilePhotoInputRef}
                  type="file"
                  accept="image/*"
                  multiple={false}
                  className="hidden"
                  onChange={(e) => setProfilePhoto(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  onClick={() => profilePhotoInputRef.current?.click()}
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" aria-hidden />
                  <span className="truncate">
                    {profilePhoto ? profilePhoto.name : "Upload Photo"}
                  </span>
                </button>
                {profilePhoto && (
                  <button
                    type="button"
                    onClick={clearProfilePhoto}
                    className="mt-2 text-xs font-medium text-gray-600 hover:text-gray-900"
                  >
                    Remove photo
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#389131] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#389131] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#389131] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  aria-invalid={email.trim().length > 0 && !isEmailValid}
                  className={`w-full border rounded-lg px-3 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#389131] focus:border-transparent ${
                    email.trim().length > 0 && !isEmailValid
                      ? "border-red-400"
                      : "border-gray-300"
                  }`}
                />
                {email.trim().length > 0 && !isEmailValid && (
                  <p className="mt-1 text-xs text-red-600">
                    Please enter a valid email address.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm flex items-center gap-2">
                  <span className="text-sm">🇺🇸</span>
                  <span className="text-gray-600">+1</span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "");
                      setPhoneNumber(digitsOnly.slice(0, 10));
                    }}
                    placeholder="Enter 10-digit phone number"
                    className="flex-1 outline-none text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                {phoneNumber.trim() && !isPhoneValid && (
                  <p className="mt-1 text-xs text-red-600">
                    Phone number must be 10 digits.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload ID Document
                </label>
                <input
                  ref={idDocumentInputRef}
                  type="file"
                  accept={idDocumentAccept}
                  multiple={false}
                  className="hidden"
                  onChange={(e) => setIdDocument(e.target.files?.[0] ?? null)}
                />
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2.5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => idDocumentInputRef.current?.click()}
                    className="flex-1 text-left text-sm text-gray-600 truncate"
                  >
                    {idDocument ? (
                      <span className="inline-flex items-center gap-2 text-gray-800">
                        <FileText className="w-4 h-4" aria-hidden />
                        <span className="truncate">{idDocument.name}</span>
                      </span>
                    ) : (
                      "Passport/ Driver’s License / National ID"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => idDocumentInputRef.current?.click()}
                    className="shrink-0 inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <FileText className="w-4 h-4" aria-hidden />
                    Choose File
                  </button>

                  <button
                    type="button"
                    onClick={clearIdDocument}
                    disabled={!idDocument}
                    aria-disabled={!idDocument}
                    className={`shrink-0 inline-flex items-center justify-center rounded-md px-2 py-2 transition-colors ${
                      idDocument
                        ? "text-gray-700 hover:bg-gray-50"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                    title="Clear file"
                  >
                    <RotateCw className="w-5 h-5" aria-hidden />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDetailsContinue}
                disabled={isDetailsContinueDisabled}
                aria-disabled={isDetailsContinueDisabled}
                className={`w-full mt-2 py-3.5 text-sm font-semibold rounded-lg transition-opacity focus:outline-none focus:ring-2 focus:ring-[#389131] focus:ring-offset-2 ${
                  isDetailsContinueDisabled
                    ? "bg-[#389131]/60 text-white cursor-not-allowed"
                    : "bg-[#389131] text-white hover:opacity-90"
                }`}
              >
                Continue
              </button>
              {isDetailsContinueDisabled && missingDetailsFields.length > 0 && (
                <p className="mt-2 text-xs text-gray-600">
                  Missing:{" "}
                  <span className="font-medium text-gray-800">
                    {missingDetailsFields.join(", ")}
                  </span>
                </p>
              )}
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return modal;
  return createPortal(modal, document.body);
};

