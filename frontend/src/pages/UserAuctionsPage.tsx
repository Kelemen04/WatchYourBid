import { useState } from "react";
import { Link } from "react-router-dom";
import AuctionListItem from "../components/layout/AuctionListItem";
import { useAuctionDelete, useAuctionsByUser } from "../hooks/useAuctions";

export default function UserAuctionsPage() {
  const { data, isLoading } = useAuctionsByUser();
  const { mutate: auctionDelete } = useAuctionDelete();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = (auctionId: number) => {
    if (window.confirm("Are you sure you want to delete this auction?")) {
      setDeletingId(auctionId);
      auctionDelete(auctionId, {
        onSettled: () => setDeletingId(null),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="font-playfair text-2xl text-primary animate-pulse">
          Loading your auctions...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-[1400px]">
        <h2 className="font-playfair text-4xl font-bold text-background mb-6 border-b border-text-muted/20 pb-2">
          Your auctions:
        </h2>

        {data && data.length > 0 ? (
          <div className="flex flex-col flex-wrap gap-10">
            {data.map((auction) => (
              <div key={auction.id} className="flex flex-col gap-2">
                <AuctionListItem auction={auction} />

                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => handleDelete(auction.id)}
                    disabled={deletingId === auction.id}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors disabled:bg-gray-400 text-center uppercase tracking-wider"
                  >
                    {deletingId === auction.id ? "Deleting..." : "Delete"}
                  </button>

                  <Link
                    to={`/auction/${auction.id}/update`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-center text-xs font-bold rounded-lg transition-colors uppercase tracking-wider"
                  >
                    Update
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-text-muted/20 rounded-2xl">
            <p className="text-gray-500 italic">
              You don't have any auctions yet!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
