export default function Filters() {
  return (
    <div className="w-64 flex flex-col gap-y-5 p-4 border-2 border-gray-400 rounded bg-white h-fit">
      <h2 className="font-bold text-lg border-b border-black pb-2 uppercase italic">
        Filters
      </h2>

      {/* 1. Search Term */}
      <div className="flex flex-col">
        <label className="text-xs font-bold uppercase text-gray-600 mb-1">
          Search
        </label>
        <input
          type="text"
          placeholder="Keywords..."
          className="border border-black p-2 text-sm w-full"
        />
      </div>

      {/* 2. Brand */}
      <div className="flex flex-col">
        <label className="text-xs font-bold uppercase text-gray-600 mb-1">
          Brand
        </label>
        <input
          type="text"
          placeholder="e.g. Rolex"
          className="border border-black p-2 text-sm w-full"
        />
      </div>

      {/* 3. Category */}
      <div className="flex flex-col">
        <label className="text-xs font-bold uppercase text-gray-600 mb-1">
          Category
        </label>
        <select className="border border-black p-2 text-sm bg-white w-full font-medium">
          <option value="">All Categories</option>
          <option value="WRISTWATCH">Wristwatch</option>
          <option value="POCKETWATCH">Pocketwatch</option>
          <option value="SMARTWATCH">Smartwatch</option>
          <option value="CLOCK">Clock</option>
        </select>
      </div>

      {/* 4. Auction Type */}
      <div className="flex flex-col">
        <label className="text-xs font-bold uppercase text-gray-600 mb-1">
          Auction Type
        </label>
        <select className="border border-black p-2 text-sm bg-white w-full">
          <option value="">All Types</option>
          <option value="ENGLISH">English</option>
          <option value="DUTCH">Dutch</option>
          <option value="JAPANESE">Japanese</option>
        </select>
      </div>

      {/* 5. Price Range */}
      <div className="flex flex-col">
        <label className="text-xs font-bold uppercase text-gray-600 mb-1">
          Price (EUR)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            className="border border-black p-2 text-sm w-full"
          />
          <span className="font-bold">-</span>
          <input
            type="number"
            placeholder="Max"
            className="border border-black p-2 text-sm w-full"
          />
        </div>
      </div>

      {/* 6. Production Year */}
      <div className="flex flex-col">
        <label className="text-xs font-bold uppercase text-gray-600 mb-1">
          Year
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="From"
            className="border border-black p-2 text-sm w-full"
          />
          <span className="font-bold">-</span>
          <input
            type="number"
            placeholder="To"
            className="border border-black p-2 text-sm w-full"
          />
        </div>
      </div>

      {/* 7. Condition */}
      <div className="flex flex-col">
        <label className="text-xs font-bold uppercase text-gray-600 mb-1">
          Condition
        </label>
        <select className="border border-black p-2 text-sm bg-white w-full">
          <option value="">Any Condition</option>
          <option value="NEW">New</option>
          <option value="USED">Used</option>
          <option value="VINTAGE">Vintage</option>
        </select>
      </div>

      {/* 8. Material */}
      <div className="flex flex-col">
        <label className="text-xs font-bold uppercase text-gray-600 mb-1">
          Material
        </label>
        <input
          type="text"
          placeholder="e.g. Steel"
          className="border border-black p-2 text-sm w-full"
        />
      </div>

      {/* 9. Sort By */}
      <div className="flex flex-col">
        <label className="text-xs font-bold uppercase text-gray-600 mb-1">
          Sort By
        </label>
        <select className="border border-black p-2 text-sm bg-white w-full italic">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2 pt-4 border-t border-gray-300">
        <button className="bg-black text-white px-4 py-2 text-sm font-bold uppercase hover:bg-gray-800 transition-colors w-full">
          Apply Filters
        </button>
        <button className="border border-black px-4 py-2 text-sm font-bold uppercase hover:bg-gray-100 transition-colors w-full">
          Reset
        </button>
      </div>
    </div>
  );
}
