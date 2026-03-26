import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getBumperPullListItems,
  getCarHaulersListItems,
  getFlatbedListItems,
  getGooseneckListItems,
} from "../../assets/data/trailers.ts";

const OwnerViewMoreTrucks: React.FC = () => {
  const navigate = useNavigate();
  const allOwnerTrucks = [
    ...getGooseneckListItems(),
    ...getBumperPullListItems(),
    ...getFlatbedListItems(),
    ...getCarHaulersListItems(),
  ];

  const isBookedTrailer = (truckId: number) => truckId % 3 === 2;

  return (
    <div className="min-h-screen bg-[#F9F8F3] px-4 py-6 sm:py-8">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="mb-5 flex items-center justify-between px-1 py-1">
          <div>
            <h1 className="text-lg font-semibold text-[#1F2937]">
              Your Trailers - View More
            </h1>
            <p className="text-xs text-gray-600">
              Manage your full truck inventory from one place
            </p>
          </div>
          <Link
            to="/"
            className="rounded-md border border-[#8CCB85] bg-[#EAF7E8] px-3 py-1.5 text-xs font-semibold text-[#2F7A29] hover:bg-[#DDF2DA]"
          >
            Back
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {allOwnerTrucks.map((item) => (
            <div
              key={`owner-more-${item.id}`}
              className="cursor-pointer"
              onClick={() =>
                navigate(`/owner/truck/${item.id}`, {
                  state: { isBooked: isBookedTrailer(Number(item.id)) },
                })
              }
            >
              <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
                <img
                  src={item.image}
                  alt={item.modelLabel}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <p className="mt-1.5 text-[14px] font-semibold leading-tight text-black">
                Gooseneck Trailor
              </p>
              <p className="mt-0.5 text-[11px] text-gray-700 leading-tight">
                <span className="text-[#F59E0B]">★</span> 4.9 {item.modelLabel}
              </p>
              <p className="mt-0.5 text-[12px] font-semibold leading-tight text-black">
                {item.priceLabel}
              </p>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-[2px] text-[9px] font-medium ${
                    isBookedTrailer(Number(item.id))
                      ? "bg-gray-200 text-gray-700"
                      : "bg-[#E7F6E6] text-[#2F7A29]"
                  }`}
                >
                  {isBookedTrailer(Number(item.id)) ? "Booked" : "Available"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OwnerViewMoreTrucks;
