import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Info,
  Shield,
  Receipt,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { logout } from "../../store/authSlice.ts";
import { logout as logoutApi } from "../../api/authApi.ts";
import { LogoutConfirmModal } from "../../components/Auth/LogoutConfirmModal.tsx";

type LeftItemKey =
  | "personal"
  | "about"
  | "privacy"
  | "transactions"
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
      default:
        return "Account Settings";
    }
  }, [active]);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } finally {
      dispatch(logout());
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
        <div className="grid grid-cols-1 lg:grid-cols-[340px,1fr] gap-10">
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
                      <Shield className="w-5 h-5 text-gray-700" aria-hidden />
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
                <div className="border border-gray-200 rounded-md px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900">Legal name</p>
                    <p className="text-xs text-gray-600 mt-0.5">Demo</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/edit-profile")}
                    className="text-xs font-semibold text-gray-900"
                  >
                    Edit
                  </button>
                </div>

                <div className="border border-gray-200 rounded-md px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900">
                      Preferred first name
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">demo</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/edit-profile")}
                    className="text-xs font-semibold text-gray-900"
                  >
                    Add
                  </button>
                </div>

                <div className="border border-gray-200 rounded-md px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900">Phone number</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Provide phone number
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/edit-profile")}
                    className="text-xs font-semibold text-gray-900"
                  >
                    Add
                  </button>
                </div>

                <div className="border border-gray-200 rounded-md px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900">Email</p>
                    <p className="text-xs text-gray-600 mt-0.5">Demo@gmail.com</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/edit-profile")}
                    className="text-xs font-semibold text-gray-900"
                  >
                    Add
                  </button>
                </div>

                <div className="border border-gray-200 rounded-md px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900">
                      Residential Address
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">Not provided</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/edit-profile")}
                    className="text-xs font-semibold text-gray-900"
                  >
                    Add
                  </button>
                </div>

                <div className="border border-gray-200 rounded-md px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900">
                      Emergency contact
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">Not provided</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/edit-profile")}
                    className="text-xs font-semibold text-gray-900"
                  >
                    Add
                  </button>
                </div>

                <div className="border border-gray-200 rounded-md px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900">
                      Identify verification
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">Not Started</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/liability-agreement")}
                    className="text-xs font-semibold text-gray-900"
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

