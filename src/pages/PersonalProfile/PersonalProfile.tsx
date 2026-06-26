import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Mars, CalendarDays, Pencil } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../store/index.ts";
import { getUserProfile, type UserProfileApiData } from "../../api/userApi.ts";

/* ─── helpers ────────────────────────────────────────────────────────────── */

const cloudinaryBase = "https://res.cloudinary.com/dpsy0wq7d/image/upload";

const sanitizePublicId = (p?: string | null): string | null => {
  if (!p) return null;
  let s = String(p).trim();
  s = s.replace(/^\s*["']+|["']+\s*$/g, "");
  s = s.replace(/%22/g, "");
  s = s.replace(/^\/+|\/+$/g, "");
  return s || null;
};

const formatDate = (iso?: string): string => {
  if (!iso) return "Not provided";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Not provided";
  }
};

/* ─── Avatar ─────────────────────────────────────────────────────────────── */

const Avatar: React.FC<{
  src?: string | null;
  initials: string;
  displayName: string;
  size?: "sm" | "lg";
}> = ({ src, initials, displayName, size = "lg" }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const dim =
    size === "lg"
      ? "w-[110px] h-[110px] sm:w-[120px] sm:h-[120px] lg:w-[140px] lg:h-[140px]"
      : "w-[56px] h-[56px]";
  const textSize =
    size === "lg"
      ? "text-[42px] lg:text-[52px]"
      : "text-[22px]";

  return (
    <div
      className={`${dim} rounded-full bg-[#E6EEF5] flex items-center justify-center overflow-hidden shrink-0 shadow-md relative`}
    >
      {src && !error ? (
        <>
          {!loaded && (
            <span className={`${textSize} font-semibold text-[#4A9B3D] select-none absolute`}>
              {initials || "?"}
            </span>
          )}
          <img
            src={src}
            alt={displayName}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          />
        </>
      ) : (
        <span className={`${textSize} font-semibold text-[#4A9B3D] select-none`}>
          {initials || "?"}
        </span>
      )}
    </div>
  );
};

/* ─── Info field (grid cell) ─────────────────────────────────────────────── */

const InfoField: React.FC<{ label: string; value?: string | null; className?: string }> = ({
  label,
  value,
  className
}) => (
  <div className={className}>
    <label className="block text-[13px] lg:text-[14px] font-semibold text-[#101828] mb-1 lg:mb-1.5">
      {label}
    </label>
    <div className="flex items-center w-full h-[48px] lg:h-[52px] rounded-xl border border-[#D0D5DD] bg-white px-3 lg:px-4 text-[14px] lg:text-[15px] text-[#101828]">
      {value?.trim() || "—"}
    </div>
  </div>
);

/* ─── Skeleton ───────────────────────────────────────────────────────────── */

const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-[#E4E7EC] rounded ${className ?? ""}`} />
);

/* ─── Main component ─────────────────────────────────────────────────────── */

const PersonalProfile: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const [profile, setProfile] = useState<UserProfileApiData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getUserProfile();
      setProfile(data);
    } catch {
      toast.error("Could not load your profile.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  /* ── derived values ── */
  const firstName =
    profile?.firstName?.trim() ||
    profile?.fullName?.trim()?.split(/\s+/)[0] ||
    "";
  const lastName =
    profile?.lastName?.trim() ||
    (() => {
      const parts = profile?.fullName?.trim()?.split(/\s+/) ?? [];
      return parts.length > 1 ? parts.slice(1).join(" ") : "";
    })();
  const fullName =
    profile?.fullName?.trim() ||
    profile?.legalName?.trim() ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    "";
  const displayName = fullName;
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");

  const sanitizedPicture = sanitizePublicId(profile?.profilePicture ?? null);
  let profilePictureUrl: string | null = null;
  if (sanitizedPicture) {
    if (
      /^https?:\/\//i.test(sanitizedPicture) ||
      /^data:/i.test(sanitizedPicture)
    ) {
      profilePictureUrl = sanitizedPicture;
    } else {
      profilePictureUrl = `${cloudinaryBase}/${sanitizedPicture}.jpg`;
    }
  }

  const country = (() => {
    if (profile?.addresses && profile.addresses.length > 0) {
      return profile.addresses[0].country || "";
    }
    return profile?.country || "";
  })();

  const zipCode = (() => {
    if (profile?.addresses && profile.addresses.length > 0) {
      return (profile.addresses[0] as { zipCode?: string }).zipCode || "";
    }
    return (profile as unknown as { zipCode?: string })?.zipCode || "";
  })();

  const role = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1).toLowerCase()
    : "";

  const dob = formatDate(profile?.dateOfBirth);
  const gender = (profile as any)?.gender?.trim() || null;

  /* ── render ── */
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F9FAFB]">
      {/* ── Page header ── */}
      <div className="w-full bg-white border-b border-[#E4E7EC] px-4 sm:px-6 lg:px-8 py-4 lg:py-5 flex items-center justify-between">
        <div className="flex items-center gap-3 lg:gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 lg:gap-1.5 text-[#667085] hover:text-[#344054] transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-[13px] lg:text-[14px] font-medium">Back</span>
          </button>
          <div className="w-px h-4 lg:h-5 bg-[#E4E7EC] hidden sm:block" />
          <h1 className="hidden sm:block text-[20px] sm:text-[24px] lg:text-[28px] leading-[100%] font-semibold text-[#101828] font-['Lexend']">
            Personal Profile
          </h1>
        </div>
        
        <button
          onClick={() => navigate('/edit-profile')}
          className="flex items-center gap-1.5 px-3 py-1.5 lg:px-4 lg:py-2 bg-white border border-[#D0D5DD] rounded-lg shadow-sm text-[13px] lg:text-[14px] font-medium text-[#344054] hover:bg-[#F9FAFB] hover:text-[#101828] transition-colors"
        >
          <Pencil className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          Edit Profile
        </button>
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
                <Avatar
                  src={profilePictureUrl}
                  initials={initials}
                  displayName={displayName}
                  size="lg"
                />
                <div className="flex flex-col items-center gap-1.5">
                  <h1 className="text-[20px] lg:text-[24px] font-bold text-[#101828] font-['Lexend'] leading-tight text-center">
                    {displayName || "—"}
                  </h1>
                  <div className="flex items-center gap-4">
                    {/* Gender row */}
                    <div className="flex items-center gap-1.5">
                      <Mars className="w-4 h-4 text-[#2B7FE5]" />
                      <span className="text-[13px] lg:text-[14px] text-[#2B7FE5] font-medium">
                        {gender || "Not specified"}
                      </span>
                    </div>
                    {/* DOB row */}
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4 text-[#E04848]" />
                      <span className="text-[13px] lg:text-[14px] text-[#667085] font-medium">
                        {dob}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Divider */}
            <div className="w-full h-px bg-[#E4E7EC]" />

            {/* ══ BOTTOM PANEL — Form ══ */}
            <main className="w-full">
              <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-[0_1px_4px_rgba(16,24,40,0.06)] p-5 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
                  {/* First Name */}
                  <InfoField label="FirstName" value={firstName} className="col-span-1 lg:col-span-1" />
                  {/* Last Name */}
                  <InfoField label="LastName" value={lastName} className="col-span-1 lg:col-span-1" />
                  {/* Email */}
                  <InfoField label="Email" value={profile?.email} className="col-span-1 sm:col-span-2 lg:col-span-2" />
                  {/* Role */}
                  <InfoField label="Role" value={role} className="col-span-1 sm:col-span-2 lg:col-span-2" />
                  {/* Country */}
                  <InfoField label="Country" value={country} className="col-span-1 sm:col-span-2 lg:col-span-2" />
                  {/* Full Name */}
                  <InfoField label="FullName" value={fullName} className="col-span-1 sm:col-span-2 lg:col-span-2" />
                  {/* Zip Code */}
                  <InfoField label="Zip Code" value={zipCode} className="col-span-1 lg:col-span-1" />
                </div>
              </div>
            </main>

          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalProfile;