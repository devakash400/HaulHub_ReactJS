import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import settingsIcon from "../../assets/images/Personalinfo.png";
import privacyicon from "../../assets/images/privacypolicy.png";
import termsicon from "../../assets/images/termscondition.png";
import transactionicon from "../../assets/images/transactionhistory.png";
import chevronDown from "../../assets/images/Dorpdown.png";
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
import { RootState } from "../../store";
import {
  getUserProfile,
  updateUserProfile,
  type EmergencyContactPayload,
  type UpdateUserProfilePayload,
  type UserProfileApiData,
} from "../../api/userApi.ts";

type CountryOption = {
  code: string;
  name: string;
  dialCode: string;
  flagUrl: string;
};

const COUNTRY_OPTIONS: CountryOption[] = [
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    flagUrl: "https://flagcdn.com/w20/us.png",
  },
  {
    code: "CA",
    name: "Canada",
    dialCode: "+1",
    flagUrl: "https://flagcdn.com/w20/ca.png",
  },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    flagUrl: "https://flagcdn.com/w20/gb.png",
  },
  {
    code: "IN",
    name: "India",
    dialCode: "+91",
    flagUrl: "https://flagcdn.com/w20/in.png",
  },
  {
    code: "AU",
    name: "Australia",
    dialCode: "+61",
    flagUrl: "https://flagcdn.com/w20/au.png",
  },
  {
    code: "DE",
    name: "Germany",
    dialCode: "+49",
    flagUrl: "https://flagcdn.com/w20/de.png",
  },
  {
    code: "FR",
    name: "France",
    dialCode: "+33",
    flagUrl: "https://flagcdn.com/w20/fr.png",
  },
];

const parsePhoneNumber = (phone?: string | null) => {
  const raw = String(phone ?? "").trim();
  if (!raw) {
    return { country: COUNTRY_OPTIONS[0], localNumber: "" };
  }
  const matched = COUNTRY_OPTIONS.find((country) =>
    raw.startsWith(country.dialCode),
  );
  if (matched) {
    return {
      country: matched,
      localNumber: raw.slice(matched.dialCode.length).replace(/\D/g, ""),
    };
  }
  return { country: COUNTRY_OPTIONS[0], localNumber: raw.replace(/\D/g, "") };
};

const validatePhoneDigits = (value: string) => {
  if (value && !/^\d+$/.test(value)) {
    return "Phone number can only contain digits.";
  }
  if (value && value.length !== 10) {
    return "Phone number must be exactly 10 digits.";
  }
  return null;
};

const validateEmail = (value: string) => {
  const email = value.trim();
  if (!email) return "Enter an email address.";
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValidEmail) return "Enter a valid email address.";
  if (!email.toLowerCase().endsWith("@gmail.com")) {
    return "Email must be a Gmail address.";
  }
  return null;
};

const isFilled = (v?: string | null) => Boolean(v && String(v).trim());

const emergencyHasData = (ec?: EmergencyContactPayload | null) =>
  Boolean(
    ec && (isFilled(ec.name) || isFilled(ec.email) || isFilled(ec.phoneNumber)),
  );

const residentialFromProfile = (p: UserProfileApiData | null): string => {
  if (!p) return "";

  const addressLine = isFilled(p.residentialAddress)
    ? String(p.residentialAddress).trim()
    : isFilled(p.address)
      ? String(p.address).trim()
      : (() => {
          const list = p.addresses;
          if (Array.isArray(list) && list.length > 0) {
            const first = list[0];
            if (typeof first === "string") return first.trim();
            if (first && typeof first === "object") {
              const o = first as Record<string, unknown>;
              const s =
                o.formattedAddress ??
                o.address ??
                o.addressLine ??
                o.addressLine1 ??
                o.street ??
                o.line1 ??
                o.city;
              if (typeof s === "string" && s.trim()) return s.trim();
            }
          }
          return "";
        })();

  const locationParts = [p.state?.trim(), p.country?.trim()].filter(isFilled);
  return [addressLine, ...locationParts].filter(isFilled).join(", ");
};

