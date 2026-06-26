import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ChevronLeft, ChevronDown, AlertTriangle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { logout } from "../../store/authSlice.ts";
import { clearWishlist } from "../../store/wishlistSlice.ts";
import { logout as logoutApi } from "../../api/authApi.ts";
import { LogoutConfirmModal } from "../../components/Auth/LogoutConfirmModal.tsx";
import Loader from "../../components/common/Loader.tsx";

import ActionConfirmModal from "../../components/common/ActionConfirmModal.tsx";
import { updateUser } from "../../store/authSlice.ts";
import { RootState } from "../../store/index.ts";
import {
  getUserProfile,
  updateUserProfile,
  type UpdateUserProfilePayload,
  type UserProfileApiData,
} from "../../api/userApi.ts";
import uploadProfilePhoto from "../../api/uploadApi.ts";
import { type CountryOption, COUNTRY_OPTIONS } from "../../data/countries.ts";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

const DEFAULT_COUNTRY = COUNTRY_OPTIONS[0];

const parsePhoneNumber = (
  phone?: string
): { country: CountryOption; local: string } => {
  const raw = (phone ?? "").trim();
  if (!raw) return { country: DEFAULT_COUNTRY, local: "" };
  const digits = raw.replace(/[^0-9+]/g, "");
  const sorted = COUNTRY_OPTIONS.slice().sort(
    (a, b) => b.dialCode.length - a.dialCode.length
  );
  const match = sorted.find(
    (c) =>
      digits.startsWith(c.dialCode.replace(/^\+/, "")) ||
      digits.startsWith(c.dialCode)
  );
  if (match) {
    const d = digits.startsWith("+") ? digits : `+${digits}`;
    const local = d.slice(match.dialCode.length).replace(/^0+/, "");
    return { country: match, local };
  }
  return { country: DEFAULT_COUNTRY, local: digits.replace(/^\+/, "") };
};

type ProfileSaveErrorBody = {
  message?: string;
  errors?: Array<{ msg?: string; message?: string }>;
};

const formatSaveError = (err: unknown): string => {
  const ax = err as AxiosError<ProfileSaveErrorBody>;
  const list = ax.response?.data?.errors;
  if (Array.isArray(list) && list.length > 0) {
    const parts = list
      .map((e) => e.msg || e.message)
      .filter((s): s is string => Boolean(s && String(s).trim()));
    if (parts.length > 0) return parts.join(" ");
  }
  return (
    ax.response?.data?.message || ax.message || "Could not save changes."
  );
};

