import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Info, ShieldAlert, Receipt, LogOut, ChevronRight } from "lucide-react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { logout } from "../../store/authSlice.ts";
import { clearWishlist } from "../../store/wishlistSlice.ts";
import { logout as logoutApi } from "../../api/authApi.ts";
import { LogoutConfirmModal } from "../../components/Auth/LogoutConfirmModal.tsx";

type LeftItemKey =
  | "personal"
  | "about"
  | "privacy"
  | "transactions"
  | "notifications"
  | "logout";

type TxStatus = "Pending" | "Confirmed" | "Canceled";
type TxItem = {
  id: string;
  name: string;
  amount: number;
  status: TxStatus;
  at: string;
};

const MOCK_TX: TxItem[] = [
  {
    id: "698094553417",
    name: "Groceries",
    amount: 350,
    status: "Pending",
    at: "26 Jan 2026 11:21 AM",
  },
  {
    id: "698094553417",
    name: "demo",
    amount: 174,
    status: "Confirmed",
    at: "30 Jan 2025 11:21 AM",
  },
  {
    id: "698094553417",
    name: "demo",
    amount: 174,
    status: "Confirmed",
    at: "18 Jan 2025 8:23 PM",
  },
  {
    id: "698094553417",
    name: "Demo",
    amount: 144,
    status: "Canceled",
    at: "14 Jan 2025 1:25 PM",
  },
  {
    id: "698094553417",
    name: "john",
    amount: 174,
    status: "Confirmed",
    at: "10 Jan 2025 9:30 PM",
  },
];

const statusMeta: Record<TxStatus, { label: string; className: string }> = {
  Pending: { label: "Pending", className: "text-amber-600" },
  Confirmed: { label: "Confirmed", className: "text-green-700" },
  Canceled: { label: "Canceled", className: "text-red-600" },
};

