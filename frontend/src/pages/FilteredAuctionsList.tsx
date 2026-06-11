import { useSearchParams } from "react-router-dom";
import { useAuctionsByFilters } from "../hooks/useAuctions";
import type { AuctionItemData, AuctionFilterDTO } from "../dto/auction.dto";
import Filters from "../components/layout/Filters";
import AuctionListItem from "../components/layout/AuctionListItem";
import { useMemo, useState } from "react";

export default function FilteredAuctionsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const take = 5;
  const skip = page * take;

  const currentFilters = useMemo<AuctionFilterDTO>(() => {
    const filters: AuctionFilterDTO = {
      sortBy: searchParams.get("sortBy") || "newest",
    };

    const searchTerm = searchParams.get("searchTerm");
    if (searchTerm) filters.searchTerm = searchTerm;
    const brand = searchParams.get("brand");
    if (brand) filters.brand = brand;
    const category = searchParams.get("category");
    if (category) filters.category = category as AuctionFilterDTO["category"];
    const auctionType = searchParams.get("auctionType");
    if (auctionType)
      filters.auctionType = auctionType as AuctionFilterDTO["auctionType"];
    const minPrice = searchParams.get("minPrice");
    if (minPrice) filters.minPrice = Number(minPrice);
    const maxPrice = searchParams.get("maxPrice");
    if (maxPrice) filters.maxPrice = Number(maxPrice);
    const minYear = searchParams.get("minYear");
    if (minYear) filters.minYear = Number(minYear);
    const maxYear = searchParams.get("maxYear");
    if (maxYear) filters.maxYear = Number(maxYear);
    const condition = searchParams.get("condition");
    if (condition) filters.condition = condition;
    const material = searchParams.get("material");
    if (material) filters.material = material;

    return filters;
  }, [searchParams, skip]);

  const { data: auctions, isLoading } = useAuctionsByFilters(
    currentFilters,
    skip,
    take,
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("skip", (newPage * take).toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const auctionList = auctions || [];

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10">
      <div className="max-w-[1400px] mx-auto px-4 md:px-10">
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

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-4 h-fit">
              <Filters />
            </div>
          </aside>

          <main className="flex-1 flex flex-col">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <span className="font-inter font-bold text-gray-400 uppercase tracking-widest animate-pulse">
                  Loading auctions...
                </span>
              </div>
            ) : auctionList.length > 0 ? (
              <div className="flex flex-col">
                {auctionList.map((auction: AuctionItemData) => (
                  <AuctionListItem key={auction.id} auction={auction} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center flex flex-col items-center justify-center shadow-sm">
                <div className="w-20 h-20 mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                  <span className="text-3xl">&#x1F50E;&#xFE0E;</span>
                </div>
                <h3 className="font-playfair text-2xl font-bold text-surface mb-2">
                  No auctions found
                </h3>
              </div>
            )}

            {/* Lapozó gombok */}
            {!isLoading && (
              <div className="mt-8 flex justify-center items-center gap-8">
                <button
                  onClick={() => handlePageChange(Math.max(page - 1, 0))}
                  disabled={page === 0}
                  className={`w-36 flex justify-center items-center py-2.5 font-bold uppercase tracking-wider text-xs border rounded-lg transition-colors ${
                    page === 0
                      ? "border-text-muted/20 text-text-muted/50 cursor-not-allowed bg-gray-50"
                      : "border-text-muted/40 text-background hover:border-primary hover:bg-primary hover:text-white"
                  }`}
                >
                  &larr; Previous
                </button>

                <span className="font-inter font-bold text-background text-sm uppercase tracking-widest w-20 text-center shrink-0">
                  Page {page + 1}
                </span>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!auctions || auctions.length < take}
                  className={`w-36 flex justify-center items-center py-2.5 font-bold uppercase tracking-wider text-xs border rounded-lg transition-colors ${
                    !auctions || auctions.length < take
                      ? "border-text-muted/20 text-text-muted/50 cursor-not-allowed bg-gray-50"
                      : "border-text-muted/40 text-background hover:border-primary hover:bg-primary hover:text-white"
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
