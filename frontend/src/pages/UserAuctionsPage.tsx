import { useState } from "react";
import { Link } from "react-router-dom";
import AuctionListItem from "../components/layout/AuctionListItem";
import { useAuctionDelete, useAuctionsByUser } from "../hooks/useAuctions";

export default function UserAuctionsPage() {
  const [page, setPage] = useState(0);
  const take = 5;
  const skip = page * take;

  const { data: auctions, isLoading } = useAuctionsByUser(skip, take);
  const { mutate: auctionDelete } = useAuctionDelete();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = (auctionId: number) => {
    if (window.confirm("Are you sure you want to delete this auction?")) {
      setDeletingId(auctionId);

      auctionDelete(auctionId, {
        onError: (err) => {
          const errorMessage =
            err.response?.data?.error ||
            "Failed to delete auction. It might have active bids.";
          alert(errorMessage);
        },
        onSettled: () => setDeletingId(null),
      });
    }
  };

  if (isLoading && page === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="font-playfair text-2xl text-primary animate-pulse">
          Loading your auctions...
        </span>
      </div>
    );
  }

  const auctionList = auctions || [];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-[1400px]">
        <h2 className="font-playfair text-4xl font-bold text-background mb-6 border-b border-text-muted/20 pb-2">
          Your auctions:
        </h2>

        {auctionList.length > 0 ? (
          <div className="flex flex-col flex-wrap gap-10">
            {auctionList.map((auction) => (
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
          <div className="text-center py-20 bg-white border border-text-muted/20 rounded-2xl shadow-sm">
            <p className="text-text-muted text-lg uppercase tracking-widest">
              You don't have any auctions yet!
            </p>
          </div>
        )}

        {/* Pagination */}
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
      </div>
    </div>
  );
}
