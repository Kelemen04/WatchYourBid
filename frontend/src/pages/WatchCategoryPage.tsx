import { useParams } from "react-router-dom";
import { useCategoryData } from "../hooks/useAuctions";
import AuctionListItem from "../components/layout/AuctionListItem";
import Filters from "../components/layout/Filters";
import AuctionCard from "../components/layout/AuctionCard";

export default function CategoryPage() {
  const { category } = useParams();
  const { data, isLoading } = useCategoryData(category || "");

  if (isLoading) {
    return (
      <div className="p-20 text-center font-playfair text-xl">Loading...</div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row gap-10 items-start">
        {/* Bal oldal: Szűrő */}
        <aside className="w-full md:w-[300px] shrink-0">
          <Filters />
        </aside>

        {/* Jobb oldal: Aukciós lista */}
        <main className="flex-1 w-full">
          <h1 className="font-playfair text-4xl text-[var(--color-surface)] mb-10 border-b border-stone-100 pb-6 capitalize">
            Findings for: {category}
          </h1>

          {/* Promoted Grid */}
          <section className="mb-12">
            <h2 className="font-playfair text-3xl font-bold text-slate-900 border-l-4 border-primary pl-4 mb-6">
              Promoted
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data?.promoted.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          </section>

          {/* Others List */}
          <section>
            <h2 className="font-playfair text-3xl font-bold text-slate-900 border-l-4 border-primary pl-4 mb-6">
              {category}
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {data?.others.map((auction) => (
                <AuctionListItem key={auction.id} auction={auction} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
