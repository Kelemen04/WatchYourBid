import { useState } from "react";
import { useParams } from "react-router-dom";
import { useCategoryData } from "../hooks/useAuctions";
import AuctionListItem from "../components/layout/AuctionListItem";
import Filters from "../components/layout/Filters";
import AuctionCard from "../components/layout/AuctionCard";

export default function CategoryPage() {
  const { category } = useParams();
  const [page, setPage] = useState(0);
  const take = 10;
  const skip = page * take;

  // Átadjuk a skip és take értékeket
  const { data, isLoading } = useCategoryData(category || "", skip, take);

  const formattedCategory = category
    ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
    : "";

  if (isLoading && page === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <span className="font-playfair text-2xl text-primary animate-pulse">
          Loading {formattedCategory} auctions...
        </span>
      </div>
    );
  }

  const auctionList = data?.others || [];

  return (
    <div className="w-full mb-10 px-4 md:px-10 flex flex-col gap-16 mt-24">
      <div className="flex flex-col md:flex-row gap-10 items-start">
        <aside className="w-full md:w-[300px] shrink-0">
          <div className="sticky top-4">
            <Filters />
          </div>
        </aside>

        <main className="flex-1 max-w-[1400px]">
          <h2 className="font-playfair text-4xl font-bold text-background mb-6 border-b border-text-muted/20 pb-2">
            Findings for: {formattedCategory}
          </h2>

          {/* Promoted Grid */}
          {page === 0 && data?.promoted && data.promoted.length > 0 && (
            <section className="mb-12">
              <h2 className="font-playfair text-3xl font-bold text-background border-l-4 border-primary pl-4 mb-6">
                Promoted
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.promoted.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </div>
            </section>
          )}

          {/* Others List */}
          <section>
            <h2 className="font-playfair text-3xl font-bold text-slate-900 border-l-4 border-primary pl-4 mb-6">
              {formattedCategory}
            </h2>
            {auctionList.length > 0 ? (
              <div className="flex flex-col gap-6">
                {auctionList.map((auction) => (
                  <AuctionListItem key={auction.id} auction={auction} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white border border-text-muted/20 rounded-2xl shadow-sm">
                <p className="text-text-muted text-lg uppercase tracking-widest">
                  No auctions found.
                </p>
              </div>
            )}

            {/* Lapozó gombok */}
            {!isLoading && (
              <div className="mt-8 flex justify-center items-center gap-8">
                <button
                  onClick={() => setPage((old) => Math.max(old - 1, 0))}
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
                  onClick={() => setPage((old) => old + 1)}
                  disabled={auctionList.length < take}
                  className={`w-36 flex justify-center items-center py-2.5 font-bold uppercase tracking-wider text-xs border rounded-lg transition-colors ${
                    auctionList.length < take
                      ? "border-text-muted/20 text-text-muted/50 cursor-not-allowed bg-gray-50"
                      : "border-text-muted/40 text-background hover:border-primary hover:bg-primary hover:text-white"
                  }`}
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
