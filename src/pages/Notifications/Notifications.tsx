import React, { useEffect } from "react";
import NotificationCard from "../../components/NotificationCard.tsx";
import { images } from "../../assets/images/index.ts";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store";
import { toast } from "react-toastify";

const Notifications: React.FC = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const userType = useSelector((state: RootState) => state.auth.userType);
  const isOwner =
    isAuthenticated && (user?.trailor === "Owner" || userType === "Owner");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const notifications = [
    {
      id: 1,
      title: "Gooseneck Trailer",
      model: "FMAX208",
      price: "$21,435",
      rating: 4.9,
      reviews: 593,
      image: images.Container,
    },
  ];

  const handleAccept = (id: number) => {
    const selected = notifications.find((n) => n.id === id);
    if (!selected) return;

    if (isOwner) {
      navigate("/trailor-condition", {
        state: {
          bookingId: `#TR-2026-${String(id).padStart(5, "0")}`,
          trailorName: selected.title,
          renterName: "Renter",
          pickupDate: "12 March 2026",
        },
      });
      return;
    }

    // Renter flow: after accept, renter sees Done/Return summary screen.
    navigate("/return", {
      state: {
        bookingId: `#TR-2026-${String(id).padStart(5, "0")}`,
      },
    });
  };

  const handleReject = () => {
    toast.info("Booking request rejected");
  };

  return (
    <div className="min-h-screen flex justify-center bg-[#F9F8F3] px-4 py-10">
      {/* 80% width main container, near top instead of perfectly centered */}
      <div className="w-full max-w-5xl md:w-[80%] bg-white rounded-2xl shadow-md border border-gray-200 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Notifications
        </h1>

        <div className="space-y-4">
          {notifications.map((n) => (
            <NotificationCard
              key={n.id}
              id={n.id}
              imageUrl={n.image}
              title={n.title}
              model={n.model}
              price={n.price}
              rating={n.rating}
              reviewsCount={n.reviews}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}

          {notifications.length === 0 && (
            <p className="text-center text-sm text-gray-500">
              No notifications right now.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;