const initials = (name: string) => (name.trim()[0] ? name.trim()[0].toUpperCase() : "?");

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState<LeftItemKey>("personal");
  const dispatch = useDispatch();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [legalName, setLegalName] = useState("Demo");
  const [isEditingLegalName, setIsEditingLegalName] = useState(false);
  const [firstNameOnId, setFirstNameOnId] = useState("Demo");
  const [surnameOnId, setSurnameOnId] = useState("Demo");
  const [preferredFirstName, setPreferredFirstName] = useState("demo");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailValue, setEmailValue] = useState("Demo@gmail.com");

  const rightTitle = useMemo(() => {
    switch (active) {
      case "personal":
        return "Personal info";
      case "about":
        return "About US";
      case "privacy":
        return "Privacy Policy";
      case "transactions":
        return "Transaction history";
      case "notifications":
        return "Notifications";
      default:
        return "Account Settings";
    }
  }, [active]);

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

  return (
    <div className="min-h-screen bg-white w-full min-w-0 overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 gap-10 items-start">
          <aside>
            <h1 className="text-lg font-semibold text-gray-900">Account Settings</h1>

            <nav className="mt-5">
              <ul className="m-0 p-0 list-none divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
                <li>
                  <button
                    type="button"
                    onClick={() => setActive("personal")}
                    className="w-full px-4 py-4 flex items-center justify-between text-left bg-white hover:bg-gray-50"
                  >
                    <span className="inline-flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-700" aria-hidden />
                      <span className="text-sm text-gray-900">Personal information</span>
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-500" aria-hidden />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActive("about")}
                    className="w-full px-4 py-4 flex items-center justify-between text-left bg-white hover:bg-gray-50"
                  >
                    <span className="inline-flex items-center gap-3">
                      <Info className="w-5 h-5 text-gray-700" aria-hidden />
                      <span className="text-sm text-gray-900">About US</span>
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-500" aria-hidden />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActive("privacy")}
                    className="w-full px-4 py-4 flex items-center justify-between text-left bg-white hover:bg-gray-50"
                  >
                    <span className="inline-flex items-center gap-3">
                      <ShieldAlert className="w-5 h-5 text-gray-700" aria-hidden />
                      <span className="text-sm text-gray-900">Privacy Policy</span>
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-500" aria-hidden />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActive("transactions")}
                    className="w-full px-4 py-4 flex items-center justify-between text-left bg-white hover:bg-gray-50"
                  >
                    <span className="inline-flex items-center gap-3">
                      <Receipt className="w-5 h-5 text-gray-700" aria-hidden />
                      <span className="text-sm text-gray-900">
                        Transaction history
                      </span>
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-500" aria-hidden />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActive("notifications")}
                    className="w-full px-4 py-4 flex items-center justify-between text-left bg-white hover:bg-gray-50"
                  >
                    <span className="inline-flex items-center gap-3">
                      <Receipt className="w-5 h-5 text-gray-700" aria-hidden />
                      <span className="text-sm text-gray-900">Notifications</span>
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-500" aria-hidden />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActive("logout");
                      setIsLogoutConfirmOpen(true);
                    }}
                    className="w-full px-4 py-4 flex items-center justify-between text-left bg-white hover:bg-gray-50"
                  >
                    <span className="inline-flex items-center gap-3">
                      <LogOut className="w-5 h-5 text-gray-700" aria-hidden />
                      <span className="text-sm text-gray-900">Log out</span>
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-500" aria-hidden />
                  </button>
                </li>
              </ul>
            </nav>
          </aside>

          <section className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900">{rightTitle}</h2>

            {active === "personal" ? (
              <div className="mt-6 space-y-3 max-w-md">
                {/* Legal name row (view mode) */}
                {!isEditingLegalName && (
                  <div className="border border-gray-200 rounded-md px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">Legal name</p>
                      <p className="mt-0.5 text-sm text-gray-700 truncate">
                        {legalName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFirstNameOnId(legalName.split(" ")[0] || "");
                        setSurnameOnId(legalName.split(" ").slice(1).join(" ") || "");
                        setIsEditingLegalName(true);
                      }}
                      className="text-sm font-semibold text-[#389131] underline"
                    >
                      Edit
                    </button>
                  </div>
                )}

                {/* Legal name edit panel */}
                {isEditingLegalName && (
                  <div className="border border-gray-200 rounded-md px-4 py-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Legal name
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Make sure this matches the name on your government ID.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingLegalName(false)}
                        className="text-sm font-semibold text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="border border-gray-300 rounded-md px-3 py-2">
                        <p className="text-xs text-gray-600">First name on ID</p>
                        <input
                          type="text"
                          value={firstNameOnId}
                          onChange={(e) => setFirstNameOnId(e.target.value)}
                          className="mt-1 w-full border-0 bg-transparent p-0 text-sm text-gray-900 outline-none"
                        />
                      </div>
                      <div className="border border-gray-300 rounded-md px-3 py-2">
                        <p className="text-xs text-gray-600">Surname on ID</p>
                        <input
                          type="text"
                          value={surnameOnId}
                          onChange={(e) => setSurnameOnId(e.target.value)}
                          className="mt-1 w-full border-0 bg-transparent p-0 text-sm text-gray-900 outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const full = `${firstNameOnId} ${surnameOnId}`.trim();
                        setLegalName(full || legalName);
                        setIsEditingLegalName(false);
                      }}
                      className="mt-1 inline-flex items-center justify-center rounded-md bg-[#389131] px-6 py-2 text-sm font-semibold text-white"
                    >
                      Save
                    </button>
                  </div>
                )}

                <div className="border border-gray-200 rounded-md px-4 py-3 flex items-center justify-between gap-3 opacity-60">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      Preferred first name
                    </p>
                    <p className="mt-0.5 text-sm text-gray-700 truncate">
                      {preferredFirstName || "Not provided"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/edit-profile")}
                    className="text-sm font-semibold text-[#389131] underline"
                  >
                    Add
                  </button>
                </div>

                <div className="border border-gray-200 rounded-md px-4 py-3 flex items-center justify-between gap-3 opacity-60">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Phone number</p>
                    <p className="mt-0.5 text-sm text-gray-600">
                      {phoneNumber || "Provide phone number"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/edit-profile")}
                    className="text-sm font-semibold text-[#389131] underline"
                  >
                    Add
                  </button>
                </div>

                <div className="border border-gray-200 rounded-md px-4 py-3 flex items-center justify-between gap-3 opacity-60">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Email</p>
                    <p className="mt-0.5 text-sm text-gray-700 truncate">
                      {emailValue}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/edit-profile")}
                    className="text-sm font-semibold text-[#389131] underline"
                  >
                    Add
                  </button>
                </div>

                <div className="border border-gray-200 rounded-md px-4 py-3 flex items-center justify-between gap-3 opacity-60">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      Residental Address
                    </p>
                    <p className="mt-0.5 text-sm text-gray-600">Not provided</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/edit-profile")}
                    className="text-sm font-semibold text-[#389131] underline"
                  >
                    Add
                  </button>
                </div>

                <div className="border border-gray-200 rounded-md px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      Emergency contact
                    </p>
                    <p className="mt-0.5 text-sm text-gray-600">Not provided</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/edit-profile")}
                    className="text-sm font-semibold text-[#389131] underline"
                  >
                    Add
                  </button>
                </div>

                <div className="border border-gray-200 rounded-md px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      Identify verification
                    </p>
                    <p className="mt-0.5 text-sm text-gray-600">Not Started</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/liability-agreement")}
                    className="text-sm font-semibold text-[#389131]"
                  >
                    Start
                  </button>
                </div>
              </div>
            ) : active === "transactions" ? (
              <div className="mt-6 max-w-md space-y-3">
                {MOCK_TX.map((tx, idx) => {
                  const meta = statusMeta[tx.status];
                  const bg =
                    tx.status === "Pending"
                      ? "bg-amber-100"
                      : tx.status === "Canceled"
                        ? "bg-red-100"
                        : "bg-green-100";
                  const text =
                    tx.status === "Pending"
                      ? "text-amber-700"
                      : tx.status === "Canceled"
                        ? "text-red-700"
                        : "text-green-700";
                  return (
                    <div
                      key={`${tx.name}-${idx}`}
                      className="border border-gray-200 rounded-md px-4 py-3 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-10 w-10 rounded-full ${bg} inline-flex items-center justify-center shrink-0`}
                        >
                          <span className={`text-sm font-semibold ${text}`}>
                            {initials(tx.name)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {tx.name}
                          </p>
                          <p className="text-[11px] text-gray-600 leading-4">
                            Transaction ID
                          </p>
                          <p className="text-[11px] text-gray-700 leading-4">
                            {tx.id}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-900">
                          $ {tx.amount.toFixed(2)}
                        </p>
                        <p className={`text-[11px] font-semibold ${meta.className}`}>
                          {meta.label}
                        </p>
                        <p className="text-[10px] text-gray-600 mt-1">{tx.at}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : active === "notifications" ? (
              <div className="mt-6 space-y-4 max-w-2xl">
                <div className="border border-gray-200 rounded-2xl shadow-sm bg-white overflow-hidden">
                  <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5">
                    <div className="w-full sm:w-32 h-28 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src="https://images.pexels.com/photos/2432228/pexels-photo-2432228.jpeg?auto=compress&cs=tinysrgb&w=600"
                        alt="Trailer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        Gooseneck Trailer
                      </p>
                      <p className="text-xs text-gray-700 mt-0.5">
                        Model: FMX208
                      </p>
                      <p className="text-xs text-gray-700 mt-1">$ 21,435.3</p>
                      <p className="mt-1 text-xs text-gray-700 flex items-center gap-1">
                        <span className="text-[#F4B000] text-base leading-none">★</span>
                        <span>
                          4.9 (593){" "}
                          <span className="font-medium">Guest Favourite</span>
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 px-4 sm:px-5 py-3 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      className="w-full sm:w-1/2 border border-gray-300 rounded-md py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      className="w-full sm:w-1/2 rounded-md py-2.5 text-sm font-medium text-white bg-[#389131] hover:opacity-90"
                    >
                      Accept
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  This is a demo notification card. You can hook it up to your real
                  booking or request notifications later.
                </p>
              </div>
            ) : (
              <div className="mt-5 text-sm text-gray-600">
                {active === "about" && <p>About US content goes here.</p>}
                {active === "privacy" && <p>Privacy Policy content goes here.</p>}
              </div>
            )}
          </section>
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
  );
};

export default AccountSettings;

