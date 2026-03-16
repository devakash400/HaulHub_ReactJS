import React from "react";

type NotificationCardProps = {
  imageUrl: string;
  title: string;
  model: string;
  price: string;
  rating: number;
  reviewsCount: number;
};

const NotificationCard: React.FC<NotificationCardProps> = ({
  imageUrl,
  title,
  model,
  price,
  rating,
  reviewsCount,
}) => {
  return (
    <div className="w-full rounded-2xl border border-gray-300 bg-white shadow-sm px-4 py-4 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="h-28 w-full sm:w-32 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {title}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              Model: <span className="font-medium">{model}</span>
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{price}</p>
            <p className="mt-1 text-xs sm:text-sm text-gray-700">
              ⭐ {rating.toFixed(1)} ({reviewsCount.toLocaleString()}) Guest
              Favourite
            </p>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              className="flex-1 rounded-lg border border-gray-400 bg-white py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Reject
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg bg-[#389131] py-2 text-sm font-semibold text-white hover:bg-[#2f7a29] transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;

