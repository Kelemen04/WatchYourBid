import { Link } from "react-router-dom";
import { useMyBidsHistory } from "../hooks/useBids";

export default function UserBidsPage() {
  const { data: bids, isLoading } = useMyBidsHistory();

  if (isLoading) return <div>Loading your bids...</div>;

  return (
    <div>
      <h2 style={{ margin: "0 0 15px 0" }}>My Bids & Wins</h2>
      {bids && bids.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {bids.map((b) => (
            <div
              key={b.id}
              style={{
                border: b.isWinner ? "2px solid green" : "1px solid #ccc",
                padding: "10px",
                backgroundColor: b.isWinner ? "#f0fff0" : "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Link
                  to={`/auction/${b.auctionId}`}
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "black",
                  }}
                >
                  {b.auction.title}
                </Link>
                {b.isWinner && (
                  <span
                    style={{
                      backgroundColor: "green",
                      color: "white",
                      padding: "2px 6px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    WINNER
                  </span>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "8px",
                  fontSize: "14px",
                  color: "gray",
                }}
              >
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
