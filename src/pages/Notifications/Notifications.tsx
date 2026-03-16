import React, { useEffect } from "react";
import NotificationCard from "../../components/NotificationCard.tsx";
import { images } from "../../assets/images/index.ts";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store";

const Notifications: React.FC = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
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
              imageUrl={n.image}
              title={n.title}
              model={n.model}
              price={n.price}
              rating={n.rating}
              reviewsCount={n.reviews}
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

