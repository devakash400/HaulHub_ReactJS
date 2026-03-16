import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  CreditCard,
  IdCard,
  Car,
  Upload,
  FileText,
  RotateCw,
} from "lucide-react";
import { lockScroll } from "../../utils/scrollLock.ts";
import { ModalHeader } from "../ModalHeader.tsx";

type MethodKey = "driving_licence" | "passport" | "identity_card";

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
  identity_card: {
    label: "Identify card",
    placeholder: "Enter Identify card",
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
    identity_card: "",
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement | null>(null);
  const idDocumentInputRef = useRef<HTMLInputElement | null>(null);

  const isIOS = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iPad|iPhone|iPod/i.test(navigator.userAgent);
  }, []);

  // iOS shows the Camera/Media picker sheet reliably when `accept="image/*"`.
  // If we include PDFs in accept, iOS often routes to the Files picker instead.
  const idDocumentAccept = useMemo(() => {
    return isIOS ? "image/*" : "image/*,application/pdf,.pdf";
  }, [isIOS]);

  const activeNumber = documentNumbers[openMethod];
  const isMethodContinueDisabled = useMemo(() => {
    return !issuingCountryRegion.trim() || !activeNumber.trim();
  }, [issuingCountryRegion, activeNumber]);

  const isEmailValid = useMemo(() => {
    const trimmed = email.trim();
    if (!trimmed) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  }, [email]);

  const missingDetailsFields = useMemo(() => {
    const missing: string[] = [];
    if (!firstName.trim()) missing.push("First name");
    if (!lastName.trim()) missing.push("Last name");
    if (!dateOfBirth.trim()) missing.push("Date of birth");
    if (!email.trim()) missing.push("Email");
    else if (!isEmailValid) missing.push("Valid email");
    if (!phoneNumber.trim()) missing.push("Phone number");
    if (!idDocument) missing.push("ID document");
    return missing;
  }, [firstName, lastName, dateOfBirth, email, isEmailValid, phoneNumber, idDocument]);

  const isDetailsContinueDisabled = useMemo(() => {
    return (
      !firstName.trim() ||
      !lastName.trim() ||
      !dateOfBirth.trim() ||
      !email.trim() ||
      !isEmailValid ||
      !phoneNumber.trim() ||
      !idDocument
    );
  }, [
    firstName,
    lastName,
    dateOfBirth,
    email,
    isEmailValid,
    phoneNumber,
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
      identity_card: "",
    });
    setProfilePhoto(null);
    setFirstName("");
    setLastName("");
    setDateOfBirth("");
    setEmail("");
    setPhoneNumber("");
    setIdDocument(null);
  }, [isOpen, defaultIssuingCountryRegion]);

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="identity-verification-title"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-lg max-h-[85vh] overflow-hidden"
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
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[85vh]">
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

              <div className="space-y-3">
                {(Object.keys(METHOD_META) as MethodKey[]).map((key) => {
                  const meta = METHOD_META[key];
                  const Icon = meta.icon;
                  const isOpenMethod = openMethod === key;
                  return (
                    <div key={key} className="border border-gray-200 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setOpenMethod(key)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-4"
                        aria-expanded={isOpenMethod}
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 border border-gray-200">
                            <Icon className="w-5 h-5 text-gray-800" aria-hidden />
                          </span>
                          <span className="text-sm sm:text-base font-medium text-gray-900">
                            {meta.label}
                          </span>
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-700 transition-transform ${
                            isOpenMethod ? "rotate-180" : ""
                          }`}
                          aria-hidden
                        />
                      </button>

                      {isOpenMethod && (
                        <div className="px-4 pb-4">
                          <input
                            type="text"
                            value={documentNumbers[key]}
                            onChange={(e) =>
                              setDocumentNumbers((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                            placeholder={meta.placeholder}
                            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#389131] focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

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
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 Enter your phone number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#389131] focus:border-transparent"
                />
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
};

