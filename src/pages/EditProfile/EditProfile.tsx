import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Settings,
  CircleHelp,
  ShieldCheck,
  LogOut,
  FileText,
  History,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { logout } from "../../store/authSlice.ts";
import { clearWishlist } from "../../store/wishlistSlice.ts";
import { logout as logoutApi } from "../../api/authApi.ts";
import { LogoutConfirmModal } from "../../components/Auth/LogoutConfirmModal.tsx";
import Loader from "../../components/common/Loader.tsx";
import { RootState } from "../../store";
import {
  getUserProfile,
  updateUserProfile,
  type EmergencyContactPayload,
  type UpdateUserProfilePayload,
  type UserProfileApiData,
} from "../../api/userApi.ts";
import chevronDown from "../../assets/images/Dorpdown.png";
import { type CountryOption, COUNTRY_OPTIONS } from "../../data/countries.ts";

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
    // eslint-disable-next-line jsx-a11y/img-redundant-alt
    <img
      src={url}
      alt={alt ?? code}
      className={className}
      onError={() => setBroken(true)}
    />
  );
};

const isFilled = (v?: string | null) => Boolean(v && String(v).trim());

const emergencyHasData = (ec?: EmergencyContactPayload | null) =>
  Boolean(
    ec && (isFilled(ec.name) || isFilled(ec.email) || isFilled(ec.phoneNumber)),
  );

const residentialFromProfile = (p: UserProfileApiData | null): string => {
  if (!p) return "";
  if (isFilled(p.residentialAddress))
    return String(p.residentialAddress).trim();
  if (isFilled(p.address)) return String(p.address).trim();
  const list = p.addresses;
  if (Array.isArray(list) && list.length > 0) {
    const first = list[0];
    if (typeof first === "string") return first.trim();
    if (first && typeof first === "object") {
      const o = first as Record<string, unknown>;
      const s =
        o.formattedAddress ?? o.address ?? o.street ?? o.line1 ?? o.city;
      if (typeof s === "string" && s.trim()) return s.trim();
    }
  }
  return "";
};

const legalDisplay = (p: UserProfileApiData | null) => {
  if (!p) return "";
  if (isFilled(p.legalName)) return String(p.legalName).trim();
  if (isFilled(p.fullName)) return String(p.fullName).trim();
  return "";
};

const DEFAULT_COUNTRY = COUNTRY_OPTIONS[0];

const parsePhoneNumber = (phone?: string) => {
  const raw = (phone ?? "").trim();
  if (!raw) return { country: DEFAULT_COUNTRY, local: "" };
  const digits = raw.replace(/[^0-9+]/g, "");
  // try to match by dialCode (longest first)
  const sorted = COUNTRY_OPTIONS.slice().sort(
    (a, b) => b.dialCode.length - a.dialCode.length,
  );
  const match = sorted.find(
    (c) =>
      digits.startsWith(c.dialCode.replace(/^\+/, "")) ||
      digits.startsWith(c.dialCode),
  );
  if (match) {
    const d = digits.startsWith("+") ? digits : `+${digits}`;
    const local = d.slice(match.dialCode.length).replace(/^0+/, "");
    return { country: match, local };
  }
  return { country: DEFAULT_COUNTRY, local: digits.replace(/^\+/, "") };
};

type ProfileUpdateErrorBody = {
  message?: string;
  errors?: Array<{ msg?: string; message?: string }>;
};

const formatProfileSaveError = (err: unknown): string => {
  const ax = err as AxiosError<ProfileUpdateErrorBody>;
  const list = ax.response?.data?.errors;
  if (Array.isArray(list) && list.length > 0) {
    const parts = list
      .map((e) => e.msg || e.message)
      .filter((s): s is string => Boolean(s && String(s).trim()));
    if (parts.length > 0) return parts.join(" ");
  }
  return ax.response?.data?.message || ax.message || "Could not save changes.";
};

