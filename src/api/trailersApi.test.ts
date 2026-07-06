import api from "./api";
import { fetchTrailersList } from "./trailersApi";

jest.mock("./api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
  API_BASE_URL: "http://localhost",
}));

describe("fetchTrailersList offline fallback", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
  });

  it("returns cached trailer data when the request fails", async () => {
    const mockedGet = api.get as jest.Mock;
    mockedGet.mockRejectedValueOnce(new Error("offline"));

    const cached = {
      gooseneck: [
        {
          id: "cached-1",
          image: "fallback",
          titleLabel: "Cached Trailer",
          modelLabel: "Model: Cached Trailer",
          priceLabel: "$120",
          availabilityStatus: "available",
        },
      ],
      bumper_pull: [],
      flatbed: [],
      car_hauler: [],
    };

    localStorage.setItem("trailersHomeCache", JSON.stringify(cached));

    const result = await fetchTrailersList({ page: 1, limit: 10 });

    expect(result.gooseneck[0].titleLabel).toBe("Cached Trailer");
    expect(result.bumper_pull).toEqual([]);
  });
});
