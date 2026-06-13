import { Link } from "react-router-dom";
import { useMyBidsHistory } from "../hooks/useBids";
import { useState } from "react";

export default function UserBidsPage() {
  const [page, setPage] = useState(0);
  const take = 10;
  const skip = page * take;

  const { data: bids, isLoading } = useMyBidsHistory(skip, take);

  if (isLoading && page === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="font-playfair text-2xl text-primary animate-pulse">
          Loading your bids...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px]">
      <h2 className="font-playfair text-4xl font-bold text-background mb-6 border-b border-text-muted/20 pb-2">
        My Bids and Wins
      </h2>
      {bids && bids.length > 0 ? (
        <div className="flex flex-col gap-[10px]">
          {bids.map((b) => (
            <div
              key={b.id}
              className={`p-[10px] ${
                b.isWinner
                  ? "border-2 rounded-2xl border-green-600 bg-[#f0fff0]"
                  : "border rounded-2xl border-text-muted bg-white"
              }`}
            >
              <div className="flex justify-between items-center">
                <Link
                  to={`/auction/${b.auctionId}`}
                  className="font-bold text-[16px] text-background hover:text-primary transition-colors"
                >
                  {b.auction.title}
                </Link>
                {b.isWinner && (
                  <span className="bg-green-600 text-white px-[6px] py-[2px] text-[12px] font-bold rounded-md tracking-wider">
                    WINNER
                  </span>
                )}
              </div>
              <div className="flex justify-between mt-[8px] text-[14px] text-gray-500">
                <span>
                  Your Bid: <strong>{b.bidAmount} EUR</strong>
                </span>
                <span>Auction Status: {b.auction.status}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-text-muted/20 rounded-2xl shadow-sm">
          <p className="text-text-muted text-lg uppercase tracking-widest">
            You haven't placed any bids yet.
          </p>
        </div>
      )}

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
            disabled={!bids || bids.length < take}
            className={`w-36 flex justify-center items-center py-2.5 font-bold uppercase tracking-wider text-xs border rounded-lg transition-colors ${
              !bids || bids.length < take
                ? "border-text-muted/20 text-text-muted/50 cursor-not-allowed bg-gray-50"
                : "border-text-muted/40 text-background hover:border-primary hover:bg-primary hover:text-white"
            }`}
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
