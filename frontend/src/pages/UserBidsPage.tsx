import { Link } from "react-router-dom";
import { useMyBidsHistory } from "../hooks/useBids";

export default function UserBidsPage() {
  const { data: bids, isLoading } = useMyBidsHistory();

  if (isLoading) return <div>Loading your bids...</div>;

  return (
    <div>
      <h2 className="mb-[15px]">My Bids & Wins</h2>
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
                  className="font-bold text-[16px] text-black"
                >
                  {b.auction.title}
                </Link>
                {b.isWinner && (
                  <span className="bg-green-600 text-white px-[6px] py-[2px] text-[12px] font-bold">
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
        <p>You haven't placed any bids yet.</p>
      )}
    </div>
  );
}
