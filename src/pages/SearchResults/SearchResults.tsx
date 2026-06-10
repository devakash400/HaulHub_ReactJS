import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { images } from "../../assets/images/index.ts";

type ResultItem = {
  _id?: string;
  id?: string | number;
  title?: string;
  images?: string[];
  pricePerDay?: number;
  totalPrice?: number;
  [key: string]: any;
};

const SearchResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const q = params.get("q") ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ResultItem[] | null>(null);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    let cancelled = false;
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `https://api.renthaulhub.com/api/search?q=${encodeURIComponent(q)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Search failed: ${res.status}`);
        const data = await res.json();
        if (cancelled) return;

        // Support responses like:
        // 1) Array of items
        // 2) { success: true, data: [...] }
        // 3) { results: [...] } or { data: [...] }
        let items: ResultItem[] = [];
        if (Array.isArray(data)) items = data as ResultItem[];
        else if (data && data.success && Array.isArray((data as any).data))
          items = (data as any).data as ResultItem[];
        else if (data && Array.isArray((data as any).results))
          items = (data as any).results as ResultItem[];
        else if (data && Array.isArray((data as any).data))
          items = (data as any).data as ResultItem[];

        setResults(items);
      } catch (err: any) {
        if (!cancelled)
          setError(err?.message ?? "Unable to fetch search results");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchResults();
    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">Search</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Results for “<span className="text-[#389131]">{q}</span>”
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {loading
              ? "Finding the best trailers for your query..."
              : results
                ? `${results.length} trailer${results.length === 1 ? "" : "s"} found`
                : "Enter a keyword to search for trailers."}
          </p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm w-full max-w-sm">
          <p className="text-sm font-medium text-gray-700">Search tip</p>
          <p className="mt-2 text-sm text-gray-500">
            Use keywords like <span className="font-semibold">flatbed</span>,
            <span className="font-semibold"> car hauler</span>, or a location to
            quickly find matching trailers.
          </p>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[24px] border border-gray-200 bg-white p-4 shadow-sm animate-pulse"
            >
              <div className="mb-4 h-40 w-full rounded-2xl bg-gray-200" />
              <div className="h-4 w-3/4 rounded-full bg-gray-200 mb-3" />
              <div className="h-4 w-1/2 rounded-full bg-gray-200 mb-3" />
              <div className="h-10 w-full rounded-2xl bg-gray-200" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-200 bg-[#FEF3F2] p-6 text-red-700">
          {error}
        </div>
      )}

      {!loading && results && results.length === 0 && (
        <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">
            No trailers found
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Try another keyword or use a different location.
          </p>
        </div>
      )}

      {!loading && results && results.length > 0 && (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 list-none p-0">
          {results.map((item) => {
            const title = item.name ?? item.title ?? item._id ?? "Untitled";
            const image =
              item.image ?? (item.images && item.images[0]) ?? images.Catimg;
            const trailerId = item._id ?? item.id;
            const rawPrice = item.pricePerDay ?? item.price ?? item.totalPrice;
            const price =
              typeof rawPrice === "number"
                ? `$${rawPrice}${item.pricePerDay ? "/day" : ""}`
                : rawPrice
                  ? String(rawPrice)
                  : "--";
            const locationText =
              item.location ?? item.place ?? "Unknown location";

            return (
              <li key={String(trailerId) + title}>
                <article
                  onClick={() => {
                    if (trailerId) navigate(`/trailer/${trailerId}`);
                  }}
                  className="group cursor-pointer overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm transition duration-200 ease-out hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="h-52 overflow-hidden bg-gray-100">
                    <img
                      src={image}
                      alt={title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-3 p-5">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 truncate">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {locationText}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-[#E6F7E8] px-3 py-1 text-sm font-semibold text-[#1f6e2e]">
                        {price}
                      </span>
                      <span className="text-sm text-gray-500">
                        Available now
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        className="rounded-2xl bg-[#389131] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2e6f26]"
                      >
                        View Trailer
                      </button>
                      <span className="text-xs uppercase tracking-[0.18em] text-gray-400">
                        Featured
                      </span>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SearchResults;
