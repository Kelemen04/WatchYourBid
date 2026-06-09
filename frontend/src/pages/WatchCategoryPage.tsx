import { useParams } from "react-router-dom";
import { useCategoryData } from "../hooks/useAuctions";
import AuctionListItem from "../components/layout/AuctionListItem";
import Filters from "../components/layout/Filters";
import AuctionCard from "../components/layout/AuctionCard";

export default function CategoryPage() {
  const { category } = useParams();
  const { data, isLoading } = useCategoryData(category || "");

  const formattedCategory = category
    ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
    : "";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <span className="font-playfair text-2xl text-primary animate-pulse">
          Loading {formattedCategory} auctions...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full mb-10 px-4 md:px-10 flex flex-col gap-16 mt-24">
      <div className="flex flex-col md:flex-row gap-10 items-start">
        {/* Filter */}
        <aside className="w-full md:w-[300px] shrink-0">
          <Filters />
        </aside>

        {/* Auctions */}
        <main className="flex-1 max-w-[1400px]">
          <h2 className="font-playfair text-4xl font-bold text-background mb-6 border-b border-text-muted/20 pb-2">
            Findings for: {formattedCategory}
          </h2>

          {/* Promoted Grid */}
          <section className="mb-12">
            <h2 className="font-playfair text-3xl font-bold text-background border-l-4 border-primary pl-4 mb-6">
              Promoted
            </h2>
            {data?.promoted && data.promoted.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data?.promoted.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white border border-text-muted/20 rounded-2xl shadow-sm">
                <p className="text-text-muted text-lg uppercase tracking-widest">
                  No promoted auctions found.
                </p>
              </div>
            )}
          </section>

          {/* Others List */}
          <section>
            <h2 className="font-playfair text-3xl font-bold text-slate-900 border-l-4 border-primary pl-4 mb-6">
              {formattedCategory}
            </h2>
            {data?.others && data.others.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {data?.others.map((auction) => (
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
          </section>
        </main>
      </div>
    </div>
  );
}
