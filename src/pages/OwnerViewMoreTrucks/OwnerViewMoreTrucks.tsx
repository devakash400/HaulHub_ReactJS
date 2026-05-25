import React from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
          {allOwnerTrucks.map((item) => {
            const booked = isBookedTrailer(Number(item.id));

            return (
              <div
                key={`owner-more-${item.id}`}
                className="w-full cursor-pointer"
                onClick={() =>
                  navigate(`/owner/truck/${item.id}`, {
                    state: { isBooked: booked },
                  })
                }
              >
                <div className="overflow-hidden rounded-[4px] bg-white">
                  {/* Image */}
                  <div className="h-[257px] w-full overflow-hidden rounded-[4px]">
                    <img
                      src={item.image}
                      alt={item.modelLabel}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="pt-2">
                    {/* Trailer Name */}
                    <p
                      className="
                        font-[Lexend]
                        text-[14px]
                        font-semibold
                        leading-[100%]
                        text-black
                      "
                    >
                      Gooseneck Trailor
                    </p>

                    {/* Rating + Model */}
                    <div className="mt-1 flex items-center">
                      <span className="text-[12px] text-[#F5A623]">★</span>

                      <span
                        className="
                          ml-1
                          font-[Lexend]
                          text-[13px]
                          font-normal
                          leading-[100%]
                          text-black
                        "
                      >
                        4.9
                      </span>

                      <span
                        className="
                          ml-1
                          font-[Lexend]
                          text-[13px]
                          font-normal
                          leading-[100%]
                          text-black
                        "
                      >
                        Model :
                      </span>

                      <span
                        className="
                          ml-1
                          font-[Lexend]
                          text-[13px]
                          font-light
                          leading-[100%]
                          text-black
                        "
                      >
                        {item.modelLabel}
                      </span>
                    </div>

                    {/* Price */}
                    <p
                      className="
                        mt-1
                        font-[Lexend]
                        text-[13px]
                        font-semibold
                        leading-[100%]
                        text-black
                      "
                    >
                      {item.priceLabel}
                    </p>

                    {/* Status */}
                    <div className="mt-2">
                      <span
                        className={`
                          inline-flex
                          h-[20px]
                          items-center
                          justify-center
                          rounded-[2px]
                          px-3
                          font-[Lexend]
                          text-[9px]
                          font-medium
                          leading-[100%]
                          ${
                            booked
                              ? "bg-[#E5E5E5] text-[#929191]"
                              : "bg-[#EBFFE9] text-[#389131]"
                          }
                        `}
                      >
                        {booked ? "Booked" : "Available"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OwnerViewMoreTrucks;