type EditField =
  | "legalName"
  | "preferredFirstName"
  | "phoneNumber"
  | "email"
  | "residentialAddress"
  | "emergencyContact";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const reduxUser = useSelector((state: RootState) => state.auth.user);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfileApiData | null>(null);
  const [profileLoadFailed, setProfileLoadFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editField, setEditField] = useState<EditField | null>(null);
  const [saving, setSaving] = useState(false);

  const [draftLegal, setDraftLegal] = useState("");
  const [draftPreferred, setDraftPreferred] = useState("");
  const [draftPhone, setDraftPhone] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [draftResidential, setDraftResidential] = useState("");
  const [draftEcName, setDraftEcName] = useState("");
  const [draftEcEmail, setDraftEcEmail] = useState("");
  const [draftEcPhone, setDraftEcPhone] = useState("");
  const [draftEcNameError, setDraftEcNameError] = useState<string | null>(null);
  const [draftEcPhoneError, setDraftEcPhoneError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] =
    useState<CountryOption>(DEFAULT_COUNTRY);
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement | null>(null);

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      setProfileLoadFailed(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setProfileLoadFailed(false);
    try {
      const data = await getUserProfile();
      setProfile(data);
    } catch (err) {
      const ax = err as AxiosError<{ message?: string }>;
      const msg =
        ax.response?.data?.message ||
        ax.message ||
        "Could not load your profile.";
      toast.error(msg);
      setProfile(null);
      setProfileLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const openEditor = (field: EditField) => {
    if (!profile) return;
    if (field === "legalName") {
      setDraftLegal(legalDisplay(profile) || "");
    } else if (field === "preferredFirstName") {
      setDraftPreferred(profile.preferredFirstName?.trim() ?? "");
    } else if (field === "phoneNumber") {
      setDraftPhone(profile.phoneNumber?.trim() ?? "");
    } else if (field === "email") {
      setDraftEmail(profile.email?.trim() ?? "");
    } else if (field === "residentialAddress") {
      setDraftResidential(residentialFromProfile(profile));
    } else if (field === "emergencyContact") {
      setDraftEcName(profile.emergencyContact?.name?.trim() ?? "");
      setDraftEcEmail(profile.emergencyContact?.email?.trim() ?? "");
      const parsed = parsePhoneNumber(
        profile.emergencyContact?.phoneNumber ?? "",
      );
      setSelectedCountry(parsed.country);
      setDraftEcPhone(parsed.local);
      setDraftEcNameError(null);
      setDraftEcPhoneError(null);
    }
    setEditField(field);
  };

  const closeEditor = () => setEditField(null);

  useEffect(() => {
    if (!editField) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditField(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editField]);

  useEffect(() => {
    if (!countryMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target as Node)
      ) {
        setCountryMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [countryMenuOpen]);

  /** PATCH only the keys sent here — do not merge empty strings for other fields (server validates the body). */
  const persist = async (patch: UpdateUserProfilePayload) => {
    if (!profile) return;
    setSaving(true);
    try {
      const next = await updateUserProfile(patch);
      setProfile(next);
      toast.success("Profile updated");
      closeEditor();
    } catch (err) {
      toast.error(formatProfileSaveError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveField = () => {
    if (!profile || !editField) return;
    if (editField === "legalName") {
      const v = draftLegal.trim();
      if (!v) {
        toast.error("Enter a legal name");
        return;
      }
      void persist({ legalName: v });
      return;
    }
    if (editField === "preferredFirstName") {
      const pf = draftPreferred.trim();
      if (!pf) {
        toast.error("Enter a preferred first name (1–50 characters)");
        return;
      }
      void persist({ preferredFirstName: pf });
      return;
    }
    if (editField === "phoneNumber") {
      const v = draftPhone.trim();
      if (!v) {
        toast.error("Enter a phone number");
        return;
      }
      void persist({ phoneNumber: v });
      return;
    }
    if (editField === "email") {
      const v = draftEmail.trim();
      if (!v) {
        toast.error("Enter an email");
        return;
      }
      void persist({ email: v });
      return;
    }
    if (editField === "residentialAddress") {
      const v = draftResidential.trim();
      if (!v) {
        toast.error("Enter an address");
        return;
      }
      void persist({ residentialAddress: v });
      return;
    }
    if (editField === "emergencyContact") {
      const name = draftEcName.trim();
      const email = draftEcEmail.trim();
      const phoneNumber = draftEcPhone.trim();
      if (!name && !email && !phoneNumber) {
        toast.error("Add at least one emergency contact detail");
        return;
      }
      const normalized = phoneNumber
        ? phoneNumber.startsWith("+")
          ? phoneNumber
          : `${selectedCountry.dialCode}${phoneNumber}`
        : "";

      void persist({
        emergencyContact: { name, email, phoneNumber: normalized },
      });
    }
  };

  const menuItems = [
    {
      label: "Account Settings",
      icon: Settings,
      onClick: () => navigate("/account-settings"),
    },
    {
      label: "About US",
      icon: CircleHelp,
      onClick: () => navigate("/about"),
    },
    {
      label: "Privacy",
      icon: ShieldCheck,
      onClick: () => navigate("/trust-safety"),
    },
    {
      label: "Terms & Conditions",
      icon: FileText,
      onClick: () => navigate("/trust-safety"),
    },
    {
      label: "Transaction History",
      icon: History,
      onClick: () => navigate("/booking"),
    },
    {
      label: "Log Out",
      icon: LogOut,
      onClick: () => setIsLogoutConfirmOpen(true),
    },
  ] as const;

  const handleLogout = async () => {
    try {
      await logoutApi();
    } finally {
      dispatch(logout());
      dispatch(clearWishlist());
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("openLoginAfterLogout", "1");
      }
      navigate("/", { replace: true });
      toast.success("Logged out successfully");
    }
  };

  const personalRows = useMemo(() => {
    const p = profile;
    const legal = legalDisplay(p);
    const preferred = p?.preferredFirstName?.trim() ?? "";
    const phone = p?.phoneNumber?.trim() ?? "";
    const email = p?.email?.trim() ?? reduxUser?.email?.trim() ?? "";
    const residential = residentialFromProfile(p);
    const ec = p?.emergencyContact;

    return [
      {
        key: "legalName" as const,
        label: "Legal name",
        value: legal,
        placeholder: "Not provided",
        hasData: isFilled(legal),
      },
      {
        key: "preferredFirstName" as const,
        label: "Preferred First Name",
        value: preferred,
        placeholder: "Not provided",
        hasData: isFilled(preferred),
      },
      {
        key: "phoneNumber" as const,
        label: "Phone number",
        value: phone,
        placeholder: "Provide phone number",
        hasData: isFilled(phone),
      },
      {
        key: "email" as const,
        label: "Email",
        value: email,
        placeholder: "Not provided",
        hasData: isFilled(email),
      },
      {
        key: "residentialAddress" as const,
        label: "Residential Address",
        value: residential,
        placeholder: "Not provided",
        hasData: isFilled(residential),
      },
      {
        key: "emergencyContact" as const,
        label: "Emergency contact",
        value: emergencyHasData(ec)
          ? [ec?.name, ec?.phoneNumber, ec?.email].filter(isFilled).join(" · ")
          : "",
        placeholder: "Not provided",
        hasData: emergencyHasData(ec),
      },
    ];
  }, [profile, reduxUser?.email]);

  const cardBtn =
    "shrink-0 text-[22px] font-medium leading-[100%] tracking-normal text-[#389131] underline decoration-solid hover:text-[#2f7a2a]";

  const inputEditClass =
    "h-[44px] w-full rounded-[2px] border border-black bg-white px-4 text-[14px] text-black outline-none";
  const inputEmergencyFieldClass =
    "w-full rounded-sm border border-black bg-white px-3 py-2.5 text-[14px] text-gray-900 outline-none focus:ring-1 focus:ring-black/20";

  const profileCardClass =
    "flex h-[71px] w-full max-w-[539px] shrink-0 items-center justify-between rounded-[3px] border border-[#00000042] bg-white px-4 text-left transition-colors hover:bg-[#fafafa] lg:w-[539px]";

  const personalCardClass =
    "min-h-[71px] w-full max-w-[593px] rounded-[2px] border border-[#D9D9D9] bg-white px-5 py-4 lg:w-[593px]";
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white">
      <div className="w-full px-[40px] py-6 sm:py-8">
        <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          {/* LEFT SIDE */}
          <div className="flex w-full flex-col lg:max-w-[539px]">
            <header>
              <h1 className="text-[36px] font-medium leading-[100%] text-black">
                Profile
              </h1>
            </header>

            <nav className="mt-6 flex flex-col gap-5">
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    className={profileCardClass}
                  >
                    <span className="flex items-center gap-3">
                      <Icon
                        className="size-[21px] shrink-0 text-black"
                        strokeWidth={1.75}
                      />

                      <span className="text-2xl font-medium leading-[100%] text-black">
                        {item.label}
                      </span>
                    </span>

                    <ChevronRight
                      className="size-[21px] shrink-0 text-black"
                      strokeWidth={1.75}
                    />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex w-full flex-col lg:max-w-[593px]">
            <header>
              <h2 className="text-[36px] font-medium leading-[100%] text-black">
                Personal info
              </h2>
            </header>

            <div className="mt-6 flex flex-col gap-5">
              {loading ? (
                <div className={personalCardClass}>
                  <div className="flex items-center justify-center py-6">
                    <Loader />
                  </div>
                </div>
              ) : !isAuthenticated ? (
                <div className={personalCardClass}>
                  <p className="text-sm text-black/70">
                    Sign in to view and edit your personal information.
                  </p>
                </div>
              ) : profileLoadFailed ? (
                <div className="w-full max-w-[593px] rounded-[3px] border border-[#00000042] bg-white p-4 lg:w-[593px]">
                  <p className="text-sm text-black">
                    We could not load your profile from the server.
                  </p>

                  <button
                    type="button"
                    onClick={() => void loadProfile()}
                    className="mt-3 rounded-md bg-[#389131] px-4 py-2 text-sm font-medium text-white hover:bg-[#2f7a2a]"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                personalRows.map((row) => {
                  const isActive = editField === row.key;
                  const dimOthers = editField !== null && !isActive;

                  return (
                    <div
                      key={row.key}
                      className={`${personalCardClass} ${
                        dimOthers ? "opacity-40" : "opacity-100"
                      }`}
                    >
                      {isActive ? (
                        <div className="flex min-h-[71px] flex-col justify-center">
                          <p className="text-[14px] font-semibold text-black mb-2">
                            {row.label}
                          </p>

                          {row.key === "legalName" && (
                            <input
                              value={draftLegal}
                              onChange={(e) => setDraftLegal(e.target.value)}
                              className={inputEditClass}
                              placeholder="Legal name as on ID"
                              autoComplete="name"
                            />
                          )}

                          {row.key === "preferredFirstName" && (
                            <input
                              value={draftPreferred}
                              onChange={(e) =>
                                setDraftPreferred(e.target.value)
                              }
                              className={inputEditClass}
                              placeholder="Preferred first name"
                            />
                          )}

                          {row.key === "phoneNumber" && (
                            <input
                              value={draftPhone}
                              onChange={(e) => setDraftPhone(e.target.value)}
                              className={inputEditClass}
                              placeholder="Phone number"
                            />
                          )}

                          {row.key === "email" && (
                            <input
                              type="email"
                              value={draftEmail}
                              onChange={(e) => setDraftEmail(e.target.value)}
                              className={inputEditClass}
                              placeholder="Email"
                            />
                          )}

                          {row.key === "residentialAddress" && (
                            <textarea
                              value={draftResidential}
                              onChange={(e) =>
                                setDraftResidential(e.target.value)
                              }
                              rows={3}
                              className={`${inputEditClass} resize-none`}
                              placeholder="Street, city, state, ZIP"
                            />
                          )}

                          {row.key === "emergencyContact" && (
                            <div className="mt-2 space-y-2">
                              <input
                                value={draftEcName}
                                onChange={(e) => setDraftEcName(e.target.value)}
                                className={inputEmergencyFieldClass}
                                placeholder="Contact name"
                              />

                              <input
                                type="email"
                                value={draftEcEmail}
                                onChange={(e) =>
                                  setDraftEcEmail(e.target.value)
                                }
                                className={inputEmergencyFieldClass}
                                placeholder="Contact email"
                              />

                              <div
                                className="relative w-full"
                                ref={countryDropdownRef}
                              >
                                <div className="h-[40px] bg-white border border-black rounded-[5px] flex items-center px-3 gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCountryMenuOpen((p) => !p)
                                    }
                                    className="flex items-center gap-2 rounded-[5px] bg-transparent px-1 py-1 text-left outline-none"
                                  >
                                    <CountryFlag
                                      code={selectedCountry.code}
                                      url={selectedCountry.flagUrl}
                                      alt={selectedCountry.name}
                                      className="w-[20px] h-[12px] object-cover rounded-[1px]"
                                    />
                                    <span className="text-[14px] font-normal text-[#929191] leading-[15px]">
                                      {selectedCountry.dialCode}
                                    </span>
                                    <img
                                      src={chevronDown}
                                      alt="dropdown"
                                      className="w-[8.5px] h-[6px] mt-1 pointer-events-none"
                                    />
                                  </button>
                                  <input
                                    type="tel"
                                    value={draftEcPhone}
                                    onChange={(e) =>
                                      setDraftEcPhone(e.target.value)
                                    }
                                    className="flex-1 bg-transparent outline-none text-[15px] text-black custom-placeholder placeholder:text-[#9B989E] font-normal"
                                    placeholder="Contact phone"
                                  />
                                </div>

                                {countryMenuOpen && (
                                  <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-[10px] border border-[#D1D5DB] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                                    {COUNTRY_OPTIONS.map((country) => (
                                      <button
                                        type="button"
                                        key={country.code}
                                        onClick={() => {
                                          setSelectedCountry(country);
                                          setCountryMenuOpen(false);
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#111827] hover:bg-[#F3F4F6]"
                                      >
                                        <CountryFlag
                                          code={country.code}
                                          url={country.flagUrl}
                                          alt={country.name}
                                          className="w-[20px] h-[12px] object-cover rounded-[1px]"
                                        />
                                        <span className="flex-1 truncate">
                                          {country.name}
                                        </span>
                                        <span className="text-[13px] text-[#6B7280]">
                                          {country.dialCode}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={handleSaveField}
                            disabled={saving}
                            className="mt-3 h-[36px] w-[90px] rounded-[4px] bg-[#389131] text-[14px] font-semibold text-white hover:bg-[#2f7a2a] disabled:opacity-50"
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-between gap-3">
                          <div className="flex min-w-0 flex-1 flex-col justify-center">
                            <p className="text-[14px] font-medium leading-[100%] text-black">
                              {row.label}
                            </p>

                            <p
                              className={`mt-[6px] truncate text-[11px] font-light leading-[100%] ${
                                row.hasData ? "text-black" : "text-black/45"
                              }`}
                            >
                              {row.hasData ? row.value : row.placeholder}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => openEditor(row.key)}
                            className={cardBtn}
                          >
                            {row.hasData ? "Edit" : "Add"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <LogoutConfirmModal
          isOpen={isLogoutConfirmOpen}
          onCancel={() => setIsLogoutConfirmOpen(false)}
          onConfirm={() => {
            setIsLogoutConfirmOpen(false);
            void handleLogout();
          }}
        />
      </div>
    </div>
  );
};

export default Profile;
