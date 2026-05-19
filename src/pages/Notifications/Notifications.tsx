import React, { useEffect } from "react";
import NotificationCard from "../../components/NotificationCard.tsx";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { RootState } from "../../store";
import { toast } from "react-toastify";
import {
  acceptOwnerRequest,
  rejectOwnerRequest,
} from "../../store/notificationSlice.ts";

const Notifications: React.FC = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const userType = useSelector((state: RootState) => state.auth.userType);
  const isOwner =
    isAuthenticated && (user?.trailor === "Owner" || userType === "Owner");
  const ownerRequests = useSelector(
    (state: RootState) => state.notifications.ownerRequests,
  );
  const renterNotifications = useSelector(
    (state: RootState) => state.notifications.renterNotifications,
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { backgroundLocation: location } });
    }
  }, [isAuthenticated, location, navigate]);

  const handleAccept = (id: number) => {
    const selected = ownerRequests.find((n) => n.id === id);
    if (!selected) return;

    if (isOwner) {
      dispatch(acceptOwnerRequest(id));
      navigate("/trailor-condition", {
        state: {
          bookingId: `#TR-2026-${String(id).padStart(5, "0")}`,
          trailorName: selected.trailerTitle,
          renterName: selected.renterName,
          pickupDate: selected.pickupDate,
        },
      });
      toast.success("Order accepted. Renter has been notified.");
      return;
    }

    navigate("/return", {
      state: {
        bookingId: `#TR-2026-${String(id).padStart(5, "0")}`,
      },
    });
  };

  const handleReject = (id: number) => {
    if (!isOwner) return;
    dispatch(rejectOwnerRequest(id));
    toast.info("Order rejected. Renter has been notified.");
  };

  return (
    <div className="min-h-screen flex justify-center bg-[#F9F8F3] px-4 py-10">
      {/* 80% width main container, near top instead of perfectly centered */}
      <div className="w-full max-w-5xl md:w-[80%] bg-white rounded-2xl shadow-md border border-gray-200 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Notifications
        </h1>

        {isOwner ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-[#F9F8F3] px-4 py-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">
                Order Status
              </p>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  ownerRequests.length > 0
                    ? "bg-[#E7F6E6] text-[#2F7A29]"
                    : "bg-[#FDECEC] text-[#B42318]"
                }`}
              >
                {ownerRequests.length > 0
                  ? `Order Available (${ownerRequests.length})`
                  : "No Order Available"}
              </span>
            </div>

            {ownerRequests.map((n) => (
              <NotificationCard
                key={n.id}
                id={n.id}
                imageUrl={n.image}
                title={n.trailerTitle}
                model={n.trailerModel}
                price={n.price}
                rating={n.rating}
                reviewsCount={n.reviews}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}

            {ownerRequests.length === 0 && (
              <p className="text-center text-sm text-gray-500">
                No notifications right now.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {renterNotifications.map((notification) => (
              <div
                key={notification.id}
                className="rounded-2xl border border-gray-200 bg-[#F9F8F3] p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      Owner {notification.status.toLowerCase()} your order
                    </p>
                    <p className="mt-1 text-sm text-gray-700">
                      Your booking request for {notification.trailerTitle}{" "}
                      (Model {notification.trailerModel}) has been{" "}
                      {notification.status.toLowerCase()}.
                    </p>
                    <p className="mt-2 text-xs font-medium text-gray-500">
                      Booking ID: {notification.bookingId}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      notification.status === "Accepted"
                        ? "bg-[#E7F6E6] text-[#2F7A29]"
                        : "bg-[#FDECEC] text-[#B42318]"
                    }`}
                  >
                    {notification.status}
                  </span>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        notification.status === "Accepted"
                          ? "/booking"
                          : "/notifications",
                      )
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                      notification.status === "Accepted"
                        ? "bg-[#389131] hover:bg-[#2f7a29]"
                        : "bg-[#475467] hover:bg-[#344054]"
                    }`}
                  >
                    {notification.status === "Accepted"
                      ? "View booking details"
                      : "View request status"}
                  </button>
                </div>
              </div>
            ))}

            {renterNotifications.length === 0 && (
              <p className="text-center text-sm text-gray-500">
                No notifications right now.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