const firstNameDisplay = (p: UserProfileApiData | null) => {
  if (!p) return "";
  if (isFilled(p.firstName)) return String(p.firstName).trim();
  if (isFilled(p.legalName)) return String(p.legalName).trim();
  if (isFilled(p.fullName)) {
    const parts = String(p.fullName).trim().split(" ").filter(Boolean);
    return parts[0] ?? "";
  }
  return "";
};

const lastNameDisplay = (p: UserProfileApiData | null) => {
  if (!p) return "";
  if (isFilled(p.lastName)) return String(p.lastName).trim();
  if (isFilled(p.preferredFirstName))
    return String(p.preferredFirstName).trim();
  if (isFilled(p.fullName)) {
    const parts = String(p.fullName).trim().split(" ").filter(Boolean);
    return parts.length > 1 ? parts.slice(1).join(" ") : "";
  }
  return "";
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

type RightPanelView = "personalInfo" | "transactionHistory";

type TransactionStatus = "pending" | "confirmed" | "canceled";

type TransactionItem = {
  id: string;
  name: string;
  transactionId: string;
  amount: string;
  status: TransactionStatus;
  date: string;
  avatarLetter: string;
  avatarColor: string;
};

const TRANSACTIONS: TransactionItem[] = [
  {
    id: "1",
    name: "Groceries",
    transactionId: "TXN-2023-001234",
    amount: "$ 350.00",
    status: "pending",
    date: "16 Jan 2023 11:21 AM",
    avatarLetter: "G",
    avatarColor: "#F4A4C8",
  },
  {
    id: "2",
    name: "demo",
    transactionId: "TXN-2023-001235",
    amount: "$ 174.00",
    status: "confirmed",
    date: "15 Jan 2023 09:45 AM",
    avatarLetter: "S",
    avatarColor: "#8FD99A",
  },
  {
    id: "3",
    name: "john",
    transactionId: "TXN-2023-001236",
    amount: "$ 174.00",
    status: "confirmed",
    date: "14 Jan 2023 03:12 PM",
    avatarLetter: "S",
    avatarColor: "#C4A8F4",
  },
  {
    id: "4",
    name: "Rental",
    transactionId: "TXN-2023-001237",
    amount: "$ 220.00",
    status: "canceled",
    date: "12 Jan 2023 06:30 PM",
    avatarLetter: "R",
    avatarColor: "#B8E6C8",
  },
];

const transactionStatusLabel: Record<TransactionStatus, string> = {
  pending: "pending",
  confirmed: "Confirmed",
  canceled: "Canceled",
};

const transactionStatusClass: Record<TransactionStatus, string> = {
  pending: "text-[#E67E22]",
  confirmed: "text-[#389131]",
  canceled: "text-[#E74C3C]",
};

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
  const [rightPanel, setRightPanel] = useState<RightPanelView>("personalInfo");

  const [draftLegal, setDraftLegal] = useState("");
  const [draftPreferred, setDraftPreferred] = useState("");
  const [draftPhone, setDraftPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    COUNTRY_OPTIONS[0],
  );
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement | null>(null);
  const [draftEmail, setDraftEmail] = useState("");
  const [draftResidentialCountry, setDraftResidentialCountry] = useState("");
  const [draftResidentialState, setDraftResidentialState] = useState("");
  const [draftResidentialLine1, setDraftResidentialLine1] = useState("");
  const [draftEcName, setDraftEcName] = useState("");
  const [draftEcEmail, setDraftEcEmail] = useState("");
  const [draftEcPhone, setDraftEcPhone] = useState("");
  const [draftLegalError, setDraftLegalError] = useState<string | null>(null);
  const [draftPreferredError, setDraftPreferredError] = useState<string | null>(
    null,
  );
  const [residentialCountryError, setResidentialCountryError] = useState<
    string | null
  >(null);
  const [residentialStateError, setResidentialStateError] = useState<
    string | null
  >(null);
  const [residentialLine1Error, setResidentialLine1Error] = useState<
    string | null
  >(null);
  const [draftEcNameError, setDraftEcNameError] = useState<string | null>(null);
  const [draftEcPhoneError, setDraftEcPhoneError] = useState<string | null>(
    null,
  );
  const [selectedEmergencyCountry, setSelectedEmergencyCountry] =
    useState<CountryOption>(COUNTRY_OPTIONS[0]);
  const [emergencyCountryOpen, setEmergencyCountryOpen] = useState(false);
  const emergencyDropdownRef = useRef<HTMLDivElement | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emergencyPhoneError, setEmergencyPhoneError] = useState<string | null>(
    null,
  );
  const [emergencyEmailError, setEmergencyEmailError] = useState<string | null>(
    null,
  );
  const [generalError, setGeneralError] = useState<string | null>(null);

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
      setDraftLegal(firstNameDisplay(profile) || "");
    } else if (field === "preferredFirstName") {
      setDraftPreferred(lastNameDisplay(profile) || "");
    } else if (field === "phoneNumber") {
      const parsed = parsePhoneNumber(profile.phoneNumber?.trim() ?? "");
      setSelectedCountry(parsed.country);
      setDraftPhone(parsed.localNumber);
    } else if (field === "email") {
      setDraftEmail(profile.email?.trim() ?? "");
    } else if (field === "residentialAddress") {
      setDraftResidentialLine1(
        profile.residentialAddress?.trim() ?? profile.address?.trim() ?? "",
      );
      setDraftResidentialState(profile.state?.trim() ?? "");
      setDraftResidentialCountry(profile.country?.trim() ?? "");
    } else if (field === "emergencyContact") {
      setDraftEcName(profile.emergencyContact?.name?.trim() ?? "");
      setDraftEcEmail(profile.emergencyContact?.email?.trim() ?? "");
      const parsed = parsePhoneNumber(
        profile.emergencyContact?.phoneNumber?.trim() ?? "",
      );
      setSelectedEmergencyCountry(parsed.country);
      setDraftEcPhone(parsed.localNumber);
      setDraftEcNameError(null);
      setDraftEcPhoneError(null);
    }
    setPhoneError(null);
    setEmailError(null);
    setEmergencyPhoneError(null);
    setEmergencyEmailError(null);
    setGeneralError(null);
    setDraftLegalError(null);
    setDraftPreferredError(null);
    setResidentialCountryError(null);
    setResidentialStateError(null);
    setEditField(field);
  };

  const closeEditor = () => setEditField(null);

  const handleCancelEdit = () => {
    if (!profile) {
      closeEditor();
      return;
    }

    if (editField === "legalName") {
      setDraftLegal(firstNameDisplay(profile) || "");
    } else if (editField === "preferredFirstName") {
      setDraftPreferred(lastNameDisplay(profile) || "");
    } else if (editField === "phoneNumber") {
      const parsed = parsePhoneNumber(profile.phoneNumber?.trim() ?? "");
      setSelectedCountry(parsed.country);
      setDraftPhone(parsed.localNumber);
    } else if (editField === "email") {
      setDraftEmail(profile.email?.trim() ?? "");
    } else if (editField === "residentialAddress") {
      setDraftResidentialLine1(
        profile.residentialAddress?.trim() ?? profile.address?.trim() ?? "",
      );
      setDraftResidentialState(profile.state?.trim() ?? "");
      setDraftResidentialCountry(profile.country?.trim() ?? "");
    } else if (editField === "emergencyContact") {
      setDraftEcName(profile.emergencyContact?.name?.trim() ?? "");
      setDraftEcEmail(profile.emergencyContact?.email?.trim() ?? "");
      const parsed = parsePhoneNumber(
        profile.emergencyContact?.phoneNumber?.trim() ?? "",
      );
      setSelectedEmergencyCountry(parsed.country);
      setDraftEcPhone(parsed.localNumber);
    }

    setPhoneError(null);
    setEmailError(null);
    setEmergencyPhoneError(null);
    setEmergencyEmailError(null);
    setGeneralError(null);
    setDraftLegalError(null);
    setDraftPreferredError(null);
    setResidentialCountryError(null);
    setResidentialStateError(null);
    setResidentialLine1Error(null);
    closeEditor();
  };

  useEffect(() => {
    if (!editField) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditField(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editField]);

  useEffect(() => {
    if (!countryDropdownOpen) return;
    const handle = (e: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target as Node)
      ) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [countryDropdownOpen]);

  useEffect(() => {
    if (!emergencyCountryOpen) return;
    const handle = (e: MouseEvent) => {
      if (
        emergencyDropdownRef.current &&
        !emergencyDropdownRef.current.contains(e.target as Node)
      ) {
        setEmergencyCountryOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [emergencyCountryOpen]);

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
  //Edit Profile
  const handleSaveField = () => {
    if (!profile || !editField) return;
    const nameRegex = /^[A-Za-z]+$/;
    if (editField === "legalName") {
      const v = draftLegal.trim();
      if (!v) {
        setDraftLegalError("Enter a first name");
        return;
      }
      if (v.length < 2 || v.length > 100) {
        setDraftLegalError("First name must be between 2 and 100 characters");
        return;
      }
      if (!nameRegex.test(v)) {
        setDraftLegalError(
          "First name must contain only letters and no spaces",
        );
        return;
      }
      setDraftLegalError(null);
      void persist({ firstName: v });
      return;
    }
    if (editField === "preferredFirstName") {
      const pf = draftPreferred.trim();
      if (!pf) {
        setDraftPreferredError("Enter a last name");
        return;
      }
      if (pf.length < 2 || pf.length > 100) {
        setDraftPreferredError(
          "Last name must be between 2 and 100 characters",
        );
        return;
      }
      if (!nameRegex.test(pf)) {
        setDraftPreferredError(
          "Last name must contain only letters and no spaces",
        );
        return;
      }
      setDraftPreferredError(null);
      void persist({ lastName: pf });
      return;
    }
    if (editField === "phoneNumber") {
      const raw = draftPhone.trim();
      const error = validatePhoneDigits(raw);
      if (!raw) {
        setPhoneError("Enter a phone number.");
        return;
      }
      if (error) {
        setPhoneError(error);
        return;
      }
      const fullPhone = raw.startsWith("+")
        ? raw
        : `${selectedCountry.dialCode}${raw}`;
      void persist({ phoneNumber: fullPhone });
      return;
    }
    if (editField === "email") {
      const v = draftEmail.trim();
      const error = validateEmail(v);
      if (error) {
        setEmailError(error);
        return;
      }
      void persist({ email: v });
      return;
    }
    if (editField === "residentialAddress") {
      const line1 = draftResidentialLine1.trim();
      const country = draftResidentialCountry.trim();
      const state = draftResidentialState.trim();
      let hasError = false;

      if (!line1) {
        setResidentialLine1Error("Enter address line 1");
        hasError = true;
      } else {
        setResidentialLine1Error(null);
      }

      if (!country) {
        setResidentialCountryError("Enter country");
        hasError = true;
      } else if (!nameRegex.test(country)) {
        setResidentialCountryError(
          "Country must contain only letters and spaces",
        );
        hasError = true;
      } else {
        setResidentialCountryError(null);
      }

      if (!state) {
        setResidentialStateError("Enter state");
        hasError = true;
      } else if (!nameRegex.test(state)) {
        setResidentialStateError("State must contain only letters and spaces");
        hasError = true;
      } else {
        setResidentialStateError(null);
      }

      if (hasError) {
        return;
      }

      void persist({
        residentialAddress: line1,
        country: country,
        state: state,
      });
      return;
    }
    if (editField === "emergencyContact") {
      const name = draftEcName.trim();
      const email = draftEcEmail.trim();
      const phoneRaw = draftEcPhone.trim();
      // Require name and phone for emergency contact; validate name letters-only
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!name) {
        setDraftEcNameError("Enter the emergency contact name");
        return;
      }
      if (!nameRegex.test(name)) {
        setDraftEcNameError("Name must contain only letters and spaces");
        return;
      }
      setDraftEcNameError(null);

      if (!phoneRaw) {
        setDraftEcPhoneError("Enter the Emergency contact number");
        return;
      }
      const phoneDigits = phoneRaw.replace(/\D/g, "");
      const phoneErrorText = validatePhoneDigits(phoneDigits);
      if (phoneErrorText) {
        setDraftEcPhoneError(phoneErrorText);
        return;
      }
      setDraftEcPhoneError(null);

      if (email) {
        const emailErrorText = validateEmail(email);
        if (emailErrorText) {
          setEmergencyEmailError(emailErrorText);
          return;
        }
      }

      const phoneNumber = phoneRaw.startsWith("+")
        ? phoneRaw
        : `${selectedEmergencyCountry.dialCode}${phoneRaw}`;
      void persist({
        emergencyContact: { name, email, phoneNumber },
      });
    }
  };

  const showPersonalInfo = () => {
    closeEditor();
    setRightPanel("personalInfo");
  };

  const showTransactionHistory = () => {
    closeEditor();
    setRightPanel("transactionHistory");
  };

  const menuItems = [
    {
      label: "Personal Information",
      icon: settingsIcon,
      panel: "personalInfo" as const,
      onClick: showPersonalInfo,
    },
    {
      label: "About US",
      icon: CircleHelp,
      panel: null,
      onClick: () => navigate("/about"),
    },
    {
      label: "Privacy Policy",
      icon: privacyicon,
      panel: null,
      onClick: () => navigate("/trust-safety"),
    },
    {
      label: "Terms & Conditions",
      icon: termsicon,
      panel: null,
      onClick: () => navigate("/trust-safety"),
    },
    {
      label: "Transaction History",
      icon: transactionicon,
      panel: "transactionHistory" as const,
      onClick: showTransactionHistory,
    },
    {
      label: "Log Out",
      icon: LogOut,
      panel: null,
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
    const firstName = firstNameDisplay(p);
    const lastName = lastNameDisplay(p);
    const phone = p?.phoneNumber?.trim() ?? "";
    const email = p?.email?.trim() ?? reduxUser?.email?.trim() ?? "";
    const residential = residentialFromProfile(p);
    const ec = p?.emergencyContact;

    return [
      {
        key: "legalName" as const,
        label: "First name",
        value: firstName,
        placeholder: "Not provided",
        hasData: isFilled(firstName),
      },
      {
        key: "preferredFirstName" as const,
        label: "Last name",
        value: lastName,
        placeholder: "Not provided",
        hasData: isFilled(lastName),
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
    "shrink-0 text-[13px] font-medium leading-[100%] tracking-normal text-[#389131] underline decoration-solid hover:text-[#2f7a2a]";

  const inputEditClass =
    "h-[44px] w-full rounded-[2px] border border-black bg-white px-4 text-[14px] leading-[44px] text-black outline-none";
  const inputEmergencyFieldClass =
    "w-full rounded-sm border border-black bg-white px-3 py-2.5 text-[14px] text-gray-900 outline-none focus:ring-1 focus:ring-black/20";

  const profileCardClass =
    "flex h-[71px] w-full max-w-[539px] shrink-0 items-center justify-between rounded-[3px] border border-[#00000042] bg-white px-4 text-left transition-colors hover:bg-[#fafafa] lg:w-[539px]";

  const personalCardClass =
    "min-h-[71px] w-full max-w-[593px] rounded-[2px] border border-[#D9D9D9] bg-white px-5 py-4 lg:w-[593px]";

  const transactionCardClass =
    "flex min-h-[71px] w-full max-w-[593px] items-center justify-between rounded-[2px] border border-[#D9D9D9] bg-white px-5 py-4 lg:w-[593px]";

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white">
      <div className="w-full px-[40px] py-6 sm:py-8">
        <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          {/* LEFT SIDE */}
          <div className="flex w-full flex-col lg:max-w-[539px]">
            <header>
              <h1 className="text-[32px] font-medium leading-[100%] text-black mb-4">
                Account Setting
              </h1>
            </header>

            <nav className="mt-6 flex flex-col gap-5">
              {menuItems.map((item) => {
                const Icon = item.icon as any;
                const isActive =
                  item.panel !== null && rightPanel === item.panel;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    className={`${profileCardClass} ${
                      isActive ? " bg-[#f6fbf4]" : ""
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {typeof Icon === "string" ? (
                        <img
                          src={Icon}
                          alt={item.label}
                          className="h-[25px] w-[25px] shrink-0 object-contain"
                        />
                      ) : (
                        <Icon
                          className="w-[25px] h-[25px] shrink-0 text-black"
                          strokeWidth={1.75}
                        />
                      )}

                      <span className="text-[24px] font-normal leading-[100%] tracking-[0px] text-black">
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
              <h2 className="text-[32px] font-medium leading-[100%] text-black mb-4">
                {rightPanel === "transactionHistory"
                  ? "Transaction History"
                  : "Personal info"}
              </h2>
            </header>

            <div className="mt-6 flex flex-col gap-5">
              {rightPanel === "transactionHistory" ? (
                TRANSACTIONS.map((txn) => (
                  <div key={txn.id} className={transactionCardClass}>
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[16px] font-semibold text-black"
                        style={{ backgroundColor: txn.avatarColor }}
                      >
                        {txn.avatarLetter}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium leading-[100%] text-black">
                          {txn.name}
                        </p>
                        <p className="mt-[6px] text-[11px] font-light leading-[100%] text-black/70">
                          Transaction ID
                        </p>
                        <p className="mt-[2px] truncate text-[11px] font-light leading-[100%] text-black">
                          {txn.transactionId}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[14px] font-medium leading-[100%] text-black">
                        {txn.amount}
                      </p>
                      <p
                        className={`mt-[6px] text-[12px] font-medium capitalize leading-[100%] ${transactionStatusClass[txn.status]}`}
                      >
                        {transactionStatusLabel[txn.status]}
                      </p>
                      <p className="mt-[6px] text-[11px] font-light leading-[100%] text-black/70">
                        {txn.date}
                      </p>
                    </div>
                  </div>
                ))
              ) : loading ? (
                <div className="flex items-center justify-center py-6">
                  <div
                    className="w-8 h-8 border-4 border-[#389131] border-t-transparent rounded-full animate-spin"
                    aria-label="Loading"
                  />
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
                            <>
                              <input
                                value={draftLegal}
                                onChange={(e) => {
                                  setDraftLegal(e.target.value);
                                  setDraftLegalError(null);
                                  setGeneralError(null);
                                }}
                                className={inputEditClass}
                                placeholder="First name"
                                autoComplete="given-name"
                              />
                              {draftLegalError && (
                                <p className="mt-2 text-[13px] font-medium text-[#E74C3C]">
                                  {draftLegalError}
                                </p>
                              )}
                            </>
                          )}

                          {row.key === "preferredFirstName" && (
                            <>
                              <input
                                value={draftPreferred}
                                onChange={(e) => {
                                  setDraftPreferred(e.target.value);
                                  setDraftPreferredError(null);
                                  setGeneralError(null);
                                }}
                                className={inputEditClass}
                                placeholder="Last name"
                                autoComplete="family-name"
                              />
                              {draftPreferredError && (
                                <p className="mt-2 text-[13px] font-medium text-[#E74C3C]">
                                  {draftPreferredError}
                                </p>
                              )}
                            </>
                          )}

                          {row.key === "phoneNumber" && (
                            <>
                              <div className="w-full h-[44px] border border-[#8B8B8B] rounded-[8px] bg-white flex items-center px-3 focus-within:border-[#389131] focus-within:ring-2 focus-within:ring-[#389131]/10 transition-all gap-2">
                                <div
                                  className="relative flex items-center gap-1 min-w-[60px]"
                                  ref={countryDropdownRef}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCountryDropdownOpen((p) => !p)
                                    }
                                    className="flex items-center gap-2 rounded-[4px] bg-transparent px-1 py-1 text-left outline-none"
                                  >
                                    <img
                                      src={selectedCountry.flagUrl}
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

                                  {countryDropdownOpen && (
                                    <div className="absolute left-0 top-full z-50 mt-1 w-[220px] overflow-hidden rounded-[10px] border border-[#D1D5DB] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                                      {COUNTRY_OPTIONS.map((country) => (
                                        <button
                                          key={country.code}
                                          type="button"
                                          onClick={() => {
                                            setSelectedCountry(country);
                                            setCountryDropdownOpen(false);
                                          }}
                                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#111827] hover:bg-[#F3F4F6]"
                                        >
                                          <img
                                            src={country.flagUrl}
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

                                <input
                                  type="tel"
                                  value={draftPhone}
                                  onChange={(e) => {
                                    const digits = e.target.value.replace(
                                      /\D/g,
                                      "",
                                    );
                                    setDraftPhone(digits);
                                    setPhoneError(validatePhoneDigits(digits));
                                    setGeneralError(null);
                                  }}
                                  maxLength={10}
                                  className="flex-1 bg-transparent outline-none text-[15px] text-black custom-placeholder placeholder:text-[#9B989E] font-normal"
                                  placeholder="Phone number"
                                />
                              </div>
                              {phoneError && (
                                <p className="mt-2 text-[13px] font-medium text-[#E74C3C]">
                                  {phoneError}
                                </p>
                              )}
                            </>
                          )}

                          {row.key === "email" && (
                            <>
                              <input
                                type="email"
                                value={draftEmail}
                                onChange={(e) => {
                                  setDraftEmail(e.target.value);
                                  setEmailError(validateEmail(e.target.value));
                                  setGeneralError(null);
                                }}
                                className={inputEditClass}
                                placeholder="Email"
                              />
                              {emailError && (
                                <p className="mt-2 text-[13px] font-medium text-[#E74C3C]">
                                  {emailError}
                                </p>
                              )}
                            </>
                          )}

                          {row.key === "residentialAddress" && (
                            <div className="space-y-3">
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                  <label className="mb-2 block text-[13px] font-medium text-black">
                                    Country
                                  </label>
                                  <input
                                    value={draftResidentialCountry}
                                    onChange={(e) => {
                                      setDraftResidentialCountry(
                                        e.target.value,
                                      );
                                      setResidentialCountryError(null);
                                      setGeneralError(null);
                                    }}
                                    className={inputEditClass}
                                    placeholder="Country"
                                  />
                                  {residentialCountryError && (
                                    <p className="mt-2 text-[13px] font-medium text-[#E74C3C]">
                                      {residentialCountryError}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <label className="mb-2 block text-[13px] font-medium text-black">
                                    State
                                  </label>
                                  <input
                                    value={draftResidentialState}
                                    onChange={(e) => {
                                      setDraftResidentialState(e.target.value);
                                      setResidentialStateError(null);
                                      setGeneralError(null);
                                    }}
                                    className={inputEditClass}
                                    placeholder="State"
                                  />
                                  {residentialStateError && (
                                    <p className="mt-2 text-[13px] font-medium text-[#E74C3C]">
                                      {residentialStateError}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div>
                                <label className="mb-2 block text-[13px] font-medium text-black">
                                  Address line 1
                                </label>
                                <textarea
                                  value={draftResidentialLine1}
                                  onChange={(e) => {
                                    setDraftResidentialLine1(e.target.value);
                                    setResidentialLine1Error(null);
                                    setGeneralError(null);
                                  }}
                                  rows={3}
                                  className={`${inputEditClass} resize-none`}
                                  placeholder="Street address, city, ZIP"
                                />
                                {residentialLine1Error && (
                                  <p className="mt-2 text-[13px] font-medium text-[#E74C3C]">
                                    {residentialLine1Error}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {row.key === "emergencyContact" && (
                            <div className="mt-2 space-y-2">
                              <input
                                value={draftEcName}
                                onChange={(e) => {
                                  setDraftEcName(e.target.value);
                                  setDraftEcNameError(null);
                                  setGeneralError(null);
                                }}
                                className={inputEmergencyFieldClass}
                                placeholder="Contact name"
                              />

                              {draftEcNameError && (
                                <p className="mt-2 text-[13px] font-medium text-[#E74C3C]">
                                  {draftEcNameError}
                                </p>
                              )}

                              <input
                                type="email"
                                value={draftEcEmail}
                                onChange={(e) => {
                                  setDraftEcEmail(e.target.value);
                                  setEmergencyEmailError(
                                    validateEmail(e.target.value),
                                  );
                                  setGeneralError(null);
                                }}
                                className={inputEmergencyFieldClass}
                                placeholder="Contact email"
                              />
                              {emergencyEmailError && (
                                <p className="mt-2 text-[13px] font-medium text-[#E74C3C]">
                                  {emergencyEmailError}
                                </p>
                              )}

                              <div className="w-full h-[44px] border border-[#8B8B8B] rounded-[8px] bg-white flex items-center px-3 focus-within:border-[#389131] focus-within:ring-2 focus-within:ring-[#389131]/10 transition-all gap-2">
                                <div
                                  className="relative flex items-center gap-1 min-w-[60px]"
                                  ref={emergencyDropdownRef}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEmergencyCountryOpen((p) => !p)
                                    }
                                    className="flex items-center gap-2 rounded-[4px] bg-transparent px-1 py-1 text-left outline-none"
                                  >
                                    <img
                                      src={selectedEmergencyCountry.flagUrl}
                                      alt={selectedEmergencyCountry.name}
                                      className="w-[20px] h-[12px] object-cover rounded-[1px]"
                                    />
                                    <span className="text-[14px] font-normal text-[#929191] leading-[15px]">
                                      {selectedEmergencyCountry.dialCode}
                                    </span>
                                    <img
                                      src={chevronDown}
                                      alt="dropdown"
                                      className="w-[8.5px] h-[6px] mt-1 pointer-events-none"
                                    />
                                  </button>

                                  {emergencyCountryOpen && (
                                    <div className="absolute left-0 top-full z-50 mt-1 w-[220px] overflow-hidden rounded-[10px] border border-[#D1D5DB] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                                      {COUNTRY_OPTIONS.map((country) => (
                                        <button
                                          key={country.code}
                                          type="button"
                                          onClick={() => {
                                            setSelectedEmergencyCountry(
                                              country,
                                            );
                                            setEmergencyCountryOpen(false);
                                          }}
                                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#111827] hover:bg-[#F3F4F6]"
                                        >
                                          <img
                                            src={country.flagUrl}
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

                                <input
                                  type="tel"
                                  value={draftEcPhone}
                                  onChange={(e) => {
                                    const digits = e.target.value.replace(
                                      /\D/g,
                                      "",
                                    );
                                    setDraftEcPhone(digits);
                                    setDraftEcPhoneError(null);
                                    setEmergencyPhoneError(
                                      validatePhoneDigits(digits),
                                    );
                                    setGeneralError(null);
                                  }}
                                  maxLength={10}
                                  className="flex-1 bg-transparent outline-none text-[15px] text-black custom-placeholder placeholder:text-[#9B989E] font-normal"
                                  placeholder="Contact phone"
                                />
                              </div>
                              {draftEcPhoneError && (
                                <p className="mt-2 text-[13px] font-medium text-[#E74C3C]">
                                  {draftEcPhoneError}
                                </p>
                              )}
                              {emergencyPhoneError && (
                                <p className="mt-2 text-[13px] font-medium text-[#E74C3C]">
                                  {emergencyPhoneError}
                                </p>
                              )}
                            </div>
                          )}

                          {generalError && (
                            <p className="mb-3 text-[13px] font-medium text-[#E74C3C]">
                              {generalError}
                            </p>
                          )}

                          <div className="mt-3 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              disabled={saving}
                              className="h-[36px] w-[90px] rounded-[4px] bg-[#E74C3C] text-[14px] font-semibold text-white hover:bg-[#C0392B] disabled:opacity-50"
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              onClick={handleSaveField}
                              disabled={saving}
                              className="h-[36px] w-[90px] rounded-[4px] bg-[#389131] text-[14px] font-semibold text-white hover:bg-[#2f7a2a] disabled:opacity-50"
                            >
                              {saving ? "Saving..." : "Save"}
                            </button>
                          </div>
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
                            onClick={() => {
                              if (dimOthers) return;
                              openEditor(row.key);
                            }}
                            className={`${cardBtn} ${dimOthers ? "pointer-events-none" : ""}`}
                            disabled={dimOthers}
                            aria-disabled={dimOthers}
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