const sanitizePublicId = (p?: string | null): string | null => {
  if (!p) return null;
  let s = String(p).trim();
  s = s.replace(/^\s*["']+|["']+\s*$/g, "");
  s = s.replace(/%22/g, "");
  s = s.replace(/^\/+|\/+$/g, "");
  return s || null;
};

const cloudinaryBase = "https://res.cloudinary.com/dpsy0wq7d/image/upload";

const LAST_UPLOAD_KEY = "haulhub_profile_image_last";

const getLastUpload = (): {
  publicId?: string;
  url?: string;
  ts?: number;
} | null => {
  try {
    const raw = localStorage.getItem(LAST_UPLOAD_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { publicId?: string; url?: string; ts?: number };
  } catch {
    return null;
  }
};

const setLastUpload = (publicId?: string | null, url?: string | null) => {
  try {
    if (!publicId || !url) {
      localStorage.removeItem(LAST_UPLOAD_KEY);
      return;
    }
    const cleanId = sanitizePublicId(publicId) ?? String(publicId);
    localStorage.setItem(
      LAST_UPLOAD_KEY,
      JSON.stringify({ publicId: cleanId, url, ts: Date.now() })
    );
  } catch {
    // ignore
  }
};

/* ─── CountryFlag sub-component ───────────────────────────────────────────── */

const countryCodeToEmoji = (code: string) => {
  if (!code) return "";
  try {
    return code
      .toUpperCase()
      .split("")
      .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
      .join("");
  } catch {
    return "";
  }
};

const CountryFlag: React.FC<{
  code: string;
  url: string;
  alt?: string;
  className?: string;
}> = ({ code, url, alt, className }) => {
  const [broken, setBroken] = useState(false);
  if (!url || broken) {
    return (
      <div
        className={`${className ?? ""} flex items-center justify-center text-[12px]`}
      >
        {countryCodeToEmoji(code)}
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={alt ?? code}
      className={className}
      onError={() => setBroken(true)}
    />
  );
};

/* ─── PhoneInput sub-component ────────────────────────────────────────────── */

interface PhoneInputProps {
  country: CountryOption;
  local: string;
  onCountryChange: (c: CountryOption) => void;
  onLocalChange: (v: string) => void;
  placeholder?: string;
  id?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  country,
  local,
  onCountryChange,
  onLocalChange,
  placeholder = "Enter your phone number",
  id,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = COUNTRY_OPTIONS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search)
  );

  return (
    <div
      ref={ref}
      className={`relative flex items-center h-[52px] rounded-xl border border-[#D0D5DD] bg-white px-4 gap-2 focus-within:border-[#4A9B3D] focus-within:ring-2 focus-within:ring-[#4A9B3D]/20 transition-all ${open ? 'z-50' : ''}`}
    >
      {/* Flag + dial code button */}
      <button
        type="button"
        onClick={() => {
          setSearch("");
          setOpen((p) => !p);
        }}
        className="flex items-center gap-1 lg:gap-1.5 shrink-0 py-1 outline-none"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <CountryFlag
          code={country.code}
          url={country.flagUrl}
          alt={country.name}
          className="w-[20px] h-[14px] lg:w-[24px] lg:h-[16px] object-cover rounded-[2px] shrink-0"
        />
        <span className="text-[13px] lg:text-[14px] text-[#344054] font-medium whitespace-nowrap">
          {country.dialCode}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#667085]" />
      </button>

      <div className="w-px h-5 lg:h-6 bg-[#D0D5DD] shrink-0" />

      <input
        id={id}
        type="tel"
        value={local}
        onChange={(e) => onLocalChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-[14px] lg:text-[15px] text-[#101828] placeholder:text-[#98A2B3] font-normal min-w-0"
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full max-h-[260px] overflow-hidden rounded-xl border border-[#D0D5DD] bg-white shadow-[0_12px_32px_rgba(16,24,40,0.12)]">
          <div className="p-2 border-b border-[#F2F4F7]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country..."
              className="w-full px-3 py-2 rounded-lg border border-[#D0D5DD] text-[13px] outline-none focus:border-[#4A9B3D]"
              autoFocus
            />
          </div>
          <ul className="overflow-y-auto max-h-[196px]" role="listbox">
            {filtered.map((c) => (
              <li key={c.code} role="option" aria-selected={c.code === country.code}>
                <button
                  type="button"
                  onClick={() => {
                    onCountryChange(c);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[14px] hover:bg-[#F9FAFB] transition-colors ${
                    c.code === country.code ? "bg-[#F0FAF0]" : ""
                  }`}
                >
                  <CountryFlag
                    code={c.code}
                    url={c.flagUrl}
                    alt={c.name}
                    className="w-[24px] h-[16px] object-cover rounded-[2px] shrink-0"
                  />
                  <span className="flex-1 truncate text-[#344054]">
                    {c.name}
                  </span>
                  <span className="text-[13px] text-[#667085]">
                    {c.dialCode}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/* ─── Field label ──────────────────────────────────────────────────────────── */

const FieldLabel: React.FC<{
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ htmlFor, required, children }) => (
  <label
    htmlFor={htmlFor}
    className="block text-[13px] lg:text-[14px] font-semibold text-[#101828] mb-1 lg:mb-1.5"
  >
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

/* ─── Text input ───────────────────────────────────────────────────────────── */

const TextInput: React.FC<
  React.InputHTMLAttributes<HTMLInputElement>
> = (props) => (
  <input
    {...props}
    className={`w-full h-[48px] lg:h-[52px] rounded-xl border border-[#D0D5DD] bg-white px-3 lg:px-4 text-[14px] lg:text-[15px] text-[#101828] placeholder:text-[#98A2B3] outline-none transition-all focus:border-[#4A9B3D] focus:ring-2 focus:ring-[#4A9B3D]/20 ${props.className ?? ""}`}
  />
);

/* ─── Main component ───────────────────────────────────────────────────────── */

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  /* profile state */
  const [profile, setProfile] = useState<UserProfileApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  /* avatar */
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* form fields */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");

  /* phone */
  const [phoneCountry, setPhoneCountry] = useState<CountryOption>(DEFAULT_COUNTRY);
  const [phoneLocal, setPhoneLocal] = useState("");

  /* emergency phone */
  const [ecCountry, setEcCountry] = useState<CountryOption>(DEFAULT_COUNTRY);
  const [ecLocal, setEcLocal] = useState("");

  /* country dropdown */
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(DEFAULT_COUNTRY);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryDropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!countryOpen) return;
    const handler = (e: MouseEvent) => {
      if (countryDropRef.current && !countryDropRef.current.contains(e.target as Node))
        setCountryOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [countryOpen]);

  const filteredCountries = COUNTRY_OPTIONS.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  /* ── load profile ── */
  const loadProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getUserProfile();
      setProfile(data);

      /* populate fields */
      const fn =
        data.firstName?.trim() ||
        data.legalName?.trim()?.split(" ").filter(Boolean)[0] ||
        data.fullName?.trim()?.split(" ").filter(Boolean)[0] ||
        "";
      const ln =
        data.lastName?.trim() ||
        data.preferredFirstName?.trim() ||
        (() => {
          const full = data.fullName?.trim();
          if (!full) return "";
          const parts = full.split(/\s+/).filter(Boolean);
          return parts.length > 1 ? parts.slice(1).join(" ") : "";
        })();

      setFirstName(fn);
      setLastName(ln);
      setEmail(data.email?.trim() ?? "");

      if (data.dateOfBirth) {
        setDob(data.dateOfBirth.split("T")[0]);
      }

      if (data.addresses && data.addresses.length > 0) {
        const addr = data.addresses[0];
        setAddress(addr.addressLine || "");
        setCity(addr.state || addr.city || "");
        if (addr.country) {
          const match = COUNTRY_OPTIONS.find(
            (c) =>
              c.code.toLowerCase() === addr.country?.toLowerCase() ||
              c.name.toLowerCase() === addr.country?.toLowerCase()
          );
          if (match) setSelectedCountry(match);
        }
      } else {
        setAddress(data.residentialAddress?.trim() || data.address?.trim() || "");
        setCity(data.state?.trim() ?? "");
        if (data.country) {
          const match = COUNTRY_OPTIONS.find(
            (c) =>
              c.code.toLowerCase() === data.country?.toLowerCase() ||
              c.name.toLowerCase() === data.country?.toLowerCase()
          );
          if (match) setSelectedCountry(match);
        }
      }
      setZipCode("");

      /* phone */
      const parsedPhone = parsePhoneNumber(data.phoneNumber ?? "");
      setPhoneCountry(parsedPhone.country);
      setPhoneLocal(parsedPhone.local);

      /* emergency contact */
      const ec = data.emergencyContact;
      if (ec?.phoneNumber) {
        const parsedEc = parsePhoneNumber(ec.phoneNumber);
        setEcCountry(parsedEc.country);
        setEcLocal(parsedEc.local);
      }

      /* avatar */
      try {
        const last = getLastUpload();
        const lastId = sanitizePublicId(last?.publicId ?? null);
        const dataId = sanitizePublicId(data.profilePicture ?? null);
        if (lastId && dataId && lastId === dataId) {
          setUploadedPreviewUrl(last?.url ?? null);
        }
      } catch {
        // ignore
      }
    } catch {
      toast.error("Could not load your profile.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  /* ── avatar url ── */
  const sanitizedPicture = sanitizePublicId(profile?.profilePicture ?? null);
  let profilePictureUrl: string | null = null;
  if (uploadedPreviewUrl) {
    profilePictureUrl = uploadedPreviewUrl;
  } else if (sanitizedPicture) {
    if (/^https?:\/\//i.test(sanitizedPicture) || /^data:/i.test(sanitizedPicture)) {
      profilePictureUrl = sanitizedPicture;
    } else {
      profilePictureUrl = `${cloudinaryBase}/${sanitizedPicture}.jpg`;
    }
  }
  const hasProfilePicture = Boolean(profilePictureUrl);

  const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");

  /* ── photo upload ── */
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file?.type.startsWith("image/")) return;
    setUploadingPhoto(true);
    try {
      const uploadResp = await uploadProfilePhoto(file);
      if (!uploadResp?.success) throw new Error("Image upload failed");
      const publicId = uploadResp.data.publicId;
      const uploadedUrl = uploadResp.data.url;
      setUploadedPreviewUrl(uploadedUrl);
      setLastUpload(publicId, uploadedUrl);
      setImgError(false);
      setImgLoaded(false);
      const updated = await updateUserProfile({ profilePicture: uploadedUrl });
      setProfile(updated);
      dispatch(updateUser({ profilePicture: updated.profilePicture ?? undefined }));
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(formatSaveError(err));
    } finally {
      setUploadingPhoto(false);
    }
  };

  /* ── save ── */
  const handleSave = async () => {
    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim();

    if (!fn) { toast.error("First name is required"); return; }
    if (!ln) { toast.error("Last name is required"); return; }
    if (!em) { toast.error("Email is required"); return; }

    const phoneNumber = phoneLocal.trim()
      ? phoneLocal.startsWith("+")
        ? phoneLocal
        : `${phoneCountry.dialCode}${phoneLocal}`
      : undefined;

    const ecPhoneNumber = ecLocal.trim()
      ? ecLocal.startsWith("+")
        ? ecLocal
        : `${ecCountry.dialCode}${ecLocal}`
      : undefined;

    const payload: UpdateUserProfilePayload = {
      firstName: fn,
      lastName: ln,
      legalName: `${fn} ${ln}`,
      email: em,
      residentialAddress: address.trim() || undefined,
      state: city.trim() || undefined,
      country: selectedCountry.code,
      dateOfBirth: dob || undefined,
      addresses: [
        {
          addressLine: address.trim() || undefined,
          state: city.trim() || undefined,
          country: selectedCountry.code,
        }
      ],
      ...(phoneNumber ? { phoneNumber } : {}),
      ...(ecPhoneNumber
        ? {
            emergencyContact: {
              name: "",
              email: "",
              phoneNumber: ecPhoneNumber,
            },
          }
        : {}),
    };

    setSaving(true);
    try {
      const updated = await updateUserProfile(payload);
      setProfile(updated);
      dispatch(
        updateUser({
          firstName: updated.firstName ?? fn,
          lastName: updated.lastName ?? ln,
          email: updated.email,
          profilePicture: updated.profilePicture ?? undefined,
          phoneNumber: updated.phoneNumber,
        })
      );
      navigate("/profile")
    } catch (err) {
      toast.error(formatSaveError(err));
    } finally {
      setSaving(false);
    }
  };

  /* ── render ── */
  return (
    <div className="min-h-screen w-full bg-[#F9FAFB] relative z-20 pb-20">
      {/* ── Page header ── */}
      <div className="w-full bg-white border-b border-[#E4E7EC] px-4 sm:px-6 lg:px-8 py-4 lg:py-5 flex items-center gap-3 lg:gap-4">
        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="flex items-center gap-1 lg:gap-1.5 text-[#667085] hover:text-[#344054] transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
          <span className="text-[13px] lg:text-[14px] font-medium">Back</span>
        </button>
        <div className="w-px h-4 lg:h-5 bg-[#E4E7EC]" />
        <h1 className="text-[20px] sm:text-[24px] lg:text-[28px] leading-[100%] font-semibold text-[#101828] font-['Lexend']">
          Edit Profile
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-[#4A9B3D] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <div className="flex flex-col gap-8 lg:gap-10 items-center">

            {/* ══ TOP PANEL — Avatar + quick info ══ */}
            <aside className="w-full max-w-full lg:max-w-[480px] shrink-0">
              <div className="flex flex-col items-center gap-4 lg:gap-5">

                {/* Avatar */}
                <div className="relative w-[110px] h-[110px] sm:w-[120px] sm:h-[120px] lg:w-[140px] lg:h-[140px]">
                  <div className="w-full h-full rounded-full bg-[#E6EEF5] shadow-md overflow-hidden flex items-center justify-center relative">
                    {hasProfilePicture && !imgLoaded && !imgError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100/60">
                        <svg
                          className="animate-spin h-7 w-7 text-[#4A9B3D]"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                      </div>
                    )}
                    {imgError || !hasProfilePicture ? (
                      <span className="text-[52px] font-semibold text-[#4A9B3D] leading-none select-none">
                        {initials || "?"}
                      </span>
                    ) : (
                      <img
                        src={profilePictureUrl!}
                        alt={displayName}
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgError(true)}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          imgLoaded ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    )}
                  </div>

                  {/* Camera button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    aria-label="Change profile photo"
                    className="absolute bottom-1 right-1 w-[40px] h-[40px] rounded-full bg-[#4A9B3D] flex items-center justify-center shadow-lg hover:bg-[#3d8432] transition-colors disabled:opacity-60"
                  >
                    {uploadingPhoto ? (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                    ) : (
                      <Camera className="w-4 h-4 text-white" />
                    )}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(ev) => void handlePhotoChange(ev)}
                    disabled={uploadingPhoto}
                  />
                </div>

                {/* Display name */}
                {displayName && (
                  <p className="text-[18px] lg:text-[20px] font-semibold text-[#101828] text-center leading-tight font-['Lexend'] break-words px-4 w-full">
                    {displayName}
                  </p>
                )}
                {email && (
                  <p className="text-[12px] lg:text-[13px] text-[#667085] text-center -mt-1 lg:-mt-2 truncate max-w-full">
                    {email}
                  </p>
                )}

                <p className="text-[11px] lg:text-[12px] text-[#98A2B3] text-center leading-relaxed px-4">
                  Click the camera icon to update your profile photo
                </p>
              </div>
            </aside>

            {/* Divider between profile and other stuff */}
            <div className="w-full h-px bg-[#E4E7EC]" />

            {/* ══ BOTTOM PANEL — Form ══ */}
            <main className="w-full">
              <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-[0_1px_4px_rgba(16,24,40,0.06)] p-5 sm:p-6 lg:p-8">

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
                    {/* First Name */}
                    <div className="col-span-1 lg:col-span-1">
                      <FieldLabel htmlFor="ep-firstName" required>First Name</FieldLabel>
                      <TextInput
                        id="ep-firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Rohit"
                        autoComplete="given-name"
                      />
                    </div>

                    {/* Last Name */}
                    <div className="col-span-1 lg:col-span-1">
                      <FieldLabel htmlFor="ep-lastName" required>Last Name</FieldLabel>
                      <TextInput
                        id="ep-lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Talreja"
                        autoComplete="family-name"
                      />
                    </div>

                    {/* Email */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                      <FieldLabel htmlFor="ep-email" required>Email</FieldLabel>
                      <TextInput
                        id="ep-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rohittalreja104@gmail.com"
                        autoComplete="email"
                      />
                      <p className="mt-1 lg:mt-1.5 text-[11px] lg:text-[12px] text-[#667085]">
                        We'll email you a reservation confirmation.
                      </p>
                    </div>

                    {/* Phone Number */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                      <FieldLabel htmlFor="ep-phone" required>Phone Number</FieldLabel>
                      <PhoneInput
                        id="ep-phone"
                        country={phoneCountry}
                        local={phoneLocal}
                        onCountryChange={setPhoneCountry}
                        onLocalChange={setPhoneLocal}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                      <FieldLabel htmlFor="ep-dob" required>Date of birth</FieldLabel>
                      <div className="relative">
                        <TextInput
                          id="ep-dob"
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          placeholder="DD/MM/YY"
                          className="pr-12"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                      <FieldLabel htmlFor="ep-address" required>Address</FieldLabel>
                      <TextInput
                        id="ep-address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter address"
                        autoComplete="street-address"
                      />
                    </div>

                    {/* Country dropdown */}
                    <div ref={countryDropRef} className="col-span-1 sm:col-span-2 lg:col-span-2">
                      <FieldLabel required>Country</FieldLabel>
                      <div className={`relative ${countryOpen ? 'z-50' : ''}`}>
                        <button
                          type="button"
                          onClick={() => { setCountrySearch(""); setCountryOpen((p) => !p); }}
                          className="w-full h-[48px] lg:h-[52px] rounded-xl border border-[#D0D5DD] bg-white px-3 lg:px-4 flex items-center gap-2 lg:gap-3 text-left outline-none transition-all focus:border-[#4A9B3D] focus:ring-2 focus:ring-[#4A9B3D]/20 hover:border-[#98A2B3]"
                          aria-haspopup="listbox"
                          aria-expanded={countryOpen}
                        >
                          <CountryFlag
                            code={selectedCountry.code}
                            url={selectedCountry.flagUrl}
                            alt={selectedCountry.name}
                            className="w-[20px] h-[14px] lg:w-[24px] lg:h-[16px] object-cover rounded-[2px] shrink-0"
                          />
                          <span className="flex-1 text-[14px] lg:text-[15px] text-[#101828] truncate">
                            {selectedCountry.name}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-[#667085] transition-transform ${countryOpen ? "rotate-180" : ""}`} />
                        </button>

                        {countryOpen && (
                          <div className="absolute left-0 top-full z-50 mt-1 w-full max-h-[260px] overflow-hidden rounded-xl border border-[#D0D5DD] bg-white shadow-[0_12px_32px_rgba(16,24,40,0.12)]">
                            <div className="p-2 border-b border-[#F2F4F7]">
                              <input
                                type="text"
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                placeholder="Search country..."
                                className="w-full px-3 py-2 rounded-lg border border-[#D0D5DD] text-[13px] outline-none focus:border-[#4A9B3D]"
                                autoFocus
                              />
                            </div>
                            <ul className="overflow-y-auto max-h-[196px]" role="listbox">
                              {filteredCountries.map((c) => (
                                <li key={c.code} role="option" aria-selected={c.code === selectedCountry.code}>
                                  <button
                                    type="button"
                                    onClick={() => { setSelectedCountry(c); setCountryOpen(false); setCountrySearch(""); }}
                                    className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[14px] hover:bg-[#F9FAFB] transition-colors ${c.code === selectedCountry.code ? "bg-[#F0FAF0]" : ""}`}
                                  >
                                    <CountryFlag
                                      code={c.code}
                                      url={c.flagUrl}
                                      alt={c.name}
                                      className="w-[24px] h-[16px] object-cover rounded-[2px] shrink-0"
                                    />
                                    <span className="flex-1 truncate text-[#344054]">{c.name}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* City */}
                    <div className="col-span-1 lg:col-span-1">
                      <FieldLabel htmlFor="ep-city" required>City</FieldLabel>
                      <TextInput
                        id="ep-city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter your city"
                        autoComplete="address-level2"
                      />
                    </div>

                    {/* Zip Code */}
                    <div className="col-span-1 lg:col-span-1">
                      <FieldLabel htmlFor="ep-zip" required>Zip Code</FieldLabel>
                      <TextInput
                        id="ep-zip"
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="Enter zip code"
                        autoComplete="postal-code"
                      />
                    </div>

                    {/* Emergency Contact */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                      <FieldLabel htmlFor="ep-ecPhone">Emergency Contact Number</FieldLabel>
                      <PhoneInput
                        id="ep-ecPhone"
                        country={ecCountry}
                        local={ecLocal}
                        onCountryChange={setEcCountry}
                        onLocalChange={setEcLocal}
                        placeholder="Enter emergency contact"
                      />
                    </div>
                </div>

                {/* ── Save button ── */}
                <div className="mt-8 lg:mt-10 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="w-full sm:w-auto h-[48px] px-8 rounded-xl border border-[#D0D5DD] text-[14px] lg:text-[15px] font-semibold text-[#344054] bg-white hover:bg-[#F9FAFB] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={saving}
                    className="w-full sm:w-auto h-[48px] px-10 rounded-xl bg-[#4A9B3D] text-[14px] lg:text-[15px] font-semibold text-white hover:bg-[#3d8432] active:bg-[#347029] transition-colors disabled:opacity-60 shadow-[0_1px_3px_rgba(74,155,61,0.4)] flex items-center justify-center"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Saving…
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            </main>

          </div>
        </div>
      )}

      <ActionConfirmModal
        visible={showCancelModal}
        title="Discard Changes?"
        description="Are you sure you want to discard your changes? Any unsaved edits will be lost."
        confirmLabel="Keep Editing"
        cancelLabel="Discard"
        onConfirm={() => setShowCancelModal(false)}
        onCancel={() => {
          setShowCancelModal(false);
          navigate(-1);
        }}
        icon={<AlertTriangle className="w-8 h-8 text-amber-500" strokeWidth={2} />}
      />
    </div>
  );
};

export default EditProfile;
