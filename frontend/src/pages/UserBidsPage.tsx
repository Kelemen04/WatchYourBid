import { Link } from "react-router-dom";
import { useMyBidsHistory } from "../hooks/useBids";

export default function UserBidsPage() {
  const { data: bids, isLoading } = useMyBidsHistory();

  if (isLoading) {
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
    </div>
  );
}
