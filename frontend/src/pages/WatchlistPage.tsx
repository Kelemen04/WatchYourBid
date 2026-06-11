import { useState } from "react";
import { Link } from "react-router-dom";
import AuctionListItem from "../components/layout/AuctionListItem";
import {
  useRemoveAuctionFromWatchlist,
  useWatchlist,
} from "../hooks/useAuctions";
import { RiFileList3Line } from "react-icons/ri";

export default function WatchlistPage() {
  const [page, setPage] = useState(0);
  const take = 10;
  const skip = page * take;

  const { data, isLoading } = useWatchlist(skip, take);
  const { mutate } = useRemoveAuctionFromWatchlist();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = (auctionId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this auction from your watchlist?",
    );

    if (confirmDelete) {
      setDeletingId(auctionId);
      mutate(
        { auctionId },
        {
          onSettled: () => setDeletingId(null),
        },
      );
    }
  };

  if (isLoading && page === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <span className="font-playfair text-2xl text-primary animate-pulse">
          Loading Watchlist...
        </span>
      </div>
    );
  }

  const auctionList = data || [];

  return (
    <div className="w-full bg-text-muted/10 min-h-screen py-10">
      <div className="max-w-[1400px] mx-auto px-4 md:px-10">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold text-surface mb-8 border-b border-text-muted/20 pb-4">
          My Watchlist
        </h1>

        {auctionList.length > 0 ? (
          <div className="flex flex-col gap-8">
            {auctionList.map((auction) => (
              <div key={auction.id} className="flex flex-col gap-2">
                <AuctionListItem auction={auction} />

                <button
                  type="button"
                  onClick={() => handleDelete(auction.id)}
                  disabled={deletingId === auction.id}
                  className="self-end px-6 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 hover:border-red-600 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === auction.id
                    ? "Removing..."
                    : "Remove from Watchlist"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-text-muted/20 rounded-2xl shadow-sm">
            <div className="w-16 h-16 mb-4 mx-auto bg-gray-50 rounded-full flex items-center justify-center">
              <RiFileList3Line className="text-4xl" />
            </div>
            <h3 className="font-playfair text-2xl font-bold text-background mb-2">
              Your watchlist is empty
            </h3>
            <p className="font-inter text-text-muted mb-6">
              You haven't saved any items yet. Start exploring to find your next
              timepiece.
            </p>
            <Link
              to="/home"
              className="bg-primary hover:bg-primary-hover text-background px-8 py-3 rounded-2xl font-bold font-inter transition-all uppercase tracking-wider text-xs"
            >
              Explore Auctions
            </Link>
          </div>
        )}

        {/* Lapozó gombok */}
        {!isLoading && auctionList.length > 0 && (
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
