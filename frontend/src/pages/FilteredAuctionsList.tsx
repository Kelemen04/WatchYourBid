import { useSearchParams } from "react-router-dom";
import { useAuctionsByFilters } from "../hooks/useAuctions"; // Ellenőrizd az útvonalat
import type { AuctionItemData } from "../dto/auction.dto";
import Filters from "../components/layout/Filters"; // Állítsd be a helyes útvonalat
import AuctionListItem from "../components/layout/AuctionListItem"; // Állítsd be a helyes útvonalat

export default function FilteredAuctionsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const take = 20;

  // A skip-et egyenesen az URL-ből olvassuk ki (alapértelmezetten 0)
  const skip = parseInt(searchParams.get("skip") || "0", 10);

  const currentFilters = {
    searchTerm: searchParams.get("searchTerm") || undefined,
    brand: searchParams.get("brand") || undefined,

    // Ezeknél KELL a megkötés, mert a backend csak ezeket az értékeket fogadja el:
    category:
      (searchParams.get("category") as
        | "WRISTWATCH"
        | "POCKETWATCH"
        | "SMARTWATCH"
        | "CLOCK") || undefined,
    auctionType:
      (searchParams.get("auctionType") as "ENGLISH" | "DUTCH" | "JAPANESE") ||
      undefined,

    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    minYear: searchParams.get("minYear")
      ? Number(searchParams.get("minYear"))
      : undefined,
    maxYear: searchParams.get("maxYear")
      ? Number(searchParams.get("maxYear"))
      : undefined,

    // Mivel ez sima string, itt elég a sima beolvasás, nem fog hibát dobni:
    condition: searchParams.get("condition") || undefined,

    material: searchParams.get("material") || undefined,
    sortBy: searchParams.get("sortBy") || "newest",
    skip,
    take,
  };

  // Adatlekérés
  const { data: auctions, isLoading } = useAuctionsByFilters(currentFilters);

  // Lapozó függvény, ami az URL-t frissíti
  const handlePageChange = (newSkip: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("skip", newSkip.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Lapozás után felugrik az oldal tetejére
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10">
      <div className="max-w-[1400px] mx-auto px-4 md:px-10">
        {/* Oldal Fejléc */}
        <div className="mb-8">
          <h1 className="font-playfair text-3xl md:text-5xl font-bold text-surface mb-2">
            Explore Auctions
          </h1>
          <p className="font-inter text-gray-500">
            {currentFilters.searchTerm
              ? `Showing results for "${currentFilters.searchTerm}"`
              : "Discover the finest luxury timepieces."}
          </p>
        </div>

        {/* Fő tartalom: Bal oldalon a szűrők, jobb oldalon az eredmények */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Bal oldal: Szűrők */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            {/* A h-fit biztosítja, hogy a filter panel ne nyúljon le az oldal aljáig */}
            <div className="sticky top-4 h-fit">
              <Filters />
            </div>
          </aside>

          {/* Jobb oldal: Eredmények listája */}
          <main className="flex-1 flex flex-col">
            {/* Betöltés állapota */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <span className="font-inter font-bold text-gray-400 uppercase tracking-widest animate-pulse">
                  Loading auctions...
                </span>
              </div>
            ) : auctions && auctions.length > 0 ? (
              // Találatok megjelenítése egymás alatt
              <div className="flex flex-col">
                {auctions.map((auction: AuctionItemData) => (
                  <AuctionListItem key={auction.id} auction={auction} />
                ))}
              </div>
            ) : (
              // Nincs találat
              <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center flex flex-col items-center justify-center shadow-sm">
                <div className="w-20 h-20 mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                  <span className="text-3xl">&#x1F50E;&#xFE0E;</span>
                </div>
                <h3 className="font-playfair text-2xl font-bold text-surface mb-2">
                  No auctions found
                </h3>
                <p className="font-inter text-gray-500 max-w-md">
                  We couldn't find any items matching your current filters. Try
                  adjusting your search criteria or clearing the filters.
                </p>
              </div>
            )}

            {/* Lapozó gombok (Csak akkor jelennek meg, ha nem töltünk épp) */}
            {!isLoading && (
              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={() => handlePageChange(Math.max(0, skip - take))}
                  disabled={skip === 0}
                  className={`px-6 py-2.5 font-bold uppercase tracking-wider text-xs border rounded-lg transition-colors ${
                    skip === 0
                      ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                      : "border-surface text-surface hover:bg-surface hover:text-white"
                  }`}
                >
                  &larr; Previous
                </button>
                <button
                  onClick={() => handlePageChange(skip + take)}
                  disabled={!auctions || auctions.length < take}
                  className={`px-6 py-2.5 font-bold uppercase tracking-wider text-xs border rounded-lg transition-colors ${
                    !auctions || auctions.length < take
                      ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                      : "border-surface text-surface hover:bg-surface hover:text-white"
                  }`}
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
