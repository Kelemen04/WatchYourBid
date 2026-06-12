import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

export default function Filters() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const handleApplyFilters = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    formData.forEach((value, key) => {
      if (value) {
        params.set(key, value.toString());
      }
    });

    navigate(`${location.pathname}?${params.toString()}`);
  };

  const handleResetFilters = () => {
    navigate(location.pathname);
  };

  return (
    <form
      key={location.search}
      onSubmit={handleApplyFilters}
      className="w-[280px] flex flex-col gap-y-4 p-6 border border-stone-200 bg-white shadow-sm font-[var(--font-inter)] h-fit relative overflow-hidden shrink-0"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-primary)] opacity-80" />

      <h2 className="font-[var(--font-playfair)] text-2xl font-bold text-[var(--color-surface)] border-b border-stone-100 pb-4 mt-1">
        Filters
      </h2>

      {/* 1. Search Term */}
      <div className="flex flex-col">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-2">
          Search
        </label>
        <input
          type="text"
          name="searchTerm"
          defaultValue={searchParams.get("searchTerm") || ""}
          placeholder="Keywords..."
          className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 text-sm text-[var(--color-surface)] placeholder:text-stone-400 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all duration-300"
        />
      </div>

      {/* 2. Brand */}
      <div className="flex flex-col">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-2">
          Brand
        </label>
        <input
          type="text"
          name="brand"
          defaultValue={searchParams.get("brand") || ""}
          placeholder="e.g. Rolex"
          className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 text-sm text-[var(--color-surface)] placeholder:text-stone-400 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all duration-300"
        />
      </div>

      {/* 3. Category */}
      <div className="flex flex-col">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-2">
          Category
        </label>
        <select
          name="category"
          defaultValue={searchParams.get("category") || ""}
          className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 text-sm text-[var(--color-surface)] outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all duration-300 cursor-pointer appearance-none"
        >
          <option value="">All Categories</option>
          <option value="WRISTWATCH">Wristwatch</option>
          <option value="POCKETWATCH">Pocketwatch</option>
          <option value="SMARTWATCH">Smartwatch</option>
          <option value="CLOCK">Clock</option>
        </select>
      </div>

      {/* 4. Auction Type */}
      <div className="flex flex-col">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-2">
          Auction Type
        </label>
        <select
          name="auctionType"
          defaultValue={searchParams.get("auctionType") || ""}
          className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 text-sm text-[var(--color-surface)] outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all duration-300 cursor-pointer appearance-none"
        >
          <option value="">All Types</option>
          <option value="ENGLISH">English</option>
          <option value="DUTCH">Dutch</option>
          <option value="JAPANESE">Japanese</option>
        </select>
      </div>

      {/* 5. Price Range */}
      <div className="flex flex-col">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-2">
          Price (EUR)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="minPrice"
            defaultValue={searchParams.get("minPrice") || ""}
            placeholder="Min"
            className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 text-sm text-[var(--color-surface)] placeholder:text-stone-400 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all duration-300"
          />
          <span className="text-stone-300 font-medium">-</span>
          <input
            type="number"
            name="maxPrice"
            defaultValue={searchParams.get("maxPrice") || ""}
            placeholder="Max"
            className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 text-sm text-[var(--color-surface)] placeholder:text-stone-400 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all duration-300"
          />
        </div>
      </div>

      {/* 6. Production Year */}
      <div className="flex flex-col">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-2">
          Year
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="minYear"
            defaultValue={searchParams.get("minYear") || ""}
            placeholder="From"
            className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 text-sm text-[var(--color-surface)] placeholder:text-stone-400 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all duration-300"
          />
          <span className="text-stone-300 font-medium">-</span>
          <input
            type="number"
            name="maxYear"
            defaultValue={searchParams.get("maxYear") || ""}
            placeholder="To"
            className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 text-sm text-[var(--color-surface)] placeholder:text-stone-400 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all duration-300"
          />
        </div>
      </div>

      {/* 7. Material */}
      <div className="flex flex-col">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-2">
          Material
        </label>
        <input
          type="text"
          name="material"
          defaultValue={searchParams.get("material") || ""}
          placeholder="e.g. Steel"
          className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 text-sm text-[var(--color-surface)] placeholder:text-stone-400 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all duration-300"
        />
      </div>

      {/* 8. Sort By */}
      <div className="flex flex-col">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-2">
          Sort By
        </label>
        <select
          name="sortBy"
          defaultValue={searchParams.get("sortBy") || "newest"}
          className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 text-sm text-[var(--color-surface)] italic outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all duration-300 cursor-pointer appearance-none"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 pt-5 mt-2 border-t border-stone-100">
        <button
          type="submit"
          className="w-full py-4 bg-[var(--color-surface)] text-white text-[11px] font-bold tracking-[0.2em] uppercase cursor-pointer transition-all duration-300 hover:bg-stone-800 hover:shadow-md"
        >
          Apply Filters
        </button>
        <button
          type="button"
          onClick={handleResetFilters}
          className="w-full py-3 bg-transparent border border-stone-200 text-[10px] font-bold tracking-[0.15em] uppercase text-stone-500 cursor-pointer transition-all duration-300 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          Reset Filters
        </button>
      </div>
    </form>
  );
}
